import { CheckCircle2, Download, Fingerprint, Lock, User, Zap } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type MonetRequest = {
  id: number;
  employee: string;
  salaryGrade: string;
  monthlyRate: number;
  daysConverted: number;
  computed: number;
  status: "computed" | "mayor-review" | "signed";
  submitted: string;
};

const MONET_REQUESTS: MonetRequest[] = [
  { id: 1, employee: "Arnel Dela Cruz", salaryGrade: "SG-19 · Step 4", monthlyRate: 58420, daysConverted: 15, computed: 58420 * 15 / 22, status: "mayor-review", submitted: "2026-04-19" },
  { id: 2, employee: "Patricia Odal", salaryGrade: "SG-22 · Step 6", monthlyRate: 72648, daysConverted: 20, computed: 72648 * 20 / 22, status: "signed", submitted: "2026-04-11" },
  { id: 3, employee: "Carlos Villamor", salaryGrade: "SG-15 · Step 2", monthlyRate: 41508, daysConverted: 10, computed: 41508 * 10 / 22, status: "computed", submitted: "2026-04-20" },
  { id: 4, employee: "Lynnette Bascon", salaryGrade: "SG-18 · Step 3", monthlyRate: 54751, daysConverted: 12, computed: 54751 * 12 / 22, status: "mayor-review", submitted: "2026-04-17" },
];

export function Monetization() {
  const peso = (n: number) => `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  return (
    <div>
      <PageHeader
        title="Leave Monetization Pipeline"
        subtitle="Auto-computed · routed to Mayor for digital signature · no spreadsheets"
        actions={<Btn icon={<Download size={14} />} label="Export Pipeline" />}
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="In Pipeline" value={String(MONET_REQUESTS.length)} trend="across all grades" />
        <Stat label="Awaiting Signature" value={String(MONET_REQUESTS.filter((r) => r.status === "mayor-review").length)} trend="at Mayor's desk" tone="warn" />
        <Stat label="Total Disbursement" value={peso(MONET_REQUESTS.reduce((s, r) => s + r.computed, 0))} trend="this batch" />
        <Stat label="Avg Processing" value="2.8d" trend="submit → signed" tone="good" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { key: "computed", label: "Auto-Computed", icon: <Zap size={12} />, tint: "bg-blue-50" },
          { key: "mayor-review", label: "Mayor Review", icon: <User size={12} />, tint: "bg-amber-50" },
          { key: "signed", label: "Digitally Signed", icon: <CheckCircle2 size={12} />, tint: "bg-emerald-50" },
        ].map((stage) => {
          const items = MONET_REQUESTS.filter((r) => r.status === stage.key);
          return (
            <div key={stage.key} className={`${stage.tint} rounded-xl p-3 col-span-1`}>
              <div className="flex items-center gap-2 mb-3 px-1 text-[11px] font-medium text-neutral-700">
                {stage.icon} {stage.label} · {items.length}
              </div>
              <div className="space-y-2">
                {items.map((r) => (
                  <div key={r.id} className="bg-white border border-neutral-200 rounded-lg p-3">
                    <div className="text-[12px] font-medium text-neutral-900">{r.employee}</div>
                    <div className="text-[10px] font-normal text-neutral-500 mt-0.5">{r.salaryGrade}</div>
                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-400 font-normal">{r.daysConverted} days</div>
                        <div className="text-[13px] font-semibold text-neutral-900 tabular-nums">{peso(Math.round(r.computed))}</div>
                      </div>
                      {r.status === "signed" && <Lock size={12} className="text-emerald-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="bg-neutral-900 rounded-xl p-4 text-white col-span-1">
          <div className="flex items-center gap-2 text-[11px] font-medium mb-3">
            <Fingerprint size={12} /> Mayor Digital Signing Panel
          </div>
          <div className="text-[11px] font-normal text-neutral-300 mb-4">
            {MONET_REQUESTS.filter((r) => r.status === "mayor-review").length} requests pending. Batch-sign with PKI credential.
          </div>
          <div className="bg-neutral-800 rounded-lg p-3 font-mono text-[10px] text-emerald-400 mb-3">
            sig::0x4f8a...c72e<br />
            batch::LGU-ORMOC-MONET-2026-042<br />
            timestamp::{new Date().toISOString()}
          </div>
          <button className="w-full py-2 bg-white text-neutral-900 rounded-lg text-[12px] font-medium cursor-pointer hover:bg-neutral-100">
            Sign & Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 10.2.C — OVERTIME CLAIMS (GPS VALIDATION) ====================
