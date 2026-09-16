// ─── ReportsWorkspace (shared) ───────────────────────────────────
// Departmental / system-wide reporting with data tables + visual summaries and
// CSV/PDF export of the EXACT filtered rows. Scope-parameterized: Dept Head is
// limited to their subtree; Super Admin gets the cross-department filter.

import { useMemo, useState } from "react";
import { Tab, TabList, TabsContext } from "@vibe/core";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import {
  BarChart3,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useTasks } from "../../hooks/useFirebaseData";
import { useOrgs } from "../../hooks/useSupabaseData";
import type { Task } from "../../services/taskService";
import { isOverdue } from "../../services/taskSelectors";
import { exportCsv, exportPdf, type ReportColumn } from "../../services/reportService";
import {
  PageHeader,
  StatCard,
  Card,
  WSelect,
  ExportMenu,
  SectionEmpty,
  LoadingState,
  formatDate,
} from "./primitives";
import { TaskStatusBadge } from "./StatusBadges";
import type { ProjectScope } from "./ProjectsWorkspace";
import { motionDuration, motionEase } from "../../shared/motion";

const STATUS_COLORS: Record<string, string> = {
  pending_assignment: "#a3a3a3",
  todo: "#94a3b8",
  in_progress: "#3b82f6",
  for_review: "#f59e0b",
  completed: "#10b981",
};

type ReportView = "status" | "productivity" | "workload" | "overdue";

