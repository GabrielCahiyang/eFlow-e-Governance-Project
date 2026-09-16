import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./TransformPrimitives";
import {
  complianceCleared,
  compliancePct,
  complianceTotal,
  currentNPV,
  npvHistory,
} from "./EnvironmentalRevenuePages";

interface InfraTask {
  id: string;
  task: string;
  assignee: string;
  initials: string;
  status: string;
  budget: string;
  budgetPct: number;
  sealed: boolean;
  dependency?: string;
}

const infraPhases: { phase: string; color: string; tasks: InfraTask[] }[] = [
  {
    phase: "Phase 1: Site Preparation",
    color: "#10B981",
    tasks: [
      { id: "SP1", task: "Spillway Excavation", assignee: "Engr. R. Almeda", initials: "RA", status: "Done", budget: "₱18.5M", budgetPct: 4.1, sealed: true },
      { id: "SP2", task: "Land Grading & Clearing", assignee: "Engr. M. Torres", initials: "MT", status: "Done", budget: "₱12.2M", budgetPct: 2.7, sealed: true },
      { id: "SP3", task: "Access Road Foundation", assignee: "Engr. J. Santos", initials: "JS", status: "Working on it", budget: "₱32.8M", budgetPct: 7.3, sealed: false },
      { id: "SP4", task: "Drainage System Install", assignee: "Engr. P. Cruz", initials: "PC", status: "Working on it", budget: "₱21.0M", budgetPct: 4.7, sealed: false },
    ],
  },
  {
    phase: "Phase 2: Vertical Construction",
    color: "#2563EB",
    tasks: [
      { id: "VC1", task: "Visitor Center Structure", assignee: "Engr. L. Tan", initials: "LT", status: "Working on it", budget: "₱85.0M", budgetPct: 18.9, sealed: false, dependency: "SP3" },
      { id: "VC2", task: "Eco-Lodge Units (Batch 1)", assignee: "Engr. A. Reyes", initials: "AR", status: "Not Started", budget: "₱65.0M", budgetPct: 14.4, sealed: false, dependency: "SP4" },
      { id: "VC3", task: "Amphitheater & Event Space", assignee: "Engr. D. Garcia", initials: "DG", status: "Not Started", budget: "₱42.0M", budgetPct: 9.3, sealed: false, dependency: "VC1" },
      { id: "VC4", task: "Restroom & Service Facilities", assignee: "Engr. K. Lim", initials: "KL", status: "Stuck", budget: "₱18.5M", budgetPct: 4.1, sealed: false },
    ],
  },
  {
    phase: "Phase 3: Utilities & Finishing",
    color: "#F59E0B",
    tasks: [
      { id: "UF1", task: "Electrical Grid Connection", assignee: "Engr. S. Ong", initials: "SO", status: "Not Started", budget: "₱38.0M", budgetPct: 8.4, sealed: false, dependency: "VC1" },
      { id: "UF2", task: "Water Treatment Plant", assignee: "Engr. B. Navarro", initials: "BN", status: "Not Started", budget: "₱52.0M", budgetPct: 11.6, sealed: false },
      { id: "UF3", task: "Landscaping & Trail System", assignee: "Engr. C. Flores", initials: "CF", status: "Not Started", budget: "₱35.0M", budgetPct: 7.8, sealed: false, dependency: "VC2" },
      { id: "UF4", task: "Solar Panel Array", assignee: "Engr. H. Mendoza", initials: "HM", status: "Not Started", budget: "₱30.0M", budgetPct: 6.7, sealed: false, dependency: "UF1" },
    ],
  },
];

// Dependency alert data
const dependencyAlerts = [
  { from: "Access Road Foundation (SP3)", to: "Visitor Center Structure (VC1)", delay: "3 days behind", impact: "Pushes VC1 start by 3 days" },
  { from: "Restroom Facilities (VC4)", to: "—", delay: "Stuck: Mayor approval", impact: "Budget frozen at ₱18.5M" },
];

