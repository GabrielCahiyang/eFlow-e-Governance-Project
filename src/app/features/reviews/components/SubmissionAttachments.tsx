import { useState } from "react";
import { Download, Loader2, Paperclip } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useToast } from "../../../components/ui/Toast";
import type { ReviewAttachment } from "../types";

export function SubmissionAttachments({
  attachments,
}: {
  attachments: ReviewAttachment[];
}) {
  const { toast } = useToast();
  const [openingPath, setOpeningPath] = useState<string>();

  if (attachments.length === 0) return null;

  const openAttachment = async (attachment: ReviewAttachment) => {
    setOpeningPath(attachment.filePath);
    try {
      const { data, error } = await supabase.storage
        .from("task-attachments")
        .createSignedUrl(attachment.filePath, 60 * 5);
      if (error || !data) throw error || new Error("Could not generate link.");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast("Could not open attachment.", "error");
    } finally {
      setOpeningPath(undefined);
    }
  };

  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wider text-neutral-400">
        Attachments
      </div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <button
            key={attachment.id}
            onClick={() => openAttachment(attachment)}
            className="inline-flex max-w-[220px] items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {openingPath === attachment.filePath ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Paperclip size={12} />
            )}
            <span className="truncate">{attachment.fileName}</span>
            <Download size={11} className="shrink-0 text-neutral-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
