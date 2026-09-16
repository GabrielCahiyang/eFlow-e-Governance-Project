import { useMemo } from "react";
import { Activity, ArrowRight, Dna, TrendingUp, Users } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

export function WorkloadVelocityOverview() {
  return (
    <div>
      <PageHeader
        title="Workload Velocity Metrics"
        subtitle="Supervising the Genetic Algorithm · ensuring the robot plays fair"
        actions={<Btn icon={<Activity size={14} />} label="Live Feed" />}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Avg Completion Velocity" value="2.4×" trend="vs baseline" tone="good" />
        <Stat label="GA Allocations / day" value="1,482" trend="automated assignments" />
        <Stat label="Manual Overrides" value="3" trend="last 24h · low" tone="good" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a
          href="#"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-900 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-neutral-700" />
            <span className="text-[13px] font-semibold">Equitable Distribution</span>
          </div>
          <p className="text-[12px] font-normal text-neutral-500 leading-relaxed mb-3">
            Scatter plot of 2,068 employees mapped by tasks × complexity. Spot outliers at a glance.
          </p>
          <div className="text-[11px] font-medium text-neutral-900 flex items-center gap-1 group-hover:gap-2 transition-all">
            Open graph <ArrowRight size={12} />
          </div>
        </a>
        <a
          href="#"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-900 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Dna size={16} className="text-neutral-700" />
            <span className="text-[13px] font-semibold">GA Allocation Review</span>
          </div>
          <p className="text-[12px] font-normal text-neutral-500 leading-relaxed mb-3">
            Run the Genetic Algorithm load balancer. No drag-and-drop — one click redistribution.
          </p>
          <div className="text-[11px] font-medium text-neutral-900 flex items-center gap-1 group-hover:gap-2 transition-all">
            Open engine <ArrowRight size={12} />
          </div>
        </a>
      </div>

      <div className="mt-5 bg-white border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-emerald-600" />
          <span className="text-[12px] font-medium">Task Completion Velocity · 30 days</span>
        </div>
        <VelocitySparkline />
      </div>
    </div>
  );
}

function VelocitySparkline() {
  const values = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 30; i++) arr.push(1.4 + Math.sin(i * 0.4) * 0.3 + i * 0.04);
    return arr;
  }, []);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const W = 800;
  const H = 100;
  const dx = W / (values.length - 1);
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * dx} ${H - ((v - min) / (max - min)) * H}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#vg)" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" />
    </svg>
  );
}

// ==================== 10.1.A — AUTOMATED ALERTS (HR INBOX) ====================
