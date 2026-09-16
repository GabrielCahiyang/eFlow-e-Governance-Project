import { ShieldCheck } from "lucide-react";
import { getRoleLabel } from "../../../shared/roles";
import type { SubtaskStatus } from "../../../services/subtaskService";
import type { SubtaskReviewerIdentity } from "../types";

function actionLabel(status: SubtaskStatus): string {
  if (status === "for_review") return "Awaiting review by";
  if (status === "completed" || status === "changes_requested") return "Reviewed by";
  return "Assigned reviewer";
}

export function SubtaskReviewerBadge({
  reviewer,
  status,
  loading = false,
  compact = false,
}: {
  reviewer?: SubtaskReviewerIdentity;
  status: SubtaskStatus;
  loading?: boolean;
  compact?: boolean;
}) {
  const identity = reviewer
    ? [reviewer.name, getRoleLabel(reviewer.role), reviewer.organizationName].filter(Boolean).join(" · ")
    : loading
      ? "Loading reviewer…"
      : "Reviewer details unavailable";

  if (compact) {
    return (
      <span
        className="inline-flex max-w-[260px] shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-medium text-indigo-700"
        title={`${actionLabel(status)} ${identity}`}
      >
        <ShieldCheck size={9} />
        <span className="truncate">{actionLabel(status)} {reviewer?.name || (loading ? "…" : "assigned reviewer")}</span>
      </span>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-2 text-indigo-900">
      <ShieldCheck size={13} className="mt-0.5 shrink-0 text-indigo-600" />
      <div className="min-w-0">
        <div className="text-[9.5px] uppercase tracking-wide text-indigo-500">{actionLabel(status)}</div>
        <div className="mt-0.5 truncate text-[11px] font-medium">{identity}</div>
      </div>
    </div>
  );
}
