import React, { useState } from "react";
import { CheckCircle2, ExternalLink, FileText, Fingerprint, Lock, Wallet } from "lucide-react";
import { Btn, PageHeader, Stat, peso, pesoShort } from "./primitives";

type Disb = {
  id: string;
  payee: string;
  purpose: string;
  amount: number;
  col: "voucher" | "treasurer" | "ready" | "released";
  orsRef: string;
  aging: number;
};

const DISB_INITIAL: Disb[] = [
  { id: "DV-2026-1882", payee: "Oriental Cement Corp.", purpose: "2,000 bags cement · Eco-Park P2", amount: 2_000_000, col: "voucher", orsRef: "ORS-2026-0482", aging: 1 },
  { id: "DV-2026-1883", payee: "MedEast Supply Inc.", purpose: "Q2 medical restock", amount: 3_800_000, col: "voucher", orsRef: "ORS-2026-0483", aging: 0 },
  { id: "DV-2026-1879", payee: "ESRI Philippines", purpose: "GIS licenses", amount: 1_200_000, col: "treasurer", orsRef: "ORS-2026-0484", aging: 2 },
  { id: "DV-2026-1880", payee: "Visayan Print Works", purpose: "Tourism print run", amount: 950_000, col: "treasurer", orsRef: "ORS-2026-0481", aging: 3 },
  { id: "DV-2026-1876", payee: "Bureau of Internal Revenue", purpose: "Withholding tax remittance", amount: 1_840_000, col: "ready", orsRef: "ORS-2026-0471", aging: 4 },
  { id: "DV-2026-1877", payee: "Construction Workers Union #4", purpose: "Payroll batch April C2", amount: 8_420_000, col: "ready", orsRef: "ORS-2026-0472", aging: 1 },
  { id: "DV-2026-1870", payee: "Asian Integrated Marine", purpose: "Coastal dredging · milestone 3", amount: 24_000_000, col: "released", orsRef: "ORS-2026-0462", aging: 0 },
  { id: "DV-2026-1871", payee: "GreenSpace Landscaping", purpose: "Phase 1 softscape", amount: 3_200_000, col: "released", orsRef: "ORS-2026-0458", aging: 2 },
];

const DISB_COLS: { id: Disb["col"]; label: string; tint: string; chip: string; icon: React.ReactNode }[] = [
  { id: "voucher", label: "Awaiting Voucher", tint: "bg-neutral-50", chip: "bg-neutral-200 text-neutral-700", icon: <FileText size={12} /> },
  { id: "treasurer", label: "Pending Treasurer Sig.", tint: "bg-amber-50", chip: "bg-amber-100 text-amber-700", icon: <Fingerprint size={12} /> },
  { id: "ready", label: "Ready for Release", tint: "bg-blue-50", chip: "bg-blue-100 text-blue-700", icon: <Wallet size={12} /> },
  { id: "released", label: "Funds Released", tint: "bg-emerald-50", chip: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={12} /> },
];

