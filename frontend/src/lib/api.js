import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND}/api`;
export const api = axios.create({ baseURL: API });

export const fmtCurrency = (v) =>
  typeof v === "number"
    ? "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : "—";

export const fmtPct = (v, digits = 2) =>
  typeof v === "number" ? `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%` : "—";

export const fmtNum = (v, digits = 2) =>
  typeof v === "number" ? v.toFixed(digits) : "—";