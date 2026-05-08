# Mutual Fund Portfolio Intelligence & Monitoring Dashboard
🎥 Watch the Live Demo Video Here- (https://www.youtube.com/watch?v=i8cbqiYVFWA) 
## Overview
This is a comprehensive financial analytics and portfolio monitoring application. I rapidly prototyped and developed this tool using **vibe coding** to solve the operational bottleneck of manually tracking mutual fund factsheets, sector allocations, and benchmark performances. 

Unlike basic NAV trackers, this dashboard functions as an active portfolio watchdog, instantly flagging structural shifts in fund management and underlying asset allocation.

## Key Capabilities
* **Automated Alert System:** Triggers alerts for critical structural shifts, including Fund Manager changes, SEBI Category reclassifications, and investment objective amendments.
* **Holdings & Sector Diff Engine:** Compares stock-level holdings and sector weights month-over-month. Automatically flags sector allocation drifts exceeding ±2%.
* **Performance Intelligence:** Tracks fund performance (1Y, 3Y, 5Y, Since Inception) against category averages and official benchmarks.
* **Aggregated Market News:** Integrates a live Google News RSS scraper to curate a customized, fund-specific daily news feed.

## Technical Architecture
* **Frontend:** React.js, Tailwind CSS, Recharts (for data visualization), built on a strict, high-contrast grid inspired by professional financial terminals.
* **Backend:** Python FastAPI.
* **Database:** MongoDB.
* **Data Pipelines:** Custom asynchronous Python scrapers fetching daily NAV data from AMFI and factsheet updates. 

## Note for Recruiters & Hiring Managers
This project serves as a "Proof of Work" for my ability to identify business/operational inefficiencies and rapidly execute technical solutions. By utilizing vibe coding workflows, I am able to move directly from strategic problem identification to a deployed, functional tool to solve real-world bottlenecks.
