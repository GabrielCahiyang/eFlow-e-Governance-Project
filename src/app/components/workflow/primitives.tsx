// Shared workflow composition contracts. These keep the existing public API
// while delegating controls, states, typography, and progress to Vibe.

import {
  Button,
  Dropdown,
  EmptyState,
  Heading,
  Loader,
  ProgressBar as VibeProgressBar,
  Search as VibeSearch,
  Text,
} from "@vibe/core";
import { Download, PDF, Warning } from "@vibe/icons";
import React from "react";

// ─── PageHeader ──────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <Text className="mb-1 uppercase tracking-[0.08em] text-neutral-500" type="text3" weight="medium">
            {eyebrow}
          </Text>
        )}
        <Heading className="leading-tight text-neutral-900" type="h1" weight="medium">
          {title}
        </Heading>
        {subtitle && (
          <Text className="mt-1 max-w-3xl text-neutral-500" type="text2">
            {subtitle}
          </Text>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </header>
  );
}

// ─── Button ──────────────────────────────────────────────────────
export function WButton({
  icon,
  children,
  variant = "secondary",
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const presentation = {
    primary: { kind: "primary", color: "primary" },
    secondary: { kind: "secondary", color: "primary" },
    danger: { kind: "secondary", color: "negative" },
    success: { kind: "primary", color: "positive" },
    ghost: { kind: "tertiary", color: "primary" },
  } as const;
  const selected = presentation[variant];
  return (
    <Button
      className={`eflow-workflow-button ${className}`}
      color={selected.color}
      disabled={disabled}
      kind={selected.kind}
      onClick={() => onClick?.()}
      size="small"
      type={type}
    >
      {icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>}
      {children}
    </Button>
  );
}

function StatCardContent({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: "neutral" | "good" | "warn" | "bad" | "info";
  icon?: React.ReactNode;
}) {
  const toneMap: Record<typeof tone, string> = {
    neutral: "text-neutral-900",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-red-700",
    info: "text-blue-700",
  };
  const iconTone: Record<typeof tone, string> = {
    neutral: "bg-neutral-100 text-neutral-600",
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
  };
  return <>
    <div className="flex items-start justify-between gap-3">
      <Text className="uppercase tracking-[0.08em] text-neutral-500" type="text3" weight="medium">{label}</Text>
      {icon && <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-lg ${iconTone[tone]}`}>{icon}</span>}
    </div>
    <div className={`eflow-tabular mt-1 text-2xl font-semibold ${toneMap[tone]}`}>{value}</div>
    {hint && <Text className="mt-1 text-neutral-500" type="text3">{hint}</Text>}
  </>;
}

// ─── StatCard ────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  onClick,
  active,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const classes = `w-full rounded-xl border bg-white p-4 text-left transition-[border-color,box-shadow] duration-100 ${
    active ? "border-blue-500 ring-1 ring-blue-500/15" : "border-neutral-200"
  }`;
  const content = <StatCardContent icon={icon} hint={hint} label={label} tone={tone} value={value} />;
  return onClick ? (
    <button
      aria-pressed={active}
      type="button"
      onClick={onClick}
      className={`${classes} cursor-pointer hover:border-neutral-300 hover:shadow-sm`}
    >
      {content}
    </button>
  ) : (
    <section aria-label={label} className={classes}>{content}</section>
  );
}

// ─── Card ────────────────────────────────────────────────────────
export function Card({
  title,
  subtitle,
  right,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-xl border border-neutral-200 bg-white ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <div>
            {title && (
              <Heading className="text-neutral-900" type="h3" weight="medium">{title}</Heading>
            )}
            {subtitle && (
              <Text className="mt-0.5 text-neutral-500" type="text3">{subtitle}</Text>
            )}
          </div>
          {right}
        </div>
      )}
      <div className={bodyClassName || "p-4"}>{children}</div>
    </section>
  );
}

// ─── SearchInput ─────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <VibeSearch
      className={className}
      clearIconLabel="Clear search"
      inputAriaLabel={placeholder}
      onChange={onChange}
      onClear={() => onChange("")}
      placeholder={placeholder}
      showClearIcon
      size="small"
      value={value}
    />
  );
}

// ─── Select ──────────────────────────────────────────────────────
export function WSelect({
  value,
  onChange,
  options,
  className = "",
  ariaLabel = "Filter options",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  const selected = options.find((option) => option.value === value);
  return (
    <Dropdown
      aria-label={ariaLabel}
      className={`eflow-workflow-select ${className}`}
      clearable={false}
      onChange={(option) => onChange(String(option.value))}
      options={options}
      size="small"
      value={selected}
    />
  );
}

// ─── FilterBar ───────────────────────────────────────────────────
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {children}
    </div>
  );
}

// ─── ExportMenu ──────────────────────────────────────────────────
// Consistent CSV/PDF export cluster. Callers wire the two handlers to
// reportService.exportCsv / exportPdf with their filtered rows.
export function ExportMenu({
  onCsv,
  onPdf,
  disabled,
}: {
  onCsv: () => void;
  onPdf: () => void;
  disabled?: boolean;
}) {
  return (
    <div aria-label="Export report" className="inline-flex items-center gap-1" role="group">
      <Button color="primary" disabled={disabled} kind="secondary" leftIcon={PDF} onClick={onPdf} size="small">PDF</Button>
      <Button color="primary" disabled={disabled} kind="secondary" leftIcon={Download} onClick={onCsv} size="small">CSV</Button>
    </div>
  );
}

// ─── Section states ──────────────────────────────────────────────
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-500" role="status">
      <Loader size="medium" />
      <Text type="text2">{label}</Text>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div aria-live="assertive" className="flex flex-col items-center justify-center gap-4 py-16 text-center" role="alert">
      <EmptyState
        description={message || "We couldn't load this data. Please try again."}
        title="Something went wrong"
        visual={<Warning aria-hidden="true" size={32} />}
      />
      {onRetry && <WButton onClick={onRetry}>Retry</WButton>}
    </div>
  );
}

export function SectionEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <EmptyState
        description={description || title}
        layout="compact"
        title={description ? title : undefined}
        visual={icon && <span aria-hidden="true" className="text-neutral-400">{icon}</span>}
      />
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────
export function ProgressBar({ value, tone = "neutral" }: { value: number; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const map = {
    neutral: "primary",
    good: "positive",
    warn: "warning",
    bad: "negative",
  } as const;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <VibeProgressBar
      aria-label={`${Math.round(pct)}% complete`}
      animated={false}
      barStyle={map[tone]}
      fullWidth
      max={100}
      min={0}
      size="small"
      value={pct}
    />
  );
}

// ─── Formatting helpers ──────────────────────────────────────────
export function formatDate(d?: string | number | null): string {
  if (!d) return "—";
  if (typeof d === "string" && /month|phase|week/i.test(d)) return d;
  const date = typeof d === "number" ? new Date(d) : new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function relativeDays(d?: string | number | null): { label: string; overdue: boolean } {
  if (!d) return { label: "No deadline", overdue: false };
  if (typeof d === "string" && /month|phase|week/i.test(d)) return { label: d, overdue: false };
  const date = typeof d === "number" ? new Date(d) : new Date(d);
  if (isNaN(date.getTime())) return { label: "No deadline", overdue: false };
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, overdue: true };
  if (days === 0) return { label: "Due today", overdue: false };
  if (days === 1) return { label: "Due tomorrow", overdue: false };
  return { label: `${days}d left`, overdue: false };
}
