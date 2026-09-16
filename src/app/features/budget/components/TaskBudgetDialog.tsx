import { X } from "lucide-react";
import type { BudgetLineInput, TaskBudgetDecision } from "../types";
import { TaskBudgetEditor } from "./TaskBudgetEditor";

export function TaskBudgetDialog({
  open,
  taskKey,
  taskTitle,
  decision,
  noCostReason,
  lines,
  fundingSource,
  readOnly = false,
  onChange,
  onClose,
}: {
  open: boolean;
  taskKey: string;
  taskTitle: string;
  decision: TaskBudgetDecision;
  noCostReason?: string;
  lines: BudgetLineInput[];
  fundingSource?: string;
  readOnly?: boolean;
  onChange: (patch: { budgetDecision: TaskBudgetDecision; budgetNoCostReason?: string; budgetLines: BudgetLineInput[] }) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return <>
    <button type="button" aria-label="Close task budget" onClick={onClose} className="fixed inset-0 z-[90] cursor-default bg-neutral-950/45 backdrop-blur-[2px]" />
    <section role="dialog" aria-modal="true" aria-label={`Budget for ${taskTitle}`} className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-4xl flex-col border-l border-neutral-200 bg-neutral-50 shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white px-5 py-4">
        <div><div className="text-[9px] uppercase tracking-[.18em] text-neutral-400">Task funding</div><h2 className="mt-1 text-[16px] font-semibold text-neutral-950">{taskTitle}</h2><p className="mt-1 text-[10px] text-neutral-500">Build the exact categories and particulars this task will consume.</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"><X size={16} /></button>
      </header>
      <div className="flex-1 overflow-y-auto p-5">
        <TaskBudgetEditor taskKey={taskKey} fundingSource={fundingSource} readOnly={readOnly} value={{ decision, noCostReason, lines }} onChange={(next) => onChange({ budgetDecision: next.decision, budgetNoCostReason: next.noCostReason, budgetLines: next.lines })} />
      </div>
      <footer className="flex justify-end border-t border-neutral-200 bg-white px-5 py-3"><button type="button" onClick={onClose} className="h-9 rounded-lg bg-neutral-950 px-5 text-[10.5px] font-medium text-white">Done</button></footer>
    </section>
  </>;
}
