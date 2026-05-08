import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { SectionHeader, Card, DeltaPill } from "../components/Common";
import { api, fmtCurrency } from "../lib/api";
import { Trash, Plus } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function Portfolio() {
  const [data, setData] = useState(null);

  const load = async () => {
    const pf = await api.get("/portfolio");
    setData(pf.data);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success("Holding removed");
      load();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const s = data?.summary;

  return (
    <Layout
      title="Portfolio"
      subtitle="Holdings ledger"
      action={
        <Link to="/add">
          <Button
            className="bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white font-display uppercase tracking-wider text-xs px-5 py-3 rounded-none"
            data-testid="add-fund-btn"
          >
            <Plus size={14} className="mr-2" />
            Add fund
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-200 bg-white mb-10">
        <KPI label="Invested" value={fmtCurrency(s?.total_invested)} />
        <KPI label="Current Value" value={fmtCurrency(s?.total_current)} primary />
        <KPI
          label="Gain"
          value={fmtCurrency(s?.total_gain)}
          valueClass={s?.total_gain >= 0 ? "text-green-700" : "text-red-700"}
          footnote={<DeltaPill value={s?.total_gain_pct} />}
        />
        <KPI label="Fund Count" value={s?.fund_count ?? "—"} />
      </div>

      <SectionHeader eyebrow="01" title="All Holdings" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Fund</th>
                <th>Category</th>
                <th className="num">Units</th>
                <th className="num">NAV</th>
                <th className="num">Invested</th>
                <th className="num">Current</th>
                <th className="num">Gain</th>
                <th className="num">Return</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.holdings || []).map((h) => (
                <tr key={h.id} data-testid={`portfolio-row-${h.scheme_code}`}>
                  <td>
                    <Link to={`/funds/${h.scheme_code}`} className="hover:underline">
                      <div className="font-medium text-zinc-950">
                        {h.scheme_name.split(" - ")[0]}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-display uppercase">
                        {h.amc}
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span className="inline-block bg-zinc-100 text-zinc-700 text-[10px] uppercase tracking-wider font-display px-2 py-1">
                      {h.category}
                    </span>
                  </td>
                  <td className="num">{h.units.toFixed(2)}</td>
                  <td className="num">{h.nav?.toFixed(2)}</td>
                  <td className="num">{fmtCurrency(h.invested_amount)}</td>
                  <td className="num">{fmtCurrency(h.current_value)}</td>
                  <td className={`num ${h.gain >= 0 ? "pos" : "neg"}`}>
                    {fmtCurrency(h.gain)}
                  </td>
                  <td className="num">
                    <DeltaPill value={h.gain_pct} />
                  </td>
                  <td className="num">
                    <button
                      onClick={() => remove(h.id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors"
                      data-testid={`remove-${h.id}`}
                      aria-label="Remove holding"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {data && data.holdings.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-zinc-500">
                    No holdings. <Link to="/add" className="underline">Add your first fund</Link>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}

function KPI({ label, value, valueClass = "text-zinc-950", primary, footnote }) {
  return (
    <div className={`p-7 border-r border-b border-zinc-200 last:border-r-0 ${primary ? "bg-zinc-950 text-white" : ""}`}>
      <div className={`text-[10px] uppercase tracking-[0.2em] font-display mb-3 ${primary ? "text-zinc-400" : "text-zinc-500"}`}>
        {label}
      </div>
      <div className={`font-mono-data text-2xl sm:text-3xl font-medium ${primary ? "text-white" : valueClass}`}>
        {value}
      </div>
      {footnote && <div className="mt-2 text-xs">{footnote}</div>}
    </div>
  );
}