export function FundReleases() {
  const [cards, setCards] = useState(DISB_INITIAL);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [releaseModal, setReleaseModal] = useState<Disb | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);

  function onDrop(target: Disb["col"]) {
    if (!draggedId) return;
    const c = cards.find((x) => x.id === draggedId);
    if (!c || c.col === target) {
      setDraggedId(null);
      return;
    }
    if (target === "released") {
      setReleaseModal(c);
      setDraggedId(null);
      return;
    }
    setCards((cs) => cs.map((x) => (x.id === draggedId ? { ...x, col: target, aging: 0 } : x)));
    setDraggedId(null);
  }

  function confirmRelease() {
    if (!releaseModal) return;
    const hash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    setLastHash(hash);
    setCards((cs) => cs.map((x) => (x.id === releaseModal.id ? { ...x, col: "released", aging: 0 } : x)));
    setReleaseModal(null);
  }

  const totalReleased = cards.filter((c) => c.col === "released").reduce((s, c) => s + c.amount, 0);
  const pendingRelease = cards.filter((c) => c.col === "ready").reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      <PageHeader
        title="Disbursement Pipeline"
        subtitle="Treasurer workspace · drag between stages · cryptographic release to Immutable Audit"
        actions={
          <>
            <Btn icon={<Fingerprint size={14} />} label="Treasurer PKI · Connected" variant="success" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Pipeline Value" value={pesoShort(cards.reduce((s, c) => s + c.amount, 0))} trend={`${cards.length} vouchers`} />
        <Stat label="Ready for Release" value={pesoShort(pendingRelease)} trend="treasurer action required" tone="warn" />
        <Stat label="Released Today" value={pesoShort(totalReleased)} trend="cryptographically sealed" tone="good" />
        <Stat label="Avg Stage Time" value="2.1h" trend="voucher → release" tone="good" />
      </div>

      {lastHash && (
        <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-lg p-3 mb-4 flex items-center gap-3">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <div className="flex-1">
            <div className="text-[12px] font-medium text-emerald-800">Release committed to blockchain</div>
            <div className="font-mono text-[10px] text-emerald-700">{lastHash}</div>
          </div>
          <ExternalLink size={13} className="text-emerald-600 cursor-pointer" />
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {DISB_COLS.map((col) => {
          const items = cards.filter((c) => c.col === col.id);
          const sum = items.reduce((s, c) => s + c.amount, 0);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className={`${col.tint} rounded-xl p-3 min-h-[520px]`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-neutral-700">{col.icon}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${col.chip}`}>{items.length}</span>
                <span className="text-[12px] font-medium text-neutral-800">{col.label}</span>
              </div>
              <div className="text-[10px] font-normal text-neutral-500 px-1 mb-3 tabular-nums">{pesoShort(sum)} staged</div>
              <div className="flex flex-col gap-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDraggedId(c.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`bg-white rounded-lg border border-neutral-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                      draggedId === c.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-mono text-[10px] text-neutral-400">{c.id}</span>
                      {c.aging > 2 && <span className="ml-auto text-[9px] text-red-500 font-medium">{c.aging}d aging</span>}
                      {c.col === "released" && <Lock size={10} className="text-emerald-600 ml-auto" />}
                    </div>
                    <div className="text-[12px] font-medium text-neutral-900 truncate">{c.payee}</div>
                    <div className="text-[10px] font-normal text-neutral-500 truncate mt-0.5">{c.purpose}</div>
                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[10px] font-normal text-neutral-400 font-mono">{c.orsRef}</span>
                      <span className="text-[12px] font-semibold text-neutral-900 tabular-nums">{pesoShort(c.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Release modal */}
      {releaseModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setReleaseModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-6 py-4">
              <div className="flex items-center gap-2">
                <Fingerprint size={16} className="text-emerald-400" />
                <span className="text-[14px] font-semibold">Release Funds · PKI Signature Required</span>
              </div>
            </div>
            <div className="p-6">
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Payee</div>
              <div className="text-[15px] font-medium text-neutral-900">{releaseModal.payee}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{releaseModal.purpose}</div>

              <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-neutral-500">Amount to disburse</span>
                  <span className="text-[28px] font-semibold text-neutral-900 tabular-nums">{peso(releaseModal.amount)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-[11px] font-normal text-neutral-600">
                <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600" /> ORS reference validated ({releaseModal.orsRef})</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600" /> Treasurer PKI credential present</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600" /> Treasury cash balance sufficient</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-600" /> Hash will forward to Immutable Audit module</div>
              </div>

              <div className="mt-5 flex gap-2">
                <button onClick={() => setReleaseModal(null)} className="flex-1 py-2.5 bg-neutral-100 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-neutral-200">
                  Cancel
                </button>
                <button onClick={confirmRelease} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-[13px] font-medium cursor-pointer hover:bg-emerald-700 flex items-center justify-center gap-1.5">
                  <Fingerprint size={13} /> Sign & Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 12.2.C — EARMARKED FUNDS (BURN RATE) ====================
