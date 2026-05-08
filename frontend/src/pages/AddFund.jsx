import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, SectionHeader } from "../components/Common";
import { api } from "../lib/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { UploadSimple, MagnifyingGlass } from "@phosphor-icons/react";

export default function AddFund() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [funds, setFunds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [units, setUnits] = useState("");
  const [invested, setInvested] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await api.get(`/funds/search?q=${encodeURIComponent(query)}`);
      setFunds(r.data);
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error("Select a fund first");
    if (!units || !invested) return toast.error("Enter units and invested amount");

    try {
      await api.post("/portfolio/add", {
        scheme_code: selected.scheme_code,
        units: parseFloat(units),
        invested_amount: parseFloat(invested),
        purchase_date: purchaseDate || undefined,
      });
      toast.success("Added to portfolio");
      nav("/portfolio");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to add");
    }
  };

  const uploadCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const r = await api.post("/portfolio/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Inserted ${r.data.inserted}, skipped ${r.data.skipped}`);
      nav("/portfolio");
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <Layout title="Add Fund" subtitle="Manual entry / CSV upload">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SectionHeader eyebrow="01" title="Manual Entry" />
          <Card className="p-6">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-2">
                  Search fund
                </label>
                <div className="relative">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Parag Parikh, HDFC Flexi…"
                    className="pl-9 rounded-none border-zinc-200 focus-visible:ring-zinc-950"
                    data-testid="fund-search-input"
                  />
                </div>
                <ul className="mt-3 max-h-[240px] overflow-y-auto border border-zinc-200" data-testid="fund-results">
                  {funds.slice(0, 20).map((f) => (
                    <li
                      key={f.scheme_code}
                      onClick={() => setSelected(f)}
                      className={`px-4 py-3 text-sm cursor-pointer border-b border-zinc-100 last:border-b-0 ${
                        selected?.scheme_code === f.scheme_code ? "bg-zinc-950 text-white" : "hover:bg-zinc-50"
                      }`}
                      data-testid={`fund-option-${f.scheme_code}`}
                    >
                      <div className="font-medium">{f.scheme_name}</div>
                      <div className={`text-[11px] font-display uppercase mt-0.5 ${selected?.scheme_code === f.scheme_code ? "text-zinc-400" : "text-zinc-500"}`}>
                        {f.amc} · {f.category}
                      </div>
                    </li>
                  ))}
                  {funds.length === 0 && <li className="px-4 py-3 text-sm text-zinc-500">No matches</li>}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-2">
                    Units
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    placeholder="0.00"
                    className="rounded-none font-mono-data"
                    data-testid="units-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-2">
                    Invested (₹)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={invested}
                    onChange={(e) => setInvested(e.target.value)}
                    placeholder="0"
                    className="rounded-none font-mono-data"
                    data-testid="invested-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-2">
                    Purchase Date
                  </label>
                  <Input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="rounded-none font-mono-data"
                    data-testid="date-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white font-display uppercase tracking-wider text-xs px-5 py-3 rounded-none"
                data-testid="submit-add-fund"
              >
                Add to Portfolio
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <SectionHeader eyebrow="02" title="CSV Upload" />
          <Card className="p-6">
            <p className="text-sm text-zinc-700 mb-4">
              Upload a CSV with columns <code className="font-mono-data bg-zinc-100 px-1">scheme_code</code>,
              <code className="font-mono-data bg-zinc-100 px-1">units</code>,
              <code className="font-mono-data bg-zinc-100 px-1">invested_amount</code>,
              <code className="font-mono-data bg-zinc-100 px-1">purchase_date</code>.
            </p>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 py-10 px-6 cursor-pointer hover:border-zinc-950 transition-colors" data-testid="upload-area">
              <UploadSimple size={20} />
              <span className="text-sm font-display uppercase tracking-wider">Choose CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={uploadCsv}
                className="hidden"
                data-testid="upload-input"
              />
            </label>
            <div className="mt-4 text-[11px] text-zinc-500 font-mono-data">
              Example:<br />
              scheme_code,units,invested_amount,purchase_date<br />
              122639,1200.5,85000,2023-04-15
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}