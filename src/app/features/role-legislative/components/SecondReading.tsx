import { useState } from "react";
import { DocumentExport, Download, Report, View } from "@carbon/icons-react";
import { Btn, PageHeader, StatCard } from "./primitives";
import { measures } from "./data";

const originalDraft = [
  { line: 1, text: "SECTION 1. Short Title. — This ordinance shall be known as the", type: "unchanged" },
  { line: 2, text: '"Marine Litter Interception Program Ordinance of 2026."', type: "unchanged" },
  { line: 3, text: "", type: "unchanged" },
  { line: 4, text: "SECTION 2. Purpose. — The City Government of Ormoc shall", type: "unchanged" },
  { line: 5, text: "establish a comprehensive marine litter interception program", type: "unchanged" },
  { line: 6, text: "covering all major waterways within the city limits.", type: "deletion" },
  { line: 7, text: "", type: "unchanged" },
  { line: 8, text: "SECTION 3. Appropriation. — The amount of FIVE MILLION", type: "unchanged" },
  { line: 9, text: "PESOS (₱5,000,000.00) is hereby appropriated from the", type: "deletion" },
  { line: 10, text: "General Fund for the implementation of this program.", type: "unchanged" },
  { line: 11, text: "", type: "unchanged" },
  { line: 12, text: "SECTION 4. Implementing Agency. — The City ENRO shall be", type: "unchanged" },
  { line: 13, text: "the primary implementing agency for this ordinance.", type: "unchanged" },
  { line: 14, text: "", type: "unchanged" },
  { line: 15, text: "SECTION 5. Penalties. — Any person found violating the", type: "unchanged" },
  { line: 16, text: "provisions of this ordinance shall be fined not less than", type: "unchanged" },
  { line: 17, text: "₱500.00 and not more than ₱5,000.00.", type: "deletion" },
];

const amendedDraft = [
  { line: 1, text: "SECTION 1. Short Title. — This ordinance shall be known as the", type: "unchanged" },
  { line: 2, text: '"Marine Litter Interception Program Ordinance of 2026."', type: "unchanged" },
  { line: 3, text: "", type: "unchanged" },
  { line: 4, text: "SECTION 2. Purpose. — The City Government of Ormoc shall", type: "unchanged" },
  { line: 5, text: "establish a comprehensive marine litter interception program", type: "unchanged" },
  { line: 6, text: "covering all major waterways and coastal areas within the", type: "insertion" },
  { line: 7, text: "city limits, including Ormoc Bay.", type: "insertion" },
  { line: 8, text: "", type: "unchanged" },
  { line: 9, text: "SECTION 3. Appropriation. — The amount of SEVEN MILLION", type: "insertion" },
  { line: 10, text: "FIVE HUNDRED THOUSAND PESOS (₱7,500,000.00) is hereby", type: "insertion" },
  { line: 11, text: "appropriated from the General Fund for the implementation", type: "unchanged" },
  { line: 12, text: "of this program.", type: "unchanged" },
  { line: 13, text: "", type: "unchanged" },
  { line: 14, text: "SECTION 4. Implementing Agency. — The City ENRO shall be", type: "unchanged" },
  { line: 15, text: "the primary implementing agency for this ordinance.", type: "unchanged" },
  { line: 16, text: "", type: "unchanged" },
  { line: 17, text: "SECTION 5. Penalties. — Any person found violating the", type: "unchanged" },
  { line: 18, text: "provisions of this ordinance shall be fined not less than", type: "unchanged" },
  { line: 19, text: "₱1,000.00 and not more than ₱10,000.00, or imprisonment", type: "insertion" },
  { line: 20, text: "of not more than six (6) months, or both.", type: "insertion" },
];

