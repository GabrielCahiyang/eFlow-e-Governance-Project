import { ArrowUpRight, CalendarDays } from "lucide-react";
import { formatDate } from "../../../components/workflow/primitives";
import type { DepartmentReportRow } from "../types";

const tone = (priority: string) => {
  const value = priority.toLowerCase();
  if (value === "critical" || value === "high") return "bg-red-50 text-red-700 border-red-200";
  if (value === "warning" || value === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  if (value === "approved" || value === "completed" || value === "low") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-neutral-50 text-neutral-600 border-neutral-200";
};

export function DepartmentReportTable({
  rows,
  onOpenTask,
}: {
  rows: DepartmentReportRow[];
  onOpenTask: (taskId: string) => void;
}) {
  return (
    <div className="max-w-full overflow-x-auto" role="region" aria-label="Department report rows" tabIndex={0}>
      <table className="w-full min-w-[980px] table-fixed">
        <colgroup>
          <col className="w-[260px]" />
          <col className="w-[150px]" />
          <col className="w-[160px]" />
          <col className="w-[140px]" />
          <col className="w-[150px]" />
          <col className="w-[150px]" />
          <col className="w-[240px]" />
        </colgroup>
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            {["Work item", "Person / role", "Project", "Status", "Signal", "Event / due", "Detail"].map((header) => (
              <th key={header} className="px-4 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-neutral-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-100 align-top hover:bg-neutral-50/70 transition-colors">
              <td className="max-w-[250px] break-words px-4 py-3 align-top whitespace-normal">
                <button
                  type="button"
                  disabled={!row.taskId}
                  onClick={() => row.taskId && onOpenTask(row.taskId)}
                  className={`text-left group ${row.taskId ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className="break-words text-[12px] font-medium text-neutral-900 group-hover:underline">
                    {row.title}
                  </span>
                  {row.taskId && <ArrowUpRight size={11} className="inline ml-1 text-neutral-400" />}
                  <span className="mt-0.5 block break-words text-[12px] text-neutral-500 line-clamp-2">{row.parent}</span>
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="text-[13px] text-neutral-800">{row.person}</div>
                <div className="mt-0.5 text-[12px] text-neutral-500">{row.role}</div>
              </td>
              <td className="max-w-[180px] break-words px-4 py-3 text-[12px] text-neutral-600 whitespace-normal">{row.project}</td>
              <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full border text-[12px] capitalize ${tone(row.status)}`}>
                  {row.status}
                </span>
                {typeof row.progress === "number" && (
                  <div className="w-24 mt-2">
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-neutral-800" style={{ width: `${Math.max(0, Math.min(100, row.progress))}%` }} /></div>
                    <div className="mt-0.5 text-[12px] text-neutral-500">{row.progress}%</div>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[12px] capitalize ${tone(row.priority)}`}>{row.priority}</span>
                <div className="mt-1.5 text-[12px] text-neutral-600">{row.metric}</div>
              </td>
              <td className="px-4 py-3 text-[12px] text-neutral-500 whitespace-nowrap">
                {row.eventAt && <div>{formatDate(row.eventAt)}</div>}
                {row.dueAt && <div className="flex items-center gap-1 mt-1"><CalendarDays size={11} /> Due {formatDate(row.dueAt)}</div>}
              </td>
              <td className="max-w-[240px] break-words px-4 py-3 text-[12px] text-neutral-600 whitespace-normal">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
