import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./TransformPrimitives";

interface PermitCard {
  id: string;
  permit: string;
  agency: string;
  status: string;
  daysInStage: number;
  sla: number;
  assignee: string;
  escalated: boolean;
}

const permitData: Record<string, PermitCard[]> = {
  "Application Filed": [
    { id: "P1", permit: "Water Quality Test Certificate", agency: "EMB Region 8", status: "Application Filed", daysInStage: 3, sla: 15, assignee: "ENRO Staff", escalated: false },
  ],
  "Agency Review": [
    { id: "P2", permit: "DENR Environmental Compliance Certificate (ECC)", agency: "DENR Region 8", status: "Agency Review", daysInStage: 18, sla: 15, assignee: "DENR Liaison", escalated: true },
    { id: "P3", permit: "Tree Cutting Permit", agency: "CENRO Ormoc", status: "Agency Review", daysInStage: 9, sla: 15, assignee: "CENRO Staff", escalated: false },
  ],
  "Approved / Cleared": [
    { id: "P4", permit: "Barangay Clearance (Brgy. Can-adieng)", agency: "Barangay Council", status: "Approved / Cleared", daysInStage: 0, sla: 7, assignee: "—", escalated: false },
    { id: "P5", permit: "Zoning Clearance", agency: "City Planning Office", status: "Approved / Cleared", daysInStage: 0, sla: 10, assignee: "—", escalated: false },
    { id: "P6", permit: "Fire Safety Inspection Certificate", agency: "BFP Ormoc", status: "Approved / Cleared", daysInStage: 0, sla: 10, assignee: "—", escalated: false },
  ],
  "Conditional / Pending Revision": [
    { id: "P7", permit: "EIA Study Revision (Habitat Impact)", agency: "DENR Region 8", status: "Conditional / Pending Revision", daysInStage: 6, sla: 20, assignee: "Env. Consultant", escalated: false },
  ],
};

export const complianceCleared = 3;
export const complianceTotal = 7;
export const compliancePct = Math.round((complianceCleared / complianceTotal) * 100);

