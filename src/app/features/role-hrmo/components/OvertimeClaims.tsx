import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, FileCheck, MapPin, Shield, User, XCircle } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type OTClaim = {
  id: number;
  employee: string;
  dept: string;
  date: string;
  hoursClaimed: number;
  gpsLocations: { time: string; location: string; valid: boolean }[];
  tasksCompleted: { time: string; task: string }[];
  verdict: "clean" | "suspicious" | "invalid";
};

const OT_CLAIMS: OTClaim[] = [
  {
    id: 1,
    employee: "Arnel Dela Cruz",
    dept: "Engineering",
    date: "2026-04-19",
    hoursClaimed: 4,
    gpsLocations: [
      { time: "18:12", location: "City Hall, Engineering Office", valid: true },
      { time: "19:45", location: "City Hall, Engineering Office", valid: true },
      { time: "21:30", location: "City Hall, Engineering Office", valid: true },
    ],
    tasksCompleted: [
      { time: "18:40", task: "Site Permit #4482 approved" },
      { time: "19:22", task: "Drainage report finalized" },
      { time: "20:55", task: "3 inspection logs filed" },
    ],
    verdict: "clean",
  },
  {
    id: 2,
    employee: "Juanito Pomentil",
    dept: "Social Welfare",
    date: "2026-04-18",
    hoursClaimed: 4,
    gpsLocations: [
      { time: "18:05", location: "Brgy. Cogon field", valid: true },
      { time: "19:30", location: "Home · District 2", valid: false },
      { time: "21:15", location: "Home · District 2", valid: false },
    ],
    tasksCompleted: [
      { time: "18:22", task: "1 case note submitted" },
    ],
    verdict: "invalid",
  },
  {
    id: 3,
    employee: "Lynnette Bascon",
    dept: "LEDIPO",
    date: "2026-04-17",
    hoursClaimed: 3,
    gpsLocations: [
      { time: "17:45", location: "City Hall, LEDIPO Office", valid: true },
      { time: "19:10", location: "City Hall, LEDIPO Office", valid: true },
    ],
    tasksCompleted: [
      { time: "18:02", task: "Investor brief drafted" },
    ],
    verdict: "suspicious",
  },
];

const verdictStyle: Record<string, { ring: string; chip: string; label: string; icon: React.ReactNode }> = {
  clean: { ring: "border-emerald-200 bg-emerald-50/40", chip: "bg-emerald-100 text-emerald-700", label: "Clean — GPS & tasks match", icon: <CheckCircle2 size={12} /> },
  suspicious: { ring: "border-amber-200 bg-amber-50/40", chip: "bg-amber-100 text-amber-700", label: "Suspicious — partial task proof", icon: <AlertTriangle size={12} /> },
  invalid: { ring: "border-red-300 bg-red-50/40", chip: "bg-red-100 text-red-700", label: "Invalid — GPS off-site, no tasks", icon: <XCircle size={12} /> },
};

export function OvertimeClaims() {
  const [selected, setSelected] = useState<OTClaim>(OT_CLAIMS[1]);
  return (
    <div>
      <PageHeader
        title="Overtime Claim Validation"
        subtitle="Split-screen proof — the system checks GPS and task completion so HR doesn't have to guess"
        actions={<Btn icon={<FileCheck size={14} />} label="Export Approved" />}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Submitted · 7d" value="142" trend="claims received" />
        <Stat label="Auto-Cleared" value="118" trend="GPS + task matched" tone="good" />
        <Stat label="Flagged Red" value="9" trend="requires HR review" tone="bad" />
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-4">
        {/* Claim queue */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Validation Queue
          </div>
          {OT_CLAIMS.map((c) => {
            const v = verdictStyle[c.verdict];
            const active = selected.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors ${active ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
              >
                <div className={`text-[12px] font-medium ${active ? "text-white" : "text-neutral-900"}`}>{c.employee}</div>
                <div className={`text-[10px] font-normal ${active ? "text-neutral-300" : "text-neutral-500"} mt-0.5`}>
                  {c.date} · {c.hoursClaimed}h claimed
                </div>
                <span className={`inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${v.chip}`}>
                  {v.icon} {c.verdict}
                </span>
              </button>
            );
          })}
        </div>

        {/* Split-screen proof */}
        <div className={`rounded-xl border-2 ${verdictStyle[selected.verdict].ring} overflow-hidden`}>
          <div className="bg-white px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Claim #{selected.id.toString().padStart(5, "0")}
              </div>
              <div className="text-[16px] font-semibold text-neutral-900 mt-0.5">
                {selected.employee} · {selected.dept}
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium ${verdictStyle[selected.verdict].chip}`}>
              {verdictStyle[selected.verdict].icon} {verdictStyle[selected.verdict].label}
            </span>
          </div>

          <div className="grid grid-cols-2">
            {/* Left: Employee claim */}
            <div className="bg-white p-5 border-r border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-neutral-500" />
                <span className="text-[12px] font-medium text-neutral-700">Employee Claim</span>
              </div>
              <div className="space-y-3 text-[12px] font-normal">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Date</div>
                  <div className="text-neutral-900">{selected.date}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Hours claimed</div>
                  <div className="text-[24px] font-semibold text-neutral-900">{selected.hoursClaimed}h</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Reason</div>
                  <div className="text-neutral-700">Urgent project deliverables · backlog processing</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">Self-attested window</div>
                  <div className="text-neutral-700">18:00 — 22:00</div>
                </div>
              </div>
            </div>

            {/* Right: System proof */}
            <div className="bg-neutral-900 text-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-[12px] font-medium">System Proof</span>
              </div>
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1">
                  <MapPin size={10} /> Mobile GPS Log
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selected.gpsLocations.map((g, i) => (
                    <div key={i} className={`flex items-center gap-2 ${g.valid ? "text-emerald-400" : "text-red-400"}`}>
                      <span className="text-neutral-500">[{g.time}]</span>
                      <span>{g.valid ? "✓" : "✗"}</span>
                      <span>{g.location}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Task Completion Timestamps
                </div>
                {selected.tasksCompleted.length === 0 ? (
                  <div className="text-red-400 text-[11px] font-mono">No tasks moved to "Done" during window.</div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[11px] text-emerald-400">
                    {selected.tasksCompleted.map((t, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-neutral-500">[{t.time}]</span>
                        <span className="flex-1">{t.task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white px-5 py-3 border-t border-neutral-200 flex gap-2 justify-end">
            <Btn icon={<XCircle size={13} />} label="Reject Claim" variant="danger" />
            <Btn icon={<CheckCircle2 size={13} />} label="Approve" variant="primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 10.2.D — PAYROLL PRE-AUDIT ====================
