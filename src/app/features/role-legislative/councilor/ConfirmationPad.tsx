import * as Carbon from "@carbon/icons-react";
import * as Lucide from "lucide-react";
import { useState } from "react";
import type { TaskCard } from "./councilorData";

export function ConfirmationPad({
  task,
  action,
  onConfirm,
  onCancel,
}: {
  task: TaskCard;
  action: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin.length === 4) {
      onConfirm();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  const actionLabels: Record<string, { label: string; color: string }> = {
    vote_yes: { label: "Vote: YES", color: "text-emerald-600" },
    vote_no: { label: "Vote: NO", color: "text-red-600" },
    abstain: { label: "Vote: ABSTAIN", color: "text-neutral-600" },
    sign_favorable: { label: "Action: Favorable Recommendation", color: "text-emerald-600" },
    return_revisions: { label: "Action: Returned for Revisions", color: "text-amber-600" },
  };

  const actionInfo = actionLabels[action] || { label: action, color: "text-neutral-600" };
  const isVote = task.type === "Floor Vote";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.3)" }}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-[380px] shadow-2xl mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Lucide.Shield size={32} className="text-emerald-500" />
          </div>
        </div>

        <h3 className="text-[18px] font-normal text-neutral-900 text-center mb-1">
          {isVote ? "Confirm Your Vote" : "Digital Signature Required"}
        </h3>
        <p className="text-[13px] font-normal text-neutral-500 text-center mb-6">
          {isVote ? "Enter your 4-digit PIN to cast your vote" : "Enter your 4-digit PIN to seal your approval"}
        </p>

        {/* Document Info */}
        <div className="bg-neutral-50 rounded-xl p-4 mb-6">
          <p className="text-[11px] font-normal text-neutral-400 uppercase tracking-wider mb-1">
            {isVote ? "Voting on" : "Signing"}
          </p>
          <p className="text-[13px] font-normal text-neutral-700">
            {task.title}
          </p>
          <p className={`text-[11px] font-normal ${actionInfo.color} mt-2 flex items-center gap-1`}>
            <Carbon.CheckmarkOutline size={12} />
            {actionInfo.label}
          </p>
        </div>

        {/* PIN Input */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`size-14 rounded-xl border-2 flex items-center justify-center text-[24px] font-normal transition-all duration-200 ${
                error
                  ? "border-red-300 bg-red-50"
                  : pin.length > i
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              {pin.length > i ? "•" : ""}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-[12px] font-normal text-red-500 text-center mb-4">
            Please enter a valid 4-digit PIN
          </p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((num, i) => {
            if (num === null) return <div key={i} />;
            return (
              <button
                key={i}
                onClick={() => {
                  if (num === "del") setPin((p) => p.slice(0, -1));
                  else if (pin.length < 4) setPin((p) => p + num);
                }}
                className="py-3 rounded-xl bg-neutral-50 text-[18px] font-normal text-neutral-700 cursor-pointer hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
              >
                {num === "del" ? "←" : num}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl text-[14px] font-normal cursor-pointer hover:bg-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-3 rounded-xl text-[14px] font-normal cursor-pointer transition-all ${
              pin.length === 4
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {isVote ? "Cast Vote" : "Confirm & Seal"}
          </button>
        </div>

        <p className="text-[10px] font-normal text-neutral-400 text-center mt-4 flex items-center justify-center gap-1">
          <Carbon.Locked size={10} />
          Cryptographically sealed via eFlow Immutable Ledger
        </p>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
