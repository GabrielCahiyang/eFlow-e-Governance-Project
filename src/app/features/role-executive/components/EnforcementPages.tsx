import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./FinancialPrimitives";
import { cashAdvances } from "./OutstandingFundsPages";

export function LeaderTracking() {
  const [sortBy, setSortBy] = React.useState<"liability" | "rate">("liability");

  const leaders = [...new Set(cashAdvances.map(c => c.leader))].map(leader => {
    const subs = cashAdvances.filter(c => c.leader === leader);
    const totalFloat = subs.reduce((s, c) => s + (c.amount - c.spent), 0);
    const totalAdvanced = subs.reduce((s, c) => s + c.amount, 0);
    const sealed = subs.filter(c => c.status === "Verified & Sealed").length;
    const onTimeRate = subs.length > 0 ? Math.round((sealed / subs.length) * 100) : 0;
    const dept = subs[0]?.dept || "";
    return { leader, dept, staffCount: subs.length, totalFloat, totalAdvanced, onTimeRate, sealed };
  });

  const sorted = [...leaders].sort((a, b) =>
    sortBy === "liability" ? b.totalFloat - a.totalFloat : a.onTimeRate - b.onTimeRate
  );

  return (
    <div>
      <UI.PageHeader
        title="Accountability Leaderboard"
        subtitle="Unliquidated Cash Advances · Leader Tracking"
        actions={<>
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            {([{ v: "liability", l: "Highest Liability" }, { v: "rate", l: "Lowest Liquidation Rate" }] as const).map((h) => (
              <button key={h.v} onClick={() => setSortBy(h.v as any)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all ${sortBy === h.v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >{h.l}</button>
            ))}
          </div>
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export" />
        </>}
      />

      {/* The Debt Dashboard */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-4">Leader Liability Ranking</h3>
        <div className="space-y-4">
          {sorted.map((l, i) => {
            const isTop = i < 2 && l.totalFloat > 5000;
            return (
              <div key={l.leader} className={`rounded-xl border p-4 ${isTop ? "border-red-200 bg-red-50/30" : "border-neutral-200"}`}>
                <div className="flex items-center gap-4">
                  {/* Rank badge */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold ${
                    isTop ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-600"
                  }`}>
                    #{i + 1}
                  </div>
                  {/* Leader info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-semibold text-neutral-900">{l.leader}</span>
                      {isTop && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">HIGH LIABILITY</span>}
                    </div>
                    <span className="text-[11px] font-normal text-neutral-500">{l.dept} · {l.staffCount} subordinates with open CA</span>
                  </div>
                  {/* Metrics */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-neutral-500 uppercase">Floating Cash</p>
                      <p className={`text-[18px] font-semibold ${l.totalFloat > 10000 ? "text-red-600" : "text-neutral-900"}`}>₱{(l.totalFloat / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-neutral-500 uppercase">On-Time Rate</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${l.onTimeRate}%`, backgroundColor: l.onTimeRate > 60 ? "#10B981" : l.onTimeRate > 30 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-[12px] font-semibold text-neutral-700">{l.onTimeRate}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-neutral-500 uppercase">Sealed</p>
                      <p className="text-[18px] font-semibold text-neutral-900">{l.sealed}/{l.staffCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Floating Cash vs On-Time Liquidation Rate by Leader</h3>
        <Charts.ResponsiveContainer width="100%" height={220}>
          <Charts.ComposedChart data={sorted.map(l => ({
            leader: l.leader.split(". ")[1] || l.leader.split(" ").pop(),
            floating: l.totalFloat / 1000,
            rate: l.onTimeRate,
          }))}>
            <Charts.CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="leader" tick={{ fontSize: 10 }} />
            <Charts.YAxis key="y1" yAxisId="left" tick={{ fontSize: 11 }} />
            <Charts.YAxis key="y2" yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Charts.Tooltip key="t" />
            <Charts.Legend key="l" wrapperStyle={{ fontSize: 11 }} />
            <Charts.Bar key="b" yAxisId="left" dataKey="floating" fill="#FCA5A5" name="Floating Cash (₱K)" />
            <Charts.Line key="line" yAxisId="right" dataKey="rate" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="On-Time Rate (%)" />
          </Charts.ComposedChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 4.2C STALLED FUNDS ALERT ====================

const enforcementLog = [
  { id: "E1", payee: "Ricardo Lim", action: "Viber Warning Dispatched", day: 15, date: "Mar 12, 2026", status: "Pending", resolved: false },
  { id: "E2", payee: "Ricardo Lim", action: "Demand Letter Auto-Generated → Dept Head", day: 30, date: "Mar 27, 2026", status: "Pending", resolved: false },
  { id: "E3", payee: "Ricardo Lim", action: "Notice of Salary Deduction → HRMO", day: 42, date: "Apr 8, 2026", status: "Auto-Escalated", resolved: false },
  { id: "E4", payee: "Jose Mendoza", action: "Viber Warning Dispatched", day: 15, date: "Mar 5, 2026", status: "Pending", resolved: false },
  { id: "E5", payee: "Jose Mendoza", action: "Demand Letter Auto-Generated → Dept Head", day: 30, date: "Mar 20, 2026", status: "Pending", resolved: false },
  { id: "E6", payee: "Jose Mendoza", action: "Notice of Salary Deduction → HRMO", day: 45, date: "Apr 4, 2026", status: "Auto-Escalated", resolved: false },
  { id: "E7", payee: "Rosa Fernandez", action: "Viber Warning Dispatched", day: 15, date: "Feb 21, 2026", status: "Resolved", resolved: true },
  { id: "E8", payee: "Rosa Fernandez", action: "Demand Letter Auto-Generated → Dept Head", day: 30, date: "Mar 8, 2026", status: "Pending", resolved: false },
  { id: "E9", payee: "Rosa Fernandez", action: "Notice of Salary Deduction → HRMO", day: 55, date: "Apr 12, 2026", status: "Auto-Escalated", resolved: false },
  { id: "E10", payee: "Pedro Reyes", action: "Viber Warning Dispatched", day: 15, date: "Apr 1, 2026", status: "Resolved", resolved: true },
  { id: "E11", payee: "Elena Cruz", action: "Viber Warning Dispatched", day: 15, date: "Mar 25, 2026", status: "Resolved", resolved: true },
  { id: "E12", payee: "Carlos Garcia", action: "Viber Warning Dispatched", day: 15, date: "Apr 3, 2026", status: "Pending", resolved: false },
];

const resolutionData = [
  { name: "Resolved at Viber (Day 15)", value: 78 },
  { name: "Resolved at Demand Letter (Day 30)", value: 15 },
  { name: "Escalated to Salary Deduction (Day 60)", value: 7 },
];

export function StalledFundsAlert() {
  const [autoLetters, setAutoLetters] = React.useState(true);

  return (
    <div>
      <UI.PageHeader
        title="Escalations & Sanctions"
        subtitle="Unliquidated Cash Advances · BPA Enforcement"
        actions={<>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <span className="text-[11px] font-medium text-neutral-600">Auto-Demand Letters</span>
            <button
              onClick={() => setAutoLetters(!autoLetters)}
              className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${autoLetters ? "bg-emerald-500" : "bg-neutral-300"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${autoLetters ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export Log" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Escalations" value={`${enforcementLog.length}`} sub="Automated actions taken" />
        <UI.StatCard label="Viber Warnings" value={`${enforcementLog.filter(e => e.action.includes("Viber")).length}`} sub="78% resolve at this stage" trend="up" />
        <UI.StatCard label="Demand Letters" value={`${enforcementLog.filter(e => e.action.includes("Demand")).length}`} sub="Auto-generated" />
        <UI.StatCard label="Salary Deduction" value={`${enforcementLog.filter(e => e.action.includes("Salary")).length}`} sub="HRMO-triggered" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Resolution Rate Pie */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">Resolution Effectiveness</h3>
          <p className="text-[10px] font-normal text-neutral-500 mb-3">% of staff that liquidate at each stage</p>
          <Charts.ResponsiveContainer width="100%" height={160}>
            <Charts.PieChart>
              <Charts.Pie key="pie" data={resolutionData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ value }) => `${value}%`}>
                <Charts.Cell key="c1" fill="#10B981" />
                <Charts.Cell key="c2" fill="#F59E0B" />
                <Charts.Cell key="c3" fill="#EF4444" />
              </Charts.Pie>
              <Charts.Tooltip key="t" />
              <Charts.Legend key="l" wrapperStyle={{ fontSize: 10 }} />
            </Charts.PieChart>
          </Charts.ResponsiveContainer>
        </div>

        {/* BPA Tiered Actions Summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 col-span-2">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">BPA Tiered Automated Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { day: "Day 15", action: "Viber Warning", desc: "Automated reminder via Viber to staff with open CA approaching 15 days.", color: "border-l-blue-400 bg-blue-50/30", icon: <Carbon.Send size={14} className="text-blue-600" />, rate: "78% resolve" },
              { day: "Day 30", action: "Demand Letter", desc: "Auto-generated formal demand letter emailed to the Department Head for accountability.", color: "border-l-amber-400 bg-amber-50/30", icon: <Carbon.DocumentExport size={14} className="text-amber-600" />, rate: "15% resolve" },
              { day: "Day 60", action: "Salary Deduction", desc: "COA-compliant notice of salary deduction triggered to HRMO for payroll offset.", color: "border-l-red-400 bg-red-50/30", icon: <Carbon.Warning size={14} className="text-red-600" />, rate: "Last resort" },
            ].map(t => (
              <div key={t.day} className={`rounded-lg border-l-4 ${t.color} p-4 border border-neutral-200`}>
                <div className="flex items-center gap-2 mb-2">
                  {t.icon}
                  <div>
                    <p className="text-[12px] font-semibold text-neutral-900">{t.day}: {t.action}</p>
                    <p className="text-[10px] font-medium text-emerald-600">{t.rate}</p>
                  </div>
                </div>
                <p className="text-[10px] font-normal text-neutral-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enforcement Feed */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Enforcement Activity Log</h3>
        <div className="space-y-2">
          {enforcementLog.map((e) => {
            const isDemand = e.action.includes("Demand");
            const isSalary = e.action.includes("Salary");
            const borderColor = isSalary ? "border-l-red-400" : isDemand ? "border-l-amber-400" : "border-l-blue-400";
            return (
              <div key={e.id} className={`flex items-center gap-3 p-3 rounded-lg border border-l-4 ${borderColor} ${e.resolved ? "bg-emerald-50/30 border-neutral-100" : "bg-white border-neutral-200"} transition-colors`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSalary ? "bg-red-100" : isDemand ? "bg-amber-100" : "bg-blue-100"}`}>
                  {isSalary ? <Carbon.Warning size={14} className="text-red-600" /> : isDemand ? <Carbon.DocumentExport size={14} className="text-amber-600" /> : <Carbon.Send size={14} className="text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-neutral-900">{e.payee}</span>
                    <span className="text-[10px] font-medium text-neutral-400">Day {e.day}</span>
                  </div>
                  <p className="text-[11px] font-normal text-neutral-600">{e.action}</p>
                </div>
                <span className="text-[10px] font-normal text-neutral-400">{e.date}</span>
                <UI.Pill status={e.resolved ? "Resolved" : e.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
