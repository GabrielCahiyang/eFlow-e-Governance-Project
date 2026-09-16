import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  History,
  ShieldCheck,
} from "lucide-react";
import type { ProjectCommandData } from "./types";
import type { Organization } from "../../../../types";
import { formatDate } from "../../../../components/workflow/primitives";
import { useCollaborationDraft } from "../../../interdepartment-collaboration/hooks/useCollaborationDraft";

export type GovernanceSubView = "signoff" | "evidence" | "decisions";

export function ProjectGovernanceTab({
  data,
  view = "signoff",
  organizations,
  onOpenTask,
}: {
  data: ProjectCommandData;
  view?: GovernanceSubView;
  organizations: Organization[];
  onOpenTask?: (taskId: string) => void;
}) {
  const [subView, setSubView] = useState<GovernanceSubView>(view);
  const collaboration = useCollaborationDraft(data.project.sourceCollaborationDraftId || null);

  // Evidence items extracted from project tasks
  const evidenceTasks = useMemo(() => {
    return data.tasks.filter(
      (t) =>
        t.status === "completed" ||
        t.status === "for_review" ||
        (t.latestSubmission && t.latestSubmission.submittedAt),
    );
  }, [data.tasks]);

  // Decision records
  const decisions = useMemo(() => {
    return data.facts.submissions.filter(
      (s) => s.status === "approved" || s.status === "changes_requested",
    );
  }, [data.facts.submissions]);

  return (
    <div className="space-y-6 font-sans">
      {/* Sub-navigation pills */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubView("signoff")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subView === "signoff"
                ? "bg-purple-50 text-purple-900 border border-purple-200"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            <ShieldCheck size={14} className={subView === "signoff" ? "text-purple-700" : "text-neutral-400"} />
            <span>Sign-off Status</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView("evidence")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subView === "evidence"
                ? "bg-purple-50 text-purple-900 border border-purple-200"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            <FileCheck2 size={14} className={subView === "evidence" ? "text-purple-700" : "text-neutral-400"} />
            <span>Evidence Register ({evidenceTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView("decisions")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subView === "decisions"
                ? "bg-purple-50 text-purple-900 border border-purple-200"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            <History size={14} className={subView === "decisions" ? "text-purple-700" : "text-neutral-400"} />
            <span>Decision History ({decisions.length})</span>
          </button>
        </div>

        <div className="text-xs text-neutral-400 font-medium">
          Project Governance &amp; Compliance Register
        </div>
      </div>

      {/* Sub-View: Sign-off Status */}
      {subView === "signoff" && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Inter-Department Endorsement Matrix
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Sign-off verification across all participating departments and partner agencies.
                </p>
              </div>
            </div>

            {collaboration.participants.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {collaboration.participants.map((participant) => {
                  const org = organizations.find((o) => o.id === participant.orgId);
                  const isOwner = participant.participationRole === "owner";
                  const approval = collaboration.approvals.find(
                    (a) => a.organizationId === participant.orgId,
                  );
                  const isApproved = approval?.decision === "approved" || isOwner;

                  return (
                    <div
                      key={participant.orgId}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-neutral-900">
                            {org?.name || participant.orgId}
                          </strong>
                          <span className="text-[10.5px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded capitalize">
                            Role: {participant.participationRole}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {isOwner
                            ? "Lead Authority — Originating Department"
                            : approval
                              ? `Endorsed and approved on ${formatDate(approval.createdAt)}`
                              : "Pending review and sign-off decision"}
                        </p>
                      </div>

                      <div>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={14} /> Endorsed &amp; Signed Off
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={14} /> Awaiting Sign-off
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                This project operates under direct single-department governance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-View: Evidence Register */}
      {subView === "evidence" && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Deliverables &amp; Evidence Register
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Audit record of verified task outputs, completed deliverables, and submission documentation.
              </p>
            </div>
          </div>

          {evidenceTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No evidence submissions recorded for this project yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10.5px]">
                    <th className="py-3 px-3">Work Package / Task</th>
                    <th className="py-3 px-3">Accountable</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Submission Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {evidenceTasks.map((t) => {
                    const isDone = t.status === "completed";
                    const isReview = t.status === "for_review";
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-neutral-900">
                          {t.title}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-600">
                          {t.assigneeName || "Unassigned"}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                              isDone
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isReview
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {t.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-neutral-500">
                          {formatDate(t.latestSubmission?.submittedAt || t.updatedAt)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenTask?.(t.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <span>Inspect Evidence</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-View: Decision History */}
      {subView === "decisions" && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Formal Decision &amp; Audit Log
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Permanent chronological history of review decisions, rework requests, and approvals.
              </p>
            </div>
          </div>

          {decisions.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No formal review decisions recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {decisions.map((d, index) => {
                const isApproved = d.status === "approved";
                const linkedTask = data.tasks.find((t) => t.id === d.taskId);
                return (
                  <div
                    key={`${d.taskId}-${index}`}
                    className={`p-4 rounded-xl border space-y-2 ${
                      isApproved
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-rose-50/40 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isApproved ? "Approved" : "Changes Requested"}
                        </span>
                        <strong className="text-xs text-neutral-900">
                          {linkedTask?.title || d.taskId}
                        </strong>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        {d.decidedAt ? formatDate(d.decidedAt) : "Recorded"}
                      </span>
                    </div>

                    {d.feedback && (
                      <p className="text-xs text-neutral-700 bg-white/80 p-2.5 rounded-lg border border-neutral-200/60 leading-relaxed">
                        <strong>Decision Note:</strong> {d.feedback}
                      </p>
                    )}

                    <div className="text-[11px] text-neutral-500">
                      Submitter: <strong>{d.submitterName || "Assignee"}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
