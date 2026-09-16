import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Filter, Link2, Search, Shield, XCircle, Zap } from "lucide-react";
import { Btn, PageHeader, Stat, peso, pesoShort } from "./primitives";

type ORS = {
  id: string;
  requester: string;
  dept: string;
  purpose: string;
  amount: number;
  bucketId: string;
  bucketName: string;
  bucketBalance: number;
  submitted: string;
  supplier: string;
  prNumber: string;
};

const ORS_QUEUE: ORS[] = [
  { id: "ors-2026-0482", requester: "Engr. R. Mapalad", dept: "Engineering", purpose: "Cement procurement — 2,000 bags for Eco-Park Phase 2 retaining wall", amount: 2_000_000, bucketId: "facilities", bucketName: "Eco-Park · Facilities", bucketBalance: 5_000_000, submitted: "2026-04-20 09:14", supplier: "Oriental Cement Corp.", prNumber: "PR-2026-0891" },
  { id: "ors-2026-0483", requester: "Dr. M. Sabando", dept: "Health Office", purpose: "Medical supplies Q2 restock — BHS provincial network", amount: 3_800_000, bucketId: "health-ops", bucketName: "Health Services · Operations", bucketBalance: 12_400_000, submitted: "2026-04-20 10:38", supplier: "MedEast Supply Inc.", prNumber: "PR-2026-0894" },
  { id: "ors-2026-0484", requester: "Arch. P. Odal", dept: "Planning", purpose: "GIS software licenses and surveyor stipend", amount: 1_200_000, bucketId: "ict", bucketName: "City Hall ICT · Software", bucketBalance: 4_800_000, submitted: "2026-04-20 13:22", supplier: "ESRI Philippines", prNumber: "PR-2026-0896" },
  { id: "ors-2026-0485", requester: "L. Bascon", dept: "LEDIPO", purpose: "Tourism campaign print run and billboard rental", amount: 4_500_000, bucketId: "marketing", bucketName: "Tourism · Marketing", bucketBalance: 1_000_000, submitted: "2026-04-20 14:51", supplier: "Visayan Print Works", prNumber: "PR-2026-0898" },
  { id: "ors-2026-0486", requester: "F. Lariosa", dept: "Legal", purpose: "Legal opinion honoraria and research fees", amount: 380_000, bucketId: "legal", bucketName: "Legal · Professional Services", bucketBalance: 2_100_000, submitted: "2026-04-20 15:17", supplier: "Dela Rama & Partners", prNumber: "PR-2026-0900" },
];

