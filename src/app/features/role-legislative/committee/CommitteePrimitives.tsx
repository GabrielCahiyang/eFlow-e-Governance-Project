import * as React from "react";
import { Button, Heading, Label, Text } from "@vibe/core";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Heading className="text-neutral-900" type="h1" weight="medium">{title}</Heading>
        <Text className="mt-1 text-neutral-500" type="text2">{subtitle || "Sangguniang Panlungsod · Ormoc City"}</Text>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}

export function Btn({ icon, label, variant = "secondary", onClick, disabled }: { icon: React.ReactNode; label: string; variant?: "primary" | "secondary" | "danger" | "success"; onClick?: () => void; disabled?: boolean }) {
  const styles = { primary: { kind: "primary", color: "primary" }, secondary: { kind: "secondary", color: "primary" }, danger: { kind: "secondary", color: "negative" }, success: { kind: "primary", color: "positive" } } as const;
  return <Button color={styles[variant].color} disabled={disabled} kind={styles[variant].kind} onClick={() => onClick?.()} size="small"><span aria-hidden="true" className="inline-flex">{icon}</span>{label}</Button>;
}

export function Pill({ status, className }: { status: string; className?: string }) {
  const pillMap: Record<string, React.ComponentProps<typeof Label>["color"]> = {
    Healthy: "positive", "At Risk": "working_orange", Overdue: "negative", Active: "positive",
    Pending: "working_orange", Draft: "bright-blue", Adopted: "positive", "Under Review": "purple",
    Available: "positive", Insufficient: "negative",
  };
  return <span aria-label={`Status: ${status}`} className={className} role="status"><Label color={pillMap[status] || "dark"} text={status} /></span>;
}

export function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: "up" | "down" | "flat" }) {
  return (
    <section aria-label={label} className="min-w-[155px] flex-1 rounded-xl border border-neutral-200 bg-white p-4">
      <Text className="uppercase tracking-[0.08em] text-neutral-500" type="text3" weight="medium">{label}</Text>
      <p className="eflow-tabular mt-1 text-[24px] font-semibold text-neutral-900">{value}</p>
      {sub && (
        <p className={`mt-1 text-[11px] ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-neutral-500"}`}>
          {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{sub}
        </p>
      )}
    </section>
  );
}

// ==================== 8.1.A PROPOSED MUNICIPAL BUDGET ====================
