import { CheckCircle2, Download, FileText, Fingerprint, Info } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type Signer = { name: string; role: string; method: string; timestamp: string; device: string; ip: string };

const SIGNERS: Signer[] = [
  { name: "Engr. Rolando Dacayo", role: "Department Head · Engineering Office", method: "PhilSys Biometric · Fingerprint", timestamp: "Apr 18, 2026 · 10:14:22", device: "eFlow Kiosk · Engineering-01", ip: "10.14.22.5" },
  { name: "Atty. Marissa Uy", role: "City Accountant", method: "PhilSys eSign · PIN + OTP", timestamp: "Apr 18, 2026 · 11:48:07", device: "MacBook Pro · MU-042", ip: "10.12.4.118" },
  { name: "Hon. Lucy Torres-Gomez", role: "City Mayor", method: "PhilSys Biometric · Face + PIN", timestamp: "Apr 18, 2026 · 13:02:59", device: "iPad · Mayor's Office", ip: "10.10.1.7" },
];

export function NonRepudiationRecords() {
  return (
    <div className="p-8 min-h-full">
      <PageHeader
        title="Non-Repudiation Records"
        subtitle="Biometric & cryptographic signature chain · DV-2026-04-00318"
        actions={<><Btn icon={<FileText size={13} />} label="View Voucher" /><Btn icon={<Download size={13} />} label="Export Signature Chain" variant="primary" /></>}
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Signatures Captured" value="3 / 3" trend="All parties attested" tone="good" />
        <Stat label="Authentication Method" value="PhilSys" trend="National ID biometrics" tone="neutral" />
        <Stat label="Repudiation Risk" value="0.00%" trend="Cryptographically bound" tone="good" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Fingerprint size={16} className="text-neutral-900" />
          <div className="text-[14px] font-medium text-neutral-900">Signature Chain of Custody</div>
          <div className="ml-auto text-[11px] font-normal text-neutral-500">DV-2026-04-00318 · ₱5,240,000</div>
        </div>

        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-emerald-200" />
          <div className="space-y-6">
            {SIGNERS.map((s, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
                  <Fingerprint size={13} className="text-emerald-700" />
                </div>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="text-[13px] font-semibold text-neutral-900">{s.name}</div>
                    <div className="text-[11px] font-normal text-neutral-500">{s.role}</div>
                  </div>
                  <div className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 size={10} /> IDENTITY BOUND
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-3 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[10.5px] font-normal">
                  <div><div className="text-neutral-400 uppercase tracking-wider text-[9px] mb-0.5">Method</div><div className="text-neutral-800">{s.method}</div></div>
                  <div><div className="text-neutral-400 uppercase tracking-wider text-[9px] mb-0.5">Timestamp</div><div className="text-neutral-800 tabular-nums">{s.timestamp}</div></div>
                  <div><div className="text-neutral-400 uppercase tracking-wider text-[9px] mb-0.5">Device</div><div className="text-neutral-800">{s.device}</div></div>
                  <div><div className="text-neutral-400 uppercase tracking-wider text-[9px] mb-0.5">IP</div><div className="text-neutral-800 font-mono">{s.ip}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info size={13} className="text-neutral-600 mt-0.5" />
            <div className="text-[11px] font-normal text-neutral-600 leading-relaxed">
              <span className="font-medium text-neutral-900">Non-repudiation principle.</span> Each signer's PhilSys identity is cryptographically bound to the voucher hash above. The statement "My staff stamped that, not me" is mathematically refuted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 14.1.C — BLOCKCHAIN COMMITS ====================
