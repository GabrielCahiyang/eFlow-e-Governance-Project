import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./FinancialPrimitives";

export const cashAdvances = [
  { payee: "Juan Dela Cruz", initials: "JC", dept: "City Engineering", amount: 15000, spent: 12800, aging: 8, status: "Floating", leader: "Engr. R. Almeda" },
  { payee: "Maria Santos", initials: "MS", dept: "Health Office", amount: 25000, spent: 24200, aging: 12, status: "Liquidation Submitted", leader: "Dr. L. Reyes" },
  { payee: "Pedro Reyes", initials: "PR", dept: "Agriculture Office", amount: 8000, spent: 5500, aging: 22, status: "Floating", leader: "Dir. J. Navarro" },
  { payee: "Ana Torres", initials: "AT", dept: "CSWDO", amount: 12000, spent: 11800, aging: 5, status: "Verified & Sealed", leader: "Dir. M. Garcia" },
  { payee: "Ricardo Lim", initials: "RL", dept: "City Engineering", amount: 45000, spent: 32000, aging: 35, status: "Floating", leader: "Engr. R. Almeda" },
  { payee: "Elena Cruz", initials: "EC", dept: "ENRO", amount: 18000, spent: 17500, aging: 28, status: "Liquidation Submitted", leader: "Dir. C. Flores" },
  { payee: "Jose Mendoza", initials: "JM", dept: "Tourism Office", amount: 6000, spent: 3200, aging: 42, status: "Floating", leader: "Dir. B. Tan" },
  { payee: "Luz Navarro", initials: "LN", dept: "City Planning", amount: 10000, spent: 9800, aging: 3, status: "Verified & Sealed", leader: "Engr. D. Ong" },
  { payee: "Carlos Garcia", initials: "CG", dept: "Health Office", amount: 20000, spent: 15200, aging: 18, status: "Floating", leader: "Dr. L. Reyes" },
  { payee: "Rosa Fernandez", initials: "RF", dept: "Agriculture Office", amount: 30000, spent: 8000, aging: 55, status: "Floating", leader: "Dir. J. Navarro" },
];

