import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "../ExecutivePrimitives";
import { bottleneckCards, burnDownData, pillarData, projectBatteries } from './data';

export function CityProjectPulse() {
  return (
    <div>
      <UI.PageHeader
        title="City Project Pulse"
        actions={<>
          <UI.ActionButton icon={<Carbon.Filter size={14} />} label="FY 2026" />
          <UI.ActionButton icon={<Carbon.Renew size={14} />} label="Refresh" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Active Projects" value="47" sub="+3 this quarter" trend="up" />
        <UI.StatCard label="Portfolio Health" value="72%" sub="Weighted completion" trend="up" />
        <UI.StatCard label="Budget Utilization" value="78.4%" sub="₱502M of ₱640M" />
        <UI.StatCard label="Open Bottlenecks" value="6" sub="13.2d avg stall" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Quick Pillar Overview */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Project Pillars</h3>
          <Charts.ResponsiveContainer width="100%" height={200}>
            <Charts.PieChart>
              <Charts.Pie key="pie" data={pillarData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                {pillarData.map((entry, i) => <Charts.Cell key={`cell-${i}`} fill={entry.color} />)}
              </Charts.Pie>
              <Charts.Tooltip key="tip" />
            </Charts.PieChart>
          </Charts.ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pillarData.map((p) => (
              <div key={p.name} className="flex items-center gap-1 text-[10px] font-normal text-neutral-600">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /> {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* Budget Quick View */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Advance vs. Liquidation</h3>
          <Charts.ResponsiveContainer width="100%" height={200}>
            <Charts.LineChart data={burnDownData.slice(-6)}>
              <Charts.CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <Charts.XAxis key="x" dataKey="month" tick={{ fontSize: 10 }} />
              <Charts.YAxis key="y" tick={{ fontSize: 10 }} />
              <Charts.Tooltip key="tip" />
              <Charts.Line key="adv" type="monotone" dataKey="advanced" stroke="#2563EB" strokeWidth={2} dot={false} name="Advanced" />
              <Charts.Line key="liq" type="monotone" dataKey="liquidated" stroke="#10B981" strokeWidth={2} dot={false} name="Liquidated" />
            </Charts.LineChart>
          </Charts.ResponsiveContainer>
        </div>

        {/* SLA radar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Dept SLA Compliance</h3>
          <Charts.ResponsiveContainer width="100%" height={200}>
            <Charts.RadarChart data={[
              { dept: "Engineering", score: 94 },
              { dept: "Health", score: 88 },
              { dept: "BPLO", score: 76 },
              { dept: "Social Welfare", score: 71 },
              { dept: "Eco-Tourism", score: 62 },
              { dept: "Agriculture", score: 58 },
            ]}>
              <Charts.PolarGrid key="grid" />
              <Charts.PolarAngleAxis key="angle" dataKey="dept" tick={{ fontSize: 9 }} />
              <Charts.PolarRadiusAxis key="radius" angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Charts.Radar key="radar" name="SLA Score" dataKey="score" stroke="#2563EB" fill="#DBEAFE" fillOpacity={0.6} />
            </Charts.RadarChart>
          </Charts.ResponsiveContainer>
        </div>
      </div>

      {/* Top Battery Widgets */}
      <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Priority Projects</h3>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {projectBatteries.slice(0, 2).map((p) => <UI.BatteryWidget key={p.project} {...p} />)}
      </div>

      {/* Bottleneck Summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Active Bottlenecks</h3>
        <div className="grid grid-cols-3 gap-3">
          {bottleneckCards.slice(0, 3).map((c) => (
            <div key={c.project} className="border border-neutral-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-neutral-900">{c.project}</span>
                <UI.Pill status={c.severity} />
              </div>
              <p className="text-[11px] font-normal text-neutral-500">Stuck: {c.stuckAt} · {c.duration}d</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 5. PREDICTIVE INSIGHT CARDS ====================
