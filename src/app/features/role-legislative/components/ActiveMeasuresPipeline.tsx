import { Analytics, Download, Locked } from "@carbon/icons-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Btn, PageHeader, Pill, StatCard } from "./primitives";
import { measures, stageColors } from "./data";

export function ActiveMeasuresPipeline() {
  const stageData = ["First Reading", "Committee Level", "Second Reading", "Third Reading", "Mayoral Approval"].map(stage => ({
    stage: stage.split(" ")[0],
    count: measures.filter(m => m.stage === stage).length,
    full: stage,
  }));

  return (
    <div>
      <PageHeader
        title="Active Measures Pipeline"
        subtitle="Legislative Dashboard · Sangguniang Panlungsod Workspace"
        actions={<>
          <Btn icon={<Analytics size={14} />} label="Pipeline Analytics" />
          <Btn icon={<Download size={14} />} label="Session Report" variant="primary" />
        </>}
      />

      {/* BPA Enforcement notice */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-3">
        <Locked size={14} className="text-violet-600" />
        <p className="text-[11px] font-normal text-violet-700">
          <strong>BPA Sequence Enforcement Active:</strong> The Flowable engine mathematically prevents any measure from bypassing a reading stage. The Three Readings rule (R.A. 7160) is automatically enforced.
        </p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Active Measures" value={`${measures.length}`} sub="In pipeline" />
        <StatCard label="Ordinances" value={`${measures.filter(m => m.type === "Ordinance").length}`} sub="Pending enactment" />
        <StatCard label="Resolutions" value={`${measures.filter(m => m.type === "Resolution").length}`} sub="Non-binding" />
        <StatCard label="Avg. Cycle Time" value="42d" sub="First to Third Reading" trend="up" />
      </div>

      {/* Pipeline overview — mini kanban */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {["First Reading", "Committee Level", "Second Reading", "Third Reading", "Mayoral Approval"].map((stage) => {
          const items = measures.filter(m => m.stage === stage);
          return (
            <div key={stage} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-neutral-100 flex items-center justify-between" style={{ borderTop: `3px solid ${stageColors[stage]}` }}>
                <span className="text-[11px] font-semibold text-neutral-900">{stage}</span>
                <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-[220px] overflow-y-auto">
                {items.map(m => (
                  <div key={m.trackingNo} className="p-2.5 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors bg-neutral-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-['JetBrains_Mono',_'Fira_Code',_monospace] text-neutral-400">{m.trackingNo}</span>
                      <Pill status={m.type} />
                    </div>
                    <p className="text-[10px] font-medium text-neutral-800 leading-tight line-clamp-2">{m.title.length > 60 ? m.title.slice(0, 60) + "…" : m.title}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[7px] font-semibold text-white">{m.authorInitials}</div>
                      <span className="text-[9px] font-normal text-neutral-500">{m.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline volume chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Pipeline Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stageData} layout="vertical">
            <CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis key="x" type="number" tick={{ fontSize: 11 }} />
            <YAxis key="y" dataKey="stage" type="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip key="t" />
            <Bar key="b" dataKey="count" name="Measures" radius={[0, 4, 4, 0]}>
              {stageData.map((entry) => (
                <Cell key={entry.full} fill={stageColors[entry.full] || "#94A3B8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== 6.1A FIRST READING ====================
