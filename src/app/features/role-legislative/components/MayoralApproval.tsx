import { CheckmarkOutline, Download, Renew, Time, Warning } from "@carbon/icons-react";
import { Btn, PageHeader, Pill, StatCard } from "./primitives";

const pendingApproval = [
  {
    trackingNo: "ORD-2026-042",
    title: "An Ordinance Establishing the Ormoc City Sustainable Tourism and Eco-Park Zone",
    passedDate: "2026-04-10",
    daysElapsed: 6,
    deadlineDays: 10,
    author: "Hon. R. Almario",
    voteResult: "9-2-1",
    status: "Pending" as const,
  },
];

export function MayoralApproval() {
  const item = pendingApproval[0];
  const daysRemaining = item.deadlineDays - item.daysElapsed;
  const pctElapsed = (item.daysElapsed / item.deadlineDays) * 100;

  return (
    <div>
      <PageHeader
        title="Pending Executive Action"
        subtitle="Active Measures Pipeline · Mayoral Approval"
        actions={<>
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <Time size={14} className="text-amber-600" />
            <span className="text-[12px] font-semibold text-amber-700">10-Day Lapse Timer Active</span>
          </div>
          <Btn icon={<Download size={14} />} label="Export" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Pending Signature" value={`${pendingApproval.length}`} sub="Awaiting Mayor" />
        <StatCard label="Days Remaining" value={`${daysRemaining}`} sub={`of ${item.deadlineDays} day limit`} trend={daysRemaining < 4 ? "down" : "flat"} />
        <StatCard label="Vote Result" value={item.voteResult} sub="Yes-No-Abstain" />
        <StatCard label="Auto-Lapse" value={daysRemaining <= 0 ? "TRIGGERED" : `In ${daysRemaining}d`} sub="If unsigned" />
      </div>

      {/* BPA Lapse Timer explanation */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <Renew size={16} className="text-cyan-600 mt-0.5 shrink-0" />
          <div>
            <span className="text-[12px] font-semibold text-cyan-800">Automated Lapse Rule (R.A. 7160, Sec. 54)</span>
            <p className="text-[11px] font-normal text-cyan-700 mt-0.5">
              If the Mayor does not sign or veto this ordinance within the legally mandated {item.deadlineDays}-day timeframe, the BPA engine will automatically change the status to <strong>"Enacted into Law (Lapsed)"</strong> and push it to the Adopted Ordinances Archive.
            </p>
          </div>
        </div>
      </div>

      {/* Pending approval board */}
      {pendingApproval.map(p => (
        <div key={p.trackingNo} className="bg-white rounded-xl border border-neutral-200 p-6 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] text-cyan-600">{p.trackingNo}</span>
                <Pill status="Mayoral Approval" />
              </div>
              <h3 className="text-[16px] font-semibold text-neutral-900">{p.title}</h3>
              <p className="text-[11px] font-normal text-neutral-500 mt-1">Author: {p.author} · Passed: {p.passedDate} · Vote: {p.voteResult}</p>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="bg-neutral-50 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-neutral-900">Executive Action Countdown</span>
              <span className={`text-[14px] font-semibold ${daysRemaining < 4 ? "text-red-600" : "text-cyan-700"}`}>
                {daysRemaining} days remaining
              </span>
            </div>
            <div className="w-full h-6 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${
                  pctElapsed > 80 ? "bg-red-400" : pctElapsed > 50 ? "bg-amber-400" : "bg-cyan-400"
                }`}
                style={{ width: `${pctElapsed}%` }}
              >
                <span className="text-[10px] font-semibold text-white">{item.daysElapsed}d elapsed</span>
              </div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] font-normal text-neutral-400">Passed ({p.passedDate})</span>
              <span className="text-[9px] font-normal text-neutral-400">Deadline (2026-04-20)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-emerald-700 transition-colors">
              <CheckmarkOutline size={16} /> Sign into Law
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-red-100 transition-colors">
              <Warning size={16} /> Veto with Remarks
            </button>
            <span className="ml-auto text-[10px] font-normal text-neutral-400">
              If no action is taken by deadline, measure auto-enacts via lapse provision.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== 6.2 PARENT: ADOPTED ORDINANCES ARCHIVE ====================
