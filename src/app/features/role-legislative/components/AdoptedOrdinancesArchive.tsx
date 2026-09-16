import { Archive, Download, Search } from "@carbon/icons-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Btn, HashDisplay, PageHeader, Pill, StatCard } from "./primitives";
import { adoptedOrdinances } from "./data";

export function AdoptedOrdinancesArchive() {
  const activeCount = adoptedOrdinances.filter(o => o.status === "Active").length;
  const byYear = [
    { year: "2024", count: 3 },
    { year: "2025", count: 5 },
    { year: "2026 YTD", count: 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Adopted Ordinances Archive"
        subtitle="Legislative Dashboard · The Digital Law Library"
        actions={<>
          <Btn icon={<Search size={14} />} label="AI Legal Research" variant="primary" />
          <Btn icon={<Download size={14} />} label="Export Registry" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Total Ordinances" value={`${adoptedOrdinances.length}`} sub="In digital archive" />
        <StatCard label="Active" value={`${activeCount}`} sub="Currently enforced" trend="up" />
        <StatCard label="Amended" value={`${adoptedOrdinances.filter(o => o.status === "Amended").length}`} sub="Modified post-enactment" />
        <StatCard label="Repealed" value={`${adoptedOrdinances.filter(o => o.status === "Repealed").length}`} sub="No longer in force" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Semantic Search card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Search size={16} className="text-blue-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">AI Semantic Search</h4>
              <p className="text-[10px] font-normal text-neutral-500">NLP-powered legal assistant</p>
            </div>
          </div>
          <p className="text-[11px] font-normal text-neutral-600 mb-3">Ask questions in natural language instead of searching by ordinance number. The NLP engine parses all adopted ordinances and highlights the exact paragraph.</p>
          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
            <p className="text-[10px] font-normal text-neutral-500 italic">"What is the fine for illegal dumping in the Eco-Park?"</p>
          </div>
        </div>

        {/* Full Index card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Archive size={16} className="text-emerald-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Immutable Registry</h4>
              <p className="text-[10px] font-normal text-neutral-500">Blockchain-sealed ordinances</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={byYear}>
              <Bar key="count" dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              <XAxis key="x" dataKey="year" tick={{ fontSize: 10 }} />
              <Tooltip key="t" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent ordinances preview */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-3 bg-neutral-50/50 border-b border-neutral-100 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-neutral-900">Recent Ordinances</span>
          <span className="text-[10px] font-normal text-neutral-500">Last 5 enacted</span>
        </div>
        {adoptedOrdinances.slice(0, 5).map(o => (
          <div key={o.number} className="flex items-center gap-4 px-5 py-3 border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
            <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] text-blue-600 w-28 shrink-0">{o.number}</span>
            <span className="text-[12px] font-medium text-neutral-900 flex-1">{o.title}</span>
            <span className="text-[10px] font-normal text-neutral-500 w-24">{o.dateEnacted}</span>
            <Pill status={o.status} />
            <HashDisplay hash={o.hash} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 6.2A SEMANTIC SEARCH ====================
