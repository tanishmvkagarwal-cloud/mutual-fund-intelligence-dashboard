from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import csv
import uuid
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from seed_data import (
    FUNDS, SNAPSHOTS, PERFORMANCE, BENCHMARK_HISTORY, DEFAULT_PORTFOLIO,
    CURR_MONTH, PREV_MONTH,
)
from scrapers.amfi import fetch_amfi_nav
from scrapers.news import fetch_fund_news
from scrapers.vr import fetch_scheme_page

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="MF Portfolio Intelligence API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- Models ----------
class FundOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    scheme_code: str
    scheme_name: str
    amc: str
    category: Optional[str] = None
    benchmark: Optional[str] = None
    fund_manager: Optional[str] = None
    nav: Optional[float] = None
    inception_date: Optional[str] = None

class PortfolioAddIn(BaseModel):
    scheme_code: str
    units: float
    invested_amount: float
    purchase_date: Optional[str] = None

class AlertDismiss(BaseModel):
    alert_id: str

# ---------- Seeding ----------
SEVERITY_HIGH = "high"
SEVERITY_MEDIUM = "medium"
SEVERITY_LOW = "low"

def _diff_holdings(prev: List[Dict], curr: List[Dict]) -> Dict[str, List[Dict]]:
    prev_map = {h["stock"]: h["weight"] for h in prev}
    curr_map = {h["stock"]: h["weight"] for h in curr}
    added, exited, increased, decreased = [], [], [], []
    for stock, w in curr_map.items():
        if stock not in prev_map:
            added.append({"stock": stock, "weight": w, "delta": w})
        else:
            d = round(w - prev_map[stock], 2)
            if d > 0.05:
                increased.append({"stock": stock, "prev": prev_map[stock], "curr": w, "delta": d})
            elif d < -0.05:
                decreased.append({"stock": stock, "prev": prev_map[stock], "curr": w, "delta": d})
    for stock, w in prev_map.items():
        if stock not in curr_map:
            exited.append({"stock": stock, "weight": w, "delta": -w})
    increased.sort(key=lambda x: -x["delta"])
    decreased.sort(key=lambda x: x["delta"])
    return {"added": added, "exited": exited, "increased": increased, "decreased": decreased}

def _diff_sectors(prev: List[Dict], curr: List[Dict], threshold: float = 2.0) -> List[Dict]:
    prev_map = {s["sector"]: s["weight"] for s in prev}
    curr_map = {s["sector"]: s["weight"] for s in curr}
    all_sectors = set(prev_map) | set(curr_map)
    rows = []
    for s in all_sectors:
        p = prev_map.get(s, 0.0)
        c = curr_map.get(s, 0.0)
        d = round(c - p, 2)
        rows.append({
            "sector": s, "prev": p, "curr": c, "delta": d,
            "flagged": abs(d) >= threshold,
        })
    rows.sort(key=lambda x: -abs(x["delta"]))
    return rows

def _compute_alerts(scheme_code: str, prev: Dict, curr: Dict) -> List[Dict]:
    alerts = []
    now_iso = datetime.now(timezone.utc).isoformat()
    def mk(atype, severity, message, prev_v, new_v):
        return {
            "id": str(uuid.uuid4()),
            "scheme_code": scheme_code,
            "type": atype,
            "severity": severity,
            "message": message,
            "prev_value": prev_v,
            "new_value": new_v,
            "created_at": now_iso,
            "dismissed": False,
        }
    if prev.get("fund_manager") != curr.get("fund_manager"):
        alerts.append(mk("fund_manager_change", SEVERITY_HIGH,
            "Fund manager changed",
            prev.get("fund_manager"), curr.get("fund_manager")))
    if prev.get("category") != curr.get("category"):
        alerts.append(mk("category_change", SEVERITY_HIGH,
            "SEBI category reclassified",
            prev.get("category"), curr.get("category")))
    if prev.get("objective") != curr.get("objective"):
        alerts.append(mk("objective_change", SEVERITY_MEDIUM,
            "Investment objective amended",
            prev.get("objective"), curr.get("objective")))
    if prev.get("scheme_name") != curr.get("scheme_name"):
        alerts.append(mk("name_change", SEVERITY_HIGH,
            "Fund name changed",
            prev.get("scheme_name"), curr.get("scheme_name")))
    pa = prev.get("asset_allocation", {})
    ca = curr.get("asset_allocation", {})
    for bucket in ("equity", "debt", "cash"):
        d = round(ca.get(bucket, 0) - pa.get(bucket, 0), 2)
        if abs(d) >= 5.0:
            alerts.append(mk("asset_allocation_change", SEVERITY_MEDIUM,
                f"{bucket.capitalize()} allocation shifted {d:+.1f}%",
                pa.get(bucket), ca.get(bucket)))
    return alerts

