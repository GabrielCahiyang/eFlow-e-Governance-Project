import * as React from "react";
import * as Lucide from "lucide-react";
import * as Carbon from "@carbon/icons-react";
import * as UI from "./CommitteePrimitives";

interface CommitteeCard {
  id: string;
  name: string;
  chair: string;
  chairInitials: string;
  activeMeasures: number;
  avgDays: number;
  status: "Healthy" | "At Risk" | "Overdue";
  overdueMeasures: number;
  nextHearing?: string;
}

const committeeCards: CommitteeCard[] = [
  { id: "c1", name: "Committee on Appropriations & Finance", chair: "Hon. J. Cruz", chairInitials: "JC", activeMeasures: 6, avgDays: 12, status: "Healthy", overdueMeasures: 0, nextHearing: "Apr 22, 2026" },
  { id: "c2", name: "Committee on Tourism & Environment", chair: "Hon. L. Santos", chairInitials: "LS", activeMeasures: 4, avgDays: 18, status: "Healthy", overdueMeasures: 0, nextHearing: "Apr 23, 2026" },
  { id: "c3", name: "Committee on Public Order & Safety", chair: "Hon. P. Garcia", chairInitials: "PG", activeMeasures: 3, avgDays: 45, status: "Overdue", overdueMeasures: 2, nextHearing: undefined },
  { id: "c4", name: "Committee on Education, Culture & Sports", chair: "Hon. A. Reyes", chairInitials: "AR", activeMeasures: 2, avgDays: 22, status: "Healthy", overdueMeasures: 0, nextHearing: "Apr 25, 2026" },
  { id: "c5", name: "Committee on Health & Social Welfare", chair: "Hon. M. Delgado", chairInitials: "MD", activeMeasures: 5, avgDays: 30, status: "At Risk", overdueMeasures: 1 },
  { id: "c6", name: "Committee on Infrastructure & Public Works", chair: "Hon. B. Navarro", chairInitials: "BN", activeMeasures: 4, avgDays: 16, status: "Healthy", overdueMeasures: 0, nextHearing: "Apr 24, 2026" },
  { id: "c7", name: "Committee on Rules & Privileges", chair: "Hon. R. Almario", chairInitials: "RA", activeMeasures: 1, avgDays: 8, status: "Healthy", overdueMeasures: 0 },
  { id: "c8", name: "Committee on Ways & Means", chair: "Hon. E. Lim", chairInitials: "EL", activeMeasures: 3, avgDays: 28, status: "At Risk", overdueMeasures: 1, nextHearing: "Apr 28, 2026" },
];

const statusColors: Record<string, { border: string; bg: string; indicator: string }> = {
  Healthy: { border: "border-emerald-200", bg: "hover:bg-emerald-50/30", indicator: "bg-emerald-400" },
  "At Risk": { border: "border-amber-200", bg: "hover:bg-amber-50/30", indicator: "bg-amber-400" },
  Overdue: { border: "border-red-200", bg: "hover:bg-red-50/30", indicator: "bg-red-400" },
};

export function CommitteeChairmanships() {
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [nudgeSent, setNudgeSent] = React.useState<Set<string>>(new Set());

  const filtered = filterStatus === "all" ? committeeCards : committeeCards.filter(c => c.status === filterStatus);
  const overdue = committeeCards.filter(c => c.status === "Overdue").length;
  const atRisk = committeeCards.filter(c => c.status === "At Risk").length;

  return (
    <div>
      <UI.PageHeader
        title="Committee Roster & SLA Tracking"
        subtitle="Office of the Vice Mayor · Sangguniang Panlungsod"
        actions={
          <>
            <UI.Btn icon={<Carbon.Filter size={14} />} label="Overdue Measures" variant="danger" onClick={() => setFilterStatus(filterStatus === "Overdue" ? "all" : "Overdue")} />
            <UI.Btn icon={<Carbon.Report size={14} />} label="Export Report" />
          </>
        }
      />

      {/* Stats */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <UI.StatCard label="Total Committees" value={`${committeeCards.length}`} sub="Standing committees" />
        <UI.StatCard label="Active Measures" value={`${committeeCards.reduce((a, b) => a + b.activeMeasures, 0)}`} sub="Across all committees" />
        <UI.StatCard label="Overdue" value={`${overdue}`} sub={`${atRisk} at risk`} trend={overdue > 0 ? "down" : "up"} />
        <UI.StatCard label="Avg. Committee Time" value={`${Math.round(committeeCards.reduce((a, b) => a + b.avgDays, 0) / committeeCards.length)}d`} sub="Target: ≤30 days" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5">
        {["all", "Healthy", "At Risk", "Overdue"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
              filterStatus === s ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Committee Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => {
          const sc = statusColors[c.status];
          return (
            <div key={c.id} className={`bg-white rounded-xl border ${sc.border} p-5 ${sc.bg} transition-colors`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-semibold text-blue-700">{c.chairInitials}</span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-neutral-900">{c.name}</h4>
                    <p className="text-[11px] font-normal text-neutral-500 mt-0.5">Chair: {c.chair}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`size-2 rounded-full ${sc.indicator}`} />
                  <UI.Pill status={c.status} />
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
                  <p className="text-[16px] font-semibold text-neutral-900">{c.activeMeasures}</p>
                  <p className="text-[9px] font-normal text-neutral-500 mt-0.5">Active Measures</p>
                </div>
                <div className={`rounded-lg p-2.5 text-center ${c.avgDays > 30 ? "bg-red-50" : c.avgDays > 20 ? "bg-amber-50" : "bg-neutral-50"}`}>
                  <p className={`text-[16px] font-semibold ${c.avgDays > 30 ? "text-red-700" : c.avgDays > 20 ? "text-amber-700" : "text-neutral-900"}`}>{c.avgDays}d</p>
                  <p className="text-[9px] font-normal text-neutral-500 mt-0.5">Avg. Time</p>
                </div>
                <div className={`rounded-lg p-2.5 text-center ${c.overdueMeasures > 0 ? "bg-red-50" : "bg-neutral-50"}`}>
                  <p className={`text-[16px] font-semibold ${c.overdueMeasures > 0 ? "text-red-700" : "text-neutral-900"}`}>{c.overdueMeasures}</p>
                  <p className="text-[9px] font-normal text-neutral-500 mt-0.5">Overdue</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                {c.nextHearing ? (
                  <span className="text-[10px] font-normal text-neutral-500 flex items-center gap-1">
                    <Lucide.Clock size={10} /> Next Hearing: {c.nextHearing}
                  </span>
                ) : (
                  <span className="text-[10px] font-normal text-red-500 flex items-center gap-1">
                    <Lucide.AlertCircle size={10} /> No hearing scheduled
                  </span>
                )}
                {(c.status === "Overdue" || c.status === "At Risk") && (
                  <button
                    onClick={() => setNudgeSent(prev => new Set(prev).add(c.id))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer transition-colors ${
                      nudgeSent.has(c.id)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    {nudgeSent.has(c.id) ? (
                      <><Lucide.Check size={10} /> Update Requested</>
                    ) : (
                      <><Carbon.Send size={12} /> Request Update</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 8.2.B WORKING DOCUMENTS ====================
