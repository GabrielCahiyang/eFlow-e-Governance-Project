// ─── Data-Health Panel (plan §5 — restricted admin observability) ──────────
// Surfaces the exact integrity problems the stabilization plan was written to
// eliminate, so a returning regression is visible instead of silently skewing
// dashboards. Everything is derived from the SAME shared selectors the
// dashboards use — a clean board here means the dashboards can be trusted.
//
// Checks (plan §5):
//   • pending tasks that already have an assignee   (assignment-state drift)
//   • active tasks missing a canonical project link (Needs project link)
//   • overdue-shaped tasks with no real due date    (fuzzy schedule leakage)
//   • tasks pointing at a project that no longer exists (dangling link)
//
// Milestone-link validity is intentionally out of scope here: the client only
// holds the project list, not every project's milestones, so a milestone audit
// belongs in a server-side report rather than this live panel.

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useTasksData, useProjectsData } from "../../hooks/useSupabaseData";
import { dataHealth, type DataHealthReport } from "../../services/taskSelectors";

function HealthRow({
  label,
  count,
  hint,
  tasks,
}: {
  label: string;
  count: number;
  hint: string;
  tasks: { id: string; title: string }[];
}) {
  const ok = count === 0;
  return (
    <div className="px-4 py-3 border-b border-neutral-50 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {ok ? (
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
          )}
          <span className="text-[12.5px] font-medium text-neutral-800 truncate">
            {label}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums shrink-0 ${
            ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {count}
        </span>
      </div>
      <div className="text-[10.5px] font-normal text-neutral-400 mt-1 ml-[23px]">
        {hint}
      </div>
      {!ok && (
        <ul className="mt-1.5 ml-[23px] space-y-0.5">
          {tasks.slice(0, 5).map((t) => (
            <li key={t.id} className="text-[11px] font-normal text-neutral-600 truncate">
              • {t.title}
            </li>
          ))}
          {tasks.length > 5 && (
            <li className="text-[11px] font-normal text-neutral-400">
              + {tasks.length - 5} more
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export function DataHealthPanel() {
  const { tasks, loading: tasksLoading, error } = useTasksData();
  const { projects, loading: projectsLoading } = useProjectsData();

  const report: DataHealthReport = useMemo(
    () => dataHealth(tasks, projects),
    [tasks, projects],
  );

  const loading = tasksLoading || projectsLoading;
  const totalIssues =
    report.assignedButPending.length +
    report.missingProjectLink.length +
    report.danglingProjectLink.length +
    report.overdueWithoutDueDate.length;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-neutral-500" />
          <span className="text-[12px] font-semibold text-neutral-700">
            Data Health
          </span>
        </div>
        {!loading && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              totalIssues === 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {totalIssues === 0 ? "All clear" : `${totalIssues} to review`}
          </span>
        )}
      </div>

      {loading ? (
        <div className="px-4 py-8 text-center text-[12px] font-normal text-neutral-400">
          Checking operational data…
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-[12px] font-normal text-red-500">
          Couldn't load task data — health checks unavailable. Retry shortly.
        </div>
      ) : (
        <div>
          <HealthRow
            label="Assigned but still pending"
            count={report.assignedButPending.length}
            hint="A task with an assignee must never sit in pending_assignment."
            tasks={report.assignedButPending}
          />
          <HealthRow
            label="Missing a project link"
            count={report.missingProjectLink.length}
            hint="Active work with no canonical linked_project_id — needs a project."
            tasks={report.missingProjectLink}
          />
          <HealthRow
            label="Dangling project link"
            count={report.danglingProjectLink.length}
            hint="linked_project_id points to a project that no longer exists."
            tasks={report.danglingProjectLink}
          />
          <HealthRow
            label="Overdue-shaped, no real due date"
            count={report.overdueWithoutDueDate.length}
            hint="A fuzzy schedule ('Month 2') can't drive an operational deadline."
            tasks={report.overdueWithoutDueDate}
          />
        </div>
      )}
    </div>
  );
}
