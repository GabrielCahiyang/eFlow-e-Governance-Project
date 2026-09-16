import * as React from "react";
import { Button, Heading, Label, Text } from "@vibe/core";
import { Check } from "@vibe/icons";

const pillMap: Record<string, string> = {
  "Working on it": "bg-amber-100 text-amber-700",
  Stuck: "bg-red-100 text-red-700",
  Done: "bg-emerald-100 text-emerald-700",
  "Not Started": "bg-neutral-100 text-neutral-500",
  "In Review": "bg-blue-100 text-blue-700",
  Passed: "bg-emerald-100 text-emerald-700",
  Fined: "bg-red-100 text-red-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Expired: "bg-red-100 text-red-700",
  Active: "bg-emerald-100 text-emerald-700",
  Critical: "bg-red-100 text-red-700",
  Warning: "bg-amber-100 text-amber-700",
  Healthy: "bg-emerald-100 text-emerald-700",
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
  Cleared: "bg-emerald-100 text-emerald-700",
  "On Track": "bg-emerald-100 text-emerald-700",
  Delayed: "bg-red-100 text-red-700",
  "At Risk": "bg-amber-100 text-amber-700",
  Normal: "bg-emerald-100 text-emerald-700",
  "Near Full": "bg-red-100 text-red-700",
  Moderate: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Upcoming: "bg-blue-100 text-blue-700",
};

export function Pill({ status }: { status: string }) {
  const style = pillMap[status] || "";
  const color = style.includes("red") ? "negative" : style.includes("amber") ? "working_orange" : style.includes("emerald") ? "positive" : style.includes("blue") ? "bright-blue" : "dark";
  return <span aria-label={`Status: ${status}`} role="status"><Label color={color} text={status} /></span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Heading className="text-neutral-900" type="h1" weight="medium">{title}</Heading>
        <Text className="mt-1 text-neutral-500" type="text2">{subtitle || "Project Transform · Ormoc City LGU"}</Text>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}

export function Btn({ icon, label, variant = "secondary" }: { icon: React.ReactNode; label: string; variant?: "primary" | "secondary" | "danger" | "success" }) {
  const styles = { primary: { kind: "primary", color: "primary" }, secondary: { kind: "secondary", color: "primary" }, danger: { kind: "secondary", color: "negative" }, success: { kind: "primary", color: "positive" } } as const;
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

// Blockchain seal checkmark
export function BlockchainSeal({ sealed }: { sealed: boolean }) {
  if (!sealed) return <span className="text-[10px] text-neutral-400 font-normal">Pending</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
      <Check size={12} className="text-emerald-500" />
      <span className="text-[10px] font-medium text-emerald-700">Sealed</span>
    </span>
  );
}

// ==================== 3.1A INFRASTRUCTURE (₱450M) ====================
