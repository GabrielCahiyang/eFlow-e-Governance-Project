import React, { useState } from "react";
import { Building2, ChevronRight, FileText, Hammer, HandHeart, Lock, Scale, TrendingUp } from "lucide-react";
import { Btn, PageHeader, Stat, peso, pesoShort } from "./primitives";

type Bucket = {
  id: string;
  name: string;
  ordinance: string;
  appropriated: number;
  obligated: number;
  released: number;
  category: "infrastructure" | "social" | "economic" | "governance";
};

const BUCKETS: Bucket[] = [
  { id: "b1", name: "Eco-Park Infrastructure", ordinance: "SP Ord. 2026-014", appropriated: 50_000_000, obligated: 32_400_000, released: 18_200_000, category: "infrastructure" },
  { id: "b2", name: "Coastal Road Rehabilitation", ordinance: "SP Ord. 2026-018", appropriated: 180_000_000, obligated: 92_000_000, released: 64_000_000, category: "infrastructure" },
  { id: "b3", name: "Health Services Modernization", ordinance: "SP Ord. 2026-009", appropriated: 85_000_000, obligated: 71_200_000, released: 58_400_000, category: "social" },
  { id: "b4", name: "Senior Citizens Welfare Fund", ordinance: "SP Ord. 2026-007", appropriated: 24_000_000, obligated: 11_800_000, released: 9_600_000, category: "social" },
  { id: "b5", name: "SME Livelihood Grants", ordinance: "SP Ord. 2026-021", appropriated: 45_000_000, obligated: 28_500_000, released: 22_100_000, category: "economic" },
  { id: "b6", name: "Tourism Campaign 2026", ordinance: "SP Ord. 2026-011", appropriated: 18_000_000, obligated: 9_400_000, released: 6_100_000, category: "economic" },
  { id: "b7", name: "City Hall ICT Upgrade", ordinance: "SP Ord. 2026-025", appropriated: 32_000_000, obligated: 14_200_000, released: 8_000_000, category: "governance" },
  { id: "b8", name: "Disaster Preparedness", ordinance: "SP Ord. 2026-003", appropriated: 68_000_000, obligated: 41_600_000, released: 28_400_000, category: "governance" },
];

const categoryStyle: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  infrastructure: { bg: "bg-orange-50", border: "border-orange-200", icon: <Hammer size={12} />, label: "Infrastructure" },
  social: { bg: "bg-rose-50", border: "border-rose-200", icon: <HandHeart size={12} />, label: "Social Services" },
  economic: { bg: "bg-emerald-50", border: "border-emerald-200", icon: <TrendingUp size={12} />, label: "Economic Devt." },
  governance: { bg: "bg-blue-50", border: "border-blue-200", icon: <Building2 size={12} />, label: "Governance" },
};

export function ProgrammaticBuckets() {
  const [selected, setSelected] = useState<Bucket>(BUCKETS[0]);
  const totalAppr = BUCKETS.reduce((s, b) => s + b.appropriated, 0);
  const totalOblg = BUCKETS.reduce((s, b) => s + b.obligated, 0);
  const totalRel = BUCKETS.reduce((s, b) => s + b.released, 0);

  const categories = Array.from(new Set(BUCKETS.map((b) => b.category)));

  return (
    <div>
      <PageHeader
        title="Master Appropriations Ledger"
        subtitle="Approved by Sangguniang Panlungsod · cryptographically deposited · mathematically locked"
        actions={
          <>
            <Btn icon={<Scale size={14} />} label="View SP Ordinance Link" variant="primary" />
            <Btn icon={<FileText size={14} />} label="Export FY 2026 Annual Budget" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Total Appropriated" value={pesoShort(totalAppr)} trend={`${BUCKETS.length} programmatic buckets`} />
        <Stat label="Obligated" value={pesoShort(totalOblg)} trend={`${((totalOblg / totalAppr) * 100).toFixed(0)}% committed`} tone="warn" />
        <Stat label="Released" value={pesoShort(totalRel)} trend={`${((totalRel / totalAppr) * 100).toFixed(0)}% disbursed`} tone="good" />
        <Stat label="Unobligated" value={pesoShort(totalAppr - totalOblg)} trend="available for new ORS" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-3 mb-5">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Lock size={13} className="text-neutral-700" />
          <span className="text-[12px] font-medium text-neutral-700">Immutable Ordinance Linkage</span>
          <span className="ml-auto text-[11px] font-normal text-neutral-400">
            Finance cannot edit appropriation totals · requires new SP ordinance
          </span>
        </div>

        {/* Tree-grid */}
        <div className="space-y-3">
          {categories.map((cat) => {
            const catBuckets = BUCKETS.filter((b) => b.category === cat);
            const catTotal = catBuckets.reduce((s, b) => s + b.appropriated, 0);
            const cs = categoryStyle[cat];
            return (
              <div key={cat} className={`rounded-lg border ${cs.border} ${cs.bg} overflow-hidden`}>
                <div className="px-4 py-2 flex items-center gap-2 border-b border-white/60">
                  <span className="text-neutral-700">{cs.icon}</span>
                  <span className="text-[12px] font-medium text-neutral-800">{cs.label}</span>
                  <span className="ml-auto text-[11px] font-medium text-neutral-700 tabular-nums">
                    {pesoShort(catTotal)}
                  </span>
                </div>
                <div className="bg-white divide-y divide-neutral-100">
                  {catBuckets.map((b) => {
                    const oblgPct = (b.obligated / b.appropriated) * 100;
                    const relPct = (b.released / b.appropriated) * 100;
                    const active = selected.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelected(b)}
                        className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-neutral-50 cursor-pointer transition-colors text-left ${
                          active ? "bg-blue-50 hover:bg-blue-50" : ""
                        }`}
                      >
                        <Lock size={11} className="text-neutral-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-neutral-900 truncate">{b.name}</span>
                            <span className="text-[10px] font-normal text-neutral-400 flex-shrink-0">{b.ordinance}</span>
                          </div>
                          <div className="mt-1.5 relative h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-amber-400" style={{ width: `${oblgPct}%` }} />
                            <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${relPct}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-4 text-right text-[11px] font-normal tabular-nums flex-shrink-0">
                          <div>
                            <div className="text-neutral-400 text-[10px]">Appr.</div>
                            <div className="text-neutral-900 font-medium">{pesoShort(b.appropriated)}</div>
                          </div>
                          <div>
                            <div className="text-amber-600 text-[10px]">Oblg.</div>
                            <div className="text-amber-700 font-medium">{pesoShort(b.obligated)}</div>
                          </div>
                          <div>
                            <div className="text-emerald-600 text-[10px]">Rel.</div>
                            <div className="text-emerald-700 font-medium">{pesoShort(b.released)}</div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-neutral-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-emerald-400" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Locked Appropriation</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">{selected.ordinance}</span>
        </div>
        <div className="text-[18px] font-semibold mb-1">{selected.name}</div>
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-800">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Appropriated</div>
            <div className="text-[18px] font-semibold tabular-nums">{peso(selected.appropriated)}</div>
          </div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase tracking-wider">Obligated</div>
            <div className="text-[18px] font-semibold tabular-nums text-amber-400">{peso(selected.obligated)}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Released</div>
            <div className="text-[18px] font-semibold tabular-nums text-emerald-400">{peso(selected.released)}</div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Remaining</div>
            <div className="text-[18px] font-semibold tabular-nums">{peso(selected.appropriated - selected.obligated)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 12.1.B — CATEGORICAL SLICES (ALLOCATION SLIDERS) ====================
