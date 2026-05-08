import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, SectionHeader } from "../components/Common";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { ArrowSquareOut } from "@phosphor-icons/react";

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/news/feed");
        setItems(r.data.items || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <Layout title="News Feed" subtitle="Aggregated · Google News">
      <SectionHeader
        eyebrow={loading ? "Fetching…" : `${items.length} stories`}
        title="Per-Fund News · Consolidated"
      />
      <Card>
        <ul className="divide-y divide-zinc-200" data-testid="news-list">
          {loading && <li className="p-6 text-zinc-500">Loading latest stories from Google News…</li>}
          {!loading && items.length === 0 && (
            <li className="p-6 text-zinc-500">
              No stories right now. Google News RSS may be unreachable or no matching coverage.
            </li>
          )}
          {items.map((n, i) => (
            <li key={i} className="p-5 hover:bg-zinc-50">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link
                      to={`/funds/${n.scheme_code}`}
                      className="inline-block bg-zinc-950 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-display"
                    >
                      {n.scheme_name?.split(" - ")[0]}
                    </Link>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-display">
                      {n.source} · {n.published?.slice(0, 16)}
                    </span>
                  </div>
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-zinc-950 font-medium hover:underline"
                    data-testid={`news-${i}`}
                  >
                    {n.title}
                  </a>
                </div>
                <a href={n.link} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-950">
                  <ArrowSquareOut size={18} />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </Layout>
  );
}