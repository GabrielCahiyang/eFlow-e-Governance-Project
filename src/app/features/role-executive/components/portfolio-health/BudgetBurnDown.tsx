import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "../ExecutivePrimitives";
import { burnDownData, deptEfficiency } from './data';

export function BudgetBurnDown() {
  return (
    <div>
      <UI.PageHeader
        title="Fiscal Utilization & Liquidation"
        actions={<>
          <UI.ActionButton icon={<Carbon.Security size={14} />} label="Blockchain Ledger Summary" />
          <UI.ActionButton icon={<Carbon.Download size={14} />} label="Export" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Advanced" value="₱640M" sub="FY 2026 to date" />
        <UI.StatCard label="Total Liquidated" value="₱502M" sub="78.4% recovery rate" trend="up" />
        <UI.StatCard label="Outstanding Gap" value="₱138M" sub="₱12M increase this month" trend="down" />
        <UI.StatCard label="Portfolio NPV" value="₱1.2B" sub="Positive ROI maintained" trend="up" />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Advance vs Return dual line */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">Advance vs. Return Scale</h3>
          <p className="text-[11px] font-normal text-neutral-500 mb-3">Cumulative fund flow (₱ Millions)</p>
          <Charts.ResponsiveContainer width="100%" height={260}>
            <Charts.ComposedChart data={burnDownData}>
              <Charts.CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <Charts.XAxis key="x" dataKey="month" tick={{ fontSize: 11 }} />
              <Charts.YAxis key="y" tick={{ fontSize: 11 }} />
              <Charts.Tooltip key="tip" />
              <Charts.Legend key="legend" wrapperStyle={{ fontSize: 11 }} />
              <Charts.Line key="adv" type="monotone" dataKey="advanced" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} name="Funds Advanced" />
              <Charts.Line key="liq" type="monotone" dataKey="liquidated" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Funds Liquidated" />
            </Charts.ComposedChart>
          </Charts.ResponsiveContainer>
        </div>

        {/* ROI/NPV Summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">ROI / NPV Tracker</h3>
          <p className="text-[11px] font-normal text-neutral-500 mb-3">AI-calculated Net Present Value by project pillar</p>
          <Charts.ResponsiveContainer width="100%" height={260}>
            <Charts.BarChart data={[
              { pillar: "Infra", npv: 520, roi: 18 },
              { pillar: "Health", npv: 280, roi: 22 },
              { pillar: "Eco-Tour", npv: 180, roi: 31 },
              { pillar: "Education", npv: 140, roi: 15 },
              { pillar: "Governance", npv: 80, roi: 12 },
            ]}>
              <Charts.CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <Charts.XAxis key="x" dataKey="pillar" tick={{ fontSize: 11 }} />
              <Charts.YAxis key="y1" yAxisId="left" tick={{ fontSize: 11 }} />
              <Charts.YAxis key="y2" yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Charts.Tooltip key="tip" />
              <Charts.Legend key="legend" wrapperStyle={{ fontSize: 11 }} />
              <Charts.Bar key="npv" yAxisId="left" dataKey="npv" fill="#2563EB" radius={[4, 4, 0, 0]} name="NPV (₱M)" />
              <Charts.Bar key="roi" yAxisId="right" dataKey="roi" fill="#10B981" radius={[4, 4, 0, 0]} name="ROI %" />
            </Charts.BarChart>
          </Charts.ResponsiveContainer>
        </div>
      </div>

      {/* Departmental Efficiency Grid */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Departmental Liquidation Efficiency</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Rank</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Department</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Velocity Score</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Pending</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Avg. Days</th>
                <th className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {deptEfficiency.map((d, i) => (
                <tr key={d.dept} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-3 text-[12px] font-medium text-neutral-600">#{i + 1}</td>
                  <td className="py-3 px-3 text-[12px] font-medium text-neutral-900 flex items-center gap-2">
                    {d.dept}
                    {d.status === "Slow" && <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Lagging" />}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.velocity}%`, backgroundColor: d.velocity > 80 ? "#10B981" : d.velocity > 65 ? "#F59E0B" : "#EF4444" }} />
                      </div>
                      <span className="text-[11px] font-normal text-neutral-600">{d.velocity}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[12px] font-normal text-neutral-600">{d.pending}</td>
                  <td className="py-3 px-3 text-[12px] font-normal text-neutral-600">{d.daysAvg}d</td>
                  <td className="py-3 px-3"><UI.Pill status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== 3. CRITICAL BOTTLENECKS ====================
