import { useState } from "react";
import { AlertCircle, Banknote, Check, ChevronRight, Clock, Edit2, Trash2 } from "lucide-react";
import type { Employee } from "../../../services/employeeService";
import type { EmployeeNotesMap } from "../../../services/employeeNotesService";
import { priorityMeta } from "./draftModel";
import type { DraftTask } from "./draftModel";
import { TaskAssignmentSummary } from "./TaskAssignmentSummary";
import { AssignmentExceptionNote } from "./AssignmentExceptionNote";
import { TeamCompositionNote } from "./TeamCompositionNote";
import { getBudgetLineAmount, TaskBudgetDialog } from "../../budget";

export function DraftTaskRow({
  dt,
  employees,
  employeeNotes: _employeeNotes,
  onUpdate,
  onDelete,
  onOpenModal,
}: {
  dt: DraftTask;
  employees: Employee[];
  employeeNotes?: EmployeeNotesMap;
  onUpdate: (key: string, patch: Partial<DraftTask>) => void;
  onDelete: (key: string) => void;
  onOpenModal: (key: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const assignedEmps = dt.assignedMemberIds
    .map((id) => employees.find((e) => e.id === id))
    .filter((emp): emp is Employee => Boolean(emp));
  const pm = priorityMeta[dt.priority] || priorityMeta.medium;
  const budgetTotal = (dt.budgetLines || []).reduce((sum, line) => sum + getBudgetLineAmount(line), 0);

  return (
    <div
      data-testid="manual-task-row"
      data-task-key={dt.key}
      className={`px-6 py-3 flex items-start gap-3 group transition-all ${
        dt.enabled ? "" : "opacity-40"
      } hover:bg-neutral-50/60`}
    >
      {/* Enable checkbox */}
      <button
        onClick={() => onUpdate(dt.key, { enabled: !dt.enabled })}
        className="shrink-0 mt-0.5"
      >
        {dt.enabled ? (
          <div className="w-4 h-4 rounded bg-neutral-900 border border-neutral-900 flex items-center justify-center">
            <Check size={10} className="text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="w-4 h-4 rounded border-2 border-neutral-300" />
        )}
      </button>

      {/* Priority bar */}
      <div className={`w-1 h-10 rounded-full shrink-0 mt-0.5 ${pm.bar}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input
              aria-label="Task title"
              data-testid="manual-task-title"
              autoFocus
              value={dt.title}
              onChange={(e) => onUpdate(dt.key, { title: e.target.value })}
              className="w-full text-[13px] font-medium text-neutral-900 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-500"
            />
            <textarea
              aria-label="Task description"
              data-testid="manual-task-description"
              rows={2}
              value={dt.description}
              onChange={(e) =>
                onUpdate(dt.key, { description: e.target.value })
              }
              className="w-full text-[12px] text-neutral-600 border border-neutral-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-neutral-400"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <input
                aria-label="Task deadline"
                data-testid="manual-task-deadline"
                type="date"
                value={dt.deadline}
                onChange={(e) => onUpdate(dt.key, { deadline: e.target.value })}
                className="text-[12px] border border-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-neutral-400"
              />
              <select
                value={dt.priority}
                onChange={(e) =>
                  onUpdate(dt.key, {
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="text-[12px] border border-neutral-200 rounded-lg px-2.5 py-1 focus:outline-none bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                data-testid="manual-task-finish-editing"
                onClick={() => setEditing(false)}
                className="text-[11px] font-medium text-white bg-neutral-800 border border-neutral-200 rounded-lg px-3 py-1 hover:bg-neutral-900 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-[13px] font-medium text-neutral-900">
              {dt.title}
            </div>
            {dt.description && (
              <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                {dt.description}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {dt.deadline && (
                <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">
                  <Clock size={9} />
                  {dt.deadline}
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${pm.badge}`}
              >
                {pm.label}
              </span>
              {dt.requiredSkills.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full"
                >
                  {s}
                </span>
              ))}
              {dt.burnoutWarning && (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                  <AlertCircle size={9} />
                  Burnout risk
                </span>
              )}
              <button
                type="button"
                onClick={() => setBudgetOpen(true)}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition ${dt.budgetDecision === "funded" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : dt.budgetDecision === "no_cost" ? "border-neutral-200 bg-neutral-100 text-neutral-600" : "border-amber-200 bg-amber-50 text-amber-700"}`}
              >
                <Banknote size={9} />
                {dt.budgetDecision === "funded" ? `Budget ${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(budgetTotal)}` : dt.budgetDecision === "no_cost" ? "No cost" : "Set task budget"}
              </button>
            </div>
          </>
        )}

        {/* Team and leader assignment */}
        <button
          data-testid="manual-task-assignment"
          onClick={() => onOpenModal(dt.key)}
          className="group/assign mt-3 flex w-full max-w-md items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 px-3 py-2.5 text-left transition hover:border-violet-400 hover:bg-violet-50/50"
          aria-label={
            assignedEmps.length === 0
              ? `Assign team and leader for ${dt.title}`
              : `Edit team and leader for ${dt.title}`
          }
        >
          <TaskAssignmentSummary
            employees={assignedEmps}
            leadMemberId={dt.leadMemberId}
          />
          <ChevronRight
            size={13}
            className="ml-auto shrink-0 text-neutral-300 group-hover/assign:text-violet-500"
          />
        </button>

        {dt.assignmentException && !editing && (
          <AssignmentExceptionNote exception={dt.assignmentException} />
        )}

        {dt.teamComposition && !editing && (
          <TeamCompositionNote composition={dt.teamComposition} />
        )}

        {dt.reasoning && !dt.assignmentException && !dt.teamComposition && !editing && (
          <div className="mt-1.5 text-[10px] text-violet-600 italic line-clamp-1">
            {dt.reasoning}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">
        <button
          data-testid="manual-task-edit"
          onClick={() => setEditing(!editing)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
          title="Edit task"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={() => onDelete(dt.key)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition"
          title="Delete task"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <TaskBudgetDialog
        open={budgetOpen}
        taskKey={dt.key}
        taskTitle={dt.title || "Untitled task"}
        decision={dt.budgetDecision || "missing"}
        noCostReason={dt.budgetNoCostReason}
        lines={dt.budgetLines || []}
        onChange={(patch) => onUpdate(dt.key, patch)}
        onClose={() => setBudgetOpen(false)}
      />
    </div>
  );
}

// ─── Draft Cockpit Component ──────────────────────────────────────
