import type { ReactNode } from "react";

export const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
export const pesoShort = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", notation: "compact", maximumFractionDigits: 1 });

export function BudgetCard({ label, value, note, icon, tone = "neutral" }: { label: string; value: string; note: string; icon: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const colors = { neutral: "bg-neutral-100 text-neutral-600", good: "bg-emerald-50 text-emerald-700", warn: "bg-amber-50 text-amber-700", bad: "bg-rose-50 text-rose-700" };
  return <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><div className="text-[12px] uppercase tracking-[0.16em] text-neutral-500">{label}</div><div className="mt-2 text-[20px] font-semibold text-neutral-950 tabular-nums">{value}</div><div className="mt-1 text-[12px] text-neutral-600">{note}</div></div><div className={`rounded-xl p-2 ${colors[tone]}`}>{icon}</div></div>
  </div>;
}

export function BudgetEmpty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center"><div className="text-[14px] font-semibold text-neutral-800">{title}</div><p className="mx-auto mt-1 max-w-lg text-[12px] leading-relaxed text-neutral-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const tone = ["approved", "settled", "locked", "released"].includes(status)
    ? "bg-emerald-50 text-emerald-700"
    : ["pending", "pending_leader_review", "pending_department_approval", "scheduled_for_release", "partially_released", "liquidation_submitted", "pending_leader_liquidation_review", "pending_department_settlement", "overdue_liquidation"].includes(status)
      ? "bg-amber-50 text-amber-700"
      : ["rejected", "changes_requested", "leader_changes_requested", "department_changes_requested", "cancelled", "expired"].includes(status)
        ? "bg-rose-50 text-rose-700"
        : "bg-neutral-100 text-neutral-600";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-medium capitalize ${tone}`}>{status.split("_").join(" ")}</span>;
}
