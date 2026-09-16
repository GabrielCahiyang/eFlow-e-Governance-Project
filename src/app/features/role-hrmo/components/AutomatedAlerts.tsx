import { useState } from "react";
import { Bell, Calendar, CheckCircle2, ChevronRight, Flame, Heart, Pause, XCircle } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type Alert = {
  id: number;
  priority: "high" | "medium" | "low";
  employee: string;
  role: string;
  dept: string;
  signal: string;
  detail: string;
  ageMin: number;
  read: boolean;
};

const INITIAL_ALERTS: Alert[] = [
  { id: 1, priority: "high", employee: "Engr. Juan Dela Cruz", role: "Senior Civil Engineer", dept: "Engineering", signal: "Burnout Critical", detail: "Logged 65h this week on Eco-Park project. Task latency ↓ 40% vs baseline.", ageMin: 12, read: false },
  { id: 2, priority: "high", employee: "Arch. Patricia Odal", role: "City Planning Architect", dept: "Planning", signal: "Weeks-since-low-load: 20", detail: "No system-recognized recovery week since Nov 2025. Cognitive markers rising.", ageMin: 47, read: false },
  { id: 3, priority: "high", employee: "Dr. Maria Sabando", role: "Health Officer II", dept: "Health Office", signal: "Post-incident fatigue", detail: "Led 18h dengue outbreak response. Post-event debriefing not yet scheduled.", ageMin: 90, read: false },
  { id: 4, priority: "medium", employee: "Lynnette Bascon", role: "LEDIPO Coordinator", dept: "LEDIPO", signal: "Elevated stress markers", detail: "Stand-up sentiment analysis flags negative tone for 6 consecutive days.", ageMin: 145, read: false },
  { id: 5, priority: "medium", employee: "Carlos Villamor", role: "Treasury Analyst", dept: "Treasury", signal: "Missed lunch windows", detail: "No keyboard-idle gap > 15min in 9 consecutive workdays.", ageMin: 210, read: true },
  { id: 6, priority: "low", employee: "Rey Alcantara", role: "CENRO Inspector", dept: "Environment", signal: "Field fatigue", detail: "GPS logs show 11 barangay visits in single day. Flag for welfare check.", ageMin: 380, read: true },
];

const priorityStyles: Record<string, { bar: string; chip: string; text: string; icon: string }> = {
  high: { bar: "bg-red-500", chip: "bg-red-100 text-red-700", text: "High Priority", icon: "text-red-600" },
  medium: { bar: "bg-amber-400", chip: "bg-amber-100 text-amber-700", text: "Medium", icon: "text-amber-600" },
  low: { bar: "bg-neutral-300", chip: "bg-neutral-100 text-neutral-600", text: "Low", icon: "text-neutral-500" },
};

export function AutomatedAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [expanded, setExpanded] = useState<number | null>(1);
  const unread = alerts.filter((a) => !a.read).length;

  function bulkAck() {
    setAlerts((arr) => arr.map((a) => ({ ...a, read: true })));
  }

  return (
    <div>
      <PageHeader
        title="System-Generated Wellness Flags"
        subtitle="AI-triaged inbox · the action-arm of the Burnout Radar"
        actions={
          <>
            <Btn icon={<Bell size={14} />} label={`${unread} unread`} />
            <Btn icon={<CheckCircle2 size={14} />} label="Bulk Acknowledge" variant="primary" onClick={bulkAck} />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Active Flags" value={String(alerts.length)} trend="system-generated" />
        <Stat label="High Priority" value={String(alerts.filter((a) => a.priority === "high").length)} trend="require action ≤ 4h" tone="bad" />
        <Stat label="Avg Triage Time" value="6.2m" trend="↓ 58% since manual" tone="good" />
        <Stat label="Resolution Rate" value="94%" trend="last 30 days" tone="good" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {alerts.map((a) => {
            const s = priorityStyles[a.priority];
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} className={`${a.read ? "opacity-70" : ""} transition-opacity`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : a.id)}
                  className="w-full flex items-stretch gap-0 text-left hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className={`w-1 ${s.bar}`} />
                  <div className="flex-1 px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.chip}`}>
                        {a.priority === "high" && <Flame size={9} />}
                        {s.text}
                      </span>
                      <span className="text-[11px] font-normal text-neutral-400">{a.signal}</span>
                      {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      <span className="ml-auto text-[11px] font-normal text-neutral-400">
                        {a.ageMin < 60 ? `${a.ageMin}m ago` : `${Math.floor(a.ageMin / 60)}h ago`}
                      </span>
                    </div>
                    <div className="text-[13px] font-medium text-neutral-900">
                      <span className={s.icon}>[{s.text}]</span> {a.employee}
                      <span className="text-neutral-400 font-normal"> · {a.role} · {a.dept}</span>
                    </div>
                    <div className="text-[12px] font-normal text-neutral-600 mt-0.5">{a.detail}</div>
                  </div>
                  <div className="flex items-center px-4 text-neutral-300">
                    <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-100 flex gap-2">
                    <Btn icon={<Pause size={13} />} label="Auto-Reassign 30% Workload" />
                    <Btn icon={<Calendar size={13} />} label="Mandate 2-Day Wellness Leave" />
                    <Btn icon={<Heart size={13} />} label="Schedule 1:1 Debriefing" variant="primary" />
                    <Btn icon={<XCircle size={13} />} label="Dismiss" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== 10.1.B — WELLNESS INTERVENTIONS (KANBAN) ====================
