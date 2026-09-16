import React, { useState } from "react";
import { ArrowLeftRight, CheckCircle2, Equal, ExternalLink, Info, Landmark, Minus, RefreshCw, TrendingUp } from "lucide-react";
import { Btn, PageHeader, Stat, peso } from "./primitives";

export function BundleChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
        {icon} {label}
      </div>
      <div className="text-[12px] font-medium text-white">{value}</div>
    </div>
  );
}

// ==================== 13.2.C — LGU POOL RETURNS (GENERAL FUND SWEEP) ====================

type PoolReturn = {
  id: number;
  employee: string;
  dept: string;
  amount: number;
  returnedOn: string;
  swept: boolean;
};

const POOL_RETURNS: PoolReturn[] = [
  { id: 1, employee: "Engr. R. Mapalad", dept: "Engineering", amount: 1500, returnedOn: "2026-04-16", swept: false },
  { id: 2, employee: "J. Pomentil", dept: "Social Welfare", amount: 1600, returnedOn: "2026-04-17", swept: false },
  { id: 3, employee: "Dr. M. Sabando", dept: "Health", amount: 6550, returnedOn: "2026-04-17", swept: false },
  { id: 4, employee: "K. Abarquez", dept: "GSO", amount: 820, returnedOn: "2026-04-18", swept: false },
  { id: 5, employee: "T. Salcedo", dept: "Tourism", amount: 940, returnedOn: "2026-04-18", swept: false },
  { id: 6, employee: "O. Perez", dept: "CENRO", amount: 1200, returnedOn: "2026-04-19", swept: false },
  { id: 7, employee: "F. Lariosa", dept: "Legal", amount: 2100, returnedOn: "2026-04-19", swept: false },
  { id: 8, employee: "G. Hingpit", dept: "Planning", amount: 780, returnedOn: "2026-04-20", swept: false },
  { id: 9, employee: "R. Alcantara", dept: "Environment", amount: 3800, returnedOn: "2026-04-20", swept: false },
  { id: 10, employee: "L. Bascon", dept: "LEDIPO", amount: 5220, returnedOn: "2026-04-20", swept: false },
];