export function SecondReading() {
  const [trackChanges, setTrackChanges] = useState(true);
  const items = measures.filter(m => m.stage === "Second Reading");

  return (
    <div>
      <PageHeader
        title="Floor Deliberations"
        subtitle="Active Measures Pipeline · Second Reading (Debate & Amendment)"
        actions={<>
          <button
            onClick={() => setTrackChanges(!trackChanges)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${
              trackChanges ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            <View size={14} />{trackChanges ? "Track Changes: ON" : "Track Changes: OFF"}
          </button>
          <Btn icon={<Download size={14} />} label="Export" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Measures in Debate" value={`${items.length}`} sub="On the floor" />
        <StatCard label="Amendments Proposed" value="4" sub="Across all measures" />
        <StatCard label="Session" value="42nd" sub="Regular session, 2026" />
        <StatCard label="Presiding" value="VM Reyes" sub="Vice Mayor" />
      </div>

      {/* Measure selector */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-neutral-900">Currently Debating:</span>
          {items.map(m => (
            <div key={m.trackingNo} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[10px] text-amber-700">{m.trackingNo}</span>
              <span className="text-[10px] font-medium text-amber-800">{m.title.slice(0, 45)}…</span>
            </div>
          ))}
        </div>
      </div>

      {/* Split-screen Version Control UI */}
      <div className="grid grid-cols-2 gap-0 rounded-xl border border-neutral-200 overflow-hidden bg-white">
        {/* Left — Original */}
        <div className="border-r border-neutral-200">
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
            <Report size={14} className="text-neutral-500" />
            <span className="text-[12px] font-semibold text-neutral-900">Original Committee Draft</span>
            <span className="text-[10px] font-normal text-neutral-400 ml-auto">v1.0 — Committee on Appropriations</span>
          </div>
          <div className="p-4 font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] leading-[22px]">
            {originalDraft.map(line => (
              <div
                key={`orig-${line.line}`}
                className={`flex gap-3 px-2 py-0.5 rounded ${
                  trackChanges && line.type === "deletion" ? "bg-red-50 line-through text-red-600" : "text-neutral-700"
                }`}
              >
                <span className="text-neutral-300 w-5 text-right shrink-0 select-none">{line.line}</span>
                <span>{line.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Amended */}
        <div>
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
            <DocumentExport size={14} className="text-blue-500" />
            <span className="text-[12px] font-semibold text-neutral-900">Live Amended Draft</span>
            <span className="text-[10px] font-normal text-neutral-400 ml-auto">v2.3 — Floor amendments applied</span>
          </div>
          <div className="p-4 font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] leading-[22px]">
            {amendedDraft.map(line => (
              <div
                key={`amend-${line.line}`}
                className={`flex gap-3 px-2 py-0.5 rounded ${
                  trackChanges && line.type === "insertion" ? "bg-emerald-50 text-emerald-700" : "text-neutral-700"
                }`}
              >
                <span className="text-neutral-300 w-5 text-right shrink-0 select-none">{line.line}</span>
                <span>
                  {trackChanges && line.type === "insertion" && <span className="text-emerald-400 mr-1">+</span>}
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amendment summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mt-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Amendment Summary</h3>
        <div className="space-y-2">
          {[
            { section: "Section 2", change: "Expanded coverage to include coastal areas and Ormoc Bay", author: "Hon. M. Delgado", type: "Expansion" },
            { section: "Section 3", change: "Increased appropriation from ₱5M to ₱7.5M to cover coastal operations", author: "Hon. L. Santos", type: "Budget Increase" },
            { section: "Section 5", change: "Doubled penalty fines and added imprisonment clause", author: "Hon. R. Almario", type: "Penalty Enhancement" },
          ].map(a => (
            <div key={a.section} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] text-amber-600 w-20 shrink-0">{a.section}</span>
              <span className="text-[11px] font-normal text-neutral-700 flex-1">{a.change}</span>
              <span className="text-[10px] font-normal text-neutral-500">{a.author}</span>
              <span className="text-[9px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{a.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 6.1D THIRD READING ====================
