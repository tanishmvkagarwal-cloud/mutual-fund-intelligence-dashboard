"""Seed data for 5 Indian equity mutual funds with 2-month factsheet snapshots.
Structured so holdings-diff, sector-diff, manager-change, category-change,
name-change, objective-change, and asset-allocation-change all trigger alerts.
"""
from datetime import datetime, timezone

# Two months: CURR (latest) and PREV (previous)
CURR_MONTH = "2026-01"
PREV_MONTH = "2025-12"

FUNDS = [
    {
        "scheme_code": "122639",
        "scheme_name": "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
        "amc": "PPFAS Mutual Fund",
        "inception_date": "2013-05-24",
        "vr_slug": "parag-parikh-flexi-cap-fund-direct-plan",
        "nav": 84.12,
    },
    {
        "scheme_code": "118834",
        "scheme_name": "Mirae Asset Large Cap Fund - Direct Plan - Growth",
        "amc": "Mirae Asset Mutual Fund",
        "inception_date": "2008-04-04",
        "vr_slug": "mirae-asset-large-cap-fund-direct-plan",
        "nav": 112.45,
    },
    {
        "scheme_code": "112277",
        "scheme_name": "Axis Bluechip Fund - Direct Plan - Growth",
        "amc": "Axis Mutual Fund",
        "inception_date": "2010-01-05",
        "vr_slug": "axis-bluechip-fund-direct-plan",
        "nav": 65.88,
    },
    {
        "scheme_code": "101044",
        "scheme_name": "HDFC Flexi Cap Fund - Direct Plan - Growth",
        "amc": "HDFC Mutual Fund",
        "inception_date": "1995-01-01",
        "vr_slug": "hdfc-flexi-cap-fund-direct-plan",
        "nav": 1745.30,
    },
    {
        "scheme_code": "101025",
        "scheme_name": "Quant Small Cap Fund - Direct Plan - Growth",
        "amc": "Quant Mutual Fund",
        "inception_date": "1996-10-28",
        "vr_slug": "quant-small-cap-fund-direct-plan",
        "nav": 268.77,
    },
]

