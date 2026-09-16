// ─── Department Head Dashboard (command center) ──────────────────
// Driven entirely by scoped organization data — no sample cards. Every metric
// reconciles with the underlying filtered tasks and is click-through to the
// source list. Project health, overdue work, pending reviews, workload by
// employee, completion rate, and upcoming deadlines.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Inbox,
  CheckCircle2,
  Users,
  CalendarClock,
  FolderKanban,
  TrendingUp,
  Flame,
} from "lucide-react";
import { useTasks } from "../../hooks/useFirebaseData";
import { useProjectsData, useScopedOrgIds } from "../../hooks/useSupabaseData";
import { useAuth } from "../../contexts/AuthContext";
import type { Task } from "../../services/taskService";
import {
  isArchived,
  isOverdue,
  isUnassigned,
  parseDueDate,
  projectStats,
} from "../../services/taskSelectors";
import {
  PageHeader,
  StatCard,
  Card,
  WSelect,
  LoadingState,
  SectionEmpty,
  ProgressBar,
  relativeDays,
} from "../workflow/primitives";
import {
  HEALTH_META,
  type Health,
  InitialsAvatar,
} from "../workflow/StatusBadges";
import { TaskDetailDrawer } from "../workflow/TaskDetailDrawer";
import { TaskRow } from "./DeptHeadDashboardTaskRow";
import { getHeadWorkspaceLabel } from "../../shared/roles";

type FocusList = null | "overdue" | "review" | "unassigned" | "completed";

