import { CheckCircle2, Circle, FileCheck2, Link2 } from "lucide-react";
import type { Task } from "../../../services/taskService";

export function TaskReviewStandards({
  task,
  tasks,
}: {
  task: Task;
  tasks: Task[];
}) {
  const dependencies = (task.dependencyIds || [])
    .map((id) => tasks.find((candidate) => candidate.id === id))
    .filter((dependency): dependency is Task => Boolean(dependency));
  const hasStandards = Boolean(
    task.acceptanceCriteria?.length || task.definitionOfDone || dependencies.length,
  );

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
          <FileCheck2 size={16} />
        </span>
        <div>
          <h3 className="text-[13px] font-semibold text-neutral-900">Completion standards</h3>
          <p className="mt-0.5 text-[11px] text-neutral-500">Compare the final submission and subtask evidence against the original definition of success.</p>
        </div>
      </div>

      {!hasStandards ? (
        <div className="mt-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-[11.5px] text-neutral-500">
          No formal acceptance criteria, definition of done, or dependencies were recorded for this task.
        </div>
      ) : (
        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          {Boolean(task.acceptanceCriteria?.length) && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Acceptance criteria</div>
              <div className="mt-2 space-y-2">
                {task.acceptanceCriteria?.map((criterion) => (
                  <div key={criterion} className="flex items-start gap-2 text-[11.5px] text-neutral-700">
                    <Circle size={12} className="mt-0.5 shrink-0 text-neutral-400" />
                    <span>{criterion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.definitionOfDone && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                <CheckCircle2 size={12} /> Definition of done
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[11.5px] text-emerald-900">{task.definitionOfDone}</p>
            </div>
          )}

          {dependencies.length > 0 && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 xl:col-span-2">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                <Link2 size={12} /> Dependencies · {dependencies.filter((item) => item.status === "completed").length}/{dependencies.length} complete
              </div>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {dependencies.map((dependency) => (
                  <div key={dependency.id} className="flex items-center gap-2 rounded-md bg-white px-2.5 py-2 text-[11px] text-neutral-700">
                    {dependency.status === "completed"
                      ? <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
                      : <Circle size={13} className="shrink-0 text-amber-500" />}
                    <span className="min-w-0 flex-1 truncate">{dependency.title}</span>
                    <span className="text-[9.5px] capitalize text-neutral-400">{dependency.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
