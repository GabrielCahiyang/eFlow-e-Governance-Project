import { AlertTriangle, CheckCircle2, Clock3, Search, ShieldAlert } from "lucide-react";
import type { Employee } from "../../../employees";
import type { TeamMemberMetrics } from "../../types";
import { TEAM_WORKLOAD_ELEVATED_THRESHOLD, TEAM_WORKLOAD_HIGH_THRESHOLD } from "../../constants";

export function TeamMemberBoard({
  employees,
  metrics,
  selectedEmployeeId,
  search,
  onSearch,
  onSelect,
}: {
  employees: Employee[];
  metrics: TeamMemberMetrics[];
  selectedEmployeeId?: string;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (employeeId: string) => void;
}) {
  const metricById = new Map(metrics.map((metric) => [metric.employeeId, metric]));
  const query = search.trim().toLowerCase();
  const filtered = employees.filter((employee) => !query || `${employee.name} ${employee.jobTitle} ${employee.departmentName || ""}`.toLowerCase().includes(query));

  return (
    <div>
      <div className="relative mb-3">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search team members…" className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-[12px] outline-none transition focus:border-neutral-400" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((employee) => {
          const metric = metricById.get(employee.id);
          if (!metric) return null;
          const high = metric.workloadSignal >= TEAM_WORKLOAD_HIGH_THRESHOLD;
          const medium = metric.workloadSignal >= TEAM_WORKLOAD_ELEVATED_THRESHOLD;
          const selected = selectedEmployeeId === employee.id;
          return (
            <button key={employee.id} type="button" onClick={() => onSelect(employee.id)} className={`rounded-xl border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none ${selected ? "border-neutral-900 ring-1 ring-neutral-900/10" : "border-neutral-200 hover:border-neutral-300"}`}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-900 text-[12px] font-semibold text-white">{employee.initials || "??"}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><h3 className="truncate text-[13px] font-semibold text-neutral-900">{employee.name}</h3><p className="truncate text-[12px] text-neutral-500">{employee.jobTitle}</p></div>
                    {metric.blocked > 0 ? <ShieldAlert size={15} className="shrink-0 text-red-500" /> : metric.stale ? <Clock3 size={15} className="shrink-0 text-amber-500" /> : <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[12px]"><span className="uppercase tracking-wide text-neutral-500">Workload signal</span><span className={high ? "font-medium text-red-600" : medium ? "font-medium text-amber-600" : "font-medium text-emerald-600"}>{metric.workloadSignal}/100</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100"><div className={`h-full rounded-full transition-all ${high ? "bg-red-500" : medium ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${metric.workloadSignal}%` }} /></div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-neutral-100 pt-3">
                {[ ["Tasks", metric.activeTasks], ["Subtasks", metric.activeSubtasks], ["Due", metric.dueSoon], ["Risk", metric.overdue + metric.blocked] ].map(([label, value]) => (
                  <div key={label as string} className="rounded-lg bg-neutral-50 px-1.5 py-2 text-center"><div className={`text-[13px] font-semibold ${label === "Risk" && Number(value) > 0 ? "text-red-600" : "text-neutral-900"}`}>{value as number}</div><div className="text-[12px] uppercase tracking-wide text-neutral-500">{label as string}</div></div>
                ))}
              </div>
              {high && <p className="mt-2 flex items-center gap-1 text-[12px] text-red-600"><AlertTriangle size={11} /> Review priorities or redistribute work.</p>}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="rounded-xl border border-dashed border-neutral-200 py-14 text-center text-[12px] text-neutral-400">No team members match this search.</div>}
    </div>
  );
}