export function ObligationRequests() {
  const [selected, setSelected] = useState<ORS>(ORS_QUEUE[0]);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const canApprove = selected.amount <= selected.bucketBalance;
  const postBalance = selected.bucketBalance - selected.amount;
  const deficitAmount = selected.amount - selected.bucketBalance;

  return (
    <div>
      <PageHeader
        title="Pending Obligation Requests"
        subtitle="Deficit spending is software-impossible · BPA cross-references every bucket in real-time"
        actions={
          <>
            <Btn icon={<Filter size={14} />} label="Filter: All Departments" />
            <Btn icon={<Search size={14} />} label="Search" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Pending ORS" value={String(ORS_QUEUE.length - confirmed.size)} trend="awaiting gatekeeper" />
        <Stat label="Today's Obligation Volume" value={pesoShort(ORS_QUEUE.reduce((s, o) => s + o.amount, 0))} />
        <Stat label="Blocked by BPA" value={String(ORS_QUEUE.filter((o) => o.amount > o.bucketBalance).length)} trend="insufficient bucket balance" tone="bad" />
        <Stat label="Avg Gatekeeper Time" value="0.4s" trend="vs 9.2d manual legacy" tone="good" />
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-4">
        {/* Queue */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-neutral-200 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            ORS Queue
          </div>
          {ORS_QUEUE.map((o) => {
            const active = selected.id === o.id;
            const blocked = o.amount > o.bucketBalance;
            const done = confirmed.has(o.id);
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors ${
                  active ? "bg-neutral-900 text-white" : done ? "bg-emerald-50" : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-mono text-[10px] ${active ? "text-neutral-400" : "text-neutral-400"}`}>{o.id}</span>
                  {blocked && !done && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {done && <CheckCircle2 size={11} className="text-emerald-600 ml-auto" />}
                </div>
                <div className={`text-[12px] font-medium ${active ? "text-white" : "text-neutral-900"} truncate`}>
                  {o.dept}
                </div>
                <div className={`text-[10px] font-normal mt-0.5 ${active ? "text-neutral-300" : "text-neutral-500"} truncate`}>
                  {o.purpose}
                </div>
                <div className={`text-[13px] font-semibold mt-1 tabular-nums ${active ? "text-white" : blocked ? "text-red-600" : "text-neutral-900"}`}>
                  {pesoShort(o.amount)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Split-screen review */}
        <div className={`rounded-xl border-2 overflow-hidden ${canApprove ? "border-emerald-200" : "border-red-300"}`}>
          <div className="bg-white px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-neutral-400">{selected.id}</div>
              <div className="text-[16px] font-semibold text-neutral-900 mt-0.5">
                {selected.dept} · {selected.requester}
              </div>
            </div>
            {canApprove ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium">
                <CheckCircle2 size={12} /> Math checks out
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
                <XCircle size={12} /> Bucket insufficient
              </span>
            )}
          </div>

          <div className="grid grid-cols-2">
            {/* Incoming request */}
            <div className="bg-white p-5 border-r border-neutral-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={14} className="text-neutral-500" />
                <span className="text-[12px] font-medium text-neutral-700">Incoming Request</span>
              </div>
              <div className="space-y-3 text-[12px] font-normal">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Purpose</div>
                  <div className="text-neutral-900 leading-relaxed">{selected.purpose}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Amount Requested</div>
                  <div className="text-[28px] font-semibold text-neutral-900 tabular-nums">{peso(selected.amount)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">Supplier</div>
                    <div className="text-neutral-700">{selected.supplier}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">PR Reference</div>
                    <div className="font-mono text-neutral-700 text-[11px]">{selected.prNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">Submitted</div>
                    <div className="text-neutral-700">{selected.submitted}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">Requester</div>
                    <div className="text-neutral-700">{selected.requester}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* System cross-reference */}
            <div className={`p-5 ${canApprove ? "bg-gradient-to-br from-emerald-50 to-white" : "bg-gradient-to-br from-red-50 to-white"}`}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className={canApprove ? "text-emerald-600" : "text-red-600"} />
                <span className="text-[12px] font-medium text-neutral-700">BPA Gatekeeper · Live</span>
              </div>

              <div className="space-y-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    <Link2 size={10} /> Cross-referenced bucket
                  </div>
                  <div className="text-[12px] font-medium text-neutral-900">{selected.bucketName}</div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-normal text-neutral-500">Current Balance</span>
                    <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">{peso(selected.bucketBalance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-normal text-neutral-500">Less: This ORS</span>
                    <span className="text-[13px] font-medium text-red-600 tabular-nums">−{peso(selected.amount)}</span>
                  </div>
                  <div className="border-t border-neutral-100 pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-neutral-700">Post-Obligation Balance</span>
                    <span className={`text-[15px] font-semibold tabular-nums ${canApprove ? "text-emerald-700" : "text-red-600"}`}>
                      {canApprove ? peso(postBalance) : `−${peso(deficitAmount)}`}
                    </span>
                  </div>
                </div>

                {/* Bucket utilization bar */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Bucket Utilization Preview</div>
                  <div className="h-6 rounded-md overflow-hidden bg-neutral-100 flex relative border border-neutral-200">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${Math.max(0, (postBalance / selected.bucketBalance) * 100)}%` }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${Math.min(100, (selected.amount / selected.bucketBalance) * 100)}%` }}
                    />
                    {!canApprove && <div className="flex-1 bg-red-500/40 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_4px,#991b1b_4px,#991b1b_8px)]" />}
                  </div>
                </div>

                {!canApprove && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle size={13} className="text-red-600 mt-0.5" />
                    <div className="text-[11px] font-normal text-red-700">
                      Bucket deficit of <span className="font-medium">{peso(deficitAmount)}</span>. Requester must
                      reduce amount or await the next SP ordinance for augmentation.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-3 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-[10px] font-mono text-neutral-400">
              gatekeeper::bpa-v4.2 · evaluated {new Date().toISOString().slice(11, 19)}
            </div>
            <div className="flex gap-2">
              <Btn icon={<XCircle size={13} />} label="Return to Requester" variant="secondary" />
              <Btn
                icon={<Shield size={13} />}
                label={canApprove ? (confirmed.has(selected.id) ? "Obligated ✓" : "Approve & Obligate") : "Disabled — Deficit"}
                variant={canApprove ? "success" : "secondary"}
                disabled={!canApprove || confirmed.has(selected.id)}
                onClick={() => {
                  if (canApprove) setConfirmed((s) => new Set([...s, selected.id]));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 12.2.B — FUND RELEASES (DISBURSEMENT PIPELINE) ====================
