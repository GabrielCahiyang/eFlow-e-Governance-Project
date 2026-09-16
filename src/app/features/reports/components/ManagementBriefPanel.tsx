import { useState } from "react";
import { AttentionBox, Heading, IconButton, Loader, Text } from "@vibe/core";
import { Close, Retry, Robot } from "@vibe/icons";
import type { AiQueueUpdate } from "../../ai";
import { WButton } from "../../../components/workflow/primitives";
import { InspectorPanel } from "../../../shared/motion";
import { generateManagementBrief } from "../services/managementBriefService";
import type { DepartmentReportRow } from "../types";

export function ManagementBriefPanel({ title, rows }: { title: string; rows: DepartmentReportRow[] }) {
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [queue, setQueue] = useState<AiQueueUpdate | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setOpen(true);
    setLoading(true);
    setError("");
    setQueue(null);
    try {
      setBrief(await generateManagementBrief(title, rows, setQueue));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate the management brief.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return <WButton icon={<Robot size={14} />} onClick={generate} disabled={rows.length === 0}>AI management brief</WButton>;
  }

  return (
    <InspectorPanel open={open} onClose={() => setOpen(false)} ariaLabel="AI management brief" className="h-full w-full max-w-[480px]">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-start justify-between">
          <div>
            <Heading className="flex items-center gap-2 text-neutral-900" type="h2" weight="medium"><Robot size={16} /> AI management brief</Heading>
            <Text className="mt-1 text-neutral-500" type="text3">Uses only the currently filtered, permission-scoped report rows. It never changes work records.</Text>
          </div>
          <IconButton aria-label="Close management brief" icon={Close} kind="tertiary" size="small" onClick={() => setOpen(false)} />
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4" role="status">
              <div className="flex items-center gap-2 text-[12px] text-blue-800"><Loader size="small" /> Preparing the brief…</div>
              {queue && <Text type="text3" className="text-blue-700">{queue.status === "queued" ? `${queue.jobsAhead} AI job(s) ahead of this report.` : "DeepSeek is analyzing the visible report now."}</Text>}
            </div>
          ) : error ? (
            <AttentionBox title="Brief unavailable" text={error} type="negative" />
          ) : (
            <div className="whitespace-pre-wrap text-[12px] leading-6 text-neutral-700">{brief}</div>
          )}
        </div>
        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <WButton icon={<Retry size={14} />} onClick={generate} disabled={loading}>Regenerate from visible rows</WButton>
        </div>
    </InspectorPanel>
  );
}
