import { useState } from "react";
import { Ban, Filter, Gavel, MessageSquare, ShieldAlert } from "lucide-react";
import { Btn, PageHeader, Stat, peso, pesoShort } from "./primitives";

type SplitCase = {
  id: string;
  vendor: string;
  office: string;
  item: string;
  pos: { po: string; date: string; amount: number }[];
  threshold: number;
  risk: "high" | "medium" | "critical";
  status: "flagged" | "explained" | "frozen";
};

const SPLIT_CASES: SplitCase[] = [
  {
    id: "s1",
    vendor: "Golden Supply Hardware Co.",
    office: "General Services Office (GSO)",
    item: "Office Equipment",
    pos: [
      { po: "PO-2026-04-0812", date: "Apr 04", amount: 420_000 },
      { po: "PO-2026-04-0847", date: "Apr 09", amount: 498_000 },
      { po: "PO-2026-04-0881", date: "Apr 14", amount: 490_000 },
    ],
    threshold: 1_000_000,
    risk: "critical",
    status: "flagged",
  },
  {
    id: "s2",
    vendor: "Reyes Construction Supplies",
    office: "City Engineering Office",
    item: "Cement & Rebar · Coastal Rd.",
    pos: [
      { po: "PO-2026-04-0721", date: "Apr 02", amount: 500_000 },
      { po: "PO-2026-04-0795", date: "Apr 07", amount: 600_000 },
    ],
    threshold: 1_000_000,
    risk: "high",
    status: "flagged",
  },
  {
    id: "s3",
    vendor: "Maribojoc Catering Services",
    office: "Office of the Mayor",
    item: "Event Catering",
    pos: [
      { po: "PO-2026-03-0612", date: "Mar 22", amount: 148_000 },
      { po: "PO-2026-03-0640", date: "Mar 26", amount: 152_000 },
      { po: "PO-2026-04-0701", date: "Apr 01", amount: 170_000 },
    ],
    threshold: 500_000,
    risk: "medium",
    status: "flagged",
  },
];

export function PublicBiddingBypasses() {
  const [selected, setSelected] = useState<SplitCase>(SPLIT_CASES[0]);
  const [frozen, setFrozen] = useState<Set<string>>(new Set());
  const total = selected.pos.reduce((s, p) => s + p.amount, 0);
  const riskTone: Record<string, string> = { critical: "bg-red-50 border-red-200 text-red-700", high: "bg-orange-50 border-orange-200 text-orange-700", medium: "bg-amber-50 border-amber-200 text-amber-700" };

  return (
    <div className="p-8 min-h-full">
      <PageHeader
        title="Public Bidding Bypasses"
        subtitle="Contract Splitting Radar · AI anomaly detection on Purchase Orders"
        actions={<><Btn icon={<Filter size={13} />} label="Filter by Office" /><Btn icon={<Gavel size={13} />} label="Referral to BAC" variant="primary" /></>}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Active Flags" value="7" trend="3 critical · 2 high · 2 medium" tone="bad" />
        <Stat label="Frozen POs" value={frozen.size.toString()} trend="Pending written justification" tone="warn" />
        <Stat label="Est. Bypass Value" value={pesoShort(6_420_000)} trend="Would require public bidding" tone="bad" />
        <Stat label="AI Confidence" value="94%" trend="Pattern match threshold" tone="neutral" />
      </div>

      <div className="grid grid-cols-[0.9fr_1.4fr] gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 px-1 mb-1">Flagged Cases</div>
          {SPLIT_CASES.map(c => (
            <button key={c.id} onClick={() => setSelected(c)} className={`w-full text-left bg-white border rounded-xl p-3 hover:shadow-sm transition ${selected.id === c.id ? "border-neutral-900 shadow-sm" : "border-neutral-200"}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[12px] font-medium text-neutral-900 truncate">{c.vendor}</div>
                <span className={`text-[9px] font-medium uppercase border rounded px-1.5 py-0.5 ${riskTone[c.risk]}`}>{c.risk}</span>
              </div>
              <div className="text-[11px] font-normal text-neutral-500">{c.office}</div>
              <div className="text-[11px] font-normal text-neutral-500 mt-0.5">{c.pos.length} POs · {peso(c.pos.reduce((s, p) => s + p.amount, 0))}</div>
            </button>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[15px] font-semibold text-neutral-900">{selected.vendor}</div>
              <div className="text-[11.5px] font-normal text-neutral-500">{selected.office} · {selected.item}</div>
            </div>
            <div className={`text-[10px] font-medium uppercase border rounded px-2 py-1 ${riskTone[selected.risk]}`}>{selected.risk} risk</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <ShieldAlert size={14} className="text-red-600 mt-0.5" />
              <div className="text-[11.5px] font-normal text-red-900 leading-relaxed">
                <span className="font-medium">AI Insight · 94% confidence.</span> The {selected.office} has issued {selected.pos.length} separate POs for "{selected.item}" to {selected.vendor} totaling {peso(total)} in 14 days. High probability of Contract Splitting to bypass the {peso(selected.threshold)} Public Bidding threshold (RA 9184).
              </div>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-2 px-3 py-2 bg-neutral-50 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              <div>PO Number</div><div>Date Issued</div><div className="text-right">Amount</div><div>&nbsp;</div>
            </div>
            {selected.pos.map(p => (
              <div key={p.po} className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-2 px-3 py-2.5 border-t border-neutral-100 items-center">
                <div className="text-[12px] font-medium text-neutral-900 font-mono">{p.po}</div>
                <div className="text-[12px] font-normal text-neutral-600">{p.date}, 2026</div>
                <div className="text-[12px] font-medium text-neutral-900 tabular-nums text-right">{peso(p.amount)}</div>
                <div>{frozen.has(p.po) ? <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 flex items-center gap-1"><Ban size={10} /> FROZEN</span> : <span className="text-[10px] text-neutral-500">pending</span>}</div>
              </div>
            ))}
            <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-2 px-3 py-2.5 border-t border-neutral-200 bg-neutral-50 items-center">
              <div className="text-[11px] font-medium text-neutral-900 col-span-2">Aggregate · within 14-day window</div>
              <div className="text-[13px] font-semibold text-red-700 tabular-nums text-right">{peso(total)}</div>
              <div />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFrozen(new Set(selected.pos.map(p => p.po)))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium bg-red-600 text-white hover:bg-red-700"
            >
              <Ban size={13} /> Freeze POs
            </button>
            <Btn icon={<MessageSquare size={13} />} label="Demand Written Justification" />
            <div className="ml-auto text-[10.5px] font-normal text-neutral-500">Action logged to Immutable Audit</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 14.2.B — COA TIMELINE FLAGS ====================
