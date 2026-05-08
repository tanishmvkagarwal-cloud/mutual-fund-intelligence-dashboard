import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, SectionHeader } from "../components/Common";
import { api } from "../lib/api";
import { Warning, CheckCircle } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const TYPE_LABEL = {
  fund_manager_change: "Fund Manager",
  category_change: "Category",
  objective_change: "Objective",
  name_change: "Name",
  asset_allocation_change: "Asset Allocation",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const a = await api.get("/alerts");
    setAlerts(a.data);
  };

  useEffect(() => { load(); }, []);

  const dismiss = async (id) => {
    await api.post(`/alerts/${id}/dismiss`);
    toast.success("Alert dismissed");
    load();
  };

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <Layout title="Alerts Center" subtitle="Active flags across portfolio">
      <div className="flex items-center gap-2 mb-6" data-testid="alert-filters">
        {["all", "high", "medium", "low"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-display border transition-colors ${
              filter === f
                ? "bg-zinc-950 text-white border-zinc-950"
                : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900"
            }`}
            data-testid={`filter-${f}`}
          >
            {f} {f === "all" && `(${alerts.length})`}
          </button>
        ))}
      </div>

      <SectionHeader eyebrow={`${filtered.length} alerts`} title="Monitoring Flags" />

      <Card>
        <ul className="divide-y divide-zinc-200" data-testid="full-alert-list">
          {filtered.length === 0 && (
            <li className="p-10 text-center text-zinc-500">
              <CheckCircle size={28} className="inline-block mb-2 text-green-600" weight="fill" />
              <div>All clear. No {filter !== "all" ? filter + " " : ""}alerts right now.</div>
            </li>
          )}
          {filtered.map((a) => (
            <li key={a.id} className="p-5 flex items-start gap-4" data-testid={`alert-${a.id}`}>
              <Warning
                size={20}
                weight="fill"
                className={
                  a.severity === "high" ? "text-red-600 mt-0.5"
                  : a.severity === "medium" ? "text-amber-500 mt-0.5"
                  : "text-zinc-400 mt-0.5"
                }
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-block bg-zinc-950 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-display">
                    {TYPE_LABEL[a.type] || a.type.replace(/_/g, " ")}
                  </span>
                  <span className={`inline-block text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-display ${
                    a.severity === "high" ? "bg-red-600 text-white"
                    : a.severity === "medium" ? "bg-amber-500 text-white"
                    : "bg-zinc-300 text-zinc-800"
                  }`}>
                    {a.severity}
                  </span>
                  <Link
                    to={`/funds/${a.scheme_code}`}
                    className="text-[11px] text-zinc-600 hover:text-zinc-950 font-display uppercase tracking-wider"
                  >
                    {a.scheme_name?.split(" - ")[0]}
                  </Link>
                </div>
                <div className="text-sm text-zinc-950 font-medium mb-1">{a.message}</div>
                {a.prev_value && (
                  <div className="text-[12px] text-zinc-500 font-mono-data break-words">
                    <span className="line-through decoration-red-400">{String(a.prev_value)}</span>
                    <span className="mx-2">→</span>
                    <span className="text-zinc-950">{String(a.new_value)}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(a.id)}
                className="text-[11px] uppercase tracking-[0.2em] font-display text-zinc-500 hover:text-zinc-950"
                data-testid={`dismiss-${a.id}`}
              >
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </Layout>
  );
}