import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./AuditPrimitives";
import { disbursements, liquidations, returnedFunds } from "./auditData";

export function CryptographicLedger() {
  const totalDisbursed = disbursements.reduce((s, d) => s + d.amount, 0);
  const totalVerified = disbursements.filter(d => d.status === "Verified").length;
  const totalFlagged = disbursements.filter(d => d.status === "Flagged").length;

  const dailyVolume = [
    { date: "Apr 9", count: 3, amount: 1.2 },
    { date: "Apr 10", count: 5, amount: 4.8 },
    { date: "Apr 11", count: 2, amount: 0.9 },
    { date: "Apr 12", count: 4, amount: 2.1 },
    { date: "Apr 13", count: 3, amount: 1.7 },
    { date: "Apr 14", count: 6, amount: 3.5 },
    { date: "Apr 15", count: 4, amount: 2.9 },
    { date: "Apr 16", count: 3, amount: 2.4 },
  ];

  return (
    <div>
      <UI.PageHeader
        title="Cryptographic Ledger"
        subtitle="Immutable Audit Review · Zero-Trust Verification Dashboard"
        actions={<>
          <UI.Btn icon={<Carbon.Security size={14} />} label="Run Full Integrity Scan" variant="primary" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export Audit Trail" />
        </>}
      />
      <UI.ReadOnlyBanner />

      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Ledger Entries" value={`${disbursements.length + liquidations.length + returnedFunds.length}`} sub="Across all sub-ledgers" />
        <UI.StatCard label="Total Disbursed" value={`₱${(totalDisbursed / 1e6).toFixed(1)}M`} sub="Blockchain-sealed" />
        <UI.StatCard label="Integrity Score" value={`${Math.round((totalVerified / disbursements.length) * 100)}%`} sub={`${totalVerified}/${disbursements.length} verified`} trend="up" />
        <UI.StatCard label="Tamper Alerts" value={`${totalFlagged}`} sub="Requires investigation" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Disbursements summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Carbon.DocumentExport size={16} className="text-blue-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Financial Disbursements</h4>
              <p className="text-[10px] font-normal text-neutral-500">{disbursements.length} sealed records</p>
            </div>
          </div>
          <div className="text-center py-2">
            <span className="text-[28px] font-semibold text-neutral-900">₱{(totalDisbursed / 1e6).toFixed(1)}M</span>
            <p className="text-[10px] font-normal text-neutral-500 mt-1">All funds leaving treasury</p>
          </div>
          <div className="flex rounded-full overflow-hidden h-2.5 bg-neutral-100 mt-2">
            <div className="bg-emerald-400" style={{ width: `${(totalVerified / disbursements.length) * 100}%` }} />
            <div className="bg-red-400" style={{ width: `${(totalFlagged / disbursements.length) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] font-normal text-emerald-600">{totalVerified} verified</span>
            <span className="text-[9px] font-normal text-red-600">{totalFlagged} flagged</span>
          </div>
        </div>

        {/* Liquidations summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Carbon.CheckmarkOutline size={16} className="text-emerald-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Project Liquidations</h4>
              <p className="text-[10px] font-normal text-neutral-500">{liquidations.length} evidence records</p>
            </div>
          </div>
          <div className="text-center py-2">
            <span className="text-[28px] font-semibold text-neutral-900">{liquidations.filter(l => l.status === "Verified").length}/{liquidations.length}</span>
            <p className="text-[10px] font-normal text-neutral-500 mt-1">Receipts with valid file hash</p>
          </div>
          <Charts.ResponsiveContainer width="100%" height={50}>
            <Charts.BarChart data={liquidations.map(l => ({ name: l.payee.split(" ")[1], amt: l.liquidated / 1000 }))}>
              <Charts.Bar key="amt" dataKey="amt" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Charts.Tooltip key="t" />
            </Charts.BarChart>
          </Charts.ResponsiveContainer>
        </div>

        {/* Returned Funds summary */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Carbon.Renew size={16} className="text-violet-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Returned Funds</h4>
              <p className="text-[10px] font-normal text-neutral-500">{returnedFunds.length} closed loops</p>
            </div>
          </div>
          <div className="text-center py-2">
            <span className="text-[28px] font-semibold text-neutral-900">{returnedFunds.filter(r => r.cycleStatus === "Cycle Sealed").length}/{returnedFunds.length}</span>
            <p className="text-[10px] font-normal text-neutral-500 mt-1">Perfectly balanced cycles</p>
          </div>
          {returnedFunds.filter(r => r.cycleStatus === "Audit Mismatch").length > 0 && (
            <div className="bg-red-50 rounded-lg p-2 mt-2 flex items-center gap-1.5">
              <Carbon.Warning size={12} className="text-red-600" />
              <span className="text-[10px] font-medium text-red-700">{returnedFunds.filter(r => r.cycleStatus === "Audit Mismatch").length} mismatch detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily transaction volume */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Daily Ledger Volume — Last 8 Days</h3>
        <Charts.ResponsiveContainer width="100%" height={200}>
          <Charts.AreaChart data={dailyVolume}>
            <Charts.CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="date" tick={{ fontSize: 11 }} />
            <Charts.YAxis key="y" tick={{ fontSize: 11 }} />
            <Charts.Tooltip key="t" />
            <Charts.Legend key="l" wrapperStyle={{ fontSize: 11 }} />
            <Charts.Area key="a1" type="monotone" dataKey="amount" stroke="#2563EB" fill="#DBEAFE" name="Amount (₱M)" />
            <Charts.Area key="a2" type="monotone" dataKey="count" stroke="#8B5CF6" fill="#EDE9FE" name="Transactions" />
          </Charts.AreaChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 5.1A FINANCIAL DISBURSEMENTS ====================
