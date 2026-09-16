import { Ban, Bell, Siren, Timer } from "lucide-react";
import { Btn, PageHeader, Stat, peso } from "./primitives";

type Delinquent = { id: string; employee: string; office: string; purpose: string; amount: number; issued: string; dayNo: number };

const DELINQUENTS: Delinquent[] = [
  { id: "p1", employee: "Mr. Danilo Escario", office: "GSO", purpose: "Travel · DILG Summit Manila", amount: 42_000, issued: "Mar 12, 2026", dayNo: 40 },
  { id: "p2", employee: "Ms. Aurelia Bontuyan", office: "Health Office", purpose: "Dengue Outreach · Brgy. 14", amount: 28_500, issued: "Mar 14, 2026", dayNo: 38 },
  { id: "p3", employee: "Engr. Rafael Tambago", office: "Engineering", purpose: "Site Inspection · Coastal Rd.", amount: 36_000, issued: "Mar 20, 2026", dayNo: 32 },
  { id: "p4", employee: "Ms. Cherry Lumapas", office: "Mayor's Office", purpose: "Seminar Registration · Cebu", amount: 18_000, issued: "Mar 25, 2026", dayNo: 27 },
  { id: "p5", employee: "Mr. Jonathan Pial", office: "Treasury", purpose: "Bank Errand Float", amount: 12_000, issued: "Mar 30, 2026", dayNo: 22 },
  { id: "p6", employee: "Ms. Rosario Villamor", office: "Accounting", purpose: "Training · COA Circular Update", amount: 22_000, issued: "Apr 05, 2026", dayNo: 16 },
];

export function ThirtyDayLiquidationAlerts() {
  const blocked = DELINQUENTS.filter(d => d.dayNo > 30);
  const totalOut = DELINQUENTS.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="p-8 min-h-full">
      <PageHeader
        title="30-Day Liquidation Alerts"
        subtitle="Cash advance delinquency matrix · COA Circular 97-002 enforcement"
        actions={<><Btn icon={<Bell size={13} />} label="Broadcast Reminder" /><Btn icon={<Ban size={13} />} label="Sync Block List to HR" variant="primary" /></>}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Holding Cash Advances" value={DELINQUENTS.length.toString()} trend="Active unliquidated" tone="neutral" />
        <Stat label="Day 31+ (Delinquent)" value={blocked.length.toString()} trend="Auto-blocked from new advances" tone="bad" />
        <Stat label="Total Outstanding" value={peso(totalOut)} trend="Across 6 employees" tone="warn" />
        <Stat label="Avg. Days Held" value="29.2" trend="Target: < 30" tone="warn" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1.3fr_1fr_1.5fr_1fr_1fr_0.9fr_auto] gap-3 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          <div>Employee</div><div>Office</div><div>Purpose</div><div>Amount</div><div>Issued</div><div>Countdown</div><div>Status</div>
        </div>
        {DELINQUENTS.map(d => {
          const isBlocked = d.dayNo > 30;
          const daysLeft = 30 - d.dayNo;
          const progress = Math.min(100, (d.dayNo / 30) * 100);
          return (
            <div key={d.id} className={`grid grid-cols-[1.3fr_1fr_1.5fr_1fr_1fr_0.9fr_auto] gap-3 px-5 py-3.5 border-b border-neutral-100 items-center ${isBlocked ? "bg-red-50/40" : ""}`}>
              <div>
                <div className="text-[12.5px] font-medium text-neutral-900">{d.employee}</div>
                <div className="text-[10.5px] font-normal text-neutral-500">CA Ref · {d.id.toUpperCase()}-2026</div>
              </div>
              <div className="text-[12px] font-normal text-neutral-700">{d.office}</div>
              <div className="text-[11.5px] font-normal text-neutral-600 truncate">{d.purpose}</div>
              <div className="text-[12px] font-medium text-neutral-900 tabular-nums">{peso(d.amount)}</div>
              <div className="text-[11.5px] font-normal text-neutral-600 tabular-nums">{d.issued}</div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer size={11} className={isBlocked ? "text-red-600" : daysLeft <= 5 ? "text-amber-600" : "text-neutral-500"} />
                  <span className={`text-[11px] font-medium tabular-nums ${isBlocked ? "text-red-700" : daysLeft <= 5 ? "text-amber-700" : "text-neutral-700"}`}>
                    {isBlocked ? `Day ${d.dayNo} · +${d.dayNo - 30} over` : `${daysLeft}d left`}
                  </span>
                </div>
                <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full ${isBlocked ? "bg-red-500" : daysLeft <= 5 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div>
                {isBlocked ? (
                  <span className="text-[10px] font-medium uppercase bg-red-600 text-white rounded px-2 py-1 flex items-center gap-1">
                    <Siren size={10} /> Delinquent
                  </span>
                ) : daysLeft <= 5 ? (
                  <span className="text-[10px] font-medium uppercase bg-amber-50 border border-amber-200 text-amber-700 rounded px-2 py-1">Due Soon</span>
                ) : (
                  <span className="text-[10px] font-medium uppercase bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-2 py-1">In Window</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Ban size={14} className="text-red-600 mt-0.5" />
          <div className="text-[11.5px] font-normal text-red-900 leading-relaxed">
            <span className="font-medium">Mathematical enforcement.</span> Employees past Day 30 are automatically tagged <span className="font-medium">Delinquent</span>. The HRMO module is signaled to block any new cash advance request, leave application, or travel order until the prior CA is fully liquidated — per COA Circular 97-002 §5.1.3.
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ROUTER ====================
