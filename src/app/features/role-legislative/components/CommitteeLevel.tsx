import { useState } from "react";
import { Analytics, Archive, CheckmarkOutline, DocumentAdd, Download, Filter, Group } from "@carbon/icons-react";
import { Btn, PageHeader, Pill, StatCard } from "./primitives";
import { measures } from "./data";

export function CommitteeLevel() {
  const items = measures.filter(m => m.stage === "Committee Level");
  const [filterMyCommittees, setFilterMyCommittees] = useState(false);

  return (
    <div>
      <PageHeader
        title="Committee Workspaces"
        subtitle="Active Measures Pipeline · Committee Level (Scrutiny & Hearings)"
        actions={<>
          <button
            onClick={() => setFilterMyCommittees(!filterMyCommittees)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${
              filterMyCommittees ? "bg-violet-100 text-violet-700 border border-violet-200" : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <Filter size={14} />{filterMyCommittees ? "My Committees" : "All Committees"}
          </button>
          <Btn icon={<Download size={14} />} label="Export" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Under Review" value={`${items.length}`} sub="Assigned to committees" />
        <StatCard label="Committees Active" value={`${[...new Set(items.map(m => m.committee))].length}`} sub="With pending measures" />
        <StatCard label="Avg. Review Time" value="18d" sub="Committee deliberation" />
        <StatCard label="Hearings Scheduled" value="2" sub="This week" trend="up" />
      </div>

      {/* Scrutiny Board — cards grouped by committee */}
      <div className="space-y-4">
        {[...new Set(items.map(m => m.committee))].map(committee => {
          const committeeMeasures = items.filter(m => m.committee === committee);
          return (
            <div key={committee} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-3 bg-violet-50/50 border-b border-violet-100 flex items-center gap-2">
                <Group size={14} className="text-violet-600" />
                <span className="text-[13px] font-semibold text-neutral-900">{committee}</span>
                <span className="text-[10px] font-medium bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">{committeeMeasures.length}</span>
              </div>
              <div className="p-4 space-y-3">
                {committeeMeasures.map(m => (
                  <div key={m.trackingNo} className="rounded-xl border border-neutral-200 p-5 hover:border-violet-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[10px] text-violet-600">{m.trackingNo}</span>
                          <Pill status={m.type} />
                        </div>
                        <h4 className="text-[13px] font-semibold text-neutral-900 leading-snug">{m.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[7px] font-semibold text-white">{m.authorInitials}</div>
                          <span className="text-[10px] font-normal text-neutral-500">{m.author} · Received {m.dateReceived}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Reality Check integration */}
                    {m.budget && m.budget > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mb-3">
                        <div className="flex items-start gap-2">
                          <Analytics size={14} className="text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[11px] font-semibold text-blue-800">AI "Reality Check" — NPV/IRR Validation</span>
                            <p className="text-[10px] font-normal text-blue-700 mt-0.5 leading-relaxed">
                              This ordinance requests ₱{m.budget}M in appropriations. The AI engine has validated this against the city's current fiscal capacity.
                              NPV: <strong>₱{(m.budget * 1.35).toFixed(1)}M</strong> · IRR: <strong>{(12.5 + Math.random() * 8).toFixed(1)}%</strong> · Payback: <strong>{Math.ceil(m.budget / 2.5)}yr</strong>.
                              Assessment: <span className="text-emerald-700 font-semibold">Fiscally feasible.</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Committee actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <Btn icon={<DocumentAdd size={14} />} label="Upload Committee Report" />
                      <Btn icon={<CheckmarkOutline size={14} />} label="Vote: Favorable" variant="success" />
                      <Btn icon={<Archive size={14} />} label="Archive" variant="danger" />
                      <span className="ml-auto text-[9px] font-normal text-neutral-400">Favorable vote → auto-push to Second Reading</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 6.1C SECOND READING ====================