# Per-scheme factsheet snapshots (CURR vs PREV) crafted so diffs/alerts are meaningful
SNAPSHOTS = {
    "122639": {  # Parag Parikh
        PREV_MONTH: {
            "scheme_name": "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
            "category": "Flexi Cap Fund",
            "benchmark": "NIFTY 500 TRI",
            "fund_manager": "Rajeev Thakkar, Raunak Onkar",
            "objective": "Long-term capital appreciation by investing in a diversified portfolio across market caps, including up to 35% international equities.",
            "asset_allocation": {"equity": 82.5, "debt": 3.2, "cash": 14.3},
            "holdings": [
                {"stock": "HDFC Bank", "weight": 7.8},
                {"stock": "Bajaj Holdings & Investment", "weight": 6.4},
                {"stock": "ITC Ltd", "weight": 5.9},
                {"stock": "Power Grid Corp", "weight": 4.5},
                {"stock": "Microsoft Corp", "weight": 4.1},
                {"stock": "Alphabet Inc", "weight": 3.8},
                {"stock": "Maruti Suzuki India", "weight": 3.5},
                {"stock": "ICICI Bank", "weight": 3.3},
                {"stock": "Coal India", "weight": 2.9},
                {"stock": "Meta Platforms", "weight": 2.7},
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 26.4},
                {"sector": "Technology", "weight": 16.8},
                {"sector": "FMCG", "weight": 9.6},
                {"sector": "Energy", "weight": 8.4},
                {"sector": "Automobile", "weight": 7.9},
                {"sector": "Healthcare", "weight": 4.2},
                {"sector": "Others", "weight": 9.2},
            ],
        },
        CURR_MONTH: {
            "scheme_name": "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
            "category": "Flexi Cap Fund",
            "benchmark": "NIFTY 500 TRI",
            "fund_manager": "Rajeev Thakkar, Raunak Onkar",
            "objective": "Long-term capital appreciation by investing in a diversified portfolio across market caps, including up to 35% international equities.",
            "asset_allocation": {"equity": 76.1, "debt": 3.5, "cash": 20.4},  # cash jumped +6.1%
            "holdings": [
                {"stock": "HDFC Bank", "weight": 8.2},      # +0.4
                {"stock": "Bajaj Holdings & Investment", "weight": 6.1},  # -0.3
                {"stock": "ITC Ltd", "weight": 5.2},         # -0.7
                {"stock": "Power Grid Corp", "weight": 5.1}, # +0.6
                {"stock": "Microsoft Corp", "weight": 4.3},
                {"stock": "Alphabet Inc", "weight": 3.9},
                {"stock": "Maruti Suzuki India", "weight": 3.5},
                {"stock": "ICICI Bank", "weight": 3.6},      # +0.3
                {"stock": "Kotak Mahindra Bank", "weight": 2.4},  # NEW
                {"stock": "Meta Platforms", "weight": 2.5},
                # Coal India EXITED
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 29.1},  # +2.7 (flag)
                {"sector": "Technology", "weight": 17.2},
                {"sector": "FMCG", "weight": 7.1},  # -2.5 (flag)
                {"sector": "Energy", "weight": 6.2},  # -2.2 (flag)
                {"sector": "Automobile", "weight": 7.5},
                {"sector": "Healthcare", "weight": 4.8},
                {"sector": "Others", "weight": 8.5},
            ],
        },
    },
    "118834": {  # Mirae Large Cap — MANAGER CHANGE
        PREV_MONTH: {
            "scheme_name": "Mirae Asset Large Cap Fund - Direct Plan - Growth",
            "category": "Large Cap Fund",
            "benchmark": "NIFTY 100 TRI",
            "fund_manager": "Gaurav Misra, Harshad Borawake",
            "objective": "Generate long-term capital appreciation by investing predominantly in large cap stocks.",
            "asset_allocation": {"equity": 98.2, "debt": 0.0, "cash": 1.8},
            "holdings": [
                {"stock": "Reliance Industries", "weight": 9.4},
                {"stock": "HDFC Bank", "weight": 8.9},
                {"stock": "ICICI Bank", "weight": 7.6},
                {"stock": "Infosys", "weight": 6.2},
                {"stock": "Larsen & Toubro", "weight": 4.5},
                {"stock": "TCS", "weight": 4.2},
                {"stock": "Axis Bank", "weight": 3.7},
                {"stock": "Bharti Airtel", "weight": 3.2},
                {"stock": "SBI", "weight": 3.0},
                {"stock": "HUL", "weight": 2.8},
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 32.4},
                {"sector": "Technology", "weight": 14.1},
                {"sector": "Energy", "weight": 11.2},
                {"sector": "FMCG", "weight": 8.6},
                {"sector": "Capital Goods", "weight": 7.3},
                {"sector": "Telecom", "weight": 4.8},
                {"sector": "Others", "weight": 21.6},
            ],
        },
        CURR_MONTH: {
            "scheme_name": "Mirae Asset Large Cap Fund - Direct Plan - Growth",
            "category": "Large Cap Fund",
            "benchmark": "NIFTY 100 TRI",
            "fund_manager": "Harshad Borawake, Ankit Jain",  # CHANGED: Gaurav Misra replaced
            "objective": "Generate long-term capital appreciation by investing predominantly in large cap stocks.",
            "asset_allocation": {"equity": 97.8, "debt": 0.0, "cash": 2.2},
            "holdings": [
                {"stock": "Reliance Industries", "weight": 9.1},
                {"stock": "HDFC Bank", "weight": 9.3},   # +0.4
                {"stock": "ICICI Bank", "weight": 7.9},
                {"stock": "Infosys", "weight": 5.8},     # -0.4
                {"stock": "Larsen & Toubro", "weight": 4.7},
                {"stock": "TCS", "weight": 4.0},
                {"stock": "Axis Bank", "weight": 3.9},
                {"stock": "Bharti Airtel", "weight": 3.6},  # +0.4
                {"stock": "SBI", "weight": 3.1},
                {"stock": "Titan Company", "weight": 2.6},  # NEW (HUL exited)
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 34.2},  # +1.8
                {"sector": "Technology", "weight": 13.2},
                {"sector": "Energy", "weight": 10.8},
                {"sector": "FMCG", "weight": 6.1},   # -2.5 (flag)
                {"sector": "Capital Goods", "weight": 7.6},
                {"sector": "Telecom", "weight": 5.2},
                {"sector": "Others", "weight": 22.9},
            ],
        },
    },
    "112277": {  # Axis Bluechip — CATEGORY reclassified + NAME change announced
        PREV_MONTH: {
            "scheme_name": "Axis Bluechip Fund - Direct Plan - Growth",
            "category": "Large Cap Fund",
            "benchmark": "NIFTY 100 TRI",
            "fund_manager": "Shreyash Devalkar",
            "objective": "Long term capital appreciation by investing in a diversified portfolio predominantly consisting of equity and equity related instruments of large cap companies.",
            "asset_allocation": {"equity": 96.5, "debt": 0.0, "cash": 3.5},
            "holdings": [
                {"stock": "HDFC Bank", "weight": 9.8},
                {"stock": "ICICI Bank", "weight": 8.1},
                {"stock": "Bajaj Finance", "weight": 7.3},
                {"stock": "Infosys", "weight": 6.5},
                {"stock": "TCS", "weight": 5.9},
                {"stock": "Asian Paints", "weight": 4.8},
                {"stock": "Titan Company", "weight": 4.2},
                {"stock": "Avenue Supermarts", "weight": 3.9},
                {"stock": "Nestle India", "weight": 3.5},
                {"stock": "Pidilite Industries", "weight": 3.1},
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 31.5},
                {"sector": "Technology", "weight": 15.8},
                {"sector": "Consumer Discretionary", "weight": 14.2},
                {"sector": "FMCG", "weight": 9.6},
                {"sector": "Chemicals", "weight": 6.8},
                {"sector": "Healthcare", "weight": 5.3},
                {"sector": "Others", "weight": 16.8},
            ],
        },
        CURR_MONTH: {
            "scheme_name": "Axis Large & Mid Cap Fund - Direct Plan - Growth",  # NAME CHANGED
            "category": "Large & Mid Cap Fund",  # CATEGORY RECLASSIFIED
            "benchmark": "NIFTY LargeMidcap 250 TRI",
            "fund_manager": "Shreyash Devalkar, Hitesh Das",
            "objective": "Long term capital appreciation by investing in a diversified portfolio of large cap and mid cap companies.",  # OBJECTIVE CHANGED
            "asset_allocation": {"equity": 95.8, "debt": 0.0, "cash": 4.2},
            "holdings": [
                {"stock": "HDFC Bank", "weight": 8.2},
                {"stock": "ICICI Bank", "weight": 7.4},
                {"stock": "Bajaj Finance", "weight": 6.8},
                {"stock": "Infosys", "weight": 5.7},
                {"stock": "TCS", "weight": 5.1},
                {"stock": "Asian Paints", "weight": 4.5},
                {"stock": "Titan Company", "weight": 4.3},
                {"stock": "Cholamandalam Investment", "weight": 3.6},  # NEW (mid-cap)
                {"stock": "Trent Ltd", "weight": 3.3},  # NEW (mid-cap)
                {"stock": "Persistent Systems", "weight": 2.9},  # NEW
                # Avenue Supermarts, Nestle, Pidilite exited
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 29.6},
                {"sector": "Technology", "weight": 17.2},
                {"sector": "Consumer Discretionary", "weight": 16.4},  # +2.2 (flag)
                {"sector": "FMCG", "weight": 5.9},  # -3.7 (flag)
                {"sector": "Chemicals", "weight": 5.2},
                {"sector": "Healthcare", "weight": 6.1},
                {"sector": "Others", "weight": 19.6},
            ],
        },
    },
    "101044": {  # HDFC Flexi Cap
        PREV_MONTH: {
            "scheme_name": "HDFC Flexi Cap Fund - Direct Plan - Growth",
            "category": "Flexi Cap Fund",
            "benchmark": "NIFTY 500 TRI",
            "fund_manager": "Roshi Jain",
            "objective": "Generate long-term capital appreciation from a portfolio of equity and equity related securities across market caps.",
            "asset_allocation": {"equity": 97.1, "debt": 0.0, "cash": 2.9},
            "holdings": [
                {"stock": "ICICI Bank", "weight": 10.2},
                {"stock": "HDFC Bank", "weight": 9.6},
                {"stock": "Axis Bank", "weight": 8.1},
                {"stock": "SBI", "weight": 6.4},
                {"stock": "Larsen & Toubro", "weight": 5.8},
                {"stock": "Bharti Airtel", "weight": 4.9},
                {"stock": "Maruti Suzuki", "weight": 4.2},
                {"stock": "Cipla", "weight": 3.7},
                {"stock": "Piramal Enterprises", "weight": 3.4},
                {"stock": "Kotak Mahindra Bank", "weight": 3.1},
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 41.6},
                {"sector": "Capital Goods", "weight": 10.8},
                {"sector": "Telecom", "weight": 6.2},
                {"sector": "Automobile", "weight": 8.4},
                {"sector": "Healthcare", "weight": 7.3},
                {"sector": "Technology", "weight": 4.8},
                {"sector": "Others", "weight": 20.9},
            ],
        },
        CURR_MONTH: {
            "scheme_name": "HDFC Flexi Cap Fund - Direct Plan - Growth",
            "category": "Flexi Cap Fund",
            "benchmark": "NIFTY 500 TRI",
            "fund_manager": "Roshi Jain",
            "objective": "Generate long-term capital appreciation from a portfolio of equity and equity related securities across market caps.",
            "asset_allocation": {"equity": 96.7, "debt": 0.0, "cash": 3.3},
            "holdings": [
                {"stock": "ICICI Bank", "weight": 10.4},
                {"stock": "HDFC Bank", "weight": 9.3},
                {"stock": "Axis Bank", "weight": 8.4},
                {"stock": "SBI", "weight": 6.8},
                {"stock": "Larsen & Toubro", "weight": 6.1},
                {"stock": "Bharti Airtel", "weight": 5.2},
                {"stock": "Maruti Suzuki", "weight": 4.5},
                {"stock": "Cipla", "weight": 3.5},
                {"stock": "Piramal Enterprises", "weight": 3.2},
                {"stock": "Kotak Mahindra Bank", "weight": 3.3},
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 42.8},
                {"sector": "Capital Goods", "weight": 11.2},
                {"sector": "Telecom", "weight": 6.6},
                {"sector": "Automobile", "weight": 8.7},
                {"sector": "Healthcare", "weight": 6.8},
                {"sector": "Technology", "weight": 5.0},
                {"sector": "Others", "weight": 18.9},
            ],
        },
    },
    "101025": {  # Quant Small Cap
        PREV_MONTH: {
            "scheme_name": "Quant Small Cap Fund - Direct Plan - Growth",
            "category": "Small Cap Fund",
            "benchmark": "NIFTY Smallcap 250 TRI",
            "fund_manager": "Sandeep Tandon, Ankit Pande, Vasav Sahgal",
            "objective": "Long term capital appreciation through investments in a diversified portfolio of small cap companies.",
            "asset_allocation": {"equity": 88.4, "debt": 0.0, "cash": 11.6},
            "holdings": [
                {"stock": "Reliance Industries", "weight": 9.2},
                {"stock": "Jio Financial Services", "weight": 6.8},
                {"stock": "Aegis Logistics", "weight": 4.5},
                {"stock": "HFCL Ltd", "weight": 3.9},
                {"stock": "RBL Bank", "weight": 3.6},
                {"stock": "Bikaji Foods", "weight": 3.2},
                {"stock": "IRB Infrastructure", "weight": 3.0},
                {"stock": "Tata Consumer", "weight": 2.8},
                {"stock": "Adani Power", "weight": 2.6},
                {"stock": "Swan Energy", "weight": 2.4},
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 22.3},
                {"sector": "Energy", "weight": 18.6},
                {"sector": "Consumer Discretionary", "weight": 12.4},
                {"sector": "Infrastructure", "weight": 11.8},
                {"sector": "FMCG", "weight": 8.5},
                {"sector": "Telecom", "weight": 6.2},
                {"sector": "Others", "weight": 20.2},
            ],
        },
        CURR_MONTH: {
            "scheme_name": "Quant Small Cap Fund - Direct Plan - Growth",
            "category": "Small Cap Fund",
            "benchmark": "NIFTY Smallcap 250 TRI",
            "fund_manager": "Sandeep Tandon, Ankit Pande, Vasav Sahgal",
            "objective": "Long term capital appreciation through investments in a diversified portfolio of small cap companies.",
            "asset_allocation": {"equity": 81.5, "debt": 0.0, "cash": 18.5},  # +6.9% cash (flag)
            "holdings": [
                {"stock": "Reliance Industries", "weight": 8.1},
                {"stock": "Jio Financial Services", "weight": 5.9},
                {"stock": "Aegis Logistics", "weight": 4.2},
                {"stock": "HFCL Ltd", "weight": 3.5},
                {"stock": "RBL Bank", "weight": 4.1},   # +0.5
                {"stock": "Bikaji Foods", "weight": 2.9},
                {"stock": "IRB Infrastructure", "weight": 2.6},
                {"stock": "Tata Consumer", "weight": 3.4},   # +0.6
                {"stock": "Swan Energy", "weight": 2.8},
                {"stock": "KEI Industries", "weight": 2.7},  # NEW (Adani Power exited)
            ],
            "sectors": [
                {"sector": "Financial Services", "weight": 23.8},
                {"sector": "Energy", "weight": 15.4},  # -3.2 (flag)
                {"sector": "Consumer Discretionary", "weight": 13.1},
                {"sector": "Infrastructure", "weight": 12.6},
                {"sector": "FMCG", "weight": 9.2},
                {"sector": "Telecom", "weight": 5.8},
                {"sector": "Others", "weight": 20.1},
            ],
        },
    },
}

