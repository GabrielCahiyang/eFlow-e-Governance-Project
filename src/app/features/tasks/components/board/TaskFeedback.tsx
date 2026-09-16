import DOMPurify from "dompurify";
import type { Task } from "../../../../services/taskService";
import { formatShortDateTime } from "./model";

export function SubmissionDetails({
  submission,
}: {
  submission?: Task["latestSubmission"];
}) {
  if (!submission) return null;
  const submittedAt = formatShortDateTime(submission.submittedAt);

  return (
    <div className="mt-1.5 rounded-lg border border-violet-100 bg-violet-50/60 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-violet-600 font-medium">
        Submission
      </div>
      {submission.note && (
        <div
          className="text-[11px] text-neutral-700 mt-0.5 [&_p]:m-0 [&_table]:text-[10px] [&_ul]:pl-4 [&_ol]:pl-4"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(submission.note) }}
        />
      )}
      <div className="text-[10px] text-neutral-500 mt-0.5">
        By {submission.submitterName || "Unknown"}
        {submittedAt ? ` - ${submittedAt}` : ""}
      </div>
      {submission.attachments && submission.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {submission.attachments.map((attachment, idx) =>
            typeof attachment === "string" ? (
              <a
                key={`${attachment}-${idx}`}
                href={attachment}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-violet-700 underline"
              >
                Attachment {idx + 1}
              </a>
            ) : (
              <span
                key={`${attachment.filePath}-${idx}`}
                className="text-[10px] text-violet-700"
              >
                {attachment.fileName}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function RejectionNotice({
  note,
  rejectedAt,
}: {
  note?: string;
  rejectedAt?: number;
}) {
  if (!note) return null;
  const rejectedAtLabel = formatShortDateTime(rejectedAt);

  return (
    <div className="mt-1.5 rounded-lg border border-red-100 bg-red-50 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-red-600 font-medium">
        Rejection
      </div>
      <div className="text-[11px] text-red-700 mt-0.5">Note: {note}</div>
      {rejectedAtLabel && (
        <div className="text-[10px] text-red-500 mt-0.5">
          Rejected {rejectedAtLabel}
        </div>
      )}
    </div>
  );
}

export function ReopenNotice({
  reason,
  reopenedAt,
  reopenedByName,
}: {
  reason?: string;
  reopenedAt?: number;
  reopenedByName?: string;
}) {
  if (!reason) return null;
  const reopenedAtLabel = formatShortDateTime(reopenedAt);

  return (
    <div className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-amber-700 font-medium">
        Reopened
      </div>
      <div className="text-[11px] text-amber-800 mt-0.5">
        Reason: {reason}
      </div>
      {(reopenedByName || reopenedAtLabel) && (
        <div className="text-[10px] text-amber-600 mt-0.5">
          {reopenedByName ? `By ${reopenedByName}` : "Reopened"}
          {reopenedAtLabel ? ` - ${reopenedAtLabel}` : ""}
        </div>
      )}
    </div>
  );
}

// ─── Assignment Modal ─────────────────────────────────────────────
