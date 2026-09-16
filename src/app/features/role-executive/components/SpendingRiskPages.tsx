import * as Carbon from "@carbon/icons-react";
import * as UI from "./FinancialPrimitives";

const overspendingProjects = [
  {
    project: "Eco-Park Spillway Excavation",
    dept: "City Engineering",
    budget: 18.5,
    burned: 22.2,
    burnRate: 120,
    daysToExhaust: 14,
    aiInsight: "Based on the last 3 weeks of procurement data, this project will run out of funds 14 days before completion.",
    risk: "High",
  },
  {
    project: "Mobile Health Unit Procurement",
    dept: "Health Office",
    budget: 35,
    burned: 30.8,
    burnRate: 112,
    daysToExhaust: 28,
    aiInsight: "Bid evaluation anomaly detected. BAC timeline is 3.2x historical average. Material costs trending up 8%.",
    risk: "High",
  },
  {
    project: "Barangay Road Network Phase 2",
    dept: "City Engineering",
    budget: 42,
    burned: 33.6,
    burnRate: 105,
    daysToExhaust: 45,
    aiInsight: "Fuel cost increases are driving 5% above baseline. Consider reallocating from Phase 3 contingency.",
    risk: "Medium",
  },
  {
    project: "Agricultural Extension Program",
    dept: "Agriculture Office",
    budget: 12,
    burned: 9.8,
    burnRate: 98,
    daysToExhaust: 60,
    aiInsight: "Spending is marginally within bounds but trending upward. Monitor seed procurement costs next month.",
    risk: "Low",
  },
];

