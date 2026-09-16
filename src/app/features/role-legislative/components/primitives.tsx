import React from "react";
import { Button, Heading, Label, Text } from "@vibe/core";

export const pillMap: Record<string, React.ComponentProps<typeof Label>["color"]> = {
  "First Reading": "bright-blue",
  "Committee Level": "purple",
  "Second Reading": "working_orange",
  "Third Reading": "dark-orange",
  "Mayoral Approval": "aquamarine",
  Favorable: "positive",
  Archived: "dark",
  Pending: "working_orange",
  Passed: "positive",
  Vetoed: "negative",
  Signed: "positive",
  "Enacted (Lapsed)": "bright-blue",
  Active: "positive",
  Repealed: "negative",
  Amended: "working_orange",
  "In Session": "bright-blue",
  Referred: "purple",
  "Under Review": "working_orange",
  YES: "positive",
  NO: "negative",
  ABSTAIN: "dark",
};

export function Pill({ status }: { status: string }) {
  return (
    <span aria-label={`Status: ${status}`} role="status"><Label color={pillMap[status] || "dark"} text={status} /></span>
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

export function HashDisplay({ hash, full }: { hash: string; full?: boolean }) {
  return (
    <span className={`font-['JetBrains_Mono',_'Fira_Code',_monospace] text-[11px] tracking-tight text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100`}>
      {full ? hash : `${hash.slice(0, 6)}…${hash.slice(-4)}`}
    </span>
  );
}

// ==================== MOCK DATA ====================

export const stableHashes = [
  "0x9A3F1D7E5B0C8A2D6F4E1B9C7A3D5F8E0B2C4A6D8F1E3B5C7A9D0F2E4B6C8",
  "0xB5E2C8D0F4A6E1B3C9D7F5A0E2B8C4D6F1A3E5B7C0D9F2A4E6B8C1D3F5A7E9",
  "0xC7D4A1E8B5F2C0D6A3E9B7F4C1D8A5E2B0F6C3D9A7E4B1F8C5D2A0E6B3F9C4",
  "0xD0F6A8E3B5C1D7A4E0B2F9C6D3A8E5B1F7C4D0A6E2B8F5C1D9A3E7B4F0C6D2",
  "0xE4B9C2D5F8A1E3B6C0D4F7A9E2B5C8D1F3A6E0B4C7D9F2A5E8B1C3D6F0A4E7",
  "0xF1A5E8B2C6D0F3A7E1B4C9D5F8A2E6B0C3D7F1A4E9B5C2D8F0A3E7B6C1D4F9",
];