export function InfrastructurePage() {
  const [expandedPhases, setExpandedPhases] = React.useState<Set<number>>(new Set([0, 1, 2]));

  const togglePhase = (idx: number) => {
    const next = new Set(expandedPhases);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setExpandedPhases(next);
  };

  return (
    <div>
      <UI.PageHeader
        title="Eco-Park Infrastructure Build"
        subtitle="Sustainable Tourism & Eco-Park · ₱450M Allocation"
        actions={<>
          <UI.Btn icon={<Carbon.View size={14} />} label="Gantt Timeline" />
          <UI.Btn icon={<Carbon.Play size={14} />} label="Run GA Workload Balancer" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Budget" value="₱450M" sub="FY 2026 allocation" />
        <UI.StatCard label="Spent to Date" value="₱84.5M" sub="18.8% utilized" />
        <UI.StatCard label="Tasks Complete" value="2/12" sub="16.7% done" />
        <UI.StatCard label="Active Workers" value="142" sub="+8 this week" trend="up" />
      </div>

      {/* Dependency Alerts */}
      {dependencyAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Carbon.Warning size={16} className="text-amber-600" />
            <h4 className="text-[12px] font-semibold text-amber-800">Dependency Alerts — Timeline Shift Detected</h4>
          </div>
          <div className="space-y-2">
            {dependencyAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-[11px] font-normal">
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{a.delay}</span>
                <span className="text-neutral-600">{a.from}</span>
                <Carbon.ChevronRight size={12} className="text-neutral-400" />
                <span className="text-neutral-600">{a.to}</span>
                <span className="text-neutral-400">·</span>
                <span className="text-red-600">{a.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monday-style Multi-Stage Board */}
      <div className="space-y-4">
        {infraPhases.map((phase, pi) => (
          <div key={pi} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => togglePhase(pi)}
              className="w-full flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-neutral-50/50 transition-colors"
            >
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: phase.color }} />
              <span className="text-[13px] font-semibold text-neutral-900 flex-1 text-left">{phase.phase}</span>
              <span className="text-[11px] font-normal text-neutral-500">{phase.tasks.filter(t => t.status === "Done").length}/{phase.tasks.length} complete</span>
              <Carbon.ChevronDown size={14} className={`text-neutral-400 transition-transform ${expandedPhases.has(pi) ? "" : "-rotate-90"}`} />
            </button>

            {expandedPhases.has(pi) && (
              <>
                {/* Column Headers */}
                <div className="grid grid-cols-[1fr_140px_120px_110px_90px_90px] gap-0 px-5 py-2 border-t border-b border-neutral-100 bg-neutral-50/50">
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Task Name</span>
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Assigned To</span>
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Status</span>
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Budget Draw</span>
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide text-right">% of ₱450M</span>
                  <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide text-center">BC Seal</span>
                </div>
                {/* Rows */}
                {phase.tasks.map((t) => (
                  <div key={t.id} className="grid grid-cols-[1fr_140px_120px_110px_90px_90px] gap-0 px-5 py-3 border-b border-neutral-50 hover:bg-blue-50/30 transition-colors items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: phase.color, opacity: t.status === "Done" ? 1 : 0.4 }} />
                      <div>
                        <span className="text-[12px] font-medium text-neutral-900">{t.task}</span>
                        {t.dependency && (
                          <span className="ml-2 text-[9px] font-normal text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">dep: {t.dependency}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white" style={{ backgroundColor: phase.color }}>
                        {t.initials}
                      </div>
                      <span className="text-[11px] font-normal text-neutral-600 truncate">{t.assignee.split(". ")[1]}</span>
                    </div>
                    <UI.Pill status={t.status} />
                    <span className="text-[12px] font-medium text-neutral-900">{t.budget}</span>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(t.budgetPct * 5, 100)}%`, backgroundColor: phase.color }} />
                        </div>
                        <span className="text-[10px] font-normal text-neutral-500">{t.budgetPct}%</span>
                      </div>
                    </div>
                    <div className="text-center"><UI.BlockchainSeal sealed={t.sealed} /></div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 3.1B ENVIRONMENTAL PROTECTION ====================

export function SustainableTourismOverview() {
  const totalBudget = 450;
  const spent = 84.5;
  const permits = { cleared: 3, total: 7 };
  const revActual = 10.49;

  return (
    <div>
      <UI.PageHeader
        title="Sustainable Tourism & Eco-Park"
        subtitle="Project Transform · Flagship Initiative #1"
        actions={<>
          <UI.Btn icon={<Carbon.View size={14} />} label="Full Timeline" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Initiative Report" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Budget" value={`₱${totalBudget}M`} sub="FY 2026 allocation" />
        <UI.StatCard label="Spent to Date" value={`₱${spent}M`} sub={`${Math.round((spent / totalBudget) * 100)}% utilized`} />
        <UI.StatCard label="Compliance" value={`${permits.cleared}/${permits.total}`} sub={`${Math.round((permits.cleared / permits.total) * 100)}% permits cleared`} trend="up" />
        <UI.StatCard label="Monthly Revenue" value={`₱${revActual}M`} sub="2.3% above target" trend="up" />
      </div>

      {/* Three module cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Infrastructure Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Carbon.Home size={16} className="text-blue-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Infrastructure (₱450M)</h4>
              <p className="text-[10px] font-normal text-neutral-500">Physical build progress</p>
            </div>
          </div>
          {/* Mini battery */}
          <div className="flex rounded-full overflow-hidden h-4 bg-neutral-100 mb-2">
            <div className="bg-emerald-500 flex items-center justify-center" style={{ width: "17%" }}>
              <span className="text-[8px] text-white font-medium">Done</span>
            </div>
            <div className="bg-amber-400" style={{ width: "25%" }} />
            <div className="bg-neutral-200" style={{ width: "58%" }} />
          </div>
          <div className="flex justify-between text-[10px] font-normal text-neutral-500">
            <span>2/12 tasks complete</span>
            <span>142 workers</span>
          </div>
          {dependencyAlerts.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 rounded px-2 py-1">
              <Carbon.Warning size={10} /> {dependencyAlerts.length} dependency alerts
            </div>
          )}
        </div>

        {/* Environmental Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Carbon.Flag size={16} className="text-emerald-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Environmental Protection</h4>
              <p className="text-[10px] font-normal text-neutral-500">Permits & clearances</p>
            </div>
          </div>
          <div className="flex rounded-full overflow-hidden h-4 bg-neutral-100 mb-2">
            <div className="bg-emerald-500" style={{ width: `${compliancePct}%` }} />
            <div className="bg-amber-300" style={{ width: `${Math.round((3 / complianceTotal) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-normal text-neutral-500">
            <span>{complianceCleared}/{complianceTotal} cleared</span>
            <span>{compliancePct}% compliant</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-red-700 bg-red-50 rounded px-2 py-1">
            <Carbon.Warning size={10} /> 1 SLA breach — DENR ECC
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Carbon.ChartBar size={16} className="text-violet-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Revenue Projections</h4>
              <p className="text-[10px] font-normal text-neutral-500">Fiscal viability</p>
            </div>
          </div>
          <Charts.ResponsiveContainer width="100%" height={70}>
            <Charts.AreaChart data={npvHistory.slice(-5)}>
              <Charts.Area key="a" type="monotone" dataKey="npv" stroke="#8B5CF6" fill="#EDE9FE" strokeWidth={1.5} />
            </Charts.AreaChart>
          </Charts.ResponsiveContainer>
          <div className="flex justify-between text-[10px] font-normal text-neutral-500 mt-1">
            <span>NPV: ₱{currentNPV}M</span>
            <span className="text-emerald-600">IRR: 14.2%</span>
          </div>
        </div>
      </div>

      {/* Quick board preview */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Priority Tasks Across Phases</h3>
        <div className="space-y-2">
          {infraPhases.flatMap(p => p.tasks).filter(t => t.status === "Working on it" || t.status === "Stuck").map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50/50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-semibold text-blue-600">{t.initials}</div>
              <span className="text-[12px] font-medium text-neutral-900 flex-1">{t.task}</span>
              <span className="text-[11px] font-normal text-neutral-500">{t.budget}</span>
              <UI.Pill status={t.status} />
              <UI.BlockchainSeal sealed={t.sealed} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 3.2A #SHInEOrmoc INITIATIVE ====================
