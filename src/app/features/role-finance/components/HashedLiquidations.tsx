import { useState } from "react";
import { CheckCircle2, Copy, Download, Hash, KeyRound, Shield } from "lucide-react";
import { Btn, PageHeader, Stat, peso, pesoShort } from "./primitives";

type HashedVoucher = {
  id: string;
  voucher: string;
  payee: string;
  amount: number;
  sealed: string;
  block: number;
  hash: string;
  status: "verified" | "verified" | "verified";
};

const HASHED_VOUCHERS: HashedVoucher[] = [
  { id: "h1", voucher: "DV-2026-04-00318", payee: "Tanchuling Construction Corp.", amount: 5_240_000, sealed: "Apr 18, 2026 · 14:22:10", block: 88421, hash: "0x77229e51a44cd0fb1e8326c579b0ad14b3a9c1ffde2a8e014dbe7723a5f1b0c9", status: "verified" },
  { id: "h2", voucher: "DV-2026-04-00319", payee: "LGU Ormoc Payroll Batch 04-B", amount: 12_800_000, sealed: "Apr 18, 2026 · 14:30:01", block: 88422, hash: "0x3fa1bcd09e8711244ab6ec90ffa3d8c2771ae4d3a8c5e78190bb231fd4ea9c10", status: "verified" },
  { id: "h3", voucher: "DV-2026-04-00320", payee: "Medika Pharmaceuticals Inc.", amount: 1_680_000, sealed: "Apr 18, 2026 · 14:44:47", block: 88423, hash: "0xb9ec220f451aa88c713e609dcba4120e9ffcd1a73b826408ea7718fa0c9e14bd", status: "verified" },
  { id: "h4", voucher: "DV-2026-04-00321", payee: "Ormoc Electric Utility (OEDC)", amount: 842_300, sealed: "Apr 18, 2026 · 15:01:22", block: 88424, hash: "0x22ef0911c6a84bd22d71a3f408cab5e09011af3c9b764102fffe2e0a8c73115e", status: "verified" },
  { id: "h5", voucher: "DV-2026-04-00322", payee: "Sagip Kabataan Feeding Program", amount: 360_000, sealed: "Apr 18, 2026 · 15:12:05", block: 88425, hash: "0xa49ec6da3280114411cb90ec2af8b70c55d9701af22683de8712cc402ae8f7d4", status: "verified" },
];

export function HashedLiquidations() {
  const [selected, setSelected] = useState<HashedVoucher>(HASHED_VOUCHERS[0]);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(selected.hash); setCopied(true); setTimeout(() => setCopied(false), 1400); };

  return (
    <div className="p-8 min-h-full">
      <PageHeader
        title="Hashed Liquidations"
        subtitle="SHA-256 cryptographic seals · Immutable Expense Ledger"
        actions={<><Btn icon={<Download size={13} />} label="Export: COA Verification File" /><Btn icon={<Shield size={13} />} label="Independent Hash Checker" variant="primary" /></>}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Sealed This Quarter" value="2,184" trend="Vouchers hashed" tone="neutral" />
        <Stat label="Total Disbursed" value={pesoShort(1_842_000_000)} trend="Cryptographically verified" tone="good" />
        <Stat label="Block Height" value="88,425" trend="Latest commit · 15:12 UTC" tone="neutral" />
        <Stat label="Hash Collisions" value="0" trend="Since genesis block" tone="good" />
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
            <Hash size={14} className="text-neutral-900" />
            <div className="text-[13px] font-medium text-neutral-900">Sealed Voucher Registry</div>
            <div className="ml-auto text-[11px] font-normal text-neutral-400">Read-only · SHA-256</div>
          </div>
          <div className="divide-y divide-neutral-100">
            {HASHED_VOUCHERS.map(v => (
              <button key={v.id} onClick={() => setSelected(v)} className={`w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors ${selected.id === v.id ? "bg-emerald-50/40" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[12px] font-medium text-neutral-900">{v.voucher}</div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                    <CheckCircle2 size={10} /> VERIFIED
                  </div>
                </div>
                <div className="text-[11px] font-normal text-neutral-500 truncate">{v.payee} · {peso(v.amount)}</div>
                <div className="text-[10px] font-normal text-neutral-400 mt-1 font-mono truncate">{v.hash.slice(0, 40)}…</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-neutral-950 rounded-xl p-5 text-neutral-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 3px)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 uppercase tracking-wider mb-1">
              <KeyRound size={12} /> Cryptographic Seal
            </div>
            <div className="text-[15px] font-semibold mb-4">{selected.voucher}</div>

            <div className="space-y-3 text-[11px] font-normal">
              <div><div className="text-neutral-500 mb-0.5">Payee</div><div className="text-neutral-100">{selected.payee}</div></div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-neutral-500 mb-0.5">Amount</div><div className="text-neutral-100 tabular-nums">{peso(selected.amount)}</div></div>
                <div><div className="text-neutral-500 mb-0.5">Block #</div><div className="text-neutral-100 tabular-nums">{selected.block.toLocaleString()}</div></div>
              </div>
              <div><div className="text-neutral-500 mb-0.5">Sealed At</div><div className="text-neutral-100">{selected.sealed}</div></div>

              <div>
                <div className="text-neutral-500 mb-1 flex items-center justify-between">
                  <span>SHA-256 Digest</span>
                  <button onClick={copy} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <Copy size={10} /> {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 font-mono text-[10.5px] text-emerald-300 break-all leading-relaxed">{selected.hash}</div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-900 rounded-lg p-3 mt-2">
                <div className="flex items-start gap-2">
                  <Shield size={12} className="text-emerald-400 mt-0.5" />
                  <div className="text-[11px] text-emerald-200 leading-relaxed">
                    If COA hashes the original receipt file with SHA-256 and the digest matches, the document is mathematically proven unaltered since {selected.sealed}.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 14.1.B — NON-REPUDIATION RECORDS ====================
