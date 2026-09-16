import { useState } from "react";
import { CheckmarkOutline, ChevronDown, DocumentAdd, DocumentExport } from "@carbon/icons-react";
import { Btn, PageHeader, Pill, StatCard } from "./primitives";
import { measures } from "./data";

export function FirstReading() {
  const items = measures.filter(m => m.stage === "First Reading");
  const committees = [
    "Committee on Appropriations",
    "Committee on Tourism & Environment",
    "Committee on Public Safety",
    "Committee on Good Government",
    "Committee on Education",
    "Committee on Infrastructure",
  ];

  const [referrals, setReferrals] = useState<Record<string, string>>({});

  return (
    <div>
      <PageHeader
        title="Plenary Calendaring"
        subtitle="Active Measures Pipeline · First Reading (Intake & Referral)"
        actions={<>
          <Btn icon={<DocumentAdd size={14} />} label="Log New Measure" variant="primary" />
          <Btn icon={<DocumentExport size={14} />} label="Session Agenda" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Pending Intake" value={`${items.length}`} sub="Awaiting referral" />
        <StatCard label="Ordinances" value={`${items.filter(m => m.type === "Ordinance").length}`} sub="Requires 3 readings" />
        <StatCard label="Resolutions" value={`${items.filter(m => m.type === "Resolution").length}`} sub="Non-binding measures" />
        <StatCard label="Oldest Pending" value="8d" sub="ORD-2026-046" />
      </div>

      {/* Intake list */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-[100px_1fr_150px_100px_200px] gap-0 px-5 py-3 bg-neutral-50/50 border-b border-neutral-100">
          {["Tracking No.", "Title", "Principal Author", "Date Received", "Referral Action"].map(h => (
            <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {items.map(m => (
          <div key={m.trackingNo} className="grid grid-cols-[100px_1fr_150px_100px_200px] gap-0 px-5 py-4 border-b border-neutral-50 hover:bg-blue-50/20 transition-colors items-center">
            <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] text-blue-600">{m.trackingNo}</span>
            <div>
              <p className="text-[12px] font-medium text-neutral-900 leading-tight">{m.title}</p>
              <Pill status={m.type} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-semibold text-white">{m.authorInitials}</div>
              <span className="text-[11px] font-normal text-neutral-700">{m.author}</span>
            </div>
            <span className="text-[11px] font-normal text-neutral-600">{m.dateReceived}</span>
            {/* Referral dropdown */}
            <div className="relative">
              <select
                value={referrals[m.trackingNo] || ""}
                onChange={(e) => setReferrals(prev => ({ ...prev, [m.trackingNo]: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-[11px] font-medium cursor-pointer appearance-none bg-white pr-8 ${
                  referrals[m.trackingNo] ? "border-violet-300 bg-violet-50 text-violet-700" : "border-neutral-200 text-neutral-600"
                }`}
              >
                <option value="">Assign to Committee…</option>
                {committees.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              {referrals[m.trackingNo] && (
                <div className="mt-1.5 flex items-center gap-1">
                  <CheckmarkOutline size={12} className="text-violet-500" />
                  <span className="text-[9px] font-normal text-violet-600">Referred → moves to Committee Level</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 6.1B COMMITTEE LEVEL ====================
