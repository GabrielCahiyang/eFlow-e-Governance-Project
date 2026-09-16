import React from "react";
import { Button, Heading, Label, Text } from "@vibe/core";

export const pillColors: Record<string, React.ComponentProps<typeof Label>["color"]> = {
  "LIVE SESSION ACTIVE": "negative", Completed: "positive", Pending: "working_orange",
  Broadcasting: "positive", "Up Next": "bright-blue", Paused: "egg_yolk", Deferred: "working_orange",
  Done: "positive", Skipped: "dark", Published: "positive", Draft: "working_orange",
  "AI Generated": "bright-blue", Finalized: "positive", "Unfinished Business": "dark-orange",
};

export function Pill({ status }: { status: string }) {
  return (
    <span aria-label={`Status: ${status}`} role="status"><Label color={pillColors[status] || "dark"} text={status} /></span>
  );
}

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

export function Btn({ icon, label, variant = "secondary" }: { icon: React.ReactNode; label: string; variant?: "primary" | "secondary" | "danger" | "success" | "live" }) {
  const styles = { primary: { kind: "primary", color: "primary" }, secondary: { kind: "secondary", color: "primary" }, danger: { kind: "primary", color: "negative" }, success: { kind: "primary", color: "positive" }, live: { kind: "secondary", color: "negative" } } as const;
  return <Button color={styles[variant].color} kind={styles[variant].kind} size="small"><span aria-hidden="true" className="inline-flex">{icon}</span>{label}</Button>;
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

// ==================== BROADCAST HISTORY ====================