export function OverspendingRisk() {
  return (
    <div>
      <UI.PageHeader
        title="Budget Burn-Rate Alerts"
        subtitle="Master Budget Execution · AI Overspending Detection"
        actions={<>
          <UI.Btn icon={<Carbon.Warning size={14} />} label="Freeze Non-Essential Funds" variant="danger" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Projects Monitored" value={`${overspendingProjects.length}`} sub="Active AI monitoring" />
        <UI.StatCard label="High Risk" value={`${overspendingProjects.filter(p => p.risk === "High").length}`} sub="Immediate attention" trend="down" />
        <UI.StatCard label="At-Risk Capital" value="₱28.5M" sub="Funds in danger zone" trend="down" />
        <UI.StatCard label="Avg Burn Rate" value={`${Math.round(overspendingProjects.reduce((s, p) => s + p.burnRate, 0) / overspendingProjects.length)}%`} sub="vs expected pace" />
      </div>

      {/* At-Risk Capital Battery */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-neutral-900">At-Risk Capital Battery</h3>
          <span className="text-[12px] font-semibold text-red-600">₱28.5M in danger zone</span>
        </div>
        <div className="flex rounded-full overflow-hidden h-7 bg-neutral-100">
          <div className="bg-red-400 flex items-center justify-center" style={{ width: "35%" }}>
            <span className="text-[10px] font-medium text-white">High: ₱10.2M</span>
          </div>
          <div className="bg-amber-300 flex items-center justify-center" style={{ width: "25%" }}>
            <span className="text-[10px] font-medium text-amber-900">Medium: ₱8.3M</span>
          </div>
          <div className="bg-emerald-400 flex items-center justify-center" style={{ width: "40%" }}>
            <span className="text-[10px] font-medium text-white">Safe: ₱10.0M</span>
          </div>
        </div>
      </div>

      {/* Risk Kanban */}
      <div className="grid grid-cols-3 gap-4">
        {(["High", "Medium", "Low"] as const).map((level) => {
          const cards = overspendingProjects.filter(p => p.risk === level);
          const colors = { High: "border-t-red-400", Medium: "border-t-amber-400", Low: "border-t-emerald-400" };
          const bgColors = { High: "bg-red-50", Medium: "bg-amber-50", Low: "bg-neutral-50" };
          return (
            <div key={level} className={`${bgColors[level]} rounded-xl border border-neutral-200 p-3`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UI.Pill status={level} />
                  <span className="text-[11px] font-semibold text-neutral-700">Risk</span>
                </div>
                <span className="text-[10px] font-medium bg-white text-neutral-600 rounded-full px-2 py-0.5 border border-neutral-200">{cards.length}</span>
              </div>
              <div className="space-y-3">
                {cards.map((c) => (
                  <div key={c.project} className={`bg-white rounded-lg border border-t-4 ${colors[level]} p-4 shadow-sm`}>
                    <h5 className="text-[12px] font-semibold text-neutral-900 mb-1">{c.project}</h5>
                    <p className="text-[10px] font-normal text-neutral-500 mb-3">{c.dept}</p>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-[9px] font-medium text-neutral-500 uppercase">Budget</p>
                        <p className="text-[13px] font-semibold text-neutral-900">₱{c.budget}M</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-medium text-neutral-500 uppercase">Burned</p>
                        <p className={`text-[13px] font-semibold ${c.burnRate > 100 ? "text-red-600" : "text-neutral-900"}`}>₱{c.burned}M</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-medium text-neutral-500">Burn Rate:</span>
                      <span className={`text-[12px] font-semibold ${c.burnRate > 100 ? "text-red-600" : "text-emerald-600"}`}>{c.burnRate}%</span>
                      {c.daysToExhaust < 30 && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">{c.daysToExhaust}d to exhaust</span>
                      )}
                    </div>

                    {/* AI Insight */}
                    <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                      <div className="flex items-start gap-1.5">
                        <Carbon.Analytics size={12} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-normal text-blue-800 leading-relaxed">{c.aiInsight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 4.1C UNDERUTILIZATION ALERTS ====================

const idleFunds = [
  { project: "Agricultural Livelihood Grants", dept: "Agriculture Office", unspent: 56.6, expiry: "Dec 31, 2026", daysLeft: 259, totalBudget: 95, pctUnspent: 59.6 },
  { project: "Tourism Marketing Campaign", dept: "Tourism Office", unspent: 21.5, expiry: "Dec 31, 2026", daysLeft: 259, totalBudget: 40, pctUnspent: 53.8 },
  { project: "Flood Control Phase 3", dept: "City Engineering", unspent: 45.2, expiry: "Sep 30, 2026", daysLeft: 167, totalBudget: 65, pctUnspent: 69.5 },
  { project: "Senior Citizen Welfare Program", dept: "CSWDO", unspent: 15.8, expiry: "Jun 30, 2026", daysLeft: 75, totalBudget: 28, pctUnspent: 56.4 },
  { project: "Drainage Master Plan", dept: "City Planning", unspent: 33.8, expiry: "Jun 15, 2026", daysLeft: 60, totalBudget: 65, pctUnspent: 52.0 },
  { project: "Fish Cage Monitoring System", dept: "Agriculture Office", unspent: 8.2, expiry: "May 31, 2026", daysLeft: 45, totalBudget: 12, pctUnspent: 68.3 },
];

export function UnderutilizationAlerts() {
  return (
    <div>
      <UI.PageHeader
        title="Idle Funds Radar"
        subtitle="Master Budget Execution · Underutilization Alerts"
        actions={<>
          <UI.Btn icon={<Carbon.Send size={14} />} label="Nudge Dept Heads" variant="primary" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Idle Funds" value="₱181.1M" sub="Across 6 projects" />
        <UI.StatCard label="Critical (<60 days)" value="2" sub="₱42.0M at risk of reversion" trend="down" />
        <UI.StatCard label="BPA Escalations" value="1" sub="Auto-pushed to Mayor" trend="down" />
        <UI.StatCard label="Avg. Utilization" value="41%" sub="Below 60% target" trend="down" />
      </div>

      {/* BPA Escalation Alert */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Carbon.Warning size={14} className="text-red-600" />
          <span className="text-[12px] font-semibold text-red-800">BPA Auto-Escalation Triggered</span>
        </div>
        <p className="text-[11px] font-normal text-red-700 ml-5">
          "Fish Cage Monitoring System" is 68% unspent with only 45 days remaining. The BPA engine has escalated this to the Mayor's Executive Cockpit for urgent intervention.
        </p>
      </div>

      {/* Countdown Board */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_110px_110px_140px_90px] gap-0 px-5 py-3 bg-neutral-50/50 border-b border-neutral-100">
          {["Project Name", "Department", "Unspent Amount", "Expiration", "Days Remaining", "% Unspent"].map(h => (
            <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {idleFunds.sort((a, b) => a.daysLeft - b.daysLeft).map((f) => {
          const isCritical = f.daysLeft < 60;
          const isWarning = f.daysLeft < 90 && !isCritical;
          return (
            <div
              key={f.project}
              className={`grid grid-cols-[1fr_120px_110px_110px_140px_90px] gap-0 px-5 py-3.5 border-b transition-colors items-center ${
                isCritical ? "border-l-4 border-l-red-400 bg-red-50/30 border-b-red-100" : isWarning ? "border-l-4 border-l-amber-300 bg-amber-50/20 border-b-neutral-50" : "border-b-neutral-50 hover:bg-neutral-50/50"
              }`}
            >
              <div>
                <span className="text-[12px] font-medium text-neutral-900">{f.project}</span>
                {isCritical && <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">CRITICAL</span>}
              </div>
              <span className="text-[11px] font-normal text-neutral-600">{f.dept}</span>
              <span className="text-[12px] font-semibold text-neutral-900">₱{f.unspent}M</span>
              <span className="text-[11px] font-normal text-neutral-600">{f.expiry}</span>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isCritical ? "bg-red-100" : isWarning ? "bg-amber-100" : "bg-neutral-100"}`}>
                  {isCritical && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  <span className={`text-[13px] font-semibold ${isCritical ? "text-red-700" : isWarning ? "text-amber-700" : "text-neutral-700"}`}>
                    {f.daysLeft}d
                  </span>
                </div>
                <span className="text-[10px] font-normal text-neutral-400">remaining</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-12 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.pctUnspent}%`, backgroundColor: f.pctUnspent > 60 ? "#EF4444" : f.pctUnspent > 40 ? "#F59E0B" : "#10B981" }} />
                </div>
                <span className="text-[10px] font-normal text-neutral-500">{f.pctUnspent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 4.2 PARENT: UNLIQUIDATED CASH ADVANCES ====================
