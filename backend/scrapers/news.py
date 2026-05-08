"""Google News RSS scraper for per-fund news feed."""
import httpx
import feedparser
import logging
from urllib.parse import quote
from typing import List, Dict

logger = logging.getLogger(__name__)

async def fetch_fund_news(fund_name: str, limit: int = 15) -> List[Dict]:
    """Fetch latest Google News RSS for a given fund name."""
    query = quote(f'"{fund_name}" mutual fund')
    url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(
                url,
                headers={"User-Agent": "Mozilla/5.0 MFPortfolio/1.0"},
            )
            resp.raise_for_status()
            body = resp.text
    except Exception as e:
        logger.warning(f"Google News fetch failed for {fund_name}: {e}")
        return []

    feed = feedparser.parse(body)
    items = []
    for entry in feed.entries[:limit]:
        items.append({
            "title": getattr(entry, "title", ""),
            "link": getattr(entry, "link", ""),
            "source": (getattr(entry, "source", {}) or {}).get("title", "Google News"),
            "published": getattr(entry, "published", ""),
            "summary": getattr(entry, "summary", "")[:400],
        })
    return items