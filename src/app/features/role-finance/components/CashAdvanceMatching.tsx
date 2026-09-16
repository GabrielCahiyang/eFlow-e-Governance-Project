import { useState } from "react";
import { CheckCircle2, Clock, Filter, Flame, Shield } from "lucide-react";
import { Btn, PageHeader, peso } from "./primitives";
import { EqBlock, OpChar } from "./UnspentFunds";

type CashAdvance = {
  id: string;
  employee: string;
  dept: string;
  purpose: string;
  advanced: number;
  verified: number;
  returned: number;
  overdueDays: number;
};

const CASH_ADVANCES: CashAdvance[] = [
  { id: "CA-2026-0091", employee: "Engr. R. Mapalad", dept: "Engineering", purpose: "Eco-Park P2 materials advance", advanced: 10000, verified: 8500, returned: 0, overdueDays: 0 },
  { id: "CA-2026-0088", employee: "Dr. M. Sabando", dept: "Health", purpose: "Provincial medical outreach", advanced: 25000, verified: 18450, returned: 6550, overdueDays: 0 },
  { id: "CA-2026-0093", employee: "L. Bascon", dept: "LEDIPO", purpose: "Tourism campaign pilot", advanced: 12000, verified: 6780, returned: 0, overdueDays: 4 },
  { id: "CA-2026-0087", employee: "J. Pomentil", dept: "Social Welfare", purpose: "Senior citizen event", advanced: 10000, verified: 8400, returned: 1600, overdueDays: 0 },
  { id: "CA-2026-0072", employee: "R. Alcantara", dept: "Environment", purpose: "Brgy. tree planting drive", advanced: 8000, verified: 4200, returned: 0, overdueDays: 38 },
];

export function CashAdvanceMatching() {
  const [selected, setSelected] = useState<CashAdvance>(CASH_ADVANCES[0]);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  const filtered = showOverdueOnly ? CASH_ADVANCES.filter((c) => c.overdueDays > 30) : CASH_ADVANCES;
  const expected = selected.advanced - selected.verified;
  const shortfall = expected - selected.returned;
  const balanced = shortfall === 0;

  return (
    <div>
      <PageHeader
        title="Liquidation Balancer"
        subtitle="Mathematical gate · you cannot close the cycle until every centavo reconciles"
        actions={
          <button
            onClick={() => setShowOverdueOnly((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors border ${
              showOverdueOnly ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-neutral-700 border-neutral-200"
            }`}
          >
            <Filter size={13} /> Overdue &gt; 30 days
          </button>
        }
      />

      <div className="grid grid-cols-[300px_1fr] gap-4">
        {/* Queue */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-neutral-200 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Cash Advances ({filtered.length})
          </div>
          {filtered.map((c) => {
            const active = selected.id === c.id;
            const short = c.advanced - c.verified - c.returned;
            const overdue = c.overdueDays > 30;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors ${active ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`font-mono text-[10px] ${active ? "text-neutral-400" : "text-neutral-400"}`}>{c.id}</span>
                  {overdue && <span className="px-1 py-0.5 rounded bg-red-600 text-white text-[8px] font-medium uppercase">{c.overdueDays}d</span>}
                </div>
                <div className={`text-[12px] font-medium ${active ? "text-white" : "text-neutral-900"}`}>{c.employee}</div>
                <div className={`text-[10px] ${active ? "text-neutral-300" : "text-neutral-500"} mt-0.5`}>{c.dept} · {peso(c.advanced)}</div>
                <div className={`text-[10px] font-normal mt-1 ${short === 0 ? (active ? "text-emerald-400" : "text-emerald-600") : active ? "text-amber-400" : "text-amber-600"}`}>
                  {short === 0 ? "✓ Reconciled" : `₱${short.toLocaleString()} unreconciled`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Equation UI */}
        <div className="bg-gradient-to-br from-neutral-50 to-white border-2 border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[11px] font-mono text-neutral-400">{selected.id}</div>
              <div className="text-[16px] font-semibold text-neutral-900 mt-0.5">{selected.employee}</div>
              <div className="text-[11px] text-neutral-500">{selected.dept} · {selected.purpose}</div>
            </div>
            {selected.overdueDays > 30 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
                <Flame size={11} /> Overdue {selected.overdueDays} days
              </span>
            )}
          </div>

          {/* The Equation */}
          <div className="mt-8 flex items-stretch gap-4">
            <EqBlock label="Original Cash Advance" value={selected.advanced} tone="neutral" />
            <OpChar>−</OpChar>
            <EqBlock label="Total Verified Receipts" value={selected.verified} tone="warn" />
            <OpChar>=</OpChar>
            <EqBlock label="Expected Return" value={expected} tone="blue" big />
          </div>

          <div className="mt-6 flex items-stretch gap-4">
            <EqBlock label="Expected Return" value={expected} tone="blue" />
            <OpChar>−</OpChar>
            <EqBlock label="Physical Cash Returned to Treasury" value={selected.returned} tone={selected.returned > 0 ? "good" : "neutral"} />
            <OpChar>=</OpChar>
            <EqBlock
              label={shortfall === 0 ? "Balanced" : "Shortfall"}
              value={shortfall}
              tone={shortfall === 0 ? "good" : "bad"}
              big
            />
          </div>

          {/* Status + action */}
          <div className="mt-7 p-4 rounded-lg border-2 flex items-center gap-3"
            style={{ borderColor: balanced ? "#10b981" : "#f59e0b", background: balanced ? "#ecfdf5" : "#fffbeb" }}>
            {balanced ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Clock size={20} className="text-amber-600" />}
            <div className="flex-1">
              <div className="text-[13px] font-semibold" style={{ color: balanced ? "#047857" : "#b45309" }}>
                {balanced ? "Equation balanced" : "Cycle cannot close"}
              </div>
              <div className="text-[11px] font-normal" style={{ color: balanced ? "#047857" : "#b45309" }}>
                {balanced
                  ? "Physical cash has been reconciled. Ready to seal the liquidation."
                  : `₱${shortfall.toLocaleString()} must be physically returned before the auditor can close this cycle.`}
              </div>
            </div>
            <Btn
              icon={<Shield size={13} />}
              label={balanced ? "Seal Liquidation" : "Blocked — Awaiting Return"}
              variant={balanced ? "success" : "secondary"}
              disabled={!balanced}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
