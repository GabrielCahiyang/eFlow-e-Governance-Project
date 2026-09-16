import { ArrowLeft, ArrowRight, AudioLines, Check, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useGuidedTourTarget } from "../hooks/useGuidedTourTarget";
import { useGuidedTourNarration } from "../hooks/useGuidedTourNarration";
import type { GuidedTourStep } from "../types";

export function GuidedTourOverlay({
  step,
  index,
  total,
  voiceEnabled,
  onToggleVoice,
  onBack,
  onNext,
  onSkip,
}: {
  step: GuidedTourStep;
  index: number;
  total: number;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const target = useGuidedTourTarget(step);
  const { supported: voiceSupported, isSpeaking } = useGuidedTourNarration(step, voiceEnabled);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const isLast = index === total - 1;

  useEffect(() => {
    nextButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft" && index > 0) onBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, onBack, onNext, onSkip]);

  const cardPosition = useMemo(() => {
    const width = Math.min(400, window.innerWidth - 32);
    if (!target) return { left: (window.innerWidth - width) / 2, top: Math.max(24, window.innerHeight / 2 - 130), width, arrow: "none" };
    const estimatedHeight = 238;
    const preferredLeft = target.left + target.width / 2 - width / 2;
    const left = Math.max(16, Math.min(window.innerWidth - width - 16, preferredLeft));
    const roomBelow = window.innerHeight - (target.top + target.height);
    const roomRight = window.innerWidth - (target.left + target.width);
    const roomLeft = target.left;
    const topBeside = Math.max(16, Math.min(window.innerHeight - estimatedHeight - 16, target.top + target.height / 2 - estimatedHeight / 2));
    if (target.left < 300 && roomRight >= width + 24) return { left: target.left + target.width + 16, top: topBeside, width, arrow: "left" };
    if (roomBelow >= estimatedHeight + 22) return { left, top: target.top + target.height + 16, width, arrow: "top" };
    if (target.top >= estimatedHeight + 22) return { left, top: target.top - estimatedHeight - 16, width, arrow: "bottom" };
    if (roomRight >= width + 24) return { left: target.left + target.width + 16, top: topBeside, width, arrow: "left" };
    if (roomLeft >= width + 24) return { left: target.left - width - 16, top: topBeside, width, arrow: "right" };
    return { left: (window.innerWidth - width) / 2, top: Math.max(16, window.innerHeight / 2 - estimatedHeight / 2), width, arrow: "none" };
  }, [target]);

  return createPortal(
    <div className="fixed inset-0 z-[300] animate-in fade-in duration-300 font-normal motion-reduce:animate-none" role="dialog" aria-modal="true" aria-label="Guided walkthrough">
      <div className="absolute inset-0" onClick={(event) => event.stopPropagation()} />
      {target ? (
        <div
          data-testid="guided-tour-spotlight"
          aria-hidden="true"
          className="pointer-events-none fixed rounded-xl border-2 border-white/95 shadow-[0_0_0_9999px_rgba(10,15,25,0.72),0_0_0_5px_rgba(139,92,246,0.42)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={target}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 animate-in fade-in bg-slate-950/75 duration-300 motion-reduce:animate-none" />
      )}

      <section
        data-testid="guided-tour-card"
        className="fixed max-h-[calc(100vh-32px)] animate-in overflow-visible rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl fade-in zoom-in-95 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transition-all motion-reduce:animate-none motion-reduce:transition-none"
        style={{ left: cardPosition.left, top: cardPosition.top, width: cardPosition.width }}
      >
        {cardPosition.arrow !== "none" && (
          <div className={`absolute h-3 w-3 rotate-45 border-neutral-200 bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            cardPosition.arrow === "top" ? "-top-1.5 left-1/2 -translate-x-1/2 border-l border-t"
              : cardPosition.arrow === "bottom" ? "-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r"
                : cardPosition.arrow === "left" ? "-left-1.5 top-1/2 -translate-y-1/2 border-b border-l"
                  : "-right-1.5 top-1/2 -translate-y-1/2 border-r border-t"
          }`} />
        )}
        <div key={step.id} data-testid="guided-tour-step-content" className="relative animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">Step {index + 1} of {total}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                role="switch"
                aria-checked={voiceEnabled}
                aria-label={voiceEnabled ? "Turn AI voice off" : "Turn AI voice on"}
                onClick={onToggleVoice}
                disabled={!voiceSupported}
                className={`group inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border px-2.5 text-[11px] font-medium transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none ${
                  voiceEnabled ? "border-violet-200 bg-violet-50 text-violet-700" : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                }`}
                title={voiceSupported ? "Read each walkthrough step aloud" : "Voice narration is unavailable in this browser"}
              >
                <span className="relative grid h-4 w-4 place-items-center">
                  {voiceEnabled ? (
                    isSpeaking ? <AudioLines size={14} className="animate-pulse motion-reduce:animate-none" /> : <Volume2 size={14} />
                  ) : <VolumeX size={14} />}
                </span>
                <span>AI voice</span>
                <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${voiceEnabled ? "bg-violet-500" : "bg-neutral-300"}`} />
              </button>
              <button type="button" onClick={onSkip} aria-label="Exit walkthrough" className="rounded-lg p-1.5 text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-700 active:scale-95 motion-reduce:transform-none"><X size={17} /></button>
            </div>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-violet-600 transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
          <h2 className="text-[18px] font-semibold leading-tight text-neutral-900">{step.title}</h2>
          <p className="mt-2 text-[13.5px] leading-6 text-neutral-600">{step.description}</p>
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4">
            <button type="button" onClick={onSkip} className="px-2 py-2 text-[12.5px] text-neutral-500 transition-colors duration-200 hover:text-neutral-800">Skip tour</button>
            <div className="flex gap-2">
              {index > 0 && <button type="button" onClick={onBack} className="inline-flex animate-in items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-[12.5px] text-neutral-700 fade-in slide-in-from-right-1 duration-200 transition-all hover:-translate-y-0.5 hover:bg-neutral-50 active:translate-y-0 motion-reduce:animate-none motion-reduce:transform-none"><ArrowLeft size={14} /> Back</button>}
              <button ref={nextButtonRef} type="button" onClick={onNext} className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-[12.5px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none">{isLast ? <><Check size={14} /> Finish</> : <>Next <ArrowRight size={14} /></>}</button>
            </div>
          </div>
          <p className="mt-3 text-[10.5px] text-neutral-400">Keyboard: ← Back · → Next · Esc Exit</p>
        </div>
      </section>
    </div>,
    document.body,
  );
}
