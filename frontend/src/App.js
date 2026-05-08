import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Dashboard from "@/pages/Dashboard";
import Portfolio from "@/pages/Portfolio";
import FundDetail from "@/pages/FundDetail";
import Alerts from "@/pages/Alerts";
import News from "@/pages/News";
import AddFund from "@/pages/AddFund";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/funds/:scheme_code" element={<FundDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/news" element={<News />} />
          <Route path="/add" element={<AddFund />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}