async def seed_database():
    # Funds collection
    count = await db.funds.count_documents({})
    if count > 0:
        return
    logger.info("Seeding database...")
    for f in FUNDS:
        curr_snap = SNAPSHOTS[f["scheme_code"]][CURR_MONTH]
        doc = {
            **f,
            "category": curr_snap["category"],
            "benchmark": curr_snap["benchmark"],
            "fund_manager": curr_snap["fund_manager"],
            "objective": curr_snap["objective"],
        }
        await db.funds.insert_one(doc)
    # Factsheet snapshots
    for code, months in SNAPSHOTS.items():
        for month, snap in months.items():
            doc = {
                "id": str(uuid.uuid4()),
                "scheme_code": code,
                "month": month,
                **snap,
            }
            await db.factsheet_snapshots.insert_one(doc)
    # Portfolio holdings
    for h in DEFAULT_PORTFOLIO:
        await db.portfolio_holdings.insert_one({
            "id": str(uuid.uuid4()),
            **h,
        })
    # Alerts computed from factsheet diffs
    for code in SNAPSHOTS:
        prev = SNAPSHOTS[code][PREV_MONTH]
        curr = SNAPSHOTS[code][CURR_MONTH]
        alerts = _compute_alerts(code, prev, curr)
        for a in alerts:
            await db.alerts.insert_one(a)
    logger.info(f"Seeded {len(FUNDS)} funds, {len(DEFAULT_PORTFOLIO)} holdings")

# ---------- Helpers ----------
def _clean(doc: Dict) -> Dict:
    if doc is None:
        return doc
    doc.pop("_id", None)
    return doc

async def _get_fund(scheme_code: str) -> Optional[Dict]:
    return _clean(await db.funds.find_one({"scheme_code": scheme_code}, {"_id": 0}))

async def _latest_snapshot(scheme_code: str) -> Optional[Dict]:
    return _clean(await db.factsheet_snapshots.find_one(
        {"scheme_code": scheme_code, "month": CURR_MONTH}, {"_id": 0}
    ))

async def _prev_snapshot(scheme_code: str) -> Optional[Dict]:
    return _clean(await db.factsheet_snapshots.find_one(
        {"scheme_code": scheme_code, "month": PREV_MONTH}, {"_id": 0}
    ))

# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"status": "ok", "app": "MF Portfolio Intelligence"}

@api_router.get("/funds/search")
async def search_funds(q: str = ""):
    """Search seeded funds by name (and live AMFI as fallback for large set)."""
    q_low = q.lower().strip()
    cursor = db.funds.find({}, {"_id": 0})
    seeded = await cursor.to_list(500)
    if not q_low:
        return seeded
    out = [f for f in seeded if q_low in f.get("scheme_name", "").lower() or q_low in f.get("amc", "").lower()]
    return out

@api_router.get("/funds/{scheme_code}")
async def get_fund(scheme_code: str):
    fund = await _get_fund(scheme_code)
    if not fund:
        raise HTTPException(404, "Fund not found")
    snap = await _latest_snapshot(scheme_code)
    prev = await _prev_snapshot(scheme_code)
    return {
        "fund": fund,
        "current_factsheet": snap,
        "previous_factsheet": prev,
        "performance": PERFORMANCE.get(scheme_code),
        "benchmark_history": BENCHMARK_HISTORY.get(scheme_code),
    }

