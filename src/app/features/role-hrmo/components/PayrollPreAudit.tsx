import { CheckCircle2, Clock, Download, FileCheck, Fingerprint, XCircle } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type AuditCheck = { label: string; status: "pass" | "fail" | "pending"; detail: string };

const AUDIT_CHECKS: AuditCheck[] = [
  { label: "Attendance logs reconciled", status: "pass", detail: "2,068 employees · 44,620 records · zero gaps" },
  { label: "Leave credits deducted correctly", status: "pass", detail: "124 leave events processed · BPA-verified" },
  { label: "Overtime claims validated", status: "pass", detail: "118 cleared · 9 flagged · 15 rejected" },
  { label: "Tax withholding computed", status: "pass", detail: "BIR schedule 2026-Q2 applied" },
  { label: "GSIS / PhilHealth contributions", status: "pass", detail: "Employer match reconciled" },
  { label: "Night differential cross-check", status: "pending", detail: "Awaiting Traffic Ops schedule sync" },
  { label: "Hazard pay allocation", status: "pass", detail: "CDRRMO · Health · Fire confirmed" },
  { label: "Loan deductions applied", status: "pass", detail: "GSIS · Pag-IBIG · salary loans matched" },
];

export function PayrollPreAudit() {
  const passes = AUDIT_CHECKS.filter((c) => c.status === "pass").length;
  const fails = AUDIT_CHECKS.filter((c) => c.status === "fail").length;
  const pending = AUDIT_CHECKS.filter((c) => c.status === "pending").length;
  const canCommit = fails === 0 && pending === 0;

  return (
    <div>
      <PageHeader
        title="Payroll Pre-Audit · April 2026 · Cycle 2"
        subtitle="Final gate before money is released · cryptographically hashed and forwarded to Financial Disbursement"
        actions={
          <>
            <Btn icon={<Download size={14} />} label="Audit Trail" />
            <Btn
              icon={<Fingerprint size={14} />}
              label={canCommit ? "Generate Hash & Forward" : "Awaiting resolution"}
              variant={canCommit ? "primary" : "secondary"}
            />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Gross Payroll" value="₱ 142.8M" trend="2,068 employees" />
        <Stat label="Checks Passed" value={`${passes}/${AUDIT_CHECKS.length}`} trend="cross-referenced" tone={passes === AUDIT_CHECKS.length ? "good" : "warn"} />
        <Stat label="Pending" value={String(pending)} trend="awaiting sync" tone="warn" />
        <Stat label="Failures" value={String(fails)} trend="blocks disbursement" tone={fails > 0 ? "bad" : "good"} />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
            <FileCheck size={14} className="text-neutral-700" />
            <span className="text-[13px] font-semibold">Reconciliation Checklist</span>
          </div>
          {AUDIT_CHECKS.map((c, i) => {
            const icon =
              c.status === "pass" ? <CheckCircle2 size={14} className="text-emerald-600" /> :
              c.status === "fail" ? <XCircle size={14} className="text-red-600" /> :
              <Clock size={14} className="text-amber-600" />;
            return (
              <div key={i} className="px-5 py-3 border-b border-neutral-100 last:border-0 flex items-start gap-3 hover:bg-neutral-50 transition-colors">
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-neutral-900">{c.label}</div>
                  <div className="text-[11px] font-normal text-neutral-500 mt-0.5">{c.detail}</div>
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider ${
                  c.status === "pass" ? "text-emerald-600" : c.status === "fail" ? "text-red-600" : "text-amber-600"
                }`}>
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hash preview */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
            <Fingerprint size={14} className="text-emerald-400" />
            <span className="text-[13px] font-semibold">Cryptographic Seal</span>
            {canCommit && <span className="ml-auto text-[10px] text-emerald-400 font-medium">READY</span>}
          </div>
          <div className="p-5">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">SHA-256</div>
            <div className="font-mono text-[10px] text-emerald-400 break-all leading-relaxed bg-neutral-950 border border-neutral-800 rounded-lg p-3 mb-4">
              {canCommit ? "8f4a9c2e7b1d3e5f0a6c8d1e4b7a9f2c3d5e8b1a4c7d9e2f5a8b1c4d7e0f3a6b" : "— pending reconciliation —"}
            </div>
            <div className="space-y-2 text-[11px] font-normal">
              <div className="flex justify-between"><span className="text-neutral-400">Cycle</span><span>2026-04-C2</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Employees</span><span className="tabular-nums">2,068</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Gross</span><span className="tabular-nums">₱142,840,218.00</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Net</span><span className="tabular-nums">₱118,922,415.40</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Block height</span><span className="tabular-nums">#482,917</span></div>
            </div>
            <button
              disabled={!canCommit}
              className={`w-full mt-4 py-2.5 rounded-lg text-[12px] font-medium transition-colors ${
                canCommit ? "bg-emerald-500 text-white hover:bg-emerald-400 cursor-pointer" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {canCommit ? "Seal & Forward to Disbursement" : "Resolve pending items first"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 11.1.A — CSC APPRAISALS (IPCR/OPCR) ====================
