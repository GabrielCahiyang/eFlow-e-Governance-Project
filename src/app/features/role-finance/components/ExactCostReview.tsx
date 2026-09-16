import { useState } from "react";
import { Bell, Download, Flame, Info, MessageSquare } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type PriceAnomaly = {
  id: string;
  employee: string;
  dept: string;
  item: string;
  unit: string;
  claimed: number;
  historical: number;
  variance: number;
  severity: "high" | "medium";
  receiptId: string;
  note?: string;
  explained?: string;
};

const ANOMALIES: PriceAnomaly[] = [
  { id: "an1", employee: "L. Bascon", dept: "LEDIPO", item: "Tarpaulin print 8×4ft", unit: "pc", claimed: 480, historical: 220, variance: 118.2, severity: "high", receiptId: "RCP-2026-1844" },
  { id: "an2", employee: "Engr. R. Mapalad", dept: "Engineering", item: "Cement (40kg)", unit: "bag", claimed: 450, historical: 250, variance: 80.0, severity: "high", receiptId: "RCP-2026-1839", note: "Submitted in Cogon field receipt" },
  { id: "an3", employee: "Dr. M. Sabando", dept: "Health", item: "Paracetamol 500mg (100s)", unit: "box", claimed: 620, historical: 540, variance: 14.8, severity: "medium" , receiptId: "RCP-2026-1843"},
  { id: "an4", employee: "Arch. P. Odal", dept: "Planning", item: "Blueprint plotter paper", unit: "roll", claimed: 3200, historical: 1800, variance: 77.8, severity: "high", receiptId: "RCP-2026-1840" },
  { id: "an5", employee: "F. Lariosa", dept: "Legal", item: "Legal folder premium", unit: "dozen", claimed: 780, historical: 640, variance: 21.9, severity: "medium", receiptId: "RCP-2026-1836" },
];

export function ExactCostReview() {
  const [items] = useState(ANOMALIES);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  function requestExplanation(id: string) {
    setRequested((s) => new Set([...s, id]));
  }

  return (
    <div>
      <PageHeader
        title="AI Price Anomaly Detector"
        subtitle="Cross-referenced against 38,000 historical LGU procurement records · graft pre-emption"
        actions={
          <>
            <Btn icon={<Download size={14} />} label="Export COA Flags" />
            <Btn icon={<Bell size={14} />} label="Notify All Flagged" variant="primary" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Items Scanned" value="1,482" trend="this week" />
        <Stat label="Anomalies Detected" value={String(items.length)} trend={`${items.filter((i) => i.severity === "high").length} high severity`} tone="warn" />
        <Stat label="High-Variance Flags" value={String(items.filter((i) => i.variance > 50).length)} trend="> 50% over historical" tone="bad" />
        <Stat label="Explanations Pending" value={String(requested.size)} trend="awaiting employee reply" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          <div className="col-span-3">Flagged Item</div>
          <div className="col-span-2">Submitted by</div>
          <div className="col-span-2 text-right">Claimed Unit Price</div>
          <div className="col-span-2 text-right">LGU Historical Avg</div>
          <div className="col-span-1 text-right">Variance</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {items.map((a) => {
          const pending = requested.has(a.id);
          return (
            <div key={a.id} className={`grid grid-cols-12 px-5 py-4 border-b border-neutral-100 last:border-0 items-center hover:bg-neutral-50 transition-colors`}>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Flame size={12} className={a.severity === "high" ? "text-red-600" : "text-amber-500"} />
                  <span className="text-[12px] font-medium text-neutral-900">{a.item}</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-normal mt-0.5 ml-5">per {a.unit} · receipt {a.receiptId}</div>
              </div>
              <div className="col-span-2 text-[12px] font-normal">
                <div className="text-neutral-900 font-medium">{a.employee}</div>
                <div className="text-[10px] text-neutral-500">{a.dept}</div>
              </div>
              <div className="col-span-2 text-right">
                <div className="text-[14px] font-semibold text-red-600 tabular-nums">₱{a.claimed.toLocaleString()}</div>
              </div>
              <div className="col-span-2 text-right">
                <div className="text-[13px] font-medium text-neutral-700 tabular-nums">₱{a.historical.toLocaleString()}</div>
              </div>
              <div className="col-span-1 text-right">
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  a.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  +{a.variance.toFixed(0)}%
                </span>
              </div>
              <div className="col-span-2 text-right">
                {pending ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">
                    <MessageSquare size={10} /> Explanation requested
                  </span>
                ) : (
                  <button
                    onClick={() => requestExplanation(a.id)}
                    className="text-[11px] font-medium text-neutral-900 hover:underline cursor-pointer"
                  >
                    Request Explanation →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-white border border-neutral-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={14} className="text-neutral-500 mt-0.5" />
        <div className="text-[11px] font-normal text-neutral-600 leading-relaxed">
          LGU historical averages are computed from <span className="font-medium text-neutral-900">38,214 prior procurements</span> across all City Hall offices over the past 36 months, weighted by recency. The threshold for "high severity" is ≥50% variance from the rolling average.
        </div>
      </div>
    </div>
  );
}

// ==================== 13.1.C — CASH ADVANCE MATCHING (EQUATION) ====================