@api_router.get("/funds/{scheme_code}/holdings-diff")
async def holdings_diff(scheme_code: str):
    prev = await _prev_snapshot(scheme_code)
    curr = await _latest_snapshot(scheme_code)
    if not prev or not curr:
        raise HTTPException(404, "Snapshots missing")
    return {
        "prev_month": prev["month"],
        "curr_month": curr["month"],
        "diff": _diff_holdings(prev["holdings"], curr["holdings"]),
        "curr_holdings": curr["holdings"],
        "prev_holdings": prev["holdings"],
    }

@api_router.get("/funds/{scheme_code}/sector-diff")
async def sector_diff(scheme_code: str, threshold: float = 2.0):
    prev = await _prev_snapshot(scheme_code)
    curr = await _latest_snapshot(scheme_code)
    if not prev or not curr:
        raise HTTPException(404, "Snapshots missing")
    return {
        "prev_month": prev["month"],
        "curr_month": curr["month"],
        "threshold": threshold,
        "sectors": _diff_sectors(prev["sectors"], curr["sectors"], threshold),
    }

@api_router.get("/funds/{scheme_code}/performance")
async def fund_performance(scheme_code: str):
    perf = PERFORMANCE.get(scheme_code)
    if not perf:
        raise HTTPException(404, "Performance not available")
    return perf

@api_router.get("/funds/{scheme_code}/benchmark-history")
async def fund_benchmark(scheme_code: str):
    bh = BENCHMARK_HISTORY.get(scheme_code)
    if not bh:
        raise HTTPException(404, "Benchmark history not available")
    return bh

@api_router.get("/funds/{scheme_code}/news")
async def fund_news(scheme_code: str, limit: int = 15):
    fund = await _get_fund(scheme_code)
    if not fund:
        raise HTTPException(404, "Fund not found")
    # Use shorter query term (fund name without direct/growth suffix)
    raw = fund["scheme_name"]
    query_name = raw.split(" - ")[0]
    items = await fetch_fund_news(query_name, limit=limit)
    return {"fund": query_name, "items": items}

# Portfolio
@api_router.get("/portfolio")
async def get_portfolio():
    holdings = await db.portfolio_holdings.find({}, {"_id": 0}).to_list(500)
    enriched = []
    total_invested = 0.0
    total_current = 0.0
    for h in holdings:
        fund = await _get_fund(h["scheme_code"])
        if not fund:
            continue
        nav = fund.get("nav") or 0
        current_value = round(nav * h["units"], 2)
        gain = round(current_value - h["invested_amount"], 2)
        gain_pct = round((gain / h["invested_amount"]) * 100, 2) if h["invested_amount"] else 0
        enriched.append({
            **h,
            "scheme_name": fund["scheme_name"],
            "amc": fund["amc"],
            "category": fund.get("category"),
            "nav": nav,
            "current_value": current_value,
            "gain": gain,
            "gain_pct": gain_pct,
        })
        total_invested += h["invested_amount"]
        total_current += current_value
    total_gain = round(total_current - total_invested, 2)
    total_gain_pct = round((total_gain / total_invested) * 100, 2) if total_invested else 0
    return {
        "holdings": enriched,
        "summary": {
            "total_invested": round(total_invested, 2),
            "total_current": round(total_current, 2),
            "total_gain": total_gain,
            "total_gain_pct": total_gain_pct,
            "fund_count": len(enriched),
        },
    }

@api_router.post("/portfolio/add")
async def add_holding(data: PortfolioAddIn):
    fund = await _get_fund(data.scheme_code)
    if not fund:
        raise HTTPException(404, "Fund not found. Search and pick a fund from list.")
    doc = {
        "id": str(uuid.uuid4()),
        "scheme_code": data.scheme_code,
        "units": data.units,
        "invested_amount": data.invested_amount,
        "purchase_date": data.purchase_date or datetime.now(timezone.utc).date().isoformat(),
    }
    await db.portfolio_holdings.insert_one(doc)
    return _clean(doc)

