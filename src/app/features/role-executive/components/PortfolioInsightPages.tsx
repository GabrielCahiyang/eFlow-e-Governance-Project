import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as UI from "./ExecutivePrimitives";

export const insightCards = [
  { type: "Burnout Risk", severity: "High", title: "High Risk of Delay in Engineering", body: "The GA Engine detects that 80% of Civil Engineers are at maximum task capacity. Consider delaying the start of Project B by 2 weeks.", confidence: 87, horizon: "30-Day", icon: <Carbon.Warning size={16} className="text-red-500" />, color: "border-l-red-400" },
  { type: "Budget Warning", severity: "Medium", title: "Projected 15% Overrun on Eco-Park", body: "Historical data suggests the current phase of the Eco-Park typically exceeds budget by 15%. Recommend a preemptive supplementary review.", confidence: 79, horizon: "90-Day", icon: <Carbon.ChartBar size={16} className="text-amber-500" />, color: "border-l-amber-400" },
  { type: "Workforce", severity: "Medium", title: "Social Welfare Staff Redistribution Needed", body: "Task completion velocity has dropped 23% this quarter. The GA recommends redistributing 4 staff from Agriculture to Social Welfare.", confidence: 82, horizon: "30-Day", icon: <Carbon.User size={16} className="text-blue-500" />, color: "border-l-blue-400" },
  { type: "Procurement", severity: "High", title: "BAC Timeline Anomaly Detected", body: "The bid evaluation for Mobile Health Units is taking 3.2x longer than the city's historical average. Investigate potential compliance issues.", confidence: 91, horizon: "30-Day", icon: <Carbon.Time size={16} className="text-red-500" />, color: "border-l-red-400" },
  { type: "Revenue", severity: "Low", title: "Tourism Revenue Ahead of Projections", body: "Eco-Tourism receipts are trending 12% above forecast. Consider accelerating Phase 2 infrastructure to capitalize on momentum.", confidence: 74, horizon: "90-Day", icon: <Carbon.Analytics size={16} className="text-emerald-500" />, color: "border-l-emerald-400" },
  { type: "Compliance", severity: "Medium", title: "30-Day Liquidation Window Approaching", body: "8 departments have unliquidated cash advances approaching the 30-day COA deadline. Automated reminders have been dispatched.", confidence: 95, horizon: "30-Day", icon: <Carbon.Flag size={16} className="text-amber-500" />, color: "border-l-amber-400" },
];

