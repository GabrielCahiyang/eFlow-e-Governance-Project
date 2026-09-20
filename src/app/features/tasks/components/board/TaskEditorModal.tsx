import { Trash2, Users, X } from "lucide-react";
import type { Employee } from "../../../../services/employeeService";
import type { Task } from "../../../../services/taskService";
import { TaskSubtasksWidget } from "../../../subtasks";
import { TaskChatSection } from "./TaskChatSection";
import type { TaskEditorDraft } from "./model";

function TaskSubtasksSection({ taskId, employees }: { taskId: string; employees: Employee[] }) {
  return (
    <TaskSubtasksWidget
      taskId={taskId}
      allowedAssignees={employees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        initials: employee.initials,
      }))}
      canManage
    />
  );
}
// ─── Draft Task Row ───────────────────────────────────────────────

export function TaskEditorModal({
  open,
  task,
  draft,
  onChange,
  onClose,
  onSave,
  onDelete,
  onCancelTask,
  onOpenTeamEditor,
  saving,
  error,
  employees,
  availableTasks,
  employeeById,
  currentUserId,
  currentUserName,
}: {
  open: boolean;
  task: Task | null;
  draft: TaskEditorDraft | null;
  onChange: (patch: Partial<TaskEditorDraft>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCancelTask: () => void;
  onOpenTeamEditor: () => void;
  saving: boolean;
  error: string;
  employees: Employee[];
  availableTasks: Task[];
  employeeById: Record<string, Employee>;
  currentUserId?: string;
  currentUserName?: string;
}) {
  if (!open || !task || !draft) return null;

  const teamMembers = draft.teamMemberIds
    .map((id) => employeeById[id])
    .filter((member): member is Employee => Boolean(member));
  const leadName =
    (draft.leadMemberId ? employeeById[draft.leadMemberId]?.name : "") ||
    teamMembers[0]?.name ||
    "Unassigned";
  const reviewerCandidates = employees.filter(
    (employee) => employee.id !== draft.leadMemberId,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88dvh] w-[calc(100vw-2rem)] max-w-[760px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
              Task Editor
            </div>
            <div className="text-[16px] font-semibold text-neutral-900 mt-0.5">
              {task.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Task Title
              </label>
              <input
                value={draft.title}
                onChange={(e) => onChange({ title: e.target.value })}
                className="mt-1 h-[40px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Description
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => onChange({ description: e.target.value })}
                className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Due Date / Schedule
              </label>
              <input
                value={draft.deadline}
                onChange={(e) => onChange({ deadline: e.target.value })}
                placeholder="e.g. 2026-07-15 or Month 1"
                className="mt-1 h-[40px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Priority
              </label>
              <select
                value={draft.priority}
                onChange={(e) =>
                  onChange({
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="mt-1 h-[40px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Tags
              </label>
              <input
                value={draft.tagsText}
                onChange={(e) => onChange({ tagsText: e.target.value })}
                placeholder="comma-separated tags"
                className="mt-1 h-[40px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Acceptance Criteria
              </label>
              <textarea
                rows={3}
                value={draft.acceptanceCriteriaText}
                onChange={(event) => onChange({ acceptanceCriteriaText: event.target.value })}
                placeholder="One testable criterion per line"
                className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Definition of Done
              </label>
              <textarea
                rows={2}
                value={draft.definitionOfDone}
                onChange={(event) => onChange({ definitionOfDone: event.target.value })}
                placeholder="Evidence, sign-off, or quality standard required for completion"
                className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Dependencies
              </label>
              <select
                value=""
                onChange={(event) => {
                  if (event.target.value && !draft.dependencyIds.includes(event.target.value)) {
                    onChange({ dependencyIds: [...draft.dependencyIds, event.target.value] });
                  }
                }}
                className="mt-1 h-[40px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              >
                <option value="">Add a prerequisite task…</option>
                {availableTasks
                  .filter((candidate) => candidate.id !== task.id && !draft.dependencyIds.includes(candidate.id))
                  .map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.title}</option>
                  ))}
              </select>
              {draft.dependencyIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draft.dependencyIds.map((dependencyId) => {
                    const dependency = availableTasks.find((candidate) => candidate.id === dependencyId);
                    return (
                      <button
                        type="button"
                        key={dependencyId}
                        onClick={() => onChange({ dependencyIds: draft.dependencyIds.filter((id) => id !== dependencyId) })}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[10.5px] text-neutral-600 hover:bg-neutral-100"
                      >
                        {dependency?.title || "Unavailable task"} <X size={10} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                  Team Assignment
                </div>
                <div className="text-[12px] text-neutral-700 mt-0.5">
                  Lead: {leadName}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {teamMembers.length > 0
                    ? `Team of ${teamMembers.length}: ${teamMembers.map((member) => member.name).join(", ")}`
                    : "No team members assigned yet."}
                </div>
              </div>
              <button
                onClick={onOpenTeamEditor}
                disabled={employees.length === 0}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-neutral-200 bg-white text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 transition"
              >
                <Users size={11} />
                Edit Team
              </button>
            </div>
            <div className="mt-3 grid gap-3 border-t border-neutral-200 pt-3 md:grid-cols-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Primary Reviewer
                <select
                  value={draft.reviewerId || ""}
                  onChange={(event) => onChange({ reviewerId: event.target.value || null })}
                  className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-400"
                >
                  <option value="">Use department reviewer</option>
                  {reviewerCandidates
                    .filter((employee) => employee.id !== draft.backupReviewerId)
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Backup Reviewer
                <select
                  value={draft.backupReviewerId || ""}
                  onChange={(event) => onChange({ backupReviewerId: event.target.value || null })}
                  className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] normal-case tracking-normal text-neutral-900 outline-none focus:border-neutral-400"
                >
                  <option value="">No backup reviewer</option>
                  {reviewerCandidates
                    .filter((employee) => employee.id !== draft.reviewerId)
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Proposal
              </label>
              <input
                value={draft.proposalTitle}
                onChange={(e) => onChange({ proposalTitle: e.target.value })}
                className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Program
              </label>
              <input
                value={draft.programTitle}
                onChange={(e) => onChange({ programTitle: e.target.value })}
                className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Project
              </label>
              <input
                value={draft.projectTitle}
                onChange={(e) => onChange({ projectTitle: e.target.value })}
                className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Activity
              </label>
              <input
                value={draft.activityTitle}
                onChange={(e) => onChange({ activityTitle: e.target.value })}
                className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Activity Schedule
              </label>
              <input
                value={draft.activitySchedule}
                onChange={(e) => onChange({ activitySchedule: e.target.value })}
                className="mt-1 h-[38px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-[12px] text-neutral-900 outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <TaskSubtasksSection taskId={task.id} employees={employees} />
          <TaskChatSection
            taskId={task.id}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>

        <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-[12px] font-medium hover:bg-red-50 transition"
            >
              <Trash2 size={13} />
              Delete Task
            </button>
            {task.status !== "completed" && task.status !== "cancelled" && (
              <button
                onClick={onCancelTask}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 text-amber-700 text-[12px] font-medium hover:bg-amber-50 transition"
              >
                <X size={13} /> Cancel Task
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 text-[12px] font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
