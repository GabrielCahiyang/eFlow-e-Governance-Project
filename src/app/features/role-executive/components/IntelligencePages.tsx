import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "./ExecutivePrimitives";
import {
  getHeatColor,
  heatmapData,
  heatmapStages,
  insightCards,
} from "./PortfolioInsightPages";

const dailyDigests = [
  {
    date: "April 12, 2026",
    bullets: [
      "Roadworks in Brgy. Ipil are progressing fast but face minor cement shortages. Engineering Dept. has contacted suppliers for emergency delivery.",
      "The BPLO inspection team cleared 45 renewals yesterday; no major blockers reported. Backlog reduced to 12 pending.",
      "Health workers report a spike in requests for the new mobile clinic schedule. 3 barangays requesting extended hours.",
    ],
    mood: "Productive",
    sentiment: 72,
    voiceNotes: 148,
    departments: 18,
  },
  {
    date: "April 11, 2026",
    bullets: [
      "Eco-Tourism site managers flagged a drainage issue at Lake Danao trail section B. Maintenance crew dispatched, ETA 2 days.",
      "Finance Dept. processed 23 liquidation reports. 4 flagged for missing OR/AR documentation — automated follow-ups sent.",
      "Agriculture extension workers completed 8 barangay visits for crop damage assessment post-typhoon advisory.",
    ],
    mood: "Steady",
    sentiment: 65,
    voiceNotes: 132,
    departments: 16,
  },
];

export function ActionableIntelligence() {
  return (
    <div>
      <UI.PageHeader
        title="Daily Ground-Level Briefing"
        actions={<>
          <UI.ActionButton icon={<Carbon.DocumentExport size={14} />} label="Export as PDF Brief" variant="primary" />
          <UI.ActionButton icon={<Carbon.Renew size={14} />} label="Refresh NLP" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Voice Stand-Ups Processed" value="148" sub="Today's submissions" />
        <UI.StatCard label="Departments Reporting" value="18/22" sub="82% participation" trend="up" />
        <UI.StatCard label="Avg. Sentiment Score" value="72%" sub="Positive workforce mood" trend="up" />
        <UI.StatCard label="Action Items Extracted" value="7" sub="Auto-routed to leaders" />
      </div>

      {dailyDigests.map((digest) => (
        <div key={digest.date} className="bg-white rounded-xl border border-neutral-200 p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Carbon.DocumentExport size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-neutral-900">Morning Briefing — {digest.date}</h3>
                <p className="text-[11px] font-normal text-neutral-500">{digest.voiceNotes} voice notes · {digest.departments} departments · Mood: <span className={digest.sentiment > 68 ? "text-emerald-600" : "text-amber-600"}>{digest.mood}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${digest.sentiment}%` }} />
              </div>
              <span className="text-[10px] font-normal text-neutral-500">{digest.sentiment}%</span>
            </div>
          </div>
          <div className="space-y-3">
            {digest.bullets.map((bullet, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold text-blue-600">{i + 1}</span>
                </div>
                <p className="text-[12px] font-normal text-neutral-700 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sentiment Trend */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Weekly Sentiment Trend</h3>
        <Charts.ResponsiveContainer width="100%" height={200}>
          <Charts.AreaChart data={[
            { day: "Mon", sentiment: 68, notes: 120 },
            { day: "Tue", sentiment: 71, notes: 135 },
            { day: "Wed", sentiment: 65, notes: 142 },
            { day: "Thu", sentiment: 74, notes: 148 },
            { day: "Fri", sentiment: 72, notes: 115 },
          ]}>
            <Charts.CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="day" tick={{ fontSize: 11 }} />
            <Charts.YAxis key="y" tick={{ fontSize: 11 }} domain={[50, 100]} />
            <Charts.Tooltip key="tip" />
            <Charts.Area key="area" type="monotone" dataKey="sentiment" stroke="#2563EB" fill="#DBEAFE" name="Sentiment %" />
          </Charts.AreaChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 8. STRATEGIC AI INSIGHTS (PARENT) ====================
export function StrategicAIInsights() {
  return (
    <div>
      <UI.PageHeader
        title="Strategic AI Insights"
        actions={<>
          <UI.ActionButton icon={<Carbon.Analytics size={14} />} label="Model Dashboard" />
          <UI.ActionButton icon={<Carbon.Download size={14} />} label="Export All" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Active Predictions" value="6" sub="AI-generated this week" />
        <UI.StatCard label="Procurement Anomalies" value="3" sub="Through BAC pipeline" trend="down" />
        <UI.StatCard label="NLP Submissions" value="148" sub="Voice stand-ups today" trend="up" />
        <UI.StatCard label="Model Accuracy" value="87%" sub="Random Forest F1-score" trend="up" />
      </div>

      {/* Top insight cards */}
      <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Priority AI Alerts</h3>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {insightCards.filter(c => c.severity === "High").map((card, i) => (
          <div key={i} className={`bg-white rounded-xl border border-neutral-200 p-5 border-l-4 ${card.color}`}>
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{card.type}</span>
              <div className="flex-1" />
              <UI.Pill status={card.severity} />
            </div>
            <h4 className="text-[13px] font-semibold text-neutral-900 mb-1">{card.title}</h4>
            <p className="text-[12px] font-normal text-neutral-600 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>

      {/* Procurement Heatmap mini */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Procurement Heatmap (Anomalies)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-[11px] font-medium text-neutral-500">Project</th>
                {heatmapStages.map((s) => (
                  <th key={s} className="py-2 px-3 text-[11px] font-medium text-neutral-500 text-center">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.slice(0, 3).map((row) => (
                <tr key={row.project}>
                  <td className="py-2 px-3 text-[11px] font-medium text-neutral-900">{row.project}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-2 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${getHeatColor(v)}`}>{v.toFixed(1)}x</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NLP Digest Preview */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Today's NLP Digest Preview</h3>
        <div className="space-y-2.5">
          {dailyDigests[0].bullets.map((b, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                <span className="text-[9px] font-semibold text-blue-600">{i + 1}</span>
              </div>
              <p className="text-[12px] font-normal text-neutral-600 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
