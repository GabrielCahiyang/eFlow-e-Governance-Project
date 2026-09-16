import * as React from "react";
import * as Lucide from "lucide-react";
import * as Carbon from "@carbon/icons-react";
import * as UI from "./CommitteePrimitives";

const budgetTreeData = [
  { name: "General Services", fullName: "General Public Services", size: 520, color: "#3B82F6", pct: 26, yoy: "+4%", aiNote: "Administrative overhead is within 28% benchmark. Personnel Services consume 72% of this allocation, consistent with national LGU averages." },
  { name: "Health", fullName: "Health Services", size: 300, color: "#10B981", pct: 15, yoy: "+12%", aiNote: "The proposed ₱300M Health budget is a 12% increase from last year, aligning with the projected population growth of Ormoc. Burn-rate history suggests 98% utilization." },
  { name: "Infrastructure", fullName: "Infrastructure Development", size: 450, color: "#F59E0B", pct: 22.5, yoy: "+8%", aiNote: "₱450M earmarked for disaster risk reduction, road widening, and drainage. 35% allocated to the Eco-Park Tourism Zone. Contractor pre-qualification completed for 3 of 5 major projects." },
  { name: "Education", fullName: "Education, Culture & Sports", size: 200, color: "#8B5CF6", pct: 10, yoy: "+6%", aiNote: "Scholarship Fund (ORD-2024-048) consumes 22% of this block. New allocation for digital literacy program in 15 barangays." },
  { name: "Social Welfare", fullName: "Social Welfare & Development", size: 180, color: "#EC4899", pct: 9, yoy: "+3%", aiNote: "Stable allocation. DSWD co-funding covers 40% of conditional cash transfer programs. No audit flags." },
  { name: "Eco & Tourism", fullName: "Economic & Tourism Dev.", size: 150, color: "#06B6D4", pct: 7.5, yoy: "+18%", aiNote: "Largest YoY increase driven by the Sustainable Tourism Eco-Park Zone (ORD-2026-042). Marine Litter Interception Program (₱5M) included under environmental sub-line." },
  { name: "Public Safety", fullName: "Public Order & Safety", size: 120, color: "#F97316", pct: 6, yoy: "+2%", aiNote: "CCTV Surveillance Network (ORD-2026-047, ₱12M) is the major new item. Disaster preparedness training (₱3M) for all barangays pending committee clearance." },
  { name: "Debt Service", fullName: "Debt Service Fund", size: 80, color: "#6B7280", pct: 4, yoy: "-5%", aiNote: "Declining as scheduled. Final tranche of the 2019 municipal bond matures in Q3 2027." },
];

const budgetComments = [
  { id: "c1", author: "Hon. J. Cruz", initials: "JC", department: "Health", text: "Requesting a ₱5M cut here to move to the Eco-Park fund. The 12% increase is already above the 5-year average.", time: "Apr 12, 2:30 PM", resolved: false },
  { id: "c2", author: "Hon. L. Santos", initials: "LS", department: "Infrastructure", text: "The ₱450M must include the flood control channel rehabilitation. Confirm with DPWH co-funding status.", time: "Apr 11, 4:15 PM", resolved: false },
  { id: "c3", author: "Hon. R. Almario", initials: "RA", department: "Eco & Tourism", text: "Eco-Park tourism revenue projections need to be attached before second reading.", time: "Apr 10, 10:00 AM", resolved: true },
];

