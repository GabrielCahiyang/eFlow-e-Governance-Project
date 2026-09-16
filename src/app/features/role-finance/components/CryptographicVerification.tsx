import { useState } from "react";
import { CheckCircle2, Download, FileText, Fingerprint, Lock, Receipt, RefreshCw, Shield, Undo2 } from "lucide-react";
import { Btn, PageHeader, peso } from "./primitives";
import { BundleChip } from "./LGUPoolReturns";

type SealCandidate = {
  id: string;
  employee: string;
  dept: string;
  advance: number;
  receiptCount: number;
  verifiedTotal: number;
  returned: number;
  orsRef: string;
};

const SEAL_READY: SealCandidate[] = [
  { id: "LIQ-2026-0482", employee: "Engr. R. Mapalad", dept: "Engineering", advance: 10000, receiptCount: 8, verifiedTotal: 8500, returned: 1500, orsRef: "ORS-2026-0482" },
  { id: "LIQ-2026-0483", employee: "Dr. M. Sabando", dept: "Health", advance: 25000, receiptCount: 14, verifiedTotal: 18450, returned: 6550, orsRef: "ORS-2026-0483" },
  { id: "LIQ-2026-0487", employee: "J. Pomentil", dept: "Social Welfare", advance: 10000, receiptCount: 3, verifiedTotal: 8400, returned: 1600, orsRef: "ORS-2026-0485" },
];

export function CryptographicVerification() {
  const [selected, setSelected] = useState<SealCandidate>(SEAL_READY[0]);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState<{ id: string; hash: string; block: number } | null>(null);

  function doSeal() {
    setSealing(true);
    setTimeout(() => {
      const hash = `0x${Array.from({ length: 8 }).map(() => Math.random().toString(16).slice(2, 10)).join("")}`;
      setSealed({ id: selected.id, hash, block: 486000 + Math.floor(Math.random() * 1000) });
      setSealing(false);
    }, 1800);
  }

  return (
    <div>
      <PageHeader
        title="Seal Liquidation · COA Proof Generator"
        subtitle="Bundles ORS + receipts + return log into a single Merkle hash, forwarded to Immutable Audit"
        actions={<Btn icon={<Shield size={14} />} label="View Immutable Audit" />}
      />

      <div className="grid grid-cols-[320px_1fr] gap-4">
        {/* Ready queue */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-neutral-200 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Ready to Seal ({SEAL_READY.length})
          </div>
          {SEAL_READY.map((s) => {
            const active = selected.id === s.id;
            const isSealed = sealed?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors ${active ? "bg-neutral-900 text-white" : isSealed ? "bg-emerald-50" : "hover:bg-neutral-50"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-mono text-[10px] ${active ? "text-neutral-400" : "text-neutral-400"}`}>{s.id}</span>
                  {isSealed && <Lock size={10} className="text-emerald-600 ml-auto" />}
                </div>
                <div className={`text-[12px] font-medium ${active ? "text-white" : "text-neutral-900"}`}>{s.employee}</div>
                <div className={`text-[10px] ${active ? "text-neutral-300" : "text-neutral-500"}`}>{s.dept}</div>
                <div className={`text-[11px] mt-1 ${active ? "text-emerald-400" : "text-emerald-600"}`}>✓ Equation balanced</div>
              </button>
            );
          })}
        </div>

        {/* Seal panel */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
            <Fingerprint size={14} className="text-emerald-400" />
            <span className="text-[13px] font-semibold">Liquidation Package · {selected.id}</span>
            {sealed?.id === selected.id && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 size={10} /> Sealed
              </span>
            )}
          </div>

          <div className="p-5">
            {/* Bundle contents */}
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-3">Bundled for Merkle hashing</div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <BundleChip icon={<FileText size={14} />} label="Obligation Request" value={selected.orsRef} />
              <BundleChip icon={<Receipt size={14} />} label="Verified Receipts" value={`${selected.receiptCount} photos`} />
              <BundleChip icon={<Undo2 size={14} />} label="Return Log" value={peso(selected.returned)} />
            </div>

            {/* Equation preview */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 mb-5">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">Reconciliation proof</div>
              <div className="font-mono text-[11px] text-neutral-300 space-y-1">
                <div>advance   = <span className="text-white">{peso(selected.advance)}</span></div>
                <div>verified  = <span className="text-amber-400">{peso(selected.verifiedTotal)}</span></div>
                <div>returned  = <span className="text-emerald-400">{peso(selected.returned)}</span></div>
                <div className="pt-1 mt-1 border-t border-neutral-800">delta     = <span className="text-emerald-400">{peso(selected.advance - selected.verifiedTotal - selected.returned)} (balanced)</span></div>
              </div>
            </div>

            {/* Hash output */}
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">SHA-256 · blockchain commit</div>
            <div className="font-mono text-[11px] break-all bg-neutral-950 border border-neutral-800 rounded-lg p-3 mb-4 min-h-[56px] flex items-center">
              {sealing ? (
                <span className="text-amber-400 flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" /> Hashing Merkle tree across {selected.receiptCount + 2} leaves...
                </span>
              ) : sealed?.id === selected.id ? (
                <span className="text-emerald-400">{sealed.hash}</span>
              ) : (
                <span className="text-neutral-600">— not yet sealed —</span>
              )}
            </div>

            {sealed?.id === selected.id && (
              <div className="flex items-center justify-between text-[11px] font-normal mb-4">
                <span className="text-neutral-400">Block height</span>
                <span className="font-mono text-white">#{sealed.block.toLocaleString()}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Btn icon={<Download size={13} />} label="Export Package (PDF)" />
              <button
                onClick={doSeal}
                disabled={sealing || sealed?.id === selected.id}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[12px] font-medium hover:bg-emerald-400 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Shield size={13} />
                {sealed?.id === selected.id ? "Sealed & Forwarded ✓" : sealing ? "Sealing..." : "Seal Liquidation → Immutable Audit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
