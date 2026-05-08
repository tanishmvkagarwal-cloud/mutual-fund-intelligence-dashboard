import React from "react";
import { NavLink } from "react-router-dom";
import {
  ChartLineUp,
  Briefcase,
  Bell,
  Newspaper,
  Plus,
  CurrencyInr,
} from "@phosphor-icons/react";

const NAV = [
  { to: "/", label: "Dashboard", icon: ChartLineUp, testid: "nav-dashboard" },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase, testid: "nav-portfolio" },
  { to: "/alerts", label: "Alerts", icon: Bell, testid: "nav-alerts" },
  { to: "/news", label: "News", icon: Newspaper, testid: "nav-news" },
  { to: "/add", label: "Add Fund", icon: Plus, testid: "nav-add" },
];

export default function Sidebar() {
  return (
    <aside
      className="h-screen w-[240px] flex-shrink-0 bg-zinc-950 text-zinc-300 flex flex-col sticky top-0"
      data-testid="sidebar"
    >
      <div className="px-6 py-7 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <CurrencyInr size={22} weight="bold" className="text-white" />
          <span
            className="font-display font-black text-white text-[17px] tracking-tighter uppercase leading-none"
          >
            Fund
            <span className="text-zinc-500">.</span>
            Watch
          </span>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display">
          Portfolio Intelligence
        </div>
      </div>

      <nav className="flex-1 py-4">
        {NAV.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            data-testid={testid}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-[13px] border-l-2 transition-colors duration-150 ${
                isActive
                  ? "border-white bg-zinc-900 text-white"
                  : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`
            }
          >
            <Icon size={18} />
            <span className="font-display font-medium uppercase tracking-wider">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-zinc-800 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-display">
        v1 · Single user
      </div>
    </aside>
  );
}