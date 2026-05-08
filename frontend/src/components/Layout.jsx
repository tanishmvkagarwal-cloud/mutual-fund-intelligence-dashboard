import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children, title, subtitle, action }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
          <div className="px-8 py-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              {subtitle && (
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-1">
                  {subtitle}
                </div>
              )}
              <h1
                className="font-display font-black text-zinc-950 text-3xl sm:text-4xl tracking-tighter leading-none"
                data-testid="page-title"
              >
                {title}
              </h1>
            </div>
            {action}
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}