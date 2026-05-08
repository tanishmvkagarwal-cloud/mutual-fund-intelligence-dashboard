import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { SectionHeader, Card, DeltaPill } from "../components/Common";
import { api, fmtPct, fmtNum } from "../lib/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ArrowLeft, ArrowUp, ArrowDown, Check, X } from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FundDetail() {
  const { scheme_code } = useParams();
  const [detail, setDetail] = useState(null);
  const [holdingsDiff, setHoldingsDiff] = useState(null);
  const [sectorDiff, setSectorDiff] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    (async () => {
      const [d, h, s, n] = await Promise.all([
        api.get(`/funds/${scheme_code}`),
        api.get(`/funds/${scheme_code}/holdings-diff`),
        api.get(`/funds/${scheme_code}/sector-diff`),
        api.get(`/funds/${scheme_code}/news`).catch(() => ({ data: { items: [] } })),
      ]);
      setDetail(d.data);
      setHoldingsDiff(h.data);
      setSectorDiff(s.data);
      setNews(n.data.items || []);
    })();
  }, [scheme_code]);

  if (!detail) return <Layout title="Loading…" />;

  const fund = detail.fund;
  const curr = detail.current_factsheet;
  const prev = detail.previous_factsheet;
  const perf = detail.performance;
  const bh = detail.benchmark_history;

  return (
    <Layout
      title={fund.scheme_name.split(" - ")[0]}
      subtitle={`${fund.amc} · ${curr?.category || fund.category}`}
      action={
        <Link
          to="/portfolio"
          className="text-xs uppercase tracking-[0.2em] font-display text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
          data-testid="back-link"
        >
          <ArrowLeft size={14} /> Back
        </Link>
      }
    >
      {/* Fund meta row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 border border-zinc-200 bg-white mb-10">
        <MetaCell label="NAV" value={fmtNum(fund.nav)} mono />
        <MetaCell label="Benchmark" value={curr?.benchmark || "—"} />
        <MetaCell label="Fund Manager" value={curr?.fund_manager || "—"} />
        <MetaCell label="Category" value={curr?.category || "—"} />
        <MetaCell label="Inception" value={fund.inception_date || "—"} mono />
      </div>

      <Tabs defaultValue="holdings" className="w-full" data-testid="fund-tabs">
        <TabsList className="bg-transparent border-b border-zinc-200 p-0 h-auto rounded-none mb-8 w-full justify-start gap-0">
          {[
            ["holdings", "Holdings Diff"],
            ["sectors", "Sector Shift"],
            ["performance", "Performance"],
            ["benchmark", "Benchmark History"],
            ["news", "News"],
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-950 data-[state=active]:bg-transparent data-[state=active]:text-zinc-950 text-zinc-500 font-display uppercase tracking-wider text-xs px-5 py-3"
              data-testid={`tab-${v}`}
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="holdings">
          <HoldingsDiffView diff={holdingsDiff} />
        </TabsContent>
        <TabsContent value="sectors">
          <SectorDiffView diff={sectorDiff} />
        </TabsContent>
        <TabsContent value="performance">
          <PerformanceView perf={perf} curr={curr} />
        </TabsContent>
        <TabsContent value="benchmark">
          <BenchmarkView bh={bh} />
        </TabsContent>
        <TabsContent value="news">
          <NewsView news={news} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function MetaCell({ label, value, mono }) {
  return (
    <div className="p-5 border-r border-b border-zinc-200 last:border-r-0">
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-2">
        {label}
      </div>
      <div className={`text-sm text-zinc-950 ${mono ? "font-mono-data" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function HoldingsDiffView({ diff }) {
  if (!diff) return <div className="text-zinc-500">Loading…</div>;
  const { added, exited, increased, decreased } = diff.diff;

  return (
    <>
      <SectionHeader
        eyebrow={`${diff.prev_month} → ${diff.curr_month}`}
        title="Monthly Holdings Change"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DiffBlock title="Newly Bought" items={added} color="green" empty="No new positions" test="diff-added" />
        <DiffBlock title="Fully Exited" items={exited} color="red" empty="No exits" test="diff-exited" />
        <DiffBlock title="Weight Increased" items={increased} color="green" showDelta test="diff-increased" />
        <DiffBlock title="Weight Decreased" items={decreased} color="red" showDelta test="diff-decreased" />
      </div>

      <SectionHeader eyebrow="Detail" title="Current Holdings" />
      <Card>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Stock</th>
              <th className="num">Prev</th>
              <th className="num">Curr</th>
              <th className="num">Δ</th>
            </tr>
          </thead>
          <tbody>
            {diff.curr_holdings.map((h, i) => {
              const p = diff.prev_holdings.find((x) => x.stock === h.stock);
              const d = p ? +(h.weight - p.weight).toFixed(2) : h.weight;
              return (
                <tr key={h.stock}>
                  <td className="num text-zinc-400">{i + 1}</td>
                  <td>{h.stock}{!p && <span className="ml-2 text-[10px] uppercase bg-green-100 text-green-800 px-1.5 py-0.5 font-display">New</span>}</td>
                  <td className="num">{p ? p.weight.toFixed(2) : "—"}</td>
                  <td className="num">{h.weight.toFixed(2)}</td>
                  <td className="num"><DeltaPill value={d} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function DiffBlock({ title, items, color, empty, showDelta, test }) {
  return (
    <Card className="p-0" data-testid={test}>
      <div className="px-5 py-3 border-b border-zinc-200 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display">
          {title}
        </span>
        <span className={`font-mono-data text-sm ${color === "green" ? "text-green-700" : "text-red-700"}`}>
          {items.length}
        </span>
      </div>
      <ul className="divide-y divide-zinc-200">
        {items.length === 0 && <li className="px-5 py-4 text-sm text-zinc-500">{empty || "—"}</li>}
        {items.slice(0, 10).map((it, i) => (
          <li key={i} className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-zinc-950">{it.stock}</span>
            <span className={`font-mono-data text-sm ${color === "green" ? "text-green-700" : "text-red-700"}`}>
              {color === "green" ? <ArrowUp size={12} className="inline mr-1" /> : <ArrowDown size={12} className="inline mr-1" />}
              {showDelta
                ? `${it.delta > 0 ? "+" : ""}${it.delta.toFixed(2)}%`
                : `${it.weight.toFixed(2)}%`}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SectorDiffView({ diff }) {
  if (!diff) return <div>Loading…</div>;

  const data = diff.sectors.map((s) => ({
    sector: s.sector,
    delta: s.delta,
    curr: s.curr,
    prev: s.prev,
    flagged: s.flagged,
  }));

  return (
    <>
      <SectionHeader
        eyebrow={`${diff.prev_month} → ${diff.curr_month}`}
        title="Sector Allocation Change"
        right={
          <span className="text-[11px] text-zinc-500 font-display uppercase tracking-wider">
            Threshold ±{diff.threshold}%
          </span>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="h-[340px]">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="0" stroke="#E4E4E7" horizontal={false} />
                <XAxis type="number" stroke="#71717A" style={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="sector"
                  stroke="#71717A"
                  style={{ fontFamily: "IBM Plex Sans", fontSize: 11 }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{ background: "#09090B", color: "#fff", border: 0, borderRadius: 0, fontSize: 12 }}
                  formatter={(v) => [`${v > 0 ? "+" : ""}${v}%`, "Δ"]}
                />
                <Bar dataKey="delta">
                  {data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.delta > 0 ? (d.flagged ? "#16A34A" : "#86EFAC") : d.flagged ? "#DC2626" : "#FCA5A5"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th className="num">Prev</th>
                <th className="num">Curr</th>
                <th className="num">Δ</th>
              </tr>
            </thead>
            <tbody>
              {diff.sectors.map((s) => (
                <tr key={s.sector} className={s.flagged ? "bg-amber-50" : ""}>
                  <td>
                    {s.sector}
                    {s.flagged && (
                      <span className="ml-2 text-[9px] uppercase bg-amber-500 text-white px-1.5 py-0.5 font-display tracking-widest">
                        Flag
                      </span>
                    )}
                  </td>
                  <td className="num">{s.prev.toFixed(2)}</td>
                  <td className="num">{s.curr.toFixed(2)}</td>
                  <td className="num"><DeltaPill value={s.delta} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function PerformanceView({ perf, curr }) {
  if (!perf) return <div>No performance data.</div>;

  const rows = ["1Y", "3Y", "5Y", "SI"];
  const chartData = rows.map((r) => ({
    period: r,
    Fund: perf[r].fund,
    Category: perf[r].category,
    Benchmark: perf[r].benchmark,
  }));

  return (
    <>
      <SectionHeader eyebrow="Returns (CAGR)" title="Performance vs Category vs Benchmark" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="h-[320px]">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#E4E4E7" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="period" stroke="#71717A" style={{ fontFamily: "IBM Plex Mono", fontSize: 12 }} />
                <YAxis stroke="#71717A" style={{ fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#09090B", color: "#fff", border: 0, fontSize: 12 }}
                  formatter={(v) => `${v}%`}
                />
                <Bar dataKey="Fund" fill="#09090B" />
                <Bar dataKey="Category" fill="#A1A1AA" />
                <Bar dataKey="Benchmark" fill="#D4D4D8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th className="num">Fund</th>
                <th className="num">Category</th>
                <th className="num">Benchmark</th>
                <th className="num">vs Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const diff = +(perf[r].fund - perf[r].benchmark).toFixed(2);
                return (
                  <tr key={r}>
                    <td className="font-mono-data">{r}</td>
                    <td className="num font-semibold">{perf[r].fund.toFixed(2)}%</td>
                    <td className="num text-zinc-600">{perf[r].category.toFixed(2)}%</td>
                    <td className="num text-zinc-600">{perf[r].benchmark.toFixed(2)}%</td>
                    <td className="num"><DeltaPill value={diff} /></td>
                  </tr>
                );
              })}
              {perf.rolling_5Y_avg && (
                <tr>
                  <td className="text-[11px] uppercase tracking-widest font-display text-zinc-500">Rolling 5Y Avg</td>
                  <td className="num" colSpan="4">{perf.rolling_5Y_avg}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

function BenchmarkView({ bh }) {
  if (!bh) return <div>No data.</div>;
  const rows = ["5Y", "10Y", "15Y"];

  return (
    <>
      <SectionHeader eyebrow="History" title="Benchmark Beating Record" />
      <Card>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Outcome</th>
              <th className="num">Return Differential</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const v = bh[r];
              if (!v) return (
                <tr key={r}>
                  <td className="font-mono-data">{r}</td>
                  <td className="text-zinc-400">Insufficient history</td>
                  <td className="num">—</td>
                </tr>
              );
              return (
                <tr key={r}>
                  <td className="font-mono-data">{r}</td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 font-display uppercase tracking-wider text-[10px] px-2 py-1 ${
                        v.passed ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                      data-testid={`bench-${r}`}
                    >
                      {v.passed ? <Check size={12} weight="bold" /> : <X size={12} weight="bold" />}
                      {v.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td className="num"><DeltaPill value={v.diff} suffix="pp" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function NewsView({ news }) {
  return (
    <>
      <SectionHeader eyebrow="Google News" title="Fund-Specific Feed" />
      <Card>
        <ul className="divide-y divide-zinc-200">
          {news.length === 0 && (
            <li className="p-6 text-sm text-zinc-500">
              No news available (Google News RSS unreachable or no matching coverage right now).
            </li>
          )}
          {news.map((n, i) => (
            <li key={i} className="p-5 hover:bg-zinc-50">
              <a
                href={n.link}
                target="_blank"
                rel="noreferrer"
                className="block"
                data-testid={`news-item-${i}`}
              >
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-1">
                  {n.source} · {n.published?.slice(0, 16)}
                </div>
                <div className="font-medium text-zinc-950 hover:underline">{n.title}</div>
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}