export function LGUPoolReturns() {
  const [rows, setRows] = useState(POOL_RETURNS);
  const [selected, setSelected] = useState<Set<number>>(new Set(POOL_RETURNS.map((r) => r.id)));
  const [sweeping, setSweeping] = useState(false);
  const [swept, setSwept] = useState<{ amount: number; hash: string } | null>(null);

  const unsweptRows = rows.filter((r) => !r.swept);
  const selectedRows = unsweptRows.filter((r) => selected.has(r.id));
  const totalSelected = selectedRows.reduce((s, r) => s + r.amount, 0);

  function toggle(id: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function doSweep() {
    if (totalSelected === 0) return;
    setSweeping(true);
    setTimeout(() => {
      const hash = `0x${Array.from({ length: 6 }).map(() => Math.random().toString(16).slice(2, 10)).join("")}`;
      setRows((rs) => rs.map((r) => (selected.has(r.id) ? { ...r, swept: true } : r)));
      setSwept({ amount: totalSelected, hash });
      setSelected(new Set());
      setSweeping(false);
    }, 1200);
  }

  const sweptTotal = rows.filter((r) => r.swept).reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageHeader
        title="General Fund Sweep · Macro Re-Injection"
        subtitle="Accumulated spare change returned from field workers · re-inject into appropriation buckets"
        actions={
          <>
            <Btn icon={<ArrowLeftRight size={14} />} label="Choose Target Bucket: General Fund" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Rows Available" value={String(unsweptRows.length)} trend="spare change ready to sweep" />
        <Stat label="Rows Selected" value={String(selected.size)} trend={peso(totalSelected)} />
        <Stat label="Swept This Session" value={peso(sweptTotal)} trend="re-injected to GF" tone="good" />
        <Stat label="YTD General Fund Replenishment" value="₱ 1.28M" trend="2026 running total" tone="good" />
      </div>

      {swept && (
        <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-lg p-3 mb-4 flex items-center gap-3">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-[12px] font-medium text-emerald-800">
              Swept {peso(swept.amount)} into General Fund · re-available to SP for appropriation
            </div>
            <div className="font-mono text-[10px] text-emerald-700 mt-0.5">{swept.hash}</div>
          </div>
          <ExternalLink size={13} className="text-emerald-600" />
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Ledger */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-200 flex items-center gap-2">
            <Landmark size={13} className="text-neutral-700" />
            <span className="text-[13px] font-semibold">Pool Return Ledger</span>
            <span className="ml-auto text-[11px] text-neutral-400 font-normal">Tick to include in sweep</span>
          </div>
          <div className="grid grid-cols-12 px-5 py-2 bg-neutral-50 border-b border-neutral-200 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            <div className="col-span-1"></div>
            <div className="col-span-4">Employee</div>
            <div className="col-span-3">Department</div>
            <div className="col-span-2">Returned on</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {rows.map((r) => {
            const isSelected = selected.has(r.id);
            return (
              <label
                key={r.id}
                className={`grid grid-cols-12 px-5 py-3 border-b border-neutral-100 last:border-0 items-center hover:bg-neutral-50 cursor-pointer text-[12px] font-normal ${
                  r.swept ? "opacity-40" : ""
                }`}
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={isSelected && !r.swept}
                    disabled={r.swept}
                    onChange={() => toggle(r.id)}
                    className="w-4 h-4 accent-neutral-900 cursor-pointer"
                  />
                </div>
                <div className="col-span-4 font-medium text-neutral-900">
                  {r.employee}
                  {r.swept && <span className="ml-2 text-[9px] text-emerald-600 font-medium uppercase">· swept</span>}
                </div>
                <div className="col-span-3 text-neutral-600">{r.dept}</div>
                <div className="col-span-2 text-neutral-500">{r.returnedOn}</div>
                <div className="col-span-2 text-right font-semibold text-neutral-900 tabular-nums">{peso(r.amount)}</div>
              </label>
            );
          })}
        </div>

        {/* Sweep summary */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
            <ArrowLeftRight size={14} className="text-emerald-400" />
            <span className="text-[13px] font-semibold">Sweep Summary</span>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">Selected for sweep</div>
            <div className="text-[32px] font-semibold text-emerald-400 tabular-nums">{peso(totalSelected)}</div>
            <div className="text-[11px] text-neutral-400 mt-1">from {selectedRows.length} employees</div>

            <div className="mt-5 pt-5 border-t border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-[11px]">
                <Minus size={11} className="text-neutral-500" />
                <span className="text-neutral-400">Source</span>
                <span className="ml-auto text-white">Pool Return Ledger</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Equal size={11} className="text-neutral-500" />
                <span className="text-neutral-400">Target bucket</span>
                <span className="ml-auto text-white font-medium">General Fund (GF-001)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Info size={11} className="text-neutral-500" />
                <span className="text-neutral-400">GF balance (pre-sweep)</span>
                <span className="ml-auto text-white tabular-nums">₱ 42.8M</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <TrendingUp size={11} className="text-emerald-400" />
                <span className="text-emerald-400">GF balance (post-sweep)</span>
                <span className="ml-auto text-emerald-400 tabular-nums font-medium">
                  ₱{(42_800_000 + totalSelected).toLocaleString("en-PH")}
                </span>
              </div>
            </div>

            <button
              onClick={doSweep}
              disabled={totalSelected === 0 || sweeping}
              className="w-full mt-5 py-2.5 bg-emerald-500 text-white rounded-lg text-[12px] font-medium hover:bg-emerald-400 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {sweeping ? <RefreshCw size={13} className="animate-spin" /> : <ArrowLeftRight size={13} />}
              {sweeping ? "Sweeping..." : "Execute Sweep to General Fund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 14.1.A — HASHED LIQUIDATIONS ====================
