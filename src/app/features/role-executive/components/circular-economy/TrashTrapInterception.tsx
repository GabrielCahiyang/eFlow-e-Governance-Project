import * as Carbon from "@carbon/icons-react";
import * as UI from "../TransformPrimitives";
import { trashTraps, weatherForecast } from "./data";

export function TrashTrapInterception() {
  return (
    <div>
      <UI.PageHeader
        title="River System Interception"
        subtitle="Marine Litter & Circular Economy · IoT Monitoring"
        actions={<>
          <UI.Btn icon={<Carbon.Location size={14} />} label="GIS Map View" variant="primary" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export Data" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Traps" value={`${trashTraps.length}`} sub="Across 4 river systems" />
        <UI.StatCard label="Weekly Interception" value={`${trashTraps.reduce((s, t) => s + t.kgWeekly, 0).toLocaleString()} kg`} sub="+12% vs last week" trend="up" />
        <UI.StatCard label="Near Full" value={`${trashTraps.filter(t => t.status === "Near Full").length}`} sub="Requires immediate clearing" trend="down" />
        <UI.StatCard label="Avg. Capacity" value={`${Math.round(trashTraps.reduce((s, t) => s + t.capacity, 0) / trashTraps.length)}%`} sub="Across all traps" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Map Placeholder */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 col-span-2">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Trap Location Map — Ormoc River Systems</h3>
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg h-[280px] relative overflow-hidden border border-neutral-100">
            {/* Stylized map representation */}
            <svg className="w-full h-full" viewBox="0 0 500 280">
              {/* Rivers */}
              <path d="M50,50 Q150,80 200,150 T350,250" stroke="#93C5FD" strokeWidth="3" fill="none" opacity="0.6" />
              <path d="M120,20 Q200,100 250,180 T400,270" stroke="#93C5FD" strokeWidth="2.5" fill="none" opacity="0.5" />
              <path d="M300,30 Q280,120 260,200 T240,270" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.4" />
              <path d="M400,60 Q350,140 320,200" stroke="#93C5FD" strokeWidth="2" fill="none" opacity="0.4" />
              {/* Trap pins */}
              {trashTraps.map((trap, i) => {
                const x = 80 + (i * 65);
                const y = 60 + (i % 3) * 70;
                const color = trap.status === "Near Full" ? "#EF4444" : trap.status === "Warning" ? "#F59E0B" : "#10B981";
                return (
                  <g key={trap.id}>
                    <circle cx={x} cy={y} r="12" fill={color} opacity="0.2" />
                    <circle cx={x} cy={y} r="6" fill={color} stroke="white" strokeWidth="2" />
                    <text x={x} y={y + 22} textAnchor="middle" className="text-[8px]" fill="#6B7280">{trap.id}</text>
                  </g>
                );
              })}
            </svg>
            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                {[{ c: "#10B981", l: "Normal" }, { c: "#F59E0B", l: "Warning" }, { c: "#EF4444", l: "Near Full" }].map((x) => (
                  <div key={x.l} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: x.c }} />
                    <span className="text-[9px] font-normal text-neutral-600">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Weather Widget */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="text-[13px] font-semibold text-neutral-900 mb-1">AI Storm Predictor</h3>
          <p className="text-[10px] font-normal text-neutral-500 mb-3">Random Forest: rainfall → trap overflow prediction</p>
          <div className="space-y-2.5">
            {weatherForecast.map((w) => (
              <div key={w.day} className={`rounded-lg p-2.5 border ${w.rain > 30 ? "bg-red-50 border-red-200" : w.rain > 15 ? "bg-amber-50 border-amber-200" : "bg-neutral-50 border-neutral-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-neutral-900">{w.day}</span>
                  <span className={`text-[11px] font-medium ${w.rain > 30 ? "text-red-600" : w.rain > 15 ? "text-amber-600" : "text-neutral-500"}`}>{w.rain}mm</span>
                </div>
                <p className="text-[10px] font-normal text-neutral-600">At risk: {w.trapRisk}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <p className="text-[10px] font-medium text-amber-800">⚡ Auto-dispatch: Wednesday clearing crews pre-assigned to TT2, TT5, TT6 based on heavy rain forecast.</p>
          </div>
        </div>
      </div>

      {/* Volume Tracking Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Volume Tracking — Weekly Interception</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100">
              {["ID", "Trap Location", "River System", "Kg/Week", "Capacity", "Clearing Team", "Status"].map((h) => (
                <th key={h} className="py-2.5 px-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trashTraps.map((t) => (
              <tr key={t.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                <td className="py-3 px-3 text-[11px] font-medium text-neutral-500">{t.id}</td>
                <td className="py-3 px-3 text-[12px] font-medium text-neutral-900">{t.name}</td>
                <td className="py-3 px-3 text-[11px] font-normal text-neutral-600">{t.river}</td>
                <td className="py-3 px-3 text-[12px] font-semibold text-neutral-900">{t.kgWeekly}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${t.capacity}%`, backgroundColor: t.capacity > 85 ? "#EF4444" : t.capacity > 60 ? "#F59E0B" : "#10B981" }} />
                    </div>
                    <span className="text-[10px] font-normal text-neutral-600">{t.capacity}%</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[11px] font-normal text-neutral-600">{t.clearingTeam}</td>
                <td className="py-3 px-3"><UI.Pill status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
