import { useState } from "react";
import { CheckCircle2, Download, ExternalLink, Fingerprint, Shield } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";
import { ratingTone } from "./CSCAppraisals";

type Evidence = {
  hash: string;
  timestamp: string;
  type: string;
  label: string;
  block: number;
  verified: boolean;
};

const DEPT_RATINGS = [
  { dept: "Engineering", rating: 4.8, label: "Outstanding", workflows: 2842, evidenceCount: 2842 },
  { dept: "City Planning", rating: 4.6, label: "Very Satisfactory", workflows: 1204, evidenceCount: 1204 },
  { dept: "Health Office", rating: 4.4, label: "Very Satisfactory", workflows: 3108, evidenceCount: 3108 },
  { dept: "LEDIPO", rating: 3.2, label: "Satisfactory", workflows: 428, evidenceCount: 428 },
];

const EVIDENCE_SAMPLE: Evidence[] = [
  { hash: "0x4f8ac72e9b1d3e5f0a6c8d1e4b7a9f2c", timestamp: "2026-01-14 09:42:18", type: "Building Permit", label: "Permit #BP-2026-0184 · Lot 14-B Cogon", block: 482731, verified: true },
  { hash: "0x9a12bd8c4e7f1a3d6b9e2c5f8a0d3b67", timestamp: "2026-01-22 14:08:51", type: "Inspection Report", label: "Drainage audit · Brgy. Linao", block: 482988, verified: true },
  { hash: "0x27fe4a09cd1b6e82a3f7d4c9b0e5a172", timestamp: "2026-02-03 11:21:07", type: "Infrastructure Milestone", label: "Real St. road closure completed", block: 483412, verified: true },
  { hash: "0x881d6f0235ae9c14b7f2d8e4a6c1b390", timestamp: "2026-02-17 16:54:32", type: "Site Permit", label: "Permit #SP-2026-0318 · Isla Verde", block: 483892, verified: true },
  { hash: "0x3e7f0d4182acb54e9f1d6b3c8a2e7045", timestamp: "2026-03-04 10:12:49", type: "Subdivision Plan", label: "Approval · Villa Nova Phase 3", block: 484571, verified: true },
  { hash: "0xab331779f2c8d5e14a0b6e3f9d72c815", timestamp: "2026-03-19 13:47:22", type: "Variance Approval", label: "Zoning variance · District 2", block: 485208, verified: true },
  { hash: "0x51c0ee22bd9a847f13e6c2a0d5b89176", timestamp: "2026-04-02 08:33:11", type: "Compliance Audit", label: "Barangay infra audit · Cogon", block: 485902, verified: true },
  { hash: "0x77229e51a44cd0fb1e8326c579b0ad14", timestamp: "2026-04-15 15:29:04", type: "Inspection Report", label: "Flash flood damage · Isla Verde", block: 486418, verified: true },
];

export function EflowDataIntegration() {
  const [selectedDept, setSelectedDept] = useState(DEPT_RATINGS[0]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(EVIDENCE_SAMPLE[0]);

  return (
    <div>
      <PageHeader
        title="Cryptographic Performance Audit"
        subtitle="Every rating anchored to immutable eFlow workflow evidence · for CSC and COA auditors"
        actions={
          <>
            <Btn icon={<Download size={14} />} label="Export: COA/CSC Audit Log" />
            <Btn icon={<Shield size={14} />} label="Verify Merkle Root" variant="primary" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Departments Audited" value={String(DEPT_RATINGS.length)} trend="semester period" />
        <Stat label="Workflows Anchored" value="7,582" trend="cryptographically sealed" />
        <Stat label="Merkle Proofs" value="2,068" trend="one per employee" tone="good" />
        <Stat label="Ledger Integrity" value="100%" trend="zero tampered blocks" tone="good" />
      </div>

      {/* Dept selector */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {DEPT_RATINGS.map((d) => {
          const tone = ratingTone(d.rating);
          const active = selectedDept.dept === d.dept;
          return (
            <button
              key={d.dept}
              onClick={() => setSelectedDept(d)}
              className={`text-left rounded-xl border p-4 cursor-pointer transition-all ${active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200 hover:border-neutral-900"}`}
            >
              <div className={`text-[11px] font-medium uppercase tracking-wider ${active ? "text-neutral-400" : "text-neutral-400"}`}>OPCR</div>
              <div className={`text-[14px] font-semibold mt-0.5 ${active ? "text-white" : "text-neutral-900"}`}>{d.dept}</div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[22px] font-semibold ${active ? "text-white" : tone.text}`}>{d.rating.toFixed(1)}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${active ? "bg-neutral-800 text-neutral-300" : tone.chip}`}>{d.label}</span>
              </div>
              <div className={`mt-2 text-[10px] font-normal ${active ? "text-neutral-400" : "text-neutral-500"}`}>
                {d.workflows.toLocaleString()} workflows anchored
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4">
        {/* Evidence list */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">Blockchain Evidence · {selectedDept.dept}</div>
              <div className="text-[11px] font-normal text-neutral-500 mt-0.5">
                Showing 8 of {selectedDept.evidenceCount.toLocaleString()} anchored records · Jan–Jun 2026
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
              <Shield size={10} /> All verified
            </span>
          </div>
          <div className="divide-y divide-neutral-100">
            {EVIDENCE_SAMPLE.map((e, i) => {
              const active = selectedEvidence?.hash === e.hash;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedEvidence(e)}
                  className={`w-full text-left px-5 py-3 cursor-pointer transition-colors ${active ? "bg-blue-50" : "hover:bg-neutral-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center text-[9px] font-mono flex-shrink-0 mt-0.5">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">{e.type}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">· {e.timestamp}</span>
                      </div>
                      <div className="text-[12px] font-medium text-neutral-900 truncate">{e.label}</div>
                      <div className="font-mono text-[10px] text-neutral-500 truncate mt-0.5">{e.hash}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] text-neutral-400 font-normal">Block</div>
                      <div className="text-[11px] font-mono text-neutral-700">#{e.block}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence detail */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center gap-2">
            <Fingerprint size={14} className="text-emerald-400" />
            <span className="text-[12px] font-medium">Evidence Detail</span>
            {selectedEvidence?.verified && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <CheckCircle2 size={10} /> Verified
              </span>
            )}
          </div>
          {selectedEvidence && (
            <div className="p-5 space-y-3">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Workflow Type</div>
                <div className="text-[13px] font-medium">{selectedEvidence.type}</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Description</div>
                <div className="text-[12px] font-normal text-neutral-200">{selectedEvidence.label}</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Cryptographic Hash</div>
                <div className="font-mono text-[10px] text-emerald-400 break-all bg-neutral-950 border border-neutral-800 rounded p-2">
                  {selectedEvidence.hash}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Block</div>
                  <div className="font-mono text-[12px] text-white">#{selectedEvidence.block}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Committed</div>
                  <div className="font-mono text-[11px] text-white">{selectedEvidence.timestamp}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-800 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={11} /> Merkle proof valid
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={11} /> Non-repudiation signature intact
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 size={11} /> Tied to ratee workflow log
                </div>
              </div>
              <button className="w-full mt-2 py-2 bg-emerald-500 text-white rounded-lg text-[11px] font-medium hover:bg-emerald-400 cursor-pointer flex items-center justify-center gap-1">
                <ExternalLink size={11} /> Open on Ledger Explorer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== WELLNESS LANDING ====================
