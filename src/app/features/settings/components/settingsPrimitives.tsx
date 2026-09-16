import type { ReactNode } from 'react';
import { AttentionBox, Heading, Loader, Text } from '@vibe/core';

export type Result = { tone: 'success' | 'error'; text: string } | null;

export const inputClass = 'h-11 rounded-lg border-neutral-200 bg-white px-3.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
}

export function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ResultMessage({ result }: { result: Result }) {
  if (!result) return null;
  return <AttentionBox animate={false} className="mt-3" compact text={result.text} type={result.tone === 'success' ? 'positive' : 'negative'} />;
}

export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-neutral-200 bg-white dark:border-slate-800 dark:bg-slate-950 ${className}`}>{children}</section>;
}

export function SectionHeading({ icon, eyebrow, title, description }: { icon: ReactNode; eyebrow: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{icon}</div>
      <div>
        <Text className="uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400" type="text3" weight="medium">{eyebrow}</Text>
        <Heading className="mt-0.5 text-neutral-900 dark:text-slate-100" type="h2" weight="medium">{title}</Heading>
        <Text className="mt-1 leading-5 text-neutral-500 dark:text-slate-400" type="text3">{description}</Text>
      </div>
    </div>
  );
}

export function IdentityItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 py-3.5 sm:px-4 first:pl-0 last:pr-0">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-slate-900 dark:text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-neutral-400 dark:text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-[12px] font-medium text-neutral-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export function SettingsLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center">
      <div aria-live="polite" className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400" role="status">
        <Loader size="small" />
        <Text type="text3">{label}</Text>
      </div>
    </div>
  );
}