export function EnvironmentalProtection() {
  return (
    <div>
      <UI.PageHeader
        title="EIA & Ecological Compliance"
        subtitle="Sustainable Tourism & Eco-Park · Permits & Clearances"
        actions={<>
          <UI.Btn icon={<Carbon.Filter size={14} />} label="Overdue SLAs" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export Tracker" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Permits" value="7" sub="Required before construction" />
        <UI.StatCard label="Cleared" value={`${complianceCleared}`} sub={`${compliancePct}% compliance`} trend="up" />
        <UI.StatCard label="In Review" value="3" sub="2 agency, 1 revision" />
        <UI.StatCard label="SLA Breaches" value="1" sub="DENR ECC at 18 days" trend="down" />
      </div>

      {/* Compliance Battery */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-neutral-900">Compliance Battery</h3>
          <span className="text-[12px] font-semibold text-emerald-600">{compliancePct}% Legal Hurdles Cleared</span>
        </div>
        <div className="flex rounded-full overflow-hidden h-7 bg-neutral-100">
          <div className="bg-emerald-500 flex items-center justify-center transition-all" style={{ width: `${compliancePct}%` }}>
            <span className="text-[10px] font-medium text-white">{complianceCleared} Cleared</span>
          </div>
          <div className="bg-amber-300 flex items-center justify-center" style={{ width: `${Math.round((3 / complianceTotal) * 100)}%` }}>
            <span className="text-[10px] font-medium text-amber-900">3 In Progress</span>
          </div>
          <div className="bg-neutral-200 flex items-center justify-center" style={{ width: `${Math.round((1 / complianceTotal) * 100)}%` }}>
            <span className="text-[10px] font-medium text-neutral-600">1</span>
          </div>
        </div>
      </div>

      {/* BPA Escalation Alert */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Carbon.Warning size={14} className="text-red-600" />
          <span className="text-[12px] font-semibold text-red-800">BPA Auto-Escalation Triggered</span>
        </div>
        <p className="text-[11px] font-normal text-red-700 ml-5">
          DENR ECC has exceeded the 15-day SLA (now at 18 days). The BPA engine has automatically escalated this to the Mayor's Office for intervention.
        </p>
      </div>

      {/* Compliance Kanban */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(permitData).map(([stage, cards]) => (
          <div key={stage} className="bg-neutral-50 rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-semibold text-neutral-700">{stage}</h4>
              <span className="text-[10px] font-medium bg-neutral-200 text-neutral-600 rounded-full px-2 py-0.5">{cards.length}</span>
            </div>
            <div className="space-y-2.5">
              {cards.map((card) => (
                <div key={card.id} className={`bg-white rounded-lg border p-3.5 shadow-sm ${card.escalated ? "border-red-300 ring-1 ring-red-100" : "border-neutral-200"}`}>
                  <h5 className="text-[12px] font-semibold text-neutral-900 mb-1">{card.permit}</h5>
                  <p className="text-[10px] font-normal text-neutral-500 mb-2">{card.agency}</p>
                  {card.daysInStage > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Carbon.Time size={10} className={card.daysInStage > card.sla ? "text-red-500" : "text-neutral-400"} />
                      <span className={`text-[10px] font-medium ${card.daysInStage > card.sla ? "text-red-600" : "text-neutral-600"}`}>
                        {card.daysInStage}d / {card.sla}d SLA
                      </span>
                      {card.daysInStage > card.sla && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">BREACH</span>}
                    </div>
                  )}
                  {card.escalated && (
                    <div className="flex items-center gap-1.5 bg-red-50 rounded px-2 py-1 mt-1">
                      <Carbon.Warning size={10} className="text-red-500" />
                      <span className="text-[9px] font-medium text-red-700">Escalated to Mayor's Office</span>
                    </div>
                  )}
                  {card.status === "Approved / Cleared" && (
                    <div className="mt-1">
                      <UI.BlockchainSeal sealed={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 3.1C REVENUE PROJECTIONS ====================
const revenueStreams = [
  { stream: "Entrance Fees", projected: 2800, actual: 3120, variance: 11.4 },
  { stream: "Eco-Lodge Bookings", projected: 4200, actual: 3850, variance: -8.3 },
  { stream: "Concessionaires", projected: 1500, actual: 1680, variance: 12.0 },
  { stream: "Event Space Rental", projected: 800, actual: 920, variance: 15.0 },
  { stream: "Guided Tours", projected: 600, actual: 540, variance: -10.0 },
  { stream: "Parking Fees", projected: 350, actual: 380, variance: 8.6 },
];

export const npvHistory = [
  { month: "Jan", npv: 1180, budget: 420 },
  { month: "Feb", npv: 1165, budget: 425 },
  { month: "Mar", npv: 1140, budget: 432 },
  { month: "Apr", npv: 1120, budget: 440 },
  { month: "May", npv: 1105, budget: 445 },
  { month: "Jun", npv: 1095, budget: 448 },
  { month: "Jul", npv: 1085, budget: 450 },
  { month: "Aug", npv: 1070, budget: 452 },
  { month: "Sep", npv: 1060, budget: 453 },
  { month: "Oct", npv: 1055, budget: 454 },
];

export const currentNPV = 1055;
const targetNPV = 900;
const npvPct = Math.min(Math.round((currentNPV / 1200) * 100), 100);

export function RevenueProjections() {
  return (
    <div>
      <UI.PageHeader
        title="Fiscal Viability Tracker"
        subtitle="Sustainable Tourism & Eco-Park · Revenue & ROI"
        actions={<>
          <UI.Btn icon={<Carbon.DocumentExport size={14} />} label="ROI Report" variant="primary" />
          <UI.Btn icon={<Carbon.Renew size={14} />} label="Recalculate NPV" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Projected Monthly Rev." value="₱10.25M" sub="Across 6 streams" />
        <UI.StatCard label="Actual Monthly Rev." value="₱10.49M" sub="2.3% above target" trend="up" />
        <UI.StatCard label="IRR" value="14.2%" sub="Above 10% threshold" trend="up" />
        <UI.StatCard label="NPV" value={`₱${currentNPV}M`} sub="Positive, healthy" trend="up" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* NPV Health Gauge */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">NPV Health Gauge</h3>
          <p className="text-[11px] font-normal text-neutral-500 mb-4">Net Present Value vs. threshold</p>
          <div className="flex flex-col items-center">
            {/* Semi-circle gauge */}
            <div className="relative w-48 h-24 overflow-hidden mb-3">
              <div className="absolute inset-0 w-48 h-48 rounded-full border-[16px] border-neutral-100" />
              <div
                className="absolute inset-0 w-48 h-48 rounded-full border-[16px] border-transparent"
                style={{
                  borderTopColor: npvPct > 75 ? "#10B981" : npvPct > 50 ? "#F59E0B" : "#EF4444",
                  borderRightColor: npvPct > 50 ? (npvPct > 75 ? "#10B981" : "#F59E0B") : "transparent",
                  borderLeftColor: npvPct > 25 ? (npvPct > 75 ? "#10B981" : npvPct > 50 ? "#F59E0B" : "#EF4444") : "transparent",
                  transform: `rotate(${-90 + (npvPct * 1.8)}deg)`,
                  transition: "all 1s ease",
                }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className="text-[28px] font-semibold text-neutral-900">₱{currentNPV}M</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-normal">
              <span className="text-red-500">← Danger &lt;₱{targetNPV}M</span>
              <span className="text-emerald-500">Safe Zone →</span>
            </div>
          </div>
        </div>

        {/* NPV Trend */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 col-span-2">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">NPV vs. Cumulative Spend Trend</h3>
          <p className="text-[11px] font-normal text-neutral-500 mb-3">As budget is consumed, NPV adjusts in real-time</p>
          <Charts.ResponsiveContainer width="100%" height={220}>
            <Charts.ComposedChart data={npvHistory}>
              <Charts.CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
              <Charts.XAxis key="x" dataKey="month" tick={{ fontSize: 11 }} />
              <Charts.YAxis key="y1" yAxisId="left" tick={{ fontSize: 11 }} domain={[900, 1200]} />
              <Charts.YAxis key="y2" yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Charts.Tooltip key="t" />
              <Charts.Legend key="l" wrapperStyle={{ fontSize: 11 }} />
              <Charts.Line key="npv" yAxisId="left" type="monotone" dataKey="npv" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="NPV (₱M)" />
              <Charts.Bar key="budget" yAxisId="right" dataKey="budget" fill="#DBEAFE" name="Cum. Spend (₱M)" />
            </Charts.ComposedChart>
          </Charts.ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Monthly Revenue Streams (₱ Thousands)</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Revenue Stream", "Projected Monthly", "Actual Monthly", "Variance", "Status"].map((h) => (
                <th key={h} className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenueStreams.map((r) => (
              <tr key={r.stream} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                <td className="py-3 px-3 text-[12px] font-medium text-neutral-900">{r.stream}</td>
                <td className="py-3 px-3 text-[12px] font-normal text-neutral-600">₱{r.projected.toLocaleString()}K</td>
                <td className="py-3 px-3 text-[12px] font-medium text-neutral-900">₱{r.actual.toLocaleString()}K</td>
                <td className="py-3 px-3">
                  <span className={`text-[12px] font-medium ${r.variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {r.variance >= 0 ? "+" : ""}{r.variance}%
                  </span>
                </td>
                <td className="py-3 px-3">
                  <UI.Pill status={r.variance >= 0 ? "On Track" : "At Risk"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== 3.1 PARENT: SUSTAINABLE TOURISM ====================
