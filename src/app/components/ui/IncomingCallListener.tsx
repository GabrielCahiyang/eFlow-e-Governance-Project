import { useState, useEffect } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { ActiveCall, subscribeToIncomingCalls, declineCall } from "../../services/callService";
import { CallModal } from "./CallModal";

export function IncomingCallListener({ userId }: { userId?: string }) {
  const [incoming, setIncoming] = useState<ActiveCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToIncomingCalls(userId, setIncoming);
    return unsub;
  }, [userId]);

  const handleAccept = () => {
    setActiveCall(incoming);
    setIncoming(null);
  };

  const handleDecline = () => {
    if (incoming) declineCall(incoming.id);
    setIncoming(null);
  };

  return (
    <>
      {incoming && (
        <div className="fixed top-4 right-4 z-[200] bg-white rounded-xl border border-neutral-200 shadow-xl p-4 w-[280px]">
          <div className="text-[12px] text-neutral-400 mb-1">
            Incoming {incoming.callType} call
          </div>
          <div className="text-[14px] font-semibold text-neutral-800 mb-3">
            {incoming.callerName}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center gap-2 text-[12px] hover:bg-emerald-700"
            >
              <Phone size={14} /> Accept
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center gap-2 text-[12px] hover:bg-red-700"
            >
              <PhoneOff size={14} /> Decline
            </button>
          </div>
        </div>
      )}

      {activeCall && (
        <CallModal call={activeCall} isCaller={false} onClose={() => setActiveCall(null)} />
      )}
    </>
  );
}

export default IncomingCallListener;
