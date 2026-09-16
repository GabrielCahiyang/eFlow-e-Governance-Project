import React, { useState } from "react";
import { CheckCircle2, FileText, MessageSquare, Receipt, Undo2 } from "lucide-react";
import { Btn, PageHeader, Stat, peso } from "./primitives";

export function EqBlock({ label, value, tone, big }: { label: string; value: number; tone: "neutral" | "good" | "warn" | "bad" | "blue"; big?: boolean }) {
  const tones = {
    neutral: { bg: "bg-white border-neutral-200", txt: "text-neutral-900" },
    good: { bg: "bg-emerald-50 border-emerald-200", txt: "text-emerald-700" },
    warn: { bg: "bg-amber-50 border-amber-200", txt: "text-amber-700" },
    bad: { bg: "bg-red-50 border-red-200", txt: "text-red-700" },
    blue: { bg: "bg-blue-50 border-blue-200", txt: "text-blue-700" },
  };
  const t = tones[tone];
  return (
    <div className={`flex-1 rounded-xl border-2 ${t.bg} p-4`}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">{label}</div>
      <div className={`${big ? "text-[26px]" : "text-[20px]"} font-semibold tabular-nums ${t.txt} mt-0.5`}>{peso(value)}</div>
    </div>
  );
}

export function OpChar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center text-[28px] font-semibold text-neutral-400 w-4 flex-shrink-0">{children}</div>;
}

// ==================== 13.2.A — UNSPENT FUNDS (ESCALATION KANBAN) ====================

type UnspentCard = {
  id: string;
  employee: string;
  dept: string;
  amount: number;
  daysSinceVerify: number;
  col: "verified" | "viber" | "memo" | "deducted";
};

const UNSPENT_INITIAL: UnspentCard[] = [
  { id: "u1", employee: "Engr. R. Mapalad", dept: "Engineering", amount: 1500, daysSinceVerify: 3, col: "verified" },
  { id: "u2", employee: "J. Pomentil", dept: "Social Welfare", amount: 1600, daysSinceVerify: 7, col: "verified" },
  { id: "u3", employee: "K. Abarquez", dept: "GSO", amount: 820, daysSinceVerify: 12, col: "verified" },
  { id: "u4", employee: "Dr. M. Sabando", dept: "Health", amount: 6550, daysSinceVerify: 17, col: "viber" },
  { id: "u5", employee: "L. Bascon", dept: "LEDIPO", amount: 5220, daysSinceVerify: 22, col: "viber" },
  { id: "u6", employee: "T. Salcedo", dept: "Tourism", amount: 940, daysSinceVerify: 24, col: "viber" },
  { id: "u7", employee: "R. Alcantara", dept: "Environment", amount: 3800, daysSinceVerify: 38, col: "memo" },
  { id: "u8", employee: "O. Perez", dept: "CENRO", amount: 1200, daysSinceVerify: 42, col: "memo" },
  { id: "u9", employee: "G. Hingpit", dept: "City Planning", amount: 2100, daysSinceVerify: 58, col: "deducted" },
];

const UNSPENT_COLS: { id: UnspentCard["col"]; label: string; tint: string; chip: string; icon: React.ReactNode; hint: string }[] = [
  { id: "verified", label: "Receipts Verified · Owes Change", tint: "bg-neutral-50", chip: "bg-neutral-200 text-neutral-700", icon: <Receipt size={12} />, hint: "0–14 days: grace period" },
  { id: "viber", label: "Viber Warning Sent", tint: "bg-amber-50", chip: "bg-amber-100 text-amber-700", icon: <MessageSquare size={12} />, hint: "15–29 days: auto-nudged" },
  { id: "memo", label: "HR Memo · Payroll Deduction Drafted", tint: "bg-orange-50", chip: "bg-orange-100 text-orange-700", icon: <FileText size={12} />, hint: "30+ days: BPA-drafted memo" },
  { id: "deducted", label: "Deducted from Payroll", tint: "bg-emerald-50", chip: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={12} />, hint: "resolved · funds returned" },
];

export function UnspentFunds() {
  const [cards, setCards] = useState(UNSPENT_INITIAL);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function onDrop(target: UnspentCard["col"]) {
    if (!draggedId) return;
    setCards((cs) => cs.map((c) => (c.id === draggedId ? { ...c, col: target } : c)));
    setDraggedId(null);
  }

  const totalOutstanding = cards.filter((c) => c.col !== "deducted").reduce((s, c) => s + c.amount, 0);

  return (
    <div>
      <PageHeader
        title="Outstanding Treasury Returns"
        subtitle="BPA auto-escalates: 15d Viber → 30d HR memo → 45d payroll deduction"
        actions={
          <>
            <Btn icon={<MessageSquare size={14} />} label="Broadcast Viber Reminder" />
            <Btn icon={<Undo2 size={14} />} label="Issue Salary Deduction Notice" variant="primary" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Outstanding" value={peso(totalOutstanding)} trend={`${cards.filter((c) => c.col !== "deducted").length} employees`} tone="warn" />
        <Stat label="At HR-Memo Stage" value={String(cards.filter((c) => c.col === "memo").length)} trend="30+ days overdue" tone="bad" />
        <Stat label="Auto-Recovered · 30d" value="₱ 48,220" trend="via payroll deduction" tone="good" />
        <Stat label="Viber Nudges Sent" value="142" trend="BPA-automated" />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {UNSPENT_COLS.map((col) => {
          const items = cards.filter((c) => c.col === col.id);
          const sum = items.reduce((s, c) => s + c.amount, 0);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className={`${col.tint} rounded-xl p-3 min-h-[520px]`}
            >
              <div className="flex items-center gap-2 px-1 mb-1">
                <span className="text-neutral-700">{col.icon}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${col.chip}`}>{items.length}</span>
                <span className="text-[12px] font-medium text-neutral-800 leading-tight">{col.label}</span>
              </div>
              <div className="text-[10px] px-1 text-neutral-500 mb-1">{col.hint}</div>
              <div className="text-[10px] px-1 text-neutral-700 font-medium mb-3 tabular-nums">{peso(sum)} outstanding</div>
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
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-neutral-900">{c.employee}</span>
                      <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${
                        c.daysSinceVerify >= 30 ? "bg-red-100 text-red-700" : c.daysSinceVerify >= 15 ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {c.daysSinceVerify}d
                      </span>
                    </div>
                    <div className="text-[10px] font-normal text-neutral-500">{c.dept}</div>
                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[9px] text-neutral-400 font-mono">spare change</span>
                      <span className="text-[14px] font-semibold text-neutral-900 tabular-nums">{peso(c.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 13.2.B — CRYPTOGRAPHIC VERIFICATION (SEAL) ====================
