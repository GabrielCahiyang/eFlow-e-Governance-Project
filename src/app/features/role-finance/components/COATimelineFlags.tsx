import { Bell, CalendarX, Download } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type Deadline = { id: string; name: string; owner: string; start: number; end: number; due: number; status: "ontrack" | "warning" | "overdue" };

const DEADLINES: Deadline[] = [
  { id: "d1", name: "Trial Balance · Q1 2026", owner: "Bookkeeping · Ms. Evangelista", start: 1, end: 25, due: 30, status: "ontrack" },
  { id: "d2", name: "Bank Reconciliation · March", owner: "Treasury · Mr. Padojinog", start: 5, end: 28, due: 28, status: "warning" },
  { id: "d3", name: "Quarter-End Report Q1", owner: "Accounting · Atty. Uy", start: 10, end: 35, due: 32, status: "overdue" },
  { id: "d4", name: "Monthly Cash Report · April", owner: "Treasury · Mr. Padojinog", start: 15, end: 42, due: 45, status: "ontrack" },
  { id: "d5", name: "Disbursement Voucher Registry", owner: "Accounting · Ms. Villanueva", start: 8, end: 34, due: 40, status: "ontrack" },
  { id: "d6", name: "Statement of Appropriations", owner: "Budget · Ms. Aseniero", start: 3, end: 32, due: 30, status: "warning" },
];

export function COATimelineFlags() {
  const today = 27;
  const max = 50;
  const tone: Record<string, { bar: string; chip: string; dot: string }> = {
    ontrack: { bar: "bg-emerald-400", chip: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
    warning: { bar: "bg-amber-400", chip: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
    overdue: { bar: "bg-red-500", chip: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" },
  };

  return (
    <div className="p-8 min-h-full">
      <PageHeader
        title="COA Timeline Flags"
        subtitle="Statutory submission Gantt · AOM prevention dashboard"
        actions={<><Btn icon={<Bell size={13} />} label="Nudge All Owners" /><Btn icon={<Download size={13} />} label="Export COA Package" variant="primary" /></>}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Active Submissions" value={DEADLINES.length.toString()} trend="Tracked statutory items" tone="neutral" />
        <Stat label="Overdue" value={DEADLINES.filter(d => d.status === "overdue").length.toString()} trend="AOM exposure" tone="bad" />
        <Stat label="At Risk (≤5d)" value={DEADLINES.filter(d => d.status === "warning").length.toString()} trend="Auto-nudged" tone="warn" />
        <Stat label="AOMs YTD" value="0" trend="Zero observations issued" tone="good" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarX size={15} className="text-neutral-900" />
          <div className="text-[13px] font-medium text-neutral-900">Submission Gantt · Day 1–50 rolling window</div>
          <div className="ml-auto text-[11px] font-normal text-neutral-500">Today: Day {today}</div>
        </div>

        <div className="space-y-3">
          {DEADLINES.map(d => {
            const leftPct = (d.start / max) * 100;
            const widthPct = ((d.end - d.start) / max) * 100;
            const duePct = (d.due / max) * 100;
            const t = tone[d.status];
            return (
              <div key={d.id} className="grid grid-cols-[220px_1fr_90px] gap-3 items-center">
                <div>
                  <div className="text-[12px] font-medium text-neutral-900 truncate">{d.name}</div>
                  <div className="text-[10.5px] font-normal text-neutral-500 truncate">{d.owner}</div>
                </div>
                <div className="relative h-7 bg-neutral-100 rounded-md overflow-hidden">
                  <div className={`absolute top-0 bottom-0 ${t.bar} opacity-80 rounded-md`} style={{ left: `${leftPct}%`, width: `${widthPct}%` }} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-neutral-900" style={{ left: `${(today / max) * 100}%` }} title="Today" />
                  <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-500" style={{ left: `${duePct}%` }} title={`Due: Day ${d.due}`}>
                    <div className="absolute -top-0.5 -left-1 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className={`text-[10px] font-medium uppercase border rounded px-1.5 py-0.5 flex items-center gap-1 ${t.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />{d.status === "ontrack" ? "on track" : d.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-4 text-[10.5px] font-normal text-neutral-500 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> On track</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> ≤5 days to due</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Overdue · AOM risk</div>
          <div className="flex items-center gap-1.5"><span className="w-0.5 h-3 bg-neutral-900" /> Today</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> COA due date</div>
          <div className="ml-auto text-neutral-600">Red T-5 auto-nudges responsible owners via eFlow + SMS</div>
        </div>
      </div>
    </div>
  );
}

// ==================== 14.2.C — 30-DAY LIQUIDATION ALERTS ====================
