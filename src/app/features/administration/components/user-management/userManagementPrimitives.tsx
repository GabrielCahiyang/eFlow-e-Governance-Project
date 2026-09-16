import type { ComponentProps } from "react";
import type { UserRole } from "../../../../types";
import { Label, ProgressBar } from "@vibe/core";
import { getRoleLabel } from "../../../../shared/roles";

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "dept_head", label: "Head" },
  { value: "assistant_head", label: "Assistant Head" },
  { value: "super_admin", label: "Super Admin" },
];

// ─── Status / Role badges ────────────────────────────────────────
export function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, ComponentProps<typeof Label>["color"]> = {
    super_admin: "negative",
    dept_head: "purple",
    assistant_head: "indigo",
    employee: "positive",
  };
  return <Label color={colors[role] || "dark"} text={getRoleLabel(role)} />;
}

export function StatusBadge({ active }: { active: boolean }) {
  return <span aria-label={`Account status: ${active ? "active" : "inactive"}`} role="status"><Label color={active ? "positive" : "dark"} text={active ? "active" : "inactive"} /></span>;
}

export function WorkloadBar({ value }: { value: number }) {
  const style = value >= 80 ? "negative" : value >= 60 ? "warning" : "positive";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16"><ProgressBar aria-label={`${value}% workload`} animated={false} barStyle={style} fullWidth size="small" value={Math.min(100, value)} /></div>
      <span className="eflow-tabular text-[11px] text-neutral-600">{value}%</span>
    </div>
  );
}

// ─── Create User Modal ───────────────────────────────────────────
