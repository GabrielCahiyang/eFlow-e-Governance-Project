import { useEffect, useRef } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";
import type { AiRuntimeStatus } from "../../../shared/controlPanelClient";
import { useAiRuntimeStatus } from "../hooks/useAiRuntimeStatus";

const UNAVAILABLE = new Set<AiRuntimeStatus>([
  "offline",
  "starting",
  "restarting",
]);

export function AiRuntimeNotifier() {
  const runtime = useAiRuntimeStatus();
  const { toast } = useToast();
  const previousStatus = useRef<AiRuntimeStatus>("unknown");

  useEffect(() => {
    const previous = previousStatus.current;
    if (UNAVAILABLE.has(runtime.status) && runtime.status !== previous) {
      toast(runtime.message, runtime.status === "offline" ? "error" : "warning");
    } else if (runtime.status === "online" && UNAVAILABLE.has(previous)) {
      toast("AI service restored. The new endpoint was published automatically.", "success");
    }
    previousStatus.current = runtime.status;
  }, [runtime.message, runtime.status, toast]);

  if (!UNAVAILABLE.has(runtime.status)) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9998] flex max-w-xl -translate-x-1/2 items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
      {runtime.status === "offline" ? (
        <CloudOff size={18} className="mt-0.5 shrink-0 text-red-600" />
      ) : (
        <RefreshCw size={18} className="mt-0.5 shrink-0 animate-spin text-amber-600" />
      )}
      <div>
        <div className="text-[12px] font-medium text-amber-950">
          AI service temporarily unavailable
        </div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
          {runtime.message}
        </div>
      </div>
    </div>
  );
}
