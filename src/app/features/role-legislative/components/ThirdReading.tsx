import { Download, UserMultiple } from "@carbon/icons-react";
import { Btn, PageHeader, Pill, StatCard } from "./primitives";
import { measures } from "./data";

const councilors = [
  { name: "Hon. R. Almario", initials: "RA", vote: "YES" },
  { name: "Hon. M. Delgado", initials: "MD", vote: "YES" },
  { name: "Hon. L. Santos", initials: "LS", vote: "YES" },
  { name: "Hon. C. Torres", initials: "CT", vote: "YES" },
  { name: "Hon. J. Cruz", initials: "JC", vote: "NO" },
  { name: "Hon. B. Navarro", initials: "BN", vote: "YES" },
  { name: "Hon. A. Reyes", initials: "AR", vote: "YES" },
  { name: "Hon. P. Garcia", initials: "PG", vote: "YES" },
  { name: "Hon. E. Lim", initials: "EL", vote: "ABSTAIN" },
  { name: "Hon. D. Fernandez", initials: "DF", vote: "YES" },
  { name: "Hon. S. Ong", initials: "SO", vote: "NO" },
  { name: "Hon. G. Tan", initials: "GT", vote: "YES" },
];

export function ThirdReading() {
  const yesCount = councilors.filter(c => c.vote === "YES").length;
  const noCount = councilors.filter(c => c.vote === "NO").length;
  const abstainCount = councilors.filter(c => c.vote === "ABSTAIN").length;
  const majority = Math.ceil(councilors.length / 2) + 1; // simple majority
  const passed = yesCount >= majority;

  const currentMeasure = measures.find(m => m.stage === "Third Reading");

  return (
    <div className="relative">
      <PageHeader
        title="Final Plenary Vote"
        subtitle="Active Measures Pipeline · Third Reading"
        actions={<>
          <Btn icon={<UserMultiple size={14} />} label="Call for Division of the House" variant="primary" />
          <Btn icon={<Download size={14} />} label="Export" />
        </>}
      />

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Quorum Required" value={`${Math.ceil(councilors.length / 2 + 1)}`} sub={`of ${councilors.length} members`} />
        <StatCard label="Present" value={`${councilors.length}`} sub="All members present" trend="up" />
        <StatCard label="Majority Needed" value={`${majority}`} sub="For passage" />
        <StatCard label="Status" value={passed ? "PASSED" : "Voting"} sub={passed ? "Majority achieved" : "In progress"} trend={passed ? "up" : "flat"} />
      </div>

      {/* Current measure banner */}
      {currentMeasure && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] text-orange-600">{currentMeasure.trackingNo}</span>
            <Pill status="Third Reading" />
          </div>
          <p className="text-[13px] font-semibold text-neutral-900">{currentMeasure.title}</p>
          <p className="text-[10px] font-normal text-neutral-500 mt-0.5">Author: {currentMeasure.author} · No further debate permitted. Final vote only.</p>
        </div>
      )}

      {/* Live Tally Widget */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-5 text-center">Live Vote Tally</h3>
        <div className="flex items-end justify-center gap-8">
          {/* YES */}
          <div className="text-center">
            <div className="w-32 bg-neutral-100 rounded-xl overflow-hidden flex flex-col justify-end" style={{ height: 180 }}>
              <div className="bg-emerald-400 rounded-t-lg transition-all duration-500 flex items-center justify-center" style={{ height: `${(yesCount / councilors.length) * 100}%` }}>
                <span className="text-[28px] font-semibold text-white">{yesCount}</span>
              </div>
            </div>
            <span className="text-[14px] font-semibold text-emerald-700 mt-2 block">YES</span>
          </div>
          {/* NO */}
          <div className="text-center">
            <div className="w-32 bg-neutral-100 rounded-xl overflow-hidden flex flex-col justify-end" style={{ height: 180 }}>
              <div className="bg-red-400 rounded-t-lg transition-all duration-500 flex items-center justify-center" style={{ height: `${(noCount / councilors.length) * 100}%` }}>
                <span className="text-[28px] font-semibold text-white">{noCount}</span>
              </div>
            </div>
            <span className="text-[14px] font-semibold text-red-700 mt-2 block">NO</span>
          </div>
          {/* ABSTAIN */}
          <div className="text-center">
            <div className="w-32 bg-neutral-100 rounded-xl overflow-hidden flex flex-col justify-end" style={{ height: 180 }}>
              <div className="bg-neutral-400 rounded-t-lg transition-all duration-500 flex items-center justify-center" style={{ height: `${(abstainCount / councilors.length) * 100}%` }}>
                <span className="text-[28px] font-semibold text-white">{abstainCount}</span>
              </div>
            </div>
            <span className="text-[14px] font-semibold text-neutral-600 mt-2 block">ABSTAIN</span>
          </div>
        </div>
        {/* Majority line */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px bg-emerald-300 flex-1 max-w-[200px]" />
          <span className="text-[11px] font-semibold text-emerald-600">Majority threshold: {majority} votes</span>
          <div className="h-px bg-emerald-300 flex-1 max-w-[200px]" />
        </div>
        {/* Passed banner */}
        {passed && (
          <div className="mt-5 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-center relative overflow-hidden">
            <div className="text-[20px] font-semibold text-emerald-700">🎉 MEASURE PASSED 🎉</div>
            <p className="text-[11px] font-normal text-emerald-600 mt-1">
              {yesCount}-{noCount}-{abstainCount} (Yes-No-Abstain) · Document locked · Auto-forwarded to Mayoral Approval
            </p>
          </div>
        )}
      </div>

      {/* Individual councilor votes */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Quorum Roll — Individual Votes</h3>
        <div className="grid grid-cols-4 gap-3">
          {councilors.map(c => {
            const voteColors: Record<string, string> = {
              YES: "border-emerald-300 bg-emerald-50",
              NO: "border-red-300 bg-red-50",
              ABSTAIN: "border-neutral-300 bg-neutral-50",
            };
            const dotColors: Record<string, string> = {
              YES: "bg-emerald-500",
              NO: "bg-red-500",
              ABSTAIN: "bg-neutral-400",
            };
            return (
              <div key={c.name} className={`flex items-center gap-3 p-3 rounded-lg border ${voteColors[c.vote]}`}>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-semibold text-white">{c.initials}</div>
                <div className="flex-1">
                  <span className="text-[11px] font-medium text-neutral-900 block">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${dotColors[c.vote]}`} />
                  <span className={`text-[11px] font-semibold ${c.vote === "YES" ? "text-emerald-700" : c.vote === "NO" ? "text-red-700" : "text-neutral-600"}`}>{c.vote}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== 6.1E MAYORAL APPROVAL ====================
