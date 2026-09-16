import { useState } from "react";
import { Analytics, CheckmarkOutline, Download, Locked, Security } from "@carbon/icons-react";
import { Btn, HashDisplay, PageHeader, Pill, StatCard } from "./primitives";
import { adoptedOrdinances } from "./data";

export function FullIndex() {
  const [showHashes, setShowHashes] = useState(true);

  return (
    <div>
      <PageHeader
        title="City Ordinance Registry"
        subtitle="Adopted Ordinances Archive · Immutable Full Index"
        actions={<>
          <button
            onClick={() => setShowHashes(!showHashes)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${
              showHashes ? "bg-slate-800 text-cyan-300 hover:bg-slate-700" : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <Security size={14} />{showHashes ? "Blockchain Hashes: ON" : "Blockchain Hashes: OFF"}
          </button>
          <Btn icon={<Download size={14} />} label="Export" />
        </>}
      />

      {/* Zero-trust banner */}
      <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-3">
        <Locked size={16} className="text-cyan-400" />
        <div>
          <span className="text-[12px] font-semibold text-cyan-300">IMMUTABLE LAW REGISTRY</span>
          <span className="text-[11px] font-normal text-slate-400 ml-3">Every enacted ordinance is cryptographically sealed. No one can secretly alter the text of a law after it has been passed.</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400">Chain Synced</span>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <StatCard label="Total Ordinances" value={`${adoptedOrdinances.length}`} sub="In immutable ledger" />
        <StatCard label="Chain Verified" value={`${adoptedOrdinances.length}`} sub="100% hash-checked" trend="up" />
        <StatCard label="Tamper Alerts" value="0" sub="All hashes match" trend="up" />
        <StatCard label="Last Sync" value="2m ago" sub="Blockchain block #48,291" />
      </div>

      {/* Master List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className={`grid gap-0 px-5 py-3 bg-neutral-50/50 border-b border-neutral-100 ${showHashes ? "grid-cols-[100px_1fr_100px_90px_130px_180px]" : "grid-cols-[100px_1fr_130px_100px_90px]"}`}>
          {showHashes
            ? ["Ordinance No.", "Title", "Date Enacted", "Status", "Author", "Blockchain Hash"].map(h => (
                <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
              ))
            : ["Ordinance No.", "Title", "Author", "Date Enacted", "Status"].map(h => (
                <span key={h} className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{h}</span>
              ))
          }
        </div>

        {adoptedOrdinances.map(o => (
          <div
            key={o.number}
            className={`grid gap-0 px-5 py-3.5 border-b border-neutral-50 hover:bg-blue-50/20 transition-colors items-center ${showHashes ? "grid-cols-[100px_1fr_100px_90px_130px_180px]" : "grid-cols-[100px_1fr_130px_100px_90px]"}`}
          >
            <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] text-blue-600">{o.number}</span>
            <span className="text-[12px] font-medium text-neutral-900 pr-3">{o.title}</span>
            {showHashes ? (
              <>
                <span className="text-[11px] font-normal text-neutral-600">{o.dateEnacted}</span>
                <Pill status={o.status} />
                <span className="text-[10px] font-normal text-neutral-500">{o.author}</span>
                <div className="flex items-center gap-1.5">
                  <HashDisplay hash={o.hash} />
                  <div className="flex items-center gap-0.5">
                    <CheckmarkOutline size={12} className="text-emerald-500" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-normal text-neutral-500">{o.author}</span>
                <span className="text-[11px] font-normal text-neutral-600">{o.dateEnacted}</span>
                <Pill status={o.status} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Connection to Financial Oversight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-5">
        <div className="flex items-start gap-3">
          <Analytics size={18} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-[13px] font-semibold text-blue-800 mb-1">Architectural Link: Law → Budget → Execution</h4>
            <p className="text-[11px] font-normal text-blue-700 leading-relaxed">
              When an ordinance with a ₱5M budget is passed through this pipeline and sealed on the blockchain, that exact ₱5M is automatically generated as the "Master Budget" in the Financial Oversight module. There is zero manual entry, zero discrepancy, and perfect traceability from the council floor to the final contractor receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== EXPORTS ====================