# Performance metrics (returns % CAGR)
PERFORMANCE = {
    "122639": {
        "1Y": {"fund": 32.4, "category": 28.1, "benchmark": 26.8},
        "3Y": {"fund": 24.6, "category": 19.8, "benchmark": 18.4},
        "5Y": {"fund": 22.1, "category": 17.9, "benchmark": 16.2},
        "SI": {"fund": 20.4, "category": 15.8, "benchmark": 14.1},
        "rolling_5Y_avg": 21.3,
    },
    "118834": {
        "1Y": {"fund": 18.6, "category": 21.4, "benchmark": 22.1},
        "3Y": {"fund": 14.2, "category": 16.8, "benchmark": 17.2},
        "5Y": {"fund": 15.8, "category": 15.1, "benchmark": 14.8},
        "SI": {"fund": 16.4, "category": 13.2, "benchmark": 12.6},
        "rolling_5Y_avg": 15.4,
    },
    "112277": {
        "1Y": {"fund": 17.2, "category": 21.4, "benchmark": 22.1},
        "3Y": {"fund": 12.8, "category": 16.8, "benchmark": 17.2},
        "5Y": {"fund": 14.6, "category": 15.1, "benchmark": 14.8},
        "SI": {"fund": 14.1, "category": 13.2, "benchmark": 12.6},
        "rolling_5Y_avg": 14.2,
    },
    "101044": {
        "1Y": {"fund": 34.8, "category": 28.1, "benchmark": 26.8},
        "3Y": {"fund": 26.4, "category": 19.8, "benchmark": 18.4},
        "5Y": {"fund": 22.8, "category": 17.9, "benchmark": 16.2},
        "SI": {"fund": 19.2, "category": 15.8, "benchmark": 14.1},
        "rolling_5Y_avg": 22.1,
    },
    "101025": {
        "1Y": {"fund": 48.2, "category": 36.4, "benchmark": 34.1},
        "3Y": {"fund": 34.6, "category": 24.8, "benchmark": 22.4},
        "5Y": {"fund": 28.9, "category": 22.1, "benchmark": 20.8},
        "SI": {"fund": 24.4, "category": 19.4, "benchmark": 17.8},
        "rolling_5Y_avg": 28.2,
    },
}

