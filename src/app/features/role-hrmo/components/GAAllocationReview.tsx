import { useState } from "react";
import { ArrowRight, CheckCircle2, Dna, Gauge, Info, RefreshCw, Zap } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type TaskMove = {
  id: number;
  task: string;
  complexity: number;
  from: string;
  to: string;
  skillMatch: number;
};

const REBALANCE_MOVES: TaskMove[] = [
  { id: 1, task: "Site Permit Review · Brgy Cogon", complexity: 8, from: "Engr. A. Dela Cruz", to: "Engr. T. Ocaña", skillMatch: 0.94 },
  { id: 2, task: "Drainage Inspection · Linao", complexity: 6, from: "Engr. A. Dela Cruz", to: "Engr. V. Saavedra", skillMatch: 0.89 },
  { id: 3, task: "Road Closure Approval · Real St.", complexity: 5, from: "Engr. A. Dela Cruz", to: "Engr. R. Montes", skillMatch: 0.92 },
  { id: 4, task: "Subdivision Plan Review", complexity: 9, from: "Arch. P. Odal", to: "Arch. K. Sumalpong", skillMatch: 0.87 },
  { id: 5, task: "Zoning Variance · District 2", complexity: 7, from: "Arch. P. Odal", to: "Planner J. Elumba", skillMatch: 0.81 },
  { id: 6, task: "Building Permit · Lot 14-B", complexity: 4, from: "Engr. A. Dela Cruz", to: "Engr. D. Tablate", skillMatch: 0.95 },
  { id: 7, task: "Infra Compliance Audit", complexity: 8, from: "Engr. A. Dela Cruz", to: "Engr. Q. Lagbas", skillMatch: 0.90 },
];

export function GAAllocationReview() {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [generation, setGeneration] = useState(0);
  const [fitness, setFitness] = useState(0.42);
  const [confirmed, setConfirmed] = useState(false);

  function runBalancer() {
    setPhase("running");
    setGeneration(0);
    setFitness(0.42);
    setConfirmed(false);
    let gen = 0;
    const timer = setInterval(() => {
      gen += 1;
      setGeneration(gen);
      setFitness((f) => Math.min(0.97, f + (0.97 - f) * 0.18));
      if (gen >= 24) {
        clearInterval(timer);
        setPhase("done");
      }
    }, 80);
  }

  return (
    <div>
      <PageHeader
        title="Genetic Algorithm Adjustments"
        subtitle="Instead of 40 manual drag-and-drops — one click, the algorithm takes over."
        actions={
          <>
            <Btn icon={<Info size={14} />} label="GA Parameters" />
            <Btn
              icon={phase === "running" ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              label={phase === "running" ? "Running..." : phase === "done" ? "Re-run" : "Run Load Balancer"}
              variant="primary"
              onClick={runBalancer}
            />
          </>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Overburdened Staff" value="2" trend="flagged by fairness graph" tone="bad" />
        <Stat label="Tasks to Redistribute" value="40" trend="complexity-weighted" />
        <Stat label="Eligible Receivers" value="312" trend="matched by skill matrix" tone="good" />
      </div>

      {/* GA Engine */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna size={16} />
            <span className="font-medium text-[13px]">Genetic Algorithm · Fitness Optimization</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-normal text-neutral-300">
            <span>pop: 240</span>
            <span>mutation: 0.04</span>
            <span>gen: {generation}/24</span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-neutral-50 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Fitness Score</span>
            <span className={`text-[13px] font-semibold ${fitness > 0.85 ? "text-emerald-600" : fitness > 0.6 ? "text-amber-600" : "text-neutral-700"}`}>
              {fitness.toFixed(3)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-neutral-100 overflow-hidden relative">
            <div
              className="h-full transition-all duration-100 bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500"
              style={{ width: `${fitness * 100}%` }}
            />
            {phase === "running" && (
              <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent,white,transparent)] animate-pulse" />
            )}
          </div>

          {/* Genome viz */}
          <div className="mt-4 flex gap-0.5 h-6 rounded overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => {
              const seed = (i * 17 + generation * 3) % 7;
              const on = phase === "idle" ? seed > 4 : seed > Math.max(1, 5 - generation * 0.2);
              return (
                <div
                  key={i}
                  className={`flex-1 transition-colors duration-150 ${on ? "bg-neutral-900" : "bg-neutral-200"}`}
                />
              );
            })}
          </div>
          <div className="text-[10px] font-normal text-neutral-400 mt-1 text-center">
            chromosome · {phase === "running" ? "mutating" : phase === "done" ? "converged" : "initial population"}
          </div>
        </div>
      </div>

      {/* Proposed moves */}
      {phase === "done" && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-neutral-900">Proposed Redistribution</div>
              <div className="text-[11px] font-normal text-neutral-500">
                7 of 40 moves shown · skill match ≥ 0.80 · projected fitness 0.94
              </div>
            </div>
            {!confirmed ? (
              <Btn icon={<CheckCircle2 size={14} />} label="Commit Rebalance" variant="primary" onClick={() => setConfirmed(true)} />
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">
                <CheckCircle2 size={12} /> Committed · GA dispatched
              </span>
            )}
          </div>

          <div className="divide-y divide-neutral-100">
            {REBALANCE_MOVES.map((m, idx) => (
              <div
                key={m.id}
                className="px-5 py-3 flex items-center gap-4 hover:bg-neutral-50 transition-colors"
                style={{ animation: `slideIn 0.4s ${idx * 60}ms backwards ease-out` }}
              >
                <div className="text-[11px] font-medium text-neutral-400 w-6">#{m.id}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-neutral-900">{m.task}</div>
                  <div className="text-[11px] font-normal text-neutral-500">complexity {m.complexity} · skill match {m.skillMatch.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-normal">
                  <span className="line-through text-red-600">{m.from}</span>
                  <ArrowRight size={12} className="text-neutral-400" />
                  <span className="text-emerald-700 font-medium">{m.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "idle" && (
        <div className="bg-white border border-dashed border-neutral-300 rounded-xl p-10 text-center">
          <Gauge size={32} className="mx-auto text-neutral-300 mb-2" />
          <div className="text-[13px] font-medium text-neutral-700">Balancer idle</div>
          <div className="text-[12px] font-normal text-neutral-500 mt-1">
            Click <span className="font-medium">Run Load Balancer</span> to let the GA redistribute the 40 overburdened tasks.
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ==================== VELOCITY OVERVIEW (Workload Velocity Metrics landing) ====================