export function ReportsWorkspace({ scope, eyebrow }: { scope: ProjectScope; eyebrow: string }) {
  const { tasks, loading } = useTasks();
  const { orgs } = useOrgs();
  const [view, setView] = useState<ReportView>("status");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("30");

  const scoped = useMemo(() => {
    let rows = tasks.filter((t) => !t.archivedAt);
    if (!scope.isSuperAdmin && scope.scopedOrgIds.length > 0) {
      rows = rows.filter((t) => !t.orgId || scope.scopedOrgIds.includes(t.orgId));
    }
    if (scope.isSuperAdmin && orgFilter !== "all") rows = rows.filter((t) => t.orgId === orgFilter);
    if (statusFilter !== "all") rows = rows.filter((t) => t.status === statusFilter);
    const days = Number(period);
    if (days > 0) {
      const since = Date.now() - days * 86400000;
      rows = rows.filter((t) => t.createdAt >= since || t.updatedAt >= since);
    }
    return rows;
  }, [tasks, scope, orgFilter, statusFilter, period]);

  // ─ Aggregates ─
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    scoped.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count, label: status.replace("_", " ") }));
  }, [scoped]);

  const overdueTasks = useMemo(() => scoped.filter(isOverdue), [scoped]);
  const completed = scoped.filter((t) => t.status === "completed").length;
  const completionRate = scoped.length ? Math.round((completed / scoped.length) * 100) : 0;

  const productivity = useMemo(() => {
    const map = new Map<string, { name: string; completed: number; active: number; overdue: number; review: number }>();
    scoped.forEach((t) => {
      if (!t.assigneeId) return;
      const row = map.get(t.assigneeId) || { name: t.assigneeName || "Unknown", completed: 0, active: 0, overdue: 0, review: 0 };
      if (t.status === "completed") row.completed++;
      else row.active++;
      if (isOverdue(t)) row.overdue++;
      if (t.status === "for_review") row.review++;
      map.set(t.assigneeId, row);
    });
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.completed - a.completed);
  }, [scoped]);

  const filtersMeta = {
    Department: scope.isSuperAdmin ? (orgFilter === "all" ? "All" : orgs.find((o) => o.id === orgFilter)?.name || orgFilter) : "My department",
    Status: statusFilter === "all" ? "All" : statusFilter,
    Period: period === "0" ? "All time" : `Last ${period} days`,
  };

  // ─ Export column sets per view ─
  const doExport = (kind: "csv" | "pdf") => {
    if (view === "productivity" || view === "workload") {
      const cols: ReportColumn<typeof productivity[number]>[] = [
        { key: "name", header: "Employee", value: (r) => r.name },
        { key: "completed", header: "Completed", value: (r) => r.completed },
        { key: "active", header: "Active", value: (r) => r.active },
        { key: "review", header: "In review", value: (r) => r.review },
        { key: "overdue", header: "Overdue", value: (r) => r.overdue },
      ];
      const meta = { title: "Employee productivity", subtitle: eyebrow, filters: filtersMeta, totals: { Employees: productivity.length, "Total completed": completed } };
      kind === "csv" ? exportCsv(productivity, cols, meta) : exportPdf(productivity, cols, meta);
    } else {
      const rows = view === "overdue" ? overdueTasks : scoped;
      const cols: ReportColumn<Task>[] = [
        { key: "title", header: "Task", value: (t) => t.title },
        { key: "assignee", header: "Assignee", value: (t) => t.assigneeName || "Unassigned" },
        { key: "status", header: "Status", value: (t) => t.status },
        { key: "priority", header: "Priority", value: (t) => t.priority || "medium" },
        { key: "deadline", header: "Deadline", value: (t) => formatDate(t.deadline || t.dueDate) },
        { key: "percent", header: "% complete", value: (t) => t.percentComplete ?? 0 },
      ];
      const meta = {
        title: view === "overdue" ? "Overdue tasks" : "Task status report",
        subtitle: eyebrow,
        filters: filtersMeta,
        totals: { Tasks: rows.length, Completed: completed, "Completion rate": `${completionRate}%`, Overdue: overdueTasks.length },
      };
      kind === "csv" ? exportCsv(rows, cols, meta) : exportPdf(rows, cols, meta);
    }
  };

  if (loading) return <div className="p-8"><LoadingState label="Building reports…" /></div>;

  const orgOptions = [{ value: "all", label: "All departments" }, ...orgs.map((o) => ({ value: o.id, label: o.name }))];
  const maxCompleted = Math.max(1, ...productivity.map((p) => p.completed + p.active));
  const reportTabs = [
    { id: "status", label: "Status & aging", icon: <BarChart3 size={13} /> },
    { id: "productivity", label: "Productivity", icon: <Users size={13} /> },
    { id: "workload", label: "Workload", icon: <TrendingUp size={13} /> },
    { id: "overdue", label: "Overdue & risk", icon: <AlertTriangle size={13} /> },
  ] as const;
  const activeReportTab = reportTabs.findIndex((tab) => tab.id === view);

  return (
    <div className="p-6 sm:p-8 min-h-full">
      <PageHeader
        eyebrow={eyebrow}
        title="Reports"
        subtitle="Analyze progress, productivity, and risk — then export exactly what you see."
        actions={<ExportMenu onCsv={() => doExport("csv")} onPdf={() => doExport("pdf")} disabled={scoped.length === 0} />}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {scope.isSuperAdmin && <WSelect value={orgFilter} onChange={setOrgFilter} options={orgOptions} />}
        <WSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "pending_assignment", label: "Unassigned" },
            { value: "todo", label: "To Do" },
            { value: "in_progress", label: "In Progress" },
            { value: "for_review", label: "For Review" },
            { value: "completed", label: "Completed" },
          ]}
        />
        <WSelect
          value={period}
          onChange={setPeriod}
          options={[
            { value: "7", label: "Last 7 days" },
            { value: "30", label: "Last 30 days" },
            { value: "90", label: "Last 90 days" },
            { value: "0", label: "All time" },
          ]}
        />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Tasks in scope" value={scoped.length} icon={<BarChart3 size={15} />} />
        <StatCard label="Completion rate" value={`${completionRate}%`} tone="good" hint={`${completed} completed`} icon={<TrendingUp size={15} />} />
        <StatCard label="Overdue" value={overdueTasks.length} tone={overdueTasks.length ? "bad" : "good"} icon={<AlertTriangle size={15} />} />
        <StatCard label="Employees" value={productivity.length} icon={<Users size={15} />} />
      </div>

      {/* View tabs */}
      <TabsContext activeTabId={activeReportTab} className="mb-4" id="reports-workspace-tabs">
        <TabList id="reports-workspace-tab-list">
          {reportTabs.map((tab) => (
            <Tab active={view === tab.id} id={tab.id} key={tab.id} onClick={() => setView(tab.id)}>
              <span className="inline-flex items-center gap-1.5">{tab.icon}{tab.label}</span>
            </Tab>
          ))}
        </TabList>
      </TabsContext>

      <AnimatePresence initial={false} mode="wait">
        <m.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={`${view}-${scoped.length === 0 ? "empty" : "content"}`}
          transition={{ duration: motionDuration.productiveMedium, ease: motionEase.state }}
        >
      {scoped.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl">
          <SectionEmpty icon={<BarChart3 size={30} />} title="No data for these filters" description="Adjust the filters to see report data." />
        </div>
      ) : view === "status" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Tasks by status" className="lg:col-span-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusCounts.map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status] || "#94a3b8"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Distribution">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusCounts} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {statusCounts.map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status] || "#94a3b8"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {statusCounts.map((s) => (
                <div key={s.status} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] || "#94a3b8" }} />
                  <span className="text-neutral-600 capitalize flex-1">{s.label}</span>
                  <span className="text-neutral-900 font-medium tabular-nums">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : view === "overdue" ? (
        <Card bodyClassName="p-0" title={`Overdue tasks (${overdueTasks.length})`}>
          {overdueTasks.length === 0 ? (
            <SectionEmpty icon={<Clock size={28} />} title="Nothing overdue" description="All tasks in scope are on schedule." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    {["Task", "Assignee", "Status", "Deadline", "Days late"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-neutral-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overdueTasks.map((t) => {
                    const late = Math.floor((Date.now() - new Date(t.deadline || t.dueDate!).getTime()) / 86400000);
                    return (
                      <tr key={t.id} className="border-b border-neutral-50">
                        <td className="px-4 py-2.5 text-[12px] font-medium text-neutral-900">{t.title}</td>
                        <td className="px-4 py-2.5 text-[12px] text-neutral-600">{t.assigneeName || "Unassigned"}</td>
                        <td className="px-4 py-2.5"><TaskStatusBadge status={t.status} size="sm" /></td>
                        <td className="px-4 py-2.5 text-[12px] text-neutral-600">{formatDate(t.deadline || t.dueDate)}</td>
                        <td className="px-4 py-2.5"><span className="text-[12px] font-semibold text-red-600 tabular-nums">{late}d</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        // productivity + workload
        <Card bodyClassName="p-0" title={view === "workload" ? "Workload distribution" : "Employee productivity"}>
          {productivity.length === 0 ? (
            <SectionEmpty icon={<Users size={28} />} title="No assigned work" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    {["Employee", "Completed", "Active", "In review", "Overdue", "Load"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-neutral-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productivity.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-50">
                      <td className="px-4 py-2.5 text-[12px] font-medium text-neutral-900">{p.name}</td>
                      <td className="px-4 py-2.5 text-[12px] text-emerald-600 font-medium tabular-nums">{p.completed}</td>
                      <td className="px-4 py-2.5 text-[12px] text-neutral-700 tabular-nums">{p.active}</td>
                      <td className="px-4 py-2.5 text-[12px] text-amber-600 tabular-nums">{p.review}</td>
                      <td className="px-4 py-2.5 text-[12px] text-red-600 tabular-nums">{p.overdue}</td>
                      <td className="px-4 py-2.5 w-[200px]">
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-800 rounded-full" style={{ width: `${((p.completed + p.active) / maxCompleted) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