export function UnliquidatedCashAdvances() {
  const totalFloating = cashAdvances.filter(c => c.status === "Floating").reduce((s, c) => s + (c.amount - c.spent), 0);
  const overdue = cashAdvances.filter(c => c.aging > 15 && c.aging <= 30);
  const critical = cashAdvances.filter(c => c.aging > 30);

  return (
    <div>
      <UI.PageHeader
        title="Unliquidated Cash Advances"
        subtitle="Financial Oversight · COA Compliance Hub"
        actions={<>
          <UI.Btn icon={<Carbon.Analytics size={14} />} label="Aging Analysis" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="COA Report" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Floating Cash" value={`₱${(totalFloating / 1000).toFixed(1)}K`} sub="Unrecovered from field" trend="down" />
        <UI.StatCard label="Active Advances" value={`${cashAdvances.length}`} sub="10 staff with open CA" />
        <UI.StatCard label="Overdue (15-30d)" value={`${overdue.length}`} sub="Demand letter stage" trend="down" />
        <UI.StatCard label="Critical (>30d)" value={`${critical.length}`} sub="Salary deduction trigger" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Outstanding Funds card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Carbon.ChartBar size={16} className="text-blue-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Outstanding Funds</h4>
              <p className="text-[10px] font-normal text-neutral-500">Daily tracking board</p>
            </div>
          </div>
          <Charts.ResponsiveContainer width="100%" height={80}>
            <Charts.BarChart data={[
              { group: "Current", count: cashAdvances.filter(c => c.aging <= 15).length },
              { group: "Overdue", count: overdue.length },
              { group: "Critical", count: critical.length },
            ]}>
              <Charts.Bar key="count" dataKey="count" radius={[3, 3, 0, 0]}>
                {[
                  <Charts.Cell key="c1" fill="#2563EB" />,
                  <Charts.Cell key="c2" fill="#F59E0B" />,
                  <Charts.Cell key="c3" fill="#EF4444" />,
                ]}
              </Charts.Bar>
              <Charts.XAxis key="x" dataKey="group" tick={{ fontSize: 9 }} />
              <Charts.Tooltip key="t" />
            </Charts.BarChart>
          </Charts.ResponsiveContainer>
        </div>

        {/* Leader Tracking card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Carbon.UserMultiple size={16} className="text-amber-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Leader Tracking</h4>
              <p className="text-[10px] font-normal text-neutral-500">Accountability leaderboard</p>
            </div>
          </div>
          <div className="space-y-2">
            {[...new Set(cashAdvances.map(c => c.leader))].slice(0, 3).map(leader => {
              const subs = cashAdvances.filter(c => c.leader === leader);
              const totalFloat = subs.reduce((s, c) => s + (c.amount - c.spent), 0);
              return (
                <div key={leader} className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-700">{leader}</span>
                  <span className="text-[11px] font-semibold text-red-600">₱{(totalFloat / 1000).toFixed(1)}K</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stalled Funds card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Carbon.Warning size={16} className="text-red-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Stalled Funds Alert</h4>
              <p className="text-[10px] font-normal text-neutral-500">BPA enforcement</p>
            </div>
          </div>
          <Charts.ResponsiveContainer width="100%" height={80}>
            <Charts.PieChart>
              <Charts.Pie key="pie" data={[
                { name: "Resolved via Viber", value: 78 },
                { name: "Demand Letter", value: 15 },
                { name: "Salary Deduction", value: 7 },
              ]} cx="50%" cy="50%" innerRadius={18} outerRadius={32} dataKey="value">
                <Charts.Cell key="p1" fill="#10B981" />
                <Charts.Cell key="p2" fill="#F59E0B" />
                <Charts.Cell key="p3" fill="#EF4444" />
              </Charts.Pie>
              <Charts.Tooltip key="t" />
            </Charts.PieChart>
          </Charts.ResponsiveContainer>
          <p className="text-[10px] font-normal text-neutral-500 text-center mt-1">78% resolve at Viber warning stage</p>
        </div>
      </div>

      {/* Aging distribution chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Aging Distribution — All Open Advances</h3>
        <Charts.ResponsiveContainer width="100%" height={200}>
          <Charts.ComposedChart data={cashAdvances.sort((a, b) => b.aging - a.aging).map(c => ({
            payee: c.payee.split(" ")[1],
            amount: c.amount / 1000,
            spent: c.spent / 1000,
            aging: c.aging,
          }))}>
            <Charts.CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="payee" tick={{ fontSize: 10 }} />
            <Charts.YAxis key="y1" yAxisId="left" tick={{ fontSize: 11 }} />
            <Charts.YAxis key="y2" yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Charts.Tooltip key="t" />
            <Charts.Legend key="l" wrapperStyle={{ fontSize: 11 }} />
            <Charts.Bar key="b1" yAxisId="left" dataKey="amount" fill="#DBEAFE" name="Advanced (₱K)" />
            <Charts.Bar key="b2" yAxisId="left" dataKey="spent" fill="#2563EB" name="Reported Spent (₱K)" />
            <Charts.Line key="line" yAxisId="right" dataKey="aging" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Aging (Days)" />
          </Charts.ComposedChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 4.2A OUTSTANDING FUNDS ====================

export function OutstandingFunds() {
  const [viewMode, setViewMode] = React.useState<"table" | "aging">("table");

  const groups = {
    "Current (< 15 Days)": cashAdvances.filter(c => c.aging <= 15),
    "Overdue (15–30 Days)": cashAdvances.filter(c => c.aging > 15 && c.aging <= 30),
    "Critical (> 30 Days)": cashAdvances.filter(c => c.aging > 30),
  };

  const groupColors: Record<string, string> = {
    "Current (< 15 Days)": "#2563EB",
    "Overdue (15–30 Days)": "#F59E0B",
    "Critical (> 30 Days)": "#EF4444",
  };

  return (
    <div>
      <UI.PageHeader
        title="Active Field Advances"
        subtitle="Unliquidated Cash Advances · Outstanding Funds"
        actions={<>
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            {(["table", "aging"] as const).map((v) => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all ${viewMode === v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >{v === "table" ? "Tracking Table" : "Aging Report"}</button>
            ))}
          </div>
          <UI.Btn icon={<Carbon.CheckmarkOutline size={14} />} label="Batch Verify Liquidations" variant="success" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Advances" value={`${cashAdvances.length}`} sub="Field staff" />
        <UI.StatCard label="Total Advanced" value={`₱${(cashAdvances.reduce((s, c) => s + c.amount, 0) / 1000).toFixed(0)}K`} sub="Across all open CA" />
        <UI.StatCard label="Reported Spent" value={`₱${(cashAdvances.reduce((s, c) => s + c.spent, 0) / 1000).toFixed(0)}K`} sub="Via mobile portal" />
        <UI.StatCard label="Expected Return" value={`₱${(cashAdvances.reduce((s, c) => s + (c.amount - c.spent), 0) / 1000).toFixed(1)}K`} sub="System calculated" trend="down" />
      </div>

      {/* High-Density Tracking Table grouped by aging */}
      <div className="space-y-4">
        {Object.entries(groups).map(([groupName, items]) => {
          if (items.length === 0) return null;
          const isCritical = groupName.includes("Critical");
          return (
            <div key={groupName} className={`bg-white rounded-xl border overflow-hidden ${isCritical ? "border-red-200" : "border-neutral-200"}`}>
              <div className="flex items-center gap-3 px-5 py-3 bg-neutral-50/50 border-b border-neutral-100">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: groupColors[groupName] }} />
                <span className="text-[13px] font-semibold text-neutral-900">{groupName}</span>
                <span className="text-[11px] font-normal text-neutral-500">{items.length} advances</span>
              </div>
              <div className="grid grid-cols-[40px_1fr_110px_100px_100px_100px_120px] gap-0 px-5 py-2 border-b border-neutral-100 bg-neutral-50/30">
                {["", "Payee", "Amount", "Spent", "Return", "Aging", "Status"].map(h => (
                  <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
                ))}
              </div>
              {items.map((c) => (
                <div
                  key={c.payee}
                  className={`grid grid-cols-[40px_1fr_110px_100px_100px_100px_120px] gap-0 px-5 py-3 border-b transition-colors items-center ${
                    isCritical ? "border-b-red-50 hover:bg-red-50/30" : "border-b-neutral-50 hover:bg-neutral-50/50"
                  } ${isCritical ? "ring-1 ring-inset ring-red-100" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-semibold text-white`} style={{ backgroundColor: groupColors[groupName] }}>
                    {c.initials}
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-neutral-900">{c.payee}</span>
                    <span className="text-[10px] font-normal text-neutral-400 ml-2">{c.dept}</span>
                  </div>
                  <span className="text-[12px] font-medium text-neutral-900">₱{c.amount.toLocaleString()}</span>
                  <span className="text-[12px] font-normal text-neutral-600">₱{c.spent.toLocaleString()}</span>
                  <span className={`text-[12px] font-semibold ${(c.amount - c.spent) > 5000 ? "text-red-600" : "text-neutral-900"}`}>
                    ₱{(c.amount - c.spent).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {isCritical && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    <span className={`text-[12px] font-semibold ${isCritical ? "text-red-600" : c.aging > 15 ? "text-amber-600" : "text-neutral-700"}`}>{c.aging}d</span>
                  </div>
                  <UI.Pill status={c.status} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 4.2B LEADER TRACKING ====================