# Benchmark beating history (pass/fail & return differential in pp)
BENCHMARK_HISTORY = {
    "122639": {"5Y": {"passed": True, "diff": 5.9},  "10Y": {"passed": True, "diff": 6.2}, "15Y": None},
    "118834": {"5Y": {"passed": True, "diff": 1.0},  "10Y": {"passed": True, "diff": 1.8}, "15Y": {"passed": True, "diff": 2.4}},
    "112277": {"5Y": {"passed": False, "diff": -0.2},"10Y": {"passed": True, "diff": 1.2}, "15Y": {"passed": True, "diff": 1.6}},
    "101044": {"5Y": {"passed": True, "diff": 6.6},  "10Y": {"passed": True, "diff": 4.9}, "15Y": {"passed": True, "diff": 5.1}},
    "101025": {"5Y": {"passed": True, "diff": 8.1},  "10Y": {"passed": True, "diff": 6.4}, "15Y": {"passed": True, "diff": 4.8}},
}

# Default portfolio holdings (sample)
DEFAULT_PORTFOLIO = [
    {"scheme_code": "122639", "units": 1200.5, "invested_amount": 85000, "purchase_date": "2023-04-15"},
    {"scheme_code": "118834", "units": 450.2,  "invested_amount": 42000, "purchase_date": "2022-11-20"},
    {"scheme_code": "112277", "units": 680.0,  "invested_amount": 38000, "purchase_date": "2023-08-10"},
    {"scheme_code": "101044", "units": 25.4,   "invested_amount": 35000, "purchase_date": "2021-02-05"},
    {"scheme_code": "101025", "units": 180.0,  "invested_amount": 28000, "purchase_date": "2024-01-22"},
]