@api_router.delete("/portfolio/{holding_id}")
async def delete_holding(holding_id: str):
    res = await db.portfolio_holdings.delete_one({"id": holding_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Holding not found")
    return {"deleted": True}

@api_router.post("/portfolio/upload")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(text))
    inserted = 0
    skipped = 0
    for row in reader:
        code = (row.get("scheme_code") or row.get("SchemeCode") or "").strip()
        try:
            units = float(row.get("units") or row.get("Units") or 0)
            invested = float(row.get("invested_amount") or row.get("Invested") or 0)
        except ValueError:
            skipped += 1
            continue
        fund = await _get_fund(code)
        if not fund or units <= 0:
            skipped += 1
            continue
        await db.portfolio_holdings.insert_one({
            "id": str(uuid.uuid4()),
            "scheme_code": code,
            "units": units,
            "invested_amount": invested,
            "purchase_date": (row.get("purchase_date") or row.get("PurchaseDate") or
                              datetime.now(timezone.utc).date().isoformat()),
        })
        inserted += 1
    return {"inserted": inserted, "skipped": skipped}

# Alerts
@api_router.get("/alerts")
async def get_alerts(include_dismissed: bool = False):
    q = {} if include_dismissed else {"dismissed": False}
    rows = await db.alerts.find(q, {"_id": 0}).to_list(500)
    # Attach scheme_name + only show for funds in portfolio
    portfolio = await db.portfolio_holdings.find({}, {"_id": 0, "scheme_code": 1}).to_list(500)
    portfolio_codes = {h["scheme_code"] for h in portfolio}
    out = []
    for a in rows:
        if a["scheme_code"] not in portfolio_codes:
            continue
        fund = await _get_fund(a["scheme_code"])
        a["scheme_name"] = fund["scheme_name"] if fund else a["scheme_code"]
        out.append(a)
    out.sort(key=lambda x: x["created_at"], reverse=True)
    return out

@api_router.post("/alerts/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str):
    res = await db.alerts.update_one({"id": alert_id}, {"$set": {"dismissed": True}})
    if res.matched_count == 0:
        raise HTTPException(404, "Alert not found")
    return {"dismissed": True}

# Dashboard aggregate
@api_router.get("/dashboard/summary")
async def dashboard_summary():
    """Aggregate numbers for the dashboard top row."""
    pf_resp = await get_portfolio()
    alerts = await get_alerts()
    by_severity = {"high": 0, "medium": 0, "low": 0}
    for a in alerts:
        by_severity[a.get("severity", "low")] = by_severity.get(a.get("severity", "low"), 0) + 1
    return {
        "portfolio": pf_resp["summary"],
        "alert_counts": by_severity,
        "total_alerts": len(alerts),
    }

# News - all holdings aggregated
@api_router.get("/news/feed")
async def aggregate_news(limit_per_fund: int = 5):
    pf = await db.portfolio_holdings.find({}, {"_id": 0}).to_list(500)
    unique_codes = list({h["scheme_code"] for h in pf})
    out = []
    for code in unique_codes:
        fund = await _get_fund(code)
        if not fund:
            continue
        query_name = fund["scheme_name"].split(" - ")[0]
        items = await fetch_fund_news(query_name, limit=limit_per_fund)
        for item in items:
            out.append({**item, "scheme_code": code, "scheme_name": fund["scheme_name"]})
    return {"items": out}

# AMFI refresh
@api_router.post("/refresh/nav")
async def refresh_nav():
    navs = await fetch_amfi_nav()
    if not navs:
        return {"updated": 0, "error": "AMFI fetch failed or returned empty"}
    nav_map = {n["scheme_code"]: n["nav"] for n in navs}
    updated = 0
    funds = await db.funds.find({}, {"_id": 0}).to_list(500)
    for f in funds:
        if f["scheme_code"] in nav_map:
            await db.funds.update_one(
                {"scheme_code": f["scheme_code"]},
                {"$set": {"nav": nav_map[f["scheme_code"]]}},
            )
            updated += 1
    return {"updated": updated, "source": "AMFI"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()