export function DeptHeadDashboard() {
  const { userProfile } = useAuth();
  const workspaceLabel = getHeadWorkspaceLabel(userProfile?.role);
  const { tasks, loading: tasksLoading } = useTasks();
  const { projects } = useProjectsData();
  const { scopedOrgIds, isSuperAdmin } = useScopedOrgIds();

  const [horizon, setHorizon] = useState("14");
  const [period, setPeriod] = useState("30");
  const [focus, setFocus] = useState<FocusList>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  // Scope tasks to the head's org subtree (super admin sees everything).
  const scoped = useMemo(() => {
    const active = tasks.filter((t) => !isArchived(t));
    if (isSuperAdmin || scopedOrgIds.length === 0) return active;
    return active.filter((t) => !t.orgId || scopedOrgIds.includes(t.orgId));
  }, [tasks, scopedOrgIds, isSuperAdmin]);

  const scopedProjects = useMemo(() => {
    const active = projects.filter((p) => p.status !== "archived");
    if (isSuperAdmin || scopedOrgIds.length === 0) return active;
    return active.filter((p) => !p.orgId || scopedOrgIds.includes(p.orgId));
  }, [projects, scopedOrgIds, isSuperAdmin]);

  // ─ Metrics ─
  const overdue = useMemo(() => scoped.filter(isOverdue), [scoped]);
  const forReview = useMemo(() => scoped.filter((t) => t.status === "for_review"), [scoped]);
  const unassigned = useMemo(
    () => scoped.filter(isUnassigned),
    [scoped],
  );

  const completionWindow = useMemo(() => {
    const days = Number(period);
    const since = Date.now() - days * 86400000;
    const inWindow = scoped.filter((t) => t.updatedAt >= since);
    const completed = inWindow.filter((t) => t.status === "completed");
    const rate = inWindow.length ? Math.round((completed.length / inWindow.length) * 100) : 0;
    return { completed: completed.length, total: inWindow.length, rate };
  }, [scoped, period]);

  const completedList = useMemo(
    () => scoped.filter((t) => t.status === "completed").sort((a, b) => b.updatedAt - a.updatedAt),
    [scoped],
  );

  // Project health buckets (derive per-project from linked tasks + fall back to
  // proposal-hierarchy grouping when there are no operational project rows yet).
  const healthBuckets = useMemo(() => {
    const buckets: Record<Health, number> = {
      on_track: 0,
      at_risk: 0,
      delayed: 0,
      complete: 0,
      no_data: 0,
    };
    if (scopedProjects.length > 0) {
      scopedProjects.forEach((p) => {
        buckets[projectStats(p, scoped).health]++;
      });
    }
    return buckets;
  }, [scopedProjects, scoped]);

  // Workload by employee (scoped active, non-completed tasks per assignee).
  const workload = useMemo(() => {
    const map = new Map<string, { name: string; active: number; overdue: number; review: number }>();
    scoped.forEach((t) => {
      if (!t.assigneeId) return;
      if (t.status === "completed") return;
      const row = map.get(t.assigneeId) || { name: t.assigneeName || "Unknown", active: 0, overdue: 0, review: 0 };
      row.active++;
      if (isOverdue(t)) row.overdue++;
      if (t.status === "for_review") row.review++;
      map.set(t.assigneeId, row);
    });
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.active - a.active);
  }, [scoped]);

  const maxLoad = Math.max(1, ...workload.map((w) => w.active));

  // Upcoming deadlines within horizon.
  const upcoming = useMemo(() => {
    const days = Number(horizon);
    const until = Date.now() + days * 86400000;
    return scoped
      .filter((t) => {
        const due = parseDueDate(t);
        return due !== null && t.status !== "completed" && due <= until;
      })
      .sort((a, b) => (parseDueDate(a) ?? 0) - (parseDueDate(b) ?? 0));
  }, [scoped, horizon]);

  const urgentFive = useMemo(
    () => [...scoped]
      .filter((t) => t.status !== "completed" && parseDueDate(t) !== null)
      .sort((a, b) => (parseDueDate(a) ?? 0) - (parseDueDate(b) ?? 0))
      .slice(0, 5),
    [scoped],
  );

  const focusRows: Task[] =
    focus === "overdue" ? overdue :
    focus === "review" ? forReview :
    focus === "unassigned" ? unassigned :
    focus === "completed" ? completedList :
    [];

  if (tasksLoading) return <div className="p-8"><LoadingState label="Loading your department…" /></div>;

  const totalHealth = Object.values(healthBuckets).reduce((s, n) => s + n, 0);

  return (
    <div className="p-6 sm:p-8 min-h-full">
      <PageHeader
        eyebrow={isSuperAdmin ? "Administration · Command Center" : `${workspaceLabel} · Command Center`}
        title={`Good day, ${(userProfile?.full_name || "there").split(" ")[0]}`}
        subtitle="Your department at a glance — manage by exception."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-neutral-400">Completion window</span>
            <WSelect
              value={period}
              onChange={setPeriod}
              options={[
                { value: "7", label: "Last 7 days" },
                { value: "30", label: "Last 30 days" },
                { value: "90", label: "Last 90 days" },
              ]}
            />
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Overdue tasks"
          value={overdue.length}
          hint={overdue.length ? "Needs attention now" : "Nothing overdue"}
          tone={overdue.length ? "bad" : "good"}
          icon={<AlertTriangle size={15} />}
          onClick={() => setFocus(focus === "overdue" ? null : "overdue")}
          active={focus === "overdue"}
        />
        <StatCard
          label="Pending review"
          value={forReview.length}
          hint="Awaiting your decision"
          tone={forReview.length ? "warn" : "neutral"}
          icon={<Inbox size={15} />}
          onClick={() => setFocus(focus === "review" ? null : "review")}
          active={focus === "review"}
        />
        <StatCard
          label="Unassigned"
          value={unassigned.length}
          hint="No owner yet"
          tone={unassigned.length ? "info" : "neutral"}
          icon={<Users size={15} />}
          onClick={() => setFocus(focus === "unassigned" ? null : "unassigned")}
          active={focus === "unassigned"}
        />
        <StatCard
          label={`Completion · ${period}d`}
          value={`${completionWindow.rate}%`}
          hint={`${completionWindow.completed}/${completionWindow.total} tasks`}
          tone="good"
          icon={<TrendingUp size={15} />}
          onClick={() => setFocus(focus === "completed" ? null : "completed")}
          active={focus === "completed"}
        />
      </div>

      {/* Focus list (drill-down from a KPI) */}
      {focus && (
        <Card
          className="mb-4"
          title={
            focus === "overdue" ? `Overdue tasks (${overdue.length})` :
            focus === "review" ? `Awaiting review (${forReview.length})` :
            focus === "unassigned" ? `Unassigned tasks (${unassigned.length})` :
            `Recently completed (${completedList.length})`
          }
          right={
            <button onClick={() => setFocus(null)} className="text-[11.5px] font-medium text-neutral-500 hover:text-neutral-900">
              Close
            </button>
          }
          bodyClassName="p-0"
        >
          {focusRows.length === 0 ? (
            <SectionEmpty icon={<CheckCircle2 size={28} />} title="All clear" description="Nothing in this list right now." />
          ) : (
            <div className="divide-y divide-neutral-100 max-h-[360px] overflow-y-auto">
              {focusRows.slice(0, 40).map((t) => (
                <TaskRow key={t.id} task={t} onOpen={() => setOpenTask(t)} />
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Project health */}
          <Card title="Project health" subtitle={`${totalHealth} active project(s) in scope`}>
            {totalHealth === 0 ? (
              <SectionEmpty
                icon={<FolderKanban size={26} />}
                title="No projects yet"
                description="Create a project to start tracking health here."
              />
            ) : (
              <div className="space-y-3">
                <div className="flex h-3 rounded-full overflow-hidden bg-neutral-100">
                  {(Object.keys(healthBuckets) as Health[]).map((h) =>
                    healthBuckets[h] ? (
                      <div
                        key={h}
                        title={`${HEALTH_META[h].label}: ${healthBuckets[h]}`}
                        style={{ width: `${(healthBuckets[h] / totalHealth) * 100}%`, background: HEALTH_META[h].color }}
                      />
                    ) : null,
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(healthBuckets) as Health[]).map((h) => (
                    <div key={h} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: HEALTH_META[h].color }} />
                      <span className="text-[12px] font-normal text-neutral-600">{HEALTH_META[h].label}</span>
                      <span className="text-[12px] font-semibold text-neutral-900 tabular-nums ml-auto">{healthBuckets[h]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Most urgent */}
          <Card title="Most urgent" subtitle="The five nearest deadlines still open" bodyClassName="p-0">
            {urgentFive.length === 0 ? (
              <SectionEmpty icon={<CalendarClock size={26} />} title="No open deadlines" />
            ) : (
              <div className="divide-y divide-neutral-100">
                {urgentFive.map((t) => (
                  <TaskRow key={t.id} task={t} onOpen={() => setOpenTask(t)} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Workload */}
          <Card title="Workload by employee" subtitle="Active tasks per person">
            {workload.length === 0 ? (
              <SectionEmpty icon={<Users size={24} />} title="No assigned work" />
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {workload.slice(0, 12).map((w) => {
                  const heavy = w.active >= 6;
                  return (
                    <div key={w.id}>
                      <div className="flex items-center gap-2 mb-1">
                        <InitialsAvatar name={w.name} size={22} />
                        <span className="text-[12px] font-medium text-neutral-800 truncate flex-1">{w.name}</span>
                        {heavy && <Flame size={12} className="text-red-500" />}
                        <span className="text-[11.5px] font-semibold text-neutral-900 tabular-nums">{w.active}</span>
                      </div>
                      <ProgressBar value={(w.active / maxLoad) * 100} tone={heavy ? "bad" : w.overdue ? "warn" : "neutral"} />
                      {(w.overdue > 0 || w.review > 0) && (
                        <div className="flex gap-3 mt-1 text-[10px] font-normal text-neutral-400">
                          {w.overdue > 0 && <span className="text-red-500">{w.overdue} overdue</span>}
                          {w.review > 0 && <span className="text-amber-500">{w.review} in review</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {unassigned.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center gap-2 text-[11.5px] font-normal text-neutral-500">
                    <Users size={12} /> {unassigned.length} unassigned task(s) need an owner
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Upcoming deadlines */}
          <Card
            title="Upcoming deadlines"
            right={
              <WSelect
                value={horizon}
                onChange={setHorizon}
                options={[
                  { value: "7", label: "7 days" },
                  { value: "14", label: "14 days" },
                  { value: "30", label: "30 days" },
                ]}
                className="h-[28px] text-[11px]"
              />
            }
            bodyClassName="p-0"
          >
            {upcoming.length === 0 ? (
              <SectionEmpty icon={<CalendarClock size={24} />} title="Nothing due soon" />
            ) : (
              <div className="divide-y divide-neutral-100 max-h-[260px] overflow-y-auto">
                {upcoming.slice(0, 20).map((t) => {
                  const rel = relativeDays(t.deadline || t.dueDate);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setOpenTask(t)}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-neutral-50"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rel.overdue ? "bg-red-500" : "bg-amber-500"}`} />
                      <span className="text-[12px] font-normal text-neutral-800 truncate flex-1">{t.title}</span>
                      <span className={`text-[10.5px] font-medium tabular-nums ${rel.overdue ? "text-red-600" : "text-neutral-400"}`}>
                        {rel.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <TaskDetailDrawer
        task={openTask}
        onClose={() => setOpenTask(null)}
        canReview
        onChanged={() => { /* realtime subscription refreshes lists */ }}
      />
    </div>
  );
}
