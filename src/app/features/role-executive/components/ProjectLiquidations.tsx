import * as React from "react";
import * as Carbon from "@carbon/icons-react";
import * as UI from "./AuditPrimitives";
import { liquidations } from "./auditData";

export function ProjectLiquidations() {
  const [selectedId, setSelectedId] = React.useState<string | null>(liquidations[0]?.id || null);
  const [filterMode, setFilterMode] = React.useState<"all" | "flagged">("all");

  const filtered = filterMode === "flagged" ? liquidations.filter(l => l.status === "Flagged") : liquidations;
  const selected = liquidations.find(l => l.id === selectedId);

  return (
    <div>
      <UI.PageHeader
        title="Verified Receipts & Liquidations"
        subtitle="Cryptographic Ledger · Project Liquidations"
        actions={<>
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            {(["all", "flagged"] as const).map(v => (
              <button key={v} onClick={() => setFilterMode(v)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all ${filterMode === v ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >{v === "all" ? "All Records" : "Flagged / Anomalous"}</button>
            ))}
          </div>
          <UI.Btn icon={<Carbon.Download size={14} />} label="Export" />
        </>}
      />
      <UI.ReadOnlyBanner />

      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Total Liquidations" value={`${liquidations.length}`} sub="Evidence records" />
        <UI.StatCard label="File Hashes Valid" value={`${liquidations.filter(l => l.imageValid).length}/${liquidations.length}`} sub="Image integrity" trend="up" />
        <UI.StatCard label="Total Liquidated" value={`₱${(liquidations.reduce((s, l) => s + l.liquidated, 0) / 1000).toFixed(0)}K`} sub="Proven spend" />
        <UI.StatCard label="Flagged" value={`${liquidations.filter(l => l.status === "Flagged").length}`} sub="Anomalous evidence" trend="down" />
      </div>

      {/* Split-Pane Verification View */}
      <div className="grid grid-cols-[1fr_1fr] gap-0 rounded-xl border border-neutral-200 overflow-hidden bg-white" style={{ minHeight: 520 }}>
        {/* Left Pane — The Ledger */}
        <div className="border-r border-neutral-200">
          <div className="px-5 py-3 bg-neutral-50/50 border-b border-neutral-100 flex items-center gap-2">
            <span className="text-[12px] font-semibold text-neutral-900">Liquidation Ledger</span>
            <span className="text-[10px] font-normal text-neutral-500">{filtered.length} records</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
            {filtered.map((l) => {
              const isActive = selectedId === l.id;
              const isFlagged = l.status === "Flagged";
              return (
                <div
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={`px-5 py-3.5 border-b cursor-pointer transition-all ${
                    isActive ? "bg-blue-50 border-b-blue-100 border-l-4 border-l-blue-500" :
                    isFlagged ? "bg-red-50/30 border-b-red-50 hover:bg-red-50/50" :
                    "border-b-neutral-50 hover:bg-neutral-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[10px] text-neutral-500">{l.id}</span>
                      <UI.Pill status={l.status} />
                    </div>
                    <span className="text-[12px] font-semibold text-neutral-900">₱{l.liquidated.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-neutral-700">{l.payee}</span>
                    <span className="text-[10px] font-normal text-neutral-400">{l.dept}</span>
                  </div>
                  <div className="mt-1.5">
                    <UI.HashDisplay hash={l.hash} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane — The Evidence Inspector */}
        <div className="bg-slate-50/30">
          <div className="px-5 py-3 bg-neutral-50/50 border-b border-neutral-100 flex items-center gap-2">
            <Carbon.View size={14} className="text-neutral-500" />
            <span className="text-[12px] font-semibold text-neutral-900">Evidence Inspector</span>
          </div>
          {selected ? (
            <div className="p-5 space-y-4">
              {/* File info */}
              <div className={`rounded-xl border-2 p-5 ${selected.imageValid ? "border-emerald-200 bg-emerald-50/30" : "border-red-300 bg-red-50/30"}`}>
                <div className="flex items-center gap-2 mb-3">
                  {selected.imageValid ? (
                    <Carbon.Security size={20} className="text-emerald-600" />
                  ) : (
                    <Carbon.Warning size={20} className="text-red-600" />
                  )}
                  <div>
                    <span className={`text-[13px] font-semibold ${selected.imageValid ? "text-emerald-700" : "text-red-700"}`}>
                      File Integrity: {selected.imageValid ? "Valid" : "COMPROMISED"}
                    </span>
                    <p className={`text-[10px] font-normal ${selected.imageValid ? "text-emerald-600" : "text-red-600"}`}>
                      {selected.imageValid
                        ? `This image has not been altered since it was uploaded by the field worker at ${selected.uploadedAt.split(" ")[1]}.`
                        : "File hash does not match blockchain record. This evidence may have been tampered with."
                      }
                    </p>
                  </div>
                </div>
                {/* Simulated document preview */}
                <div className="bg-white rounded-lg border border-neutral-200 p-4 text-center">
                  <div className="w-full h-32 bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center">
                      <Carbon.DocumentExport size={28} className="text-neutral-300 mx-auto mb-1" />
                      <span className="text-[11px] font-normal text-neutral-400">{selected.fileType}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-medium text-neutral-500">SHA-256:</span>
                    <span className="font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[10px] text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded">{selected.fileHash}</span>
                  </div>
                </div>
              </div>

              {/* Evidence metadata */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <h4 className="text-[12px] font-semibold text-neutral-900 mb-3">Evidence Metadata</h4>
                <div className="space-y-2.5">
                  {[
                    ["Liquidation ID", selected.id],
                    ["Advance Reference", selected.advanceRef],
                    ["Payee", selected.payee],
                    ["Department", selected.dept],
                    ["Amount Advanced", `₱${selected.amount.toLocaleString()}`],
                    ["Amount Liquidated", `₱${selected.liquidated.toLocaleString()}`],
                    ["Amount Returned", `₱${selected.returned.toLocaleString()}`],
                    ["Uploaded By", selected.uploadedBy],
                    ["Upload Timestamp", selected.uploadedAt],
                    ["Geo-Tag", selected.geoTag],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="text-[10px] font-medium text-neutral-500 uppercase w-32 shrink-0">{label}</span>
                      <span className="text-[11px] font-normal text-neutral-800">{val}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] font-medium text-neutral-500 uppercase w-32 shrink-0">Blockchain Hash</span>
                    <UI.HashDisplay hash={selected.hash} full />
                  </div>
                </div>
              </div>

              {/* The Immutable Seal */}
              <div className={`rounded-xl p-4 text-center ${selected.imageValid ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-300"}`}>
                <div className="flex items-center justify-center gap-2">
                  {selected.imageValid ? (
                    <>
                      <Carbon.Locked size={14} className="text-emerald-600" />
                      <span className="text-[12px] font-semibold text-emerald-700">IMMUTABLE SEAL: INTACT</span>
                    </>
                  ) : (
                    <>
                      <Carbon.Warning size={14} className="text-red-600" />
                      <span className="text-[12px] font-semibold text-red-700">IMMUTABLE SEAL: BROKEN — TAMPER ALERT DISPATCHED</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400">
              <p className="text-[13px] font-normal">Select a record from the ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== 5.1C RETURNED FUNDS ====================
