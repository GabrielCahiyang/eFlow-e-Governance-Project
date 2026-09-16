import * as React from "react";
import { CheckCircle2, Send, Trash2 } from "lucide-react";
import type { CollaborationDraftStatus, CollaborationReadiness as Readiness } from "../types";

export function CollaborationActionRail({
  isOwner,
  status,
  readiness,
  busy,
  hasRevision,
  onRequestReview,
  onCommit,
  onDelete,
  ownerName,
  departmentOnly,
}: {
  isOwner: boolean;
  status: CollaborationDraftStatus;
  readiness: Readiness | null;
  busy: boolean;
  hasRevision: boolean;
  onRequestReview: () => Promise<void>;
  onCommit: () => Promise<void>;
  onDelete: (reason: string) => Promise<void>;
  ownerName?: string;
  departmentOnly: boolean;
}) {
  const [deleting, setDeleting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  return <div className="space-y-3">
    {isOwner && !departmentOnly && status === "draft" && <button type="button" data-testid="request-collaboration-review" disabled={busy} onClick={onRequestReview} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-[11px] font-medium text-white disabled:opacity-50"><Send size={13} /> Request collaboration review</button>}
    {isOwner && (departmentOnly || readiness?.ready) && status !== "committed" && status !== "archived" && <button type="button" data-testid="publish-proposal" disabled={busy || !hasRevision || !readiness?.ready} onClick={onCommit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-[11px] font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 size={13} /> {departmentOnly ? "Publish department proposal" : "Publish proposal"}</button>}
    {!departmentOnly && !isOwner && readiness?.ready && status !== "committed" && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-[10px] leading-relaxed text-emerald-800"><strong>Approved and ready to publish.</strong><br />Waiting for {ownerName || "the owning office"} Head or Assistant Head to publish the operational work.</div>}
    {status !== "committed" && <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-[10px] leading-relaxed text-blue-800"><strong>Proposed work is not assigned.</strong><br />{departmentOnly ? "Publishing creates the operational projects, tasks, and employee assignments for your department." : "No project, task, or employee assignment becomes operational until the collaboration approval gate succeeds."}</div>}
    {isOwner && status !== "committed" && (!deleting ? <button type="button" onClick={() => setDeleting(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-[10px] text-red-600 hover:bg-red-50"><Trash2 size={12} /> Delete draft</button> : <div className="rounded-xl border border-red-200 bg-red-50 p-3"><div className="text-[10px] font-medium text-red-800">Soft-delete this draft</div><div className="mt-1 text-[9px] leading-relaxed text-red-600">Operational history is not affected. A reason is required for the governance audit.</div><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Reason for deletion" className="mt-2 w-full resize-none rounded-lg border border-red-200 bg-white px-2 py-2 text-[10px] outline-none" /><div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setDeleting(false); setReason(""); }} className="px-2 py-1.5 text-[9px] text-neutral-500">Cancel</button><button type="button" disabled={busy || !reason.trim()} onClick={() => onDelete(reason)} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[9px] text-white disabled:opacity-40">Delete draft</button></div></div>)}
  </div>;
}