// Simple squarified treemap layout algorithm
function computeTreemapLayout(data: typeof budgetTreeData, width: number, height: number) {
  const total = data.reduce((s, d) => s + d.size, 0);
  const sorted = [...data].sort((a, b) => b.size - a.size);
  const rects: { x: number; y: number; w: number; h: number; item: typeof budgetTreeData[0] }[] = [];
  
  let cx = 0, cy = 0, cw = width, ch = height;
  // Use a simple strip layout
  let remaining = [...sorted];
  
  while (remaining.length > 0) {
    const isWide = cw >= ch;
    // Take items for this strip
    const stripItems: typeof remaining = [];
    let stripTotal = 0;
    const stripSize = isWide ? ch : cw;
    
    // Greedy: add items while aspect ratio improves
    for (const item of remaining) {
      stripItems.push(item);
      stripTotal += item.size;
      if (stripItems.length >= 2) {
        const stripLen = (stripTotal / total) * (isWide ? cw : ch) * (isWide ? ch : cw) / stripSize;
        const lastH = ((item.size / stripTotal) * stripSize);
        const ar = Math.max(stripLen / lastH, lastH / stripLen);
        if (ar > 4 && remaining.length > stripItems.length) {
          stripItems.pop();
          stripTotal -= item.size;
          break;
        }
      }
    }
    
    remaining = remaining.slice(stripItems.length);
    const stripFraction = stripTotal / total;
    const stripWidth = isWide ? cw * stripFraction : cw;
    const stripHeight = isWide ? ch : ch * stripFraction;
    
    let offset = 0;
    for (const item of stripItems) {
      const itemFrac = item.size / stripTotal;
      const itemLen = isWide ? stripHeight * itemFrac : stripWidth * itemFrac;
      rects.push({
        x: isWide ? cx : cx + offset,
        y: isWide ? cy + offset : cy,
        w: isWide ? stripWidth : itemLen,
        h: isWide ? itemLen : stripHeight,
        item,
      });
      offset += itemLen;
    }
    
    if (isWide) { cx += stripWidth; cw -= stripWidth; }
    else { cy += stripHeight; ch -= stripHeight; }
    
  }
  
  return rects;
}

