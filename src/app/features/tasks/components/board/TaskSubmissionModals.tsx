import { useRef, useState } from "react";
import { CheckCircle2, RotateCcw, Upload, X } from "lucide-react";
import type { Task } from "../../../../services/taskService";
import { RichTextEditor } from "../../../../components/ui/RichTextEditor";
import { SimpleTableEditor } from "../../../../components/ui/SimpleTableEditor";

export function SubmitForReviewModal({
  open,
  task,
  note,
  attachments,
  onNoteChange,
  onAttachmentsChange,
  onRemoveAttachment,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  task: Task | null;
  note: string;
  attachments: File[];
  onNoteChange: (value: string) => void;
  onAttachmentsChange: (files: File[]) => void;
  onRemoveAttachment: (index: number) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [noteMode, setNoteMode] = useState<"write" | "table">("write");

  if (!open || !task) return null;

  const subtaskCount = task.subtaskCount || 0;
  const approvedSubtaskCount = task.subtaskCompletedCount || 0;
  const remainingSubtasks = Math.max(0, subtaskCount - approvedSubtaskCount);
  const subtasksReady = remainingSubtasks === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-[560px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s ease" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
              Submit for Review
            </div>
            <div className="text-[15px] font-semibold text-neutral-900 mt-0.5">
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
          <div
            className={`rounded-xl border px-3 py-2.5 ${
              subtasksReady
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <div className="flex items-center gap-2 text-[11.5px] font-medium">
              <CheckCircle2 size={14} />
              {subtaskCount === 0
                ? "No subtasks require approval"
                : `${approvedSubtaskCount} of ${subtaskCount} subtasks approved`}
            </div>
            <p className="mt-1 text-[10.5px] leading-relaxed opacity-80">
              {subtasksReady
                ? "Add the Team Lead’s final completion summary, then submit the complete task to the Department Head."
                : `${remainingSubtasks} subtask${remainingSubtasks === 1 ? " is" : "s are"} still waiting for Team Leader approval. The task cannot be submitted to the Department Head yet.`}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                Completion Note (required)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNoteMode("write")}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${noteMode === "write" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:bg-neutral-100"}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setNoteMode("table")}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${noteMode === "table" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:bg-neutral-100"}`}
                >
                  Table
                </button>
              </div>
            </div>
            {noteMode === "write" ? (
              <RichTextEditor
                value={note}
                onChange={onNoteChange}
                placeholder="Summarize what was completed, results, or evidence details..."
              />
            ) : (
              <SimpleTableEditor onChange={onNoteChange} />
            )}
          </div>

          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                  Attachments (optional)
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Photos, PDF evidence, or supporting files.
                </div>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-neutral-200 bg-white text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 transition"
              >
                <Upload size={11} />
                Add files
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  onAttachmentsChange(Array.from(e.target.files || []))
                }
              />
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between text-[11px] text-neutral-600"
                  >
                    <span className="truncate max-w-[380px]">{file.name}</span>
                    <button
                      onClick={() => onRemoveAttachment(idx)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !subtasksReady}
            className="px-4 py-2 text-[12px] font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UndoCompletedModal({
  open,
  task,
  reason,
  onReasonChange,
  onClose,
  onSubmit,
  saving,
  error,
}: {
  open: boolean;
  task: Task | null;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
  error: string;
}) {
  if (!open || !task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s ease" }}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-amber-600 font-medium">
              Reopen Completed Task
            </div>
            <div className="mt-0.5 text-[15px] font-semibold text-neutral-900">
              {task.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
            This moves the task back to In Progress and notifies the assigned
            team with your reason.
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
              Undo reason (required)
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Explain why this completed task needs to be reopened..."
              className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-[13px] text-neutral-900 outline-none focus:border-amber-300"
            />
          </div>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-[12px] font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            <RotateCcw size={13} />
            {saving ? "Reopening..." : "Undo Completion"}
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── List Board View ──────────────────────────────────────────────
