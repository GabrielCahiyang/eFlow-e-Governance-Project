import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "../ExecutivePrimitives";
import { pillarData, projectBatteries } from './data';

export function PortfolioCompletionRates() {
  const [selectedPillar, setSelectedPillar] = React.useState<string | null>(null);
  const filtered = selectedPillar ? projectBatteries.filter((_, i) => i % 2 === (selectedPillar === "Infrastructure" ? 0 : 1)) : projectBatteries;

  return (
    <div>
      <UI.PageHeader
        title="City-Wide Project Completion"
        actions={<>
          <UI.ActionButton icon={<Carbon.Filter size={14} />} label="FY 2026" />
          <UI.ActionButton icon={<Carbon.DocumentExport size={14} />} label="DILG Transparency Report" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Projects" value="47" sub="+3 this quarter" trend="up" />
        <UI.StatCard label="Avg. Completion" value="54%" sub="2.3% above target" trend="up" />
        <UI.StatCard label="Active Workforce" value="1,248" sub="Across 20+ departments" />
        <UI.StatCard label="At-Risk Projects" value="6" sub="2 more than last month" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Pillar Sunburst */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 col-span-1">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Pillar Breakdown</h3>
          <p className="text-[11px] font-normal text-neutral-500 mb-3">Click a slice to filter projects</p>
          <Charts.ResponsiveContainer width="100%" height={220}>
            <Charts.PieChart>
              <Charts.Pie
                key="pillar-pie"
                data={pillarData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                onClick={(d) => setSelectedPillar(selectedPillar === d.name ? null : d.name)}
                style={{ cursor: "pointer" }}
              >
                {pillarData.map((entry, i) => (
                  <Charts.Cell key={`cell-${i}`} fill={entry.color} opacity={selectedPillar && selectedPillar !== entry.name ? 0.3 : 1} />
                ))}
              </Charts.Pie>
              <Charts.Tooltip key="pillar-tooltip" />
            </Charts.PieChart>
          </Charts.ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pillarData.map((p) => (
              <button key={p.name} onClick={() => setSelectedPillar(selectedPillar === p.name ? null : p.name)} className={`flex items-center gap-1.5 text-[10px] font-normal px-2 py-1 rounded-full cursor-pointer transition-all ${selectedPillar === p.name ? "ring-2 ring-offset-1" : ""}`} style={{ borderColor: p.color }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Completion Trend */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 col-span-2">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Monthly Completion Trend</h3>
          <Charts.ResponsiveContainer width="100%" height={260}>
            <Charts.AreaChart data={[
              { month: "Jan", completion: 32, target: 35 },
              { month: "Feb", completion: 36, target: 38 },
              { month: "Mar", completion: 41, target: 42 },
              { month: "Apr", completion: 45, target: 46 },
              { month: "May", completion: 48, target: 50 },
              { month: "Jun", completion: 50, target: 54 },
              { month: "Jul", completion: 54, target: 58 },
              { month: "Aug", completion: 57, target: 62 },
              { month: "Sep", completion: 61, target: 66 },
              { month: "Oct", completion: 64, target: 70 },
            ]}>
              <Charts.CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
              <Charts.XAxis key="x" dataKey="month" tick={{ fontSize: 11 }} />
              <Charts.YAxis key="y" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Charts.Tooltip key="tip" />
              <Charts.Area key="target" type="monotone" dataKey="target" stroke="#E5E7EB" fill="#F9FAFB" strokeDasharray="4 4" name="Target" />
              <Charts.Area key="completion" type="monotone" dataKey="completion" stroke="#2563EB" fill="#DBEAFE" name="Actual" />
            </Charts.AreaChart>
          </Charts.ResponsiveContainer>
        </div>
      </div>

      {/* Battery Boards */}
      <div>
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">
          Project Battery Boards {selectedPillar && <span className="text-blue-600">· {selectedPillar}</span>}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((p) => <UI.BatteryWidget key={p.project} {...p} />)}
        </div>
      </div>
    </div>
  );
}

// ==================== 2. BUDGET BURN-DOWN ====================
