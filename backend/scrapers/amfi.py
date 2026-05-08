"""AMFI NAV scraper - fetches daily NAV from public AMFI feed."""
import httpx
import logging
from typing import List, Dict, Optional

AMFI_NAV_URL = "https://www.amfiindia.com/spages/NAVAll.txt"
logger = logging.getLogger(__name__)

async def fetch_amfi_nav() -> List[Dict]:
    """Fetch all mutual fund NAVs from AMFI.
    Returns list of {scheme_code, scheme_name, nav, date, amc}.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            resp = await client.get(
                AMFI_NAV_URL,
                headers={"User-Agent": "Mozilla/5.0 MFPortfolio/1.0"},
            )
            resp.raise_for_status()
            text = resp.text
    except Exception as e:
        logger.warning(f"AMFI fetch failed: {e}")
        return []
    
    results = []
    current_amc = ""
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if "Mutual Fund" in line and ";" not in line:
            current_amc = line
            continue
        parts = line.split(";")
        if len(parts) >= 6 and parts[0].strip().isdigit():
            scheme_code = parts[0].strip()
            scheme_name = parts[3].strip()
            nav_str = parts[4].strip()
            date = parts[5].strip()
            try:
                nav = float(nav_str)
            except ValueError:
                continue
            results.append({
                "scheme_code": scheme_code,
                "scheme_name": scheme_name,
                "nav": nav,
                "date": date,
                "amc": current_amc,
            })
    return results

async def fetch_nav_for_code(scheme_code: str) -> Optional[float]:
    all_navs = await fetch_amfi_nav()
    for item in all_navs:
        if item["scheme_code"] == scheme_code:
            return item["nav"]
    return None