export function PredictiveInsightCards() {
  const [horizon, setHorizon] = React.useState<"30-Day" | "90-Day">("30-Day");
  const filtered = insightCards.filter((c) => c.horizon === horizon || horizon === "30-Day");

  return (
    <div>
      <UI.PageHeader
        title="AI Risk Forecasts"
        actions={<>
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            {(["30-Day", "90-Day"] as const).map((h) => (
              <button key={h} onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all ${
                  horizon === h ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >{h} Horizon</button>
            ))}
          </div>
          <UI.ActionButton icon={<Carbon.Download size={14} />} label="Export" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Predictions" value={`${filtered.length}`} sub="AI-generated forecasts" />
        <UI.StatCard label="High Severity" value={`${filtered.filter(c => c.severity === "High").length}`} sub="Requires immediate action" trend="down" />
        <UI.StatCard label="Avg. Confidence" value={`${Math.round(filtered.reduce((s, c) => s + c.confidence, 0) / filtered.length)}%`} sub="Model certainty" />
        <UI.StatCard label="Actions Taken" value="12" sub="Based on AI advice this month" trend="up" />
      </div>

      {/* Masonry-style grid of smart cards */}
      <div className="columns-2 gap-4 space-y-4">
        {filtered.map((card, i) => (
          <div key={i} className={`bg-white rounded-xl border border-neutral-200 p-5 border-l-4 ${card.color} break-inside-avoid`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {card.icon}
                <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{card.type}</span>
              </div>
              <UI.Pill status={card.severity} />
            </div>
            <h3 className="text-[14px] font-semibold text-neutral-900 mb-1.5">{card.title}</h3>
            <p className="text-[12px] font-normal text-neutral-600 leading-relaxed mb-3">{card.body}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${card.confidence}%` }} />
                </div>
                <span className="text-[10px] font-normal text-neutral-500">{card.confidence}% conf.</span>
              </div>
              <span className="text-[10px] font-normal text-neutral-400">{card.horizon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 6. PROCUREMENT DELAY ALERTS ====================
const biddingPipeline = [
  { project: "Mobile Health Unit", stage: "Notice of Award", days: 42, avgDays: 14, anomaly: true, status: "Critical" },
  { project: "Road Equipment Lease", stage: "Bid Evaluation", days: 28, avgDays: 10, anomaly: true, status: "Warning" },
  { project: "School Furniture Lot 3", stage: "Post-Qualification", days: 18, avgDays: 12, anomaly: false, status: "On Track" },
  { project: "IT Infrastructure Ph.2", stage: "Opening of Bids", days: 8, avgDays: 7, anomaly: false, status: "On Track" },
  { project: "Eco-Park Landscaping", stage: "Notice of Award", days: 31, avgDays: 14, anomaly: true, status: "Warning" },
  { project: "Water System Upgrade", stage: "Pre-Bid Conference", days: 5, avgDays: 5, anomaly: false, status: "On Track" },
];

export const heatmapStages = ["Pre-Bid", "Opening", "Evaluation", "Post-Qual", "NOA"];
export const heatmapData = [
  { project: "Mobile Health Unit", values: [1.0, 1.2, 2.1, 1.8, 3.0] },
  { project: "Road Equipment", values: [0.8, 1.0, 2.8, 1.5, 1.2] },
  { project: "School Furniture", values: [1.1, 0.9, 1.5, 1.0, 0.8] },
  { project: "IT Infrastructure", values: [1.0, 1.1, 0.9, 0.7, 0.6] },
  { project: "Eco-Park Landscaping", values: [0.9, 1.3, 1.6, 2.2, 2.2] },
];

export function getHeatColor(val: number) {
  if (val >= 2.5) return "bg-red-500 text-white";
  if (val >= 2.0) return "bg-red-300 text-red-900";
  if (val >= 1.5) return "bg-amber-200 text-amber-800";
  if (val >= 1.2) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export function ProcurementDelayAlerts() {
  return (
    <div>
      <UI.PageHeader
        title="NGPA Compliance & Bidding Radar"
        actions={<>
          <UI.ActionButton icon={<Carbon.Filter size={14} />} label="Active Bids Only" />
          <UI.ActionButton icon={<Carbon.View size={14} />} label="Open BPMN Viewer" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Procurements" value="14" sub="Through BAC pipeline" />
        <UI.StatCard label="Anomalous" value="3" sub="Statistically delayed" trend="down" />
        <UI.StatCard label="Avg. Cycle Time" value="22d" sub="vs 14d historical avg" trend="down" />
        <UI.StatCard label="Compliance Rate" value="78%" sub="NGPA adherence" />
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">Process Mining Heatmap</h3>
        <p className="text-[11px] font-normal text-neutral-500 mb-4">Duration ratio vs. historical average (1.0 = on par, &gt;2.0 = anomalous)</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Project</th>
                {heatmapStages.map((s) => (
                  <th key={s} className="py-2 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide text-center">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.project}>
                  <td className="py-2 px-3 text-[12px] font-medium text-neutral-900">{row.project}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-2 px-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-medium ${getHeatColor(v)}`}>{v.toFixed(1)}x</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bidding Pipeline Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Bidding Pipeline</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Project</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Current Stage</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Days Elapsed</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">City Avg</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Anomaly</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {biddingPipeline.map((b) => (
                <tr key={b.project} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-3 text-[12px] font-medium text-neutral-900">{b.project}</td>
                  <td className="py-3 px-3 text-[12px] font-normal text-neutral-600">{b.stage}</td>
                  <td className="py-3 px-3 text-[12px] font-medium text-neutral-900">{b.days}d</td>
                  <td className="py-3 px-3 text-[12px] font-normal text-neutral-500">{b.avgDays}d</td>
                  <td className="py-3 px-3">
                    {b.anomaly ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                        <Carbon.Warning size={12} /> {(b.days / b.avgDays).toFixed(1)}x slower
                      </span>
                    ) : (
                      <span className="text-[11px] font-normal text-neutral-400">Normal</span>
                    )}
                  </td>
                  <td className="py-3 px-3"><UI.Pill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== 7. ACTIONABLE INTELLIGENCE (NLP DIGEST) ====================
