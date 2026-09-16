import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "../ExecutivePrimitives";
import { bottleneckCards, kanbanCols } from './data';

export function CriticalBottlenecks() {
  return (
    <div>
      <UI.PageHeader
        title="Systemic Stalls & SLA Breaches"
        actions={<>
          <UI.ActionButton icon={<Carbon.Warning size={14} />} label="Trigger All-Dept Alert" variant="danger" />
          <UI.ActionButton icon={<Carbon.Filter size={14} />} label="Filter by SLA" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Bottlenecks" value="6" sub="2 new this week" trend="down" />
        <UI.StatCard label="Avg. Stall Duration" value="13.2d" sub="Above 7-day SLA" trend="down" />
        <UI.StatCard label="Resolved This Month" value="9" sub="64% resolution rate" trend="up" />
        <UI.StatCard label="At-Risk Budget Impact" value="₱45M" sub="Frozen due to stalls" />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {kanbanCols.map((col) => {
          const cards = bottleneckCards.filter((c) =>
            col === "Finance Scrutiny" ? c.stuckAt.includes("Finance") || c.stuckAt.includes("COA") :
            col === "BAC / Procurement" ? c.stuckAt.includes("BAC") || c.stuckAt.includes("Vendor") :
            c.stuckAt.includes("Approval") || c.stuckAt.includes("Security") || c.stuckAt.includes("IT")
          );
          return (
            <div key={col} className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-semibold text-neutral-700">{col}</h4>
                <span className="text-[11px] font-medium bg-neutral-200 text-neutral-600 rounded-full px-2 py-0.5">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {cards.map((card) => (
                  <div key={card.project} className="bg-white rounded-lg border border-neutral-200 p-3.5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-[12px] font-semibold text-neutral-900">{card.project}</h5>
                      <UI.Pill status={card.severity} />
                    </div>
                    <p className="text-[11px] font-normal text-neutral-500 mb-1">
                      Stuck At: <span className="text-neutral-700">{card.stuckAt}</span>
                    </p>
                    <p className="text-[11px] font-normal text-neutral-500 mb-2.5">
                      Duration: <span className={`${card.duration > 10 ? "text-red-600" : "text-amber-600"}`}>{card.duration} Days</span> (SLA: {card.sla})
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <Carbon.User size={10} className="text-blue-600" />
                        </div>
                        <span className="text-[10px] font-normal text-neutral-600">{card.assignee}</span>
                      </div>
                      <button className="flex items-center gap-1 px-2 py-1 rounded-md bg-violet-50 hover:bg-violet-100 cursor-pointer transition-colors" title="Send Executive Nudge via Viber">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.03 2 10.94c0 2.7 1.36 5.12 3.5 6.73V22l3.88-2.13c.83.23 1.71.35 2.62.35 5.52 0 10-4.03 10-8.94S17.52 2 12 2z" fill="#7C3AED" /><path d="M13.5 8.5l-3 3.5 2.5.5-1.5 3.5 3-3.5-2.5-.5 1.5-3.5z" fill="white" /></svg>
                        <span className="text-[9px] font-medium text-violet-700">Nudge</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Breach Trend */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">SLA Breach Trend (Weekly)</h3>
        <Charts.ResponsiveContainer width="100%" height={200}>
          <Charts.BarChart data={[
            { week: "W1", breaches: 3, resolved: 5 },
            { week: "W2", breaches: 5, resolved: 4 },
            { week: "W3", breaches: 2, resolved: 6 },
            { week: "W4", breaches: 4, resolved: 3 },
            { week: "W5", breaches: 6, resolved: 4 },
            { week: "W6", breaches: 3, resolved: 7 },
          ]}>
            <Charts.CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="week" tick={{ fontSize: 11 }} />
            <Charts.YAxis key="y" tick={{ fontSize: 11 }} />
            <Charts.Tooltip key="tip" />
            <Charts.Legend key="legend" wrapperStyle={{ fontSize: 11 }} />
            <Charts.Bar key="breaches" dataKey="breaches" fill="#EF4444" radius={[4, 4, 0, 0]} name="Breaches" />
            <Charts.Bar key="resolved" dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} name="Resolved" />
          </Charts.BarChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 4. CITY PROJECT PULSE (PARENT) ====================
