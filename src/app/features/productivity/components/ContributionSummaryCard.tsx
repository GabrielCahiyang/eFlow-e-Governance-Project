import { Trophy } from "lucide-react";
import type { MonthlyContributionRow } from "../types";

export function ContributionSummaryCard({ rows, title = "Monthly contribution" }: { rows: MonthlyContributionRow[]; title?: string }) {
  const leader = rows[0];
  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-amber-700"><Trophy size={14} />{title}</div><span className="rounded-full bg-white px-2 py-1 text-[8.5px] text-neutral-500">Approved work only</span></div>
      {leader ? <><div className="mt-3 flex items-end justify-between gap-3"><div><div className="text-[9px] text-neutral-400">Current leader</div><div className="mt-0.5 text-[13px] font-semibold text-neutral-900">{leader.employeeName}</div><div className="text-[9px] text-neutral-400">{leader.approvedTasks} tasks · {leader.approvedSubtasks} subtasks</div></div><div className="text-right"><div className="text-[22px] font-semibold text-neutral-900">{leader.contributionScore}</div><div className="text-[8.5px] text-neutral-400">contribution score</div></div></div><div className="mt-3 flex gap-1">{rows.slice(0, 3).map((row) => <span key={row.userId} className="truncate rounded-md border border-amber-100 bg-white px-2 py-1 text-[8.5px] text-neutral-600">#{row.rank} {row.employeeName}</span>)}</div></> : <p className="mt-4 text-[10px] text-neutral-500">No approved contributions this month yet.</p>}
    </div>
  );
}
