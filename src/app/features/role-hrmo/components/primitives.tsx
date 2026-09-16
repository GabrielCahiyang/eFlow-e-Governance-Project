import type { ReactNode } from "react";
import { Button, Heading, Text } from "@vibe/core";
import { Team } from "@vibe/icons";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><Text className="mb-1 flex items-center gap-2 uppercase tracking-[0.08em] text-neutral-500" type="text3" weight="medium"><Team aria-hidden="true" size={14} /> HRMO · Command Center</Text><Heading className="text-neutral-900" type="h1" weight="medium">{title}</Heading><Text className="mt-1 text-neutral-500" type="text2">{subtitle || "Human Resource Management Office · Ormoc City"}</Text></div><div className="flex items-center gap-2">{actions}</div></header>;
}

export function Btn({ icon, label, variant = "secondary", onClick }: { icon?: ReactNode; label: string; variant?: "primary" | "secondary" | "danger" | "success"; onClick?: () => void }) {
  const styles = { primary: { kind: "primary", color: "primary" }, secondary: { kind: "secondary", color: "primary" }, danger: { kind: "secondary", color: "negative" }, success: { kind: "primary", color: "positive" } } as const;
  return <Button color={styles[variant].color} kind={styles[variant].kind} onClick={() => onClick?.()} size="small">{icon && <span aria-hidden="true" className="inline-flex">{icon}</span>}{label}</Button>;
}

export function Stat({ label, value, trend, tone = "neutral" }: { label: string; value: string; trend?: string; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const tones = { neutral: "text-neutral-900", good: "text-emerald-600", warn: "text-amber-600", bad: "text-red-600" };
  return <section aria-label={label} className="rounded-xl border border-neutral-200 bg-white p-4"><Text className="uppercase tracking-[0.08em] text-neutral-500" type="text3" weight="medium">{label}</Text><div className={`eflow-tabular mt-1 text-[24px] font-semibold ${tones[tone]}`}>{value}</div>{trend && <Text className="mt-1 text-neutral-500" type="text3">{trend}</Text>}</section>;
}
