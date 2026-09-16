import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as UI from "../TransformPrimitives";
import { campaignData } from "./data";

export function SHInEOrmocInitiative() {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(Object.keys(campaignData)));

  const toggleGroup = (g: string) => {
    const n = new Set(expanded);
    n.has(g) ? n.delete(g) : n.add(g);
    setExpanded(n);
  };

  const totalParticipation = Object.values(campaignData).flat().reduce((s, t) => s + t.participation, 0);

  return (
    <div>
      <UI.PageHeader
        title="SHInE Campaign Logistics"
        subtitle="Marine Litter & Circular Economy · #SHInEOrmoc"
        actions={<>
          <UI.Btn icon={<Carbon.Group size={14} />} label="Dispatch Field Team" variant="primary" />
          <UI.Btn icon={<Carbon.Filter size={14} />} label="By District" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Barangays" value={`${Object.keys(campaignData).length}`} sub="With scheduled activities" />
        <UI.StatCard label="Total Participation" value={totalParticipation.toLocaleString()} sub="Citizens engaged" trend="up" />
        <UI.StatCard label="Activities This Month" value={`${Object.values(campaignData).flat().length}`} sub="3 completed, 4 upcoming" />
        <UI.StatCard label="NLP Auto-Updates" value="4" sub="From Viber voice notes" trend="up" />
      </div>

      {/* NLP Integration Banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.03 2 10.94c0 2.7 1.36 5.12 3.5 6.73V22l3.88-2.13c.83.23 1.71.35 2.62.35 5.52 0 10-4.03 10-8.94S17.52 2 12 2z" fill="#7C3AED" /></svg>
          <span className="text-[12px] font-semibold text-violet-800">NLP Voice Note Integration Active</span>
        </div>
        <p className="text-[11px] font-normal text-violet-700 ml-5">
          Last update: <em>"We collected 50 bags in Punta today, 89 volunteers showed up"</em> → Auto-parsed → Participation Count: 89, Status: Completed
        </p>
      </div>

      {/* Dynamic Task Board grouped by Barangay */}
      <div className="space-y-3">
        {Object.entries(campaignData).map(([brgy, tasks]) => (
          <div key={brgy} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <button onClick={() => toggleGroup(brgy)} className="w-full flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-neutral-50/50 transition-colors">
              <Carbon.Location size={14} className="text-emerald-600" />
              <span className="text-[13px] font-semibold text-neutral-900 flex-1 text-left">{brgy}</span>
              <span className="text-[11px] font-normal text-neutral-500">{tasks.length} activities</span>
              <Carbon.ChevronDown size={14} className={`text-neutral-400 transition-transform ${expanded.has(brgy) ? "" : "-rotate-90"}`} />
            </button>

            {expanded.has(brgy) && (
              <>
                <div className="grid grid-cols-[1fr_100px_100px_80px_90px_80px] gap-0 px-5 py-2 border-t border-b border-neutral-100 bg-neutral-50/50">
                  {["Activity", "Date", "Participation", "Budget", "Status", "NLP"].map((h) => (
                    <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
                  ))}
                </div>
                {tasks.map((t, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_100px_80px_90px_80px] gap-0 px-5 py-3 border-b border-neutral-50 hover:bg-emerald-50/20 transition-colors items-center">
                    <span className="text-[12px] font-medium text-neutral-900">{t.activity}</span>
                    <span className="text-[11px] font-normal text-neutral-600">{t.date}</span>
                    <span className="text-[12px] font-medium text-neutral-900">{t.participation > 0 ? t.participation.toLocaleString() : "—"}</span>
                    <span className="text-[11px] font-normal text-neutral-600">{t.budget}</span>
                    <UI.Pill status={t.status} />
                    <div>
                      {t.nlpUpdated ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                          <Carbon.CheckmarkOutline size={10} /> Auto
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Manual</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 3.2B PLASTIC REGULATION COMPLIANCE ====================
