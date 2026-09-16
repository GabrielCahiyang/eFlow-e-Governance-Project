// ─── Dashboard Metric Card ───────────────────────────────────────
import React from "react";
import { Skeleton, Text } from "@vibe/core";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
  loading?: boolean;
}

export function MetricCard({ label, value, icon, trend, color = "#0085FF", loading }: MetricCardProps) {
  if (loading) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white p-4" aria-label={`${label} is loading`}>
        <Skeleton type="text" size="small" width={80} />
        <div className="my-3"><Skeleton type="rectangle" size="custom" width={64} height={32} /></div>
        <Skeleton type="text" size="small" width={96} />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm" aria-label={label}>
      <div className="flex items-center justify-between mb-2">
        <Text className="uppercase tracking-wider" type="text3" color="secondary" weight="medium">
          {label}
        </Text>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}10` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
        )}
      </div>
      <div className="text-[28px] font-semibold tabular-nums text-neutral-900">
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              trend.value >= 0 ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <Text
            type="text3"
            weight="medium"
            className={`${
              trend.value >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </Text>
        </div>
      )}
    </section>
  );
}

// ─── Wide Metric (inline label + value) ──────────────────────────
export function MetricCardWide({
  label,
  value,
  suffix,
  color = "#0085FF",
  loading,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  color?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <section className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-4" aria-label={`${label} is loading`}>
        <Skeleton type="rectangle" size="custom" width={80} height={40} />
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-4" aria-label={label}>
      <div className="text-[28px] font-semibold tabular-nums" style={{ color }}>
        {value}
        {suffix && <span className="text-[14px] text-neutral-400 ml-1">{suffix}</span>}
      </div>
      <Text className="mt-1 text-neutral-500" type="text3" weight="medium">{label}</Text>
    </section>
  );
}
