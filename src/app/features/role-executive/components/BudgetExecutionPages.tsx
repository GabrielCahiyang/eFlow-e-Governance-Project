import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./FinancialPrimitives";

const departmentBudgets = [
  { dept: "City Engineering", appropriated: 285, disbursed: 142.5, velocity: [30, 42, 55, 68, 80, 95, 110, 125, 142], sealed: true },
  { dept: "Health Office", appropriated: 180, disbursed: 98.2, velocity: [15, 28, 40, 52, 65, 72, 82, 90, 98], sealed: true },
  { dept: "Social Welfare (CSWDO)", appropriated: 120, disbursed: 85.1, velocity: [10, 22, 35, 48, 55, 62, 70, 78, 85], sealed: true },
  { dept: "Agriculture Office", appropriated: 95, disbursed: 38.4, velocity: [5, 8, 12, 18, 22, 28, 32, 35, 38], sealed: true },
  { dept: "ENRO", appropriated: 75, disbursed: 42.8, velocity: [8, 14, 20, 25, 28, 32, 36, 40, 43], sealed: true },
  { dept: "City Planning", appropriated: 65, disbursed: 31.2, velocity: [4, 8, 12, 16, 20, 24, 27, 29, 31], sealed: true },
  { dept: "City Treasurer", appropriated: 45, disbursed: 28.9, velocity: [3, 6, 10, 14, 18, 22, 24, 26, 29], sealed: true },
  { dept: "Tourism Office", appropriated: 40, disbursed: 18.5, velocity: [2, 4, 6, 8, 10, 12, 14, 16, 19], sealed: false },
];

