import { Clock3, LogOut, ShieldCheck } from "lucide-react";
import { formatRemainingTime } from "../services/sessionTimeline";

export function InactivityWarningDialog({ remainingMs, onStaySignedIn, onSignOut }: { remainingMs: number; onStaySignedIn: () => void; onSignOut: () => void }) {
  return (
    <div className="fixed inset-0 z-[10050] grid place-items-center bg-neutral-950/45 p-4 backdrop-blur-[2px]" role="presentation">
      <section role="alertdialog" aria-modal="true" aria-labelledby="idle-warning-title" aria-describedby="idle-warning-description" className="w-full max-w-[430px] overflow-hidden rounded-2xl border border-white/30 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-amber-300"><Clock3 size={20} /></div><div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[18px] font-semibold tracking-wide text-amber-200">{formatRemainingTime(remainingMs)}</div></div>
          <h2 id="idle-warning-title" className="mt-4 text-[18px] font-semibold">Your session is about to expire</h2>
          <p id="idle-warning-description" className="mt-1 text-[11px] leading-5 text-neutral-300">For LGU data protection, eFlow signs out accounts after one hour without genuine user activity.</p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-blue-600" /><p className="text-[10.5px] leading-5 text-blue-800">Realtime updates, AI jobs, animations, and network traffic do not extend the session. Your server-side AI job may continue, but you must sign in again to view its result.</p></div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onSignOut} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"><LogOut size={14} />Sign out now</button><button type="button" autoFocus onClick={onStaySignedIn} className="h-10 rounded-lg bg-neutral-900 px-5 text-[11px] font-semibold text-white shadow-sm hover:bg-neutral-800">Stay signed in</button></div>
        </div>
      </section>
    </div>
  );
}