export function ProposedMunicipalBudget() {
  const [selectedBlock, setSelectedBlock] = React.useState<typeof budgetTreeData[0] | null>(null);
  const totalBudget = budgetTreeData.reduce((a, b) => a + b.size, 0);
  const treemapRects = computeTreemapLayout(budgetTreeData, 100, 100);

  return (
    <div>
      <UI.PageHeader
        title="Annual Budget Scrutiny"
        subtitle="FY 2027 Executive Budget · Submitted by the Office of the City Mayor"
        actions={
          <>
            <UI.Btn icon={<Carbon.View size={14} />} label="Departmental Breakdown" />
            <UI.Btn icon={<Lucide.Zap size={14} />} label="AI Forecast" variant="primary" />
          </>
        }
      />

      {/* Stats */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <UI.StatCard label="Total Budget" value={`₱${(totalBudget / 1000).toFixed(1)}B`} sub="FY 2027 Proposed" />
        <UI.StatCard label="YoY Change" value="+6.8%" sub="vs FY 2026 ₱1.87B" trend="up" />
        <UI.StatCard label="Committee Comments" value={`${budgetComments.filter(c => !c.resolved).length}`} sub={`${budgetComments.filter(c => c.resolved).length} resolved`} />
        <UI.StatCard label="AI Risk Score" value="Low" sub="No unfunded mandates detected" trend="up" />
      </div>

      {/* Tree Map + Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 mb-6">
        {/* Tree Map */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-neutral-900">Budget Allocation Tree-Map</h3>
            <span className="text-[11px] font-normal text-neutral-400">Click a block to inspect</span>
          </div>
          <div className="h-[340px] relative rounded-lg overflow-hidden">
            {treemapRects.map((r, i) => (
              <div
                key={`tm-${i}`}
                onClick={() => setSelectedBlock(r.item)}
                className="absolute cursor-pointer transition-all duration-200 hover:brightness-110 hover:z-10 flex flex-col justify-center px-3 py-2"
                style={{
                  left: `${r.x}%`,
                  top: `${r.y}%`,
                  width: `${r.w}%`,
                  height: `${r.h}%`,
                  backgroundColor: r.item.color,
                  opacity: selectedBlock?.name === r.item.name ? 1 : 0.85,
                  outline: selectedBlock?.name === r.item.name ? "3px solid #1e293b" : "2px solid #fff",
                  outlineOffset: "-2px",
                  borderRadius: "6px",
                }}
              >
                {r.w > 12 && r.h > 12 && (
                  <>
                    <span className="text-white text-[12px] font-medium leading-tight truncate">{r.item.name}</span>
                    <span className="text-white/70 text-[10px] font-normal mt-0.5">₱{r.item.size}M · {r.item.pct}%</span>
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-100">
            {budgetTreeData.map(d => (
              <button key={d.name} onClick={() => setSelectedBlock(d)} className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity">
                <div className="size-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-normal text-neutral-600">{d.name} ({d.pct}%)</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Fiscal Note Panel */}
        <div className="flex flex-col gap-4">
          {selectedBlock ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-3 rounded-sm" style={{ backgroundColor: selectedBlock.color }} />
                <h4 className="text-[14px] font-semibold text-neutral-900">{selectedBlock.fullName}</h4>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[28px] font-semibold text-neutral-900">₱{selectedBlock.size}M</span>
                <span className={`text-[12px] font-medium ${selectedBlock.yoy.startsWith("+") ? "text-emerald-600" : selectedBlock.yoy.startsWith("-") ? "text-blue-600" : "text-neutral-500"}`}>
                  {selectedBlock.yoy} YoY
                </span>
              </div>
              {/* AI Note */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lucide.Zap size={12} className="text-violet-600" />
                  <span className="text-[11px] font-semibold text-violet-700">AI Fiscal Note</span>
                </div>
                <p className="text-[12px] font-normal text-violet-800 leading-relaxed">
                  {selectedBlock.aiNote}
                </p>
              </div>
              {/* Allocation Bar */}
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-normal text-neutral-500">Share of Total Budget</span>
                  <span className="text-[10px] font-semibold text-neutral-700">{selectedBlock.pct}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedBlock.pct}%`, backgroundColor: selectedBlock.color }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col items-center justify-center text-center h-[260px]">
              <Carbon.Analytics size={32} className="text-neutral-200 mb-3" />
              <p className="text-[13px] font-normal text-neutral-400">Click a budget block to view</p>
              <p className="text-[11px] font-normal text-neutral-300 mt-1">AI Fiscal Note & details</p>
            </div>
          )}

          {/* Quick Comparison */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h4 className="text-[13px] font-semibold text-neutral-900 mb-3">FY 2027 vs FY 2026</h4>
            <div className="flex flex-col gap-2.5">
              {budgetTreeData.slice(0, 5).map(d => {
                const fy27 = d.size;
                const fy26 = Math.round(d.size / (1 + parseFloat(d.yoy) / 100));
                const max = Math.max(...budgetTreeData.slice(0, 5).map(x => x.size));
                return (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="text-[9px] font-normal text-neutral-500 w-[60px] shrink-0 truncate">{d.name}</span>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="h-[8px] bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D1D5DB] rounded-full" style={{ width: `${(fy26 / max) * 100}%` }} />
                      </div>
                      <div className="h-[8px] bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(fy27 / max) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-[9px] font-medium text-neutral-700 w-[32px] text-right">{fy27}M</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1"><div className="size-2 rounded-sm bg-[#D1D5DB]" /><span className="text-[8px] font-normal text-neutral-400">FY 2026</span></div>
                <div className="flex items-center gap-1"><div className="size-2 rounded-sm bg-blue-500" /><span className="text-[8px] font-normal text-neutral-400">FY 2027</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Committee Comments */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Lucide.MessageSquare size={14} className="text-neutral-500" />
            <h3 className="text-[14px] font-semibold text-neutral-900">Committee Inline Comments</h3>
            <span className="text-[11px] font-normal text-neutral-400">
              {budgetComments.filter(c => !c.resolved).length} open
            </span>
          </div>
          <UI.Btn icon={<Lucide.Plus size={12} />} label="Add Comment" />
        </div>
        <div className="divide-y divide-neutral-50">
          {budgetComments.map(c => (
            <div key={c.id} className={`px-5 py-4 ${c.resolved ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold text-blue-700">{c.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-neutral-900">{c.author}</span>
                    <span className="text-[10px] font-normal text-neutral-400">on {c.department}</span>
                    <span className="text-[10px] font-normal text-neutral-400">· {c.time}</span>
                    {c.resolved && <UI.Pill status="Resolved" className="!text-[9px] !py-0" />}
                  </div>
                  <p className="text-[12px] font-normal text-neutral-700 leading-relaxed">{c.text}</p>
                </div>
                {!c.resolved && (
                  <button className="text-[10px] font-medium text-emerald-600 hover:underline cursor-pointer whitespace-nowrap">Mark Resolved</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 8.1.B BUDGET LEGISLATION ====================