export function MasterBudgetExecution() {
  const totalApprop = departmentBudgets.reduce((s, d) => s + d.appropriated, 0);
  const totalDisbursed = departmentBudgets.reduce((s, d) => s + d.disbursed, 0);

  return (
    <div>
      <UI.PageHeader
        title="Master Budget Execution"
        subtitle="Financial Oversight · FY 2026 Fiscal Year"
        actions={<>
          <UI.Btn icon={<Carbon.Analytics size={14} />} label="Execution Analytics" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Initiative Report" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Appropriated" value={`₱${totalApprop}M`} sub="SP Resolution #402" />
        <UI.StatCard label="Total Disbursed" value={`₱${totalDisbursed.toFixed(1)}M`} sub={`${Math.round((totalDisbursed / totalApprop) * 100)}% execution rate`} />
        <UI.StatCard label="Remaining Balance" value={`₱${(totalApprop - totalDisbursed).toFixed(1)}M`} sub="Unobligated" />
        <UI.StatCard label="At-Risk Depts" value="2" sub="Agriculture, Tourism underspent" trend="down" />
      </div>

      {/* Three summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Carbon.ChartBar size={16} className="text-blue-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Expenditure vs Approved</h4>
              <p className="text-[10px] font-normal text-neutral-500">Central fiscal ledger</p>
            </div>
          </div>
          <Charts.ResponsiveContainer width="100%" height={80}>
            <Charts.BarChart data={departmentBudgets.slice(0, 5).map(d => ({ name: d.dept.split(" ")[0], app: d.appropriated, dis: d.disbursed }))}>
              <Charts.Bar key="app" dataKey="app" fill="#DBEAFE" name="Approved" />
              <Charts.Bar key="dis" dataKey="dis" fill="#2563EB" name="Disbursed" />
              <Charts.XAxis key="x" dataKey="name" tick={{ fontSize: 9 }} />
              <Charts.Tooltip key="t" />
            </Charts.BarChart>
          </Charts.ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Carbon.Warning size={16} className="text-red-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Overspending Risk</h4>
              <p className="text-[10px] font-normal text-neutral-500">AI burn-rate analysis</p>
            </div>
          </div>
          <div className="text-center py-2">
            <span className="text-[28px] font-semibold text-red-600">₱28.5M</span>
            <p className="text-[10px] font-normal text-neutral-500 mt-1">At-risk capital across 3 projects</p>
          </div>
          <div className="flex rounded-full overflow-hidden h-3 bg-neutral-100">
            <div className="bg-red-400" style={{ width: "35%" }} />
            <div className="bg-amber-300" style={{ width: "25%" }} />
            <div className="bg-emerald-400" style={{ width: "40%" }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Carbon.Time size={16} className="text-amber-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Underutilization Alerts</h4>
              <p className="text-[10px] font-normal text-neutral-500">Idle funds tracker</p>
            </div>
          </div>
          <div className="text-center py-2">
            <span className="text-[28px] font-semibold text-amber-600">₱78.3M</span>
            <p className="text-[10px] font-normal text-neutral-500 mt-1">Idle funds with &lt;90 days left</p>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] font-medium text-red-600">2 departments at critical countdown</span>
          </div>
        </div>
      </div>

      {/* Execution velocity chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Execution Velocity — All Departments</h3>
        <Charts.ResponsiveContainer width="100%" height={240}>
          <Charts.ComposedChart data={departmentBudgets.map(d => ({
            dept: d.dept.length > 12 ? d.dept.slice(0, 12) + "…" : d.dept,
            appropriated: d.appropriated,
            disbursed: d.disbursed,
            remaining: d.appropriated - d.disbursed,
            pct: Math.round((d.disbursed / d.appropriated) * 100),
          }))}>
            <Charts.CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="dept" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
            <Charts.YAxis key="y" tick={{ fontSize: 11 }} />
            <Charts.Tooltip key="t" />
            <Charts.Legend key="l" wrapperStyle={{ fontSize: 11 }} />
            <Charts.Bar key="b1" dataKey="disbursed" fill="#2563EB" name="Disbursed (₱M)" stackId="a" />
            <Charts.Bar key="b2" dataKey="remaining" fill="#DBEAFE" name="Remaining (₱M)" stackId="a" />
          </Charts.ComposedChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 4.1A EXPENDITURE VS APPROVED ====================

export function ExpenditureVsApproved() {
  const [lockShake, setLockShake] = React.useState<string | null>(null);

  const handleLockClick = (dept: string) => {
    setLockShake(dept);
    setTimeout(() => setLockShake(null), 600);
  };

  return (
    <div>
      <UI.PageHeader
        title="Fiscal Year Execution"
        subtitle="Master Budget Execution · Expenditure vs Approved Ledger"
        actions={<>
          <UI.Btn icon={<Carbon.Filter size={14} />} label="Project Transform Only" />
          <UI.Btn icon={<Carbon.DocumentExport size={14} />} label="COA Ledger" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Appropriated" value="₱905M" sub="SP Resolution #402" />
        <UI.StatCard label="Total Disbursed" value="₱485.6M" sub="53.7% execution" />
        <UI.StatCard label="Remaining" value="₱419.4M" sub="Unobligated balance" />
        <UI.StatCard label="Blockchain Sealed" value="7/8" sub="87.5% verified" trend="up" />
      </div>

      {/* Immutable locking notice */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 mb-5 flex items-center gap-2">
        <Carbon.Locked size={14} className="text-violet-600" />
        <p className="text-[11px] font-normal text-violet-700">
          <strong>Immutable Locking Active:</strong> Appropriated Budget values are cryptographically sealed by SP Resolution #402. Manual edits require legislative override.
        </p>
      </div>

      {/* Monday-style Financial Board */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_140px_130px_180px_90px] gap-0 px-5 py-3 bg-neutral-50/50 border-b border-neutral-100">
          {["Department", "Appropriated", "Actual Disbursed", "Remaining", "Execution Velocity", "BC Seal"].map(h => (
            <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
          ))}
        </div>
        {/* Rows */}
        {departmentBudgets.map((d) => {
          const remaining = d.appropriated - d.disbursed;
          const pct = Math.round((d.disbursed / d.appropriated) * 100);
          const status = pct > 70 ? "On Track" : pct > 40 ? "At Risk" : "Critical";
          return (
            <div key={d.dept} className="grid grid-cols-[1fr_140px_140px_130px_180px_90px] gap-0 px-5 py-3.5 border-b border-neutral-50 hover:bg-blue-50/20 transition-colors items-center">
              <span className="text-[12px] font-medium text-neutral-900">{d.dept}</span>
              {/* Appropriated — locked cell */}
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-neutral-900">₱{d.appropriated}M</span>
                <button
                  onClick={() => handleLockClick(d.dept)}
                  title="Cryptographically sealed by SP Resolution #402. Edits require legislative override."
                  className={`cursor-pointer transition-transform ${lockShake === d.dept ? "animate-[shake_0.3s_ease-in-out_2]" : ""}`}
                  style={lockShake === d.dept ? { animation: "shake 0.3s ease-in-out 2" } : {}}
                >
                  <Carbon.Locked size={12} className={`transition-colors ${lockShake === d.dept ? "text-red-500" : "text-neutral-300"}`} />
                </button>
              </div>
              <span className="text-[12px] font-medium text-neutral-900">₱{d.disbursed}M</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-normal text-neutral-600">₱{remaining.toFixed(1)}M</span>
                <UI.Pill status={status} />
              </div>
              {/* Sparkline */}
              <div className="flex items-center gap-2">
                <Charts.LineChart width={100} height={24} data={d.velocity.map((v, i) => ({ m: i, v }))}>
                  <Charts.Line key="v" type="monotone" dataKey="v" stroke={pct > 60 ? "#10B981" : pct > 40 ? "#F59E0B" : "#EF4444"} strokeWidth={1.5} dot={false} />
                </Charts.LineChart>
                <span className="text-[10px] font-medium text-neutral-500">{pct}%</span>
              </div>
              <div className="text-center"><UI.BlockchainSeal sealed={d.sealed} /></div>
            </div>
          );
        })}
      </div>

      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}

// ==================== 4.1B OVERSPENDING RISK ====================
