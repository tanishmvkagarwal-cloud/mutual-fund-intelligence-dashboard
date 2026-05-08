import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { DeltaPill, SectionHeader, Card } from "../components/Common";
import { api, fmtCurrency, fmtPct } from "../lib/api";
import { ArrowUpRight, Warning, ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [pf, al] = await Promise.all([
      api.get("/portfolio"),
      api.get("/alerts"),
    ]);
    setPortfolio(pf.data);
    setAlerts(al.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.post("/refresh/nav");
      if (res.data.error) toast.error(res.data.error);
      else toast.success(`Updated NAV for ${res.data.updated} funds`);
      await load();
    } catch {
      toast.error("Refresh failed");
    }
    setRefreshing(false);
  };

  const s = portfolio?.summary;

  return (
    <Layout
      title="Portfolio Dashboard"
      subtitle="Overview / Intelligence"
      action={
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white font-display uppercase tracking-wider text-xs px-5 py-3 rounded-none"
          data-testid="refresh-nav-btn"
        >
          <ArrowsClockwise size={14} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Fetching AMFI…" : "Refresh NAV"}
        </Button>
      }
    >
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-200 bg-white mb-10" data-testid="kpi-row">
        <KPI label="Total Invested" value={fmtCurrency(s?.total_invested)} mono />
        <KPI label="Current Value" value={fmtCurrency(s?.total_current)} mono primary />
        <KPI
          label="Total Gain"
          value={fmtCurrency(s?.total_gain)}
          mono
          valueClass={s?.total_gain >= 0 ? "text-green-700" : "text-red-700"}
          footnote={<DeltaPill value={s?.total_gain_pct} />}
        />
        <KPI
          label="Funds Tracked"
          value={s?.fund_count ?? "—"}
          mono
          footnote={
            <span className="text-xs text-zinc-500">
              {alerts.length} active alert{alerts.length === 1 ? "" : "s"}
            </span>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Holdings Table */}
        <section className="lg:col-span-2">
          <SectionHeader
            eyebrow="01"
            title="Holdings"
            right={
              <Link
                to="/portfolio"
                className="text-xs uppercase tracking-[0.2em] font-display text-zinc-600 hover:text-zinc-950"
                data-testid="view-all-holdings"
              >
                View all →
              </Link>
            }
          />
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Fund</th>
                    <th className="num">Units</th>
                    <th className="num">NAV</th>
                    <th className="num">Invested</th>
                    <th className="num">Current</th>
                    <th className="num">Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {(portfolio?.holdings || []).map((h) => (
                    <tr key={h.id} data-testid={`holding-row-${h.scheme_code}`}>
                      <td>
                        <Link
                          to={`/funds/${h.scheme_code}`}
                          className="hover:underline"
                        >
                          <div className="font-medium text-zinc-950 leading-tight">
                            {h.scheme_name.split(" - ")[0]}
                          </div>
                          <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-display mt-0.5">
                            {h.category || h.amc}
                          </div>
                        </Link>
                      </td>
                      <td className="num">{h.units.toFixed(2)}</td>
                      <td className="num">{h.nav?.toFixed(2)}</td>
                      <td className="num">{fmtCurrency(h.invested_amount)}</td>
                      <td className="num">{fmtCurrency(h.current_value)}</td>
                      <td className="num">
                        <div>
                          <div className={h.gain >= 0 ? "pos" : "neg"}>
                            {fmtCurrency(h.gain)}
                          </div>
                          <DeltaPill value={h.gain_pct} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {portfolio && portfolio.holdings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-zinc-500">
                        No holdings yet. <Link to="/add" className="underline">Add a fund</Link>.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Alerts */}
        <section>
          <SectionHeader
            eyebrow="02"
            title="Active Alerts"
            right={
              <Link
                to="/alerts"
                className="text-xs uppercase tracking-[0.2em] font-display text-zinc-600 hover:text-zinc-950"
                data-testid="view-all-alerts"
              >
                View all →
              </Link>
            }
          />
          <Card className="p-0">
            <ul className="divide-y divide-zinc-200" data-testid="alert-list">
              {(alerts || []).slice(0, 8).map((a) => (
                <li key={a.id} className="p-4 hover:bg-zinc-50">
                  <div className="flex items-start gap-3">
                    <Warning
                      size={18}
                      className={
                        a.severity === "high"
                          ? "text-red-600 mt-0.5"
                          : a.severity === "medium"
                          ? "text-amber-500 mt-0.5"
                          : "text-zinc-500 mt-0.5"
                      }
                      weight="fill"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-block bg-zinc-950 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-display">
                          {a.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-display uppercase">
                          {a.scheme_name?.split(" - ")[0]}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-800">{a.message}</div>
                      {a.prev_value && a.new_value && (
                        <div className="text-[11px] text-zinc-500 mt-1 font-mono-data truncate">
                          {String(a.prev_value).slice(0, 40)} →{" "}
                          <span className="text-zinc-900">{String(a.new_value).slice(0, 40)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {alerts.length === 0 && (
                <li className="p-6 text-sm text-zinc-500">
                  All quiet. No active alerts across your portfolio.
                </li>
              )}
            </ul>
          </Card>
        </section>
      </div>

      <div className="mt-10">
        <SectionHeader eyebrow="03" title="Quick Access" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(portfolio?.holdings || []).slice(0, 3).map((h) => (
            <Link
              key={h.id}
              to={`/funds/${h.scheme_code}`}
              className="block bg-white border border-zinc-200 p-6 hover-darken transition-colors duration-150"
              data-testid={`quick-${h.scheme_code}`}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-2">
                {h.category}
              </div>
              <div className="font-display font-bold text-zinc-950 text-lg leading-tight mb-4">
                {h.scheme_name.split(" - ")[0]}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display">
                    Current
                  </div>
                  <div className="font-mono-data text-lg text-zinc-950">
                    {fmtCurrency(h.current_value)}
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-zinc-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function KPI({ label, value, footnote, valueClass = "text-zinc-950", primary }) {
  return (
    <div className={`p-7 border-r border-b border-zinc-200 last:border-r-0 ${primary ? "bg-zinc-950 text-white" : ""}`}>
      <div className={`text-[10px] uppercase tracking-[0.2em] font-display mb-3 ${primary ? "text-zinc-400" : "text-zinc-500"}`}>
        {label}
      </div>
      <div className={`font-mono-data text-2xl sm:text-3xl font-medium tracking-tight ${primary ? "text-white" : valueClass}`}>
        {value}
      </div>
      {footnote && <div className="mt-2 text-xs">{footnote}</div>}
    </div>
  );
}