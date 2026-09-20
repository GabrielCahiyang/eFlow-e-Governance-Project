import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck2,
  FolderKanban,
  History,
  Rows3,
  Users,
} from "lucide-react";
import { TaskDetailDrawer } from "../../tasks";
import { useDepartmentTeamAnalytics } from "../../team-management";
import {
  Card,
  ExportMenu,
  LoadingState,
  PageHeader,
  SearchInput,
  SectionEmpty,
  StatCard,
  WSelect,
  formatDate,
} from "../../../components/workflow/primitives";
import { exportCsv, exportPdf, type ReportColumn } from "../../../services/reportService";
import { DEPARTMENT_REPORTS } from "../constants";
import { buildDepartmentReportRows, filterDepartmentReportRows } from "../selectors/departmentReportSelectors";
import type { DepartmentReportKind, DepartmentReportRow } from "../types";
import { DepartmentReportTable } from "./DepartmentReportTable";
import { ManagementBriefPanel } from "./ManagementBriefPanel";
import { buildMonthlyContributionLeaderboard, ContributionSummaryCard } from "../../productivity";

const DAY = 86_400_000;

const reportIcons: Record<DepartmentReportKind, ReactNode> = {
  operations: <Rows3 size={15} />,
  projects: <FolderKanban size={15} />,
  contributions: <Users size={15} />,
  reviews: <ClipboardCheck size={15} />,
  evidence: <FileCheck2 size={15} />,
  risks: <AlertTriangle size={15} />,
  lifecycle: <History size={15} />,
};

const dateInputTime = (value: string, end = false): number | undefined => {
  if (!value) return undefined;
  const time = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00"}`).getTime();
  return Number.isFinite(time) ? time : undefined;
};

export function DeptHeadReportsWorkspace() {
  const analytics = useDepartmentTeamAnalytics();
  const [kind, setKind] = useState<DepartmentReportKind>("operations");
  const [search, setSearch] = useState("");
  const [personId, setPersonId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("0");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>();

  const definition = DEPARTMENT_REPORTS.find((report) => report.id === kind) || DEPARTMENT_REPORTS[0];
  const allRows = useMemo(
    () => buildDepartmentReportRows(kind, analytics.tasks, analytics.projects, analytics.deptEmployees, analytics.facts, analytics.attention),
    [analytics.attention, analytics.deptEmployees, analytics.facts, analytics.projects, analytics.tasks, kind],
  );
  const dateBounds = useMemo(() => {
    if (period === "custom") return { from: dateInputTime(fromDate), to: dateInputTime(toDate, true) };
    const days = Number(period);
    return { from: days > 0 ? Date.now() - days * DAY : undefined, to: undefined };
  }, [fromDate, period, toDate]);
  const rows = useMemo(() => filterDepartmentReportRows(allRows, {
    search,
    personId,
    projectId,
    status,
    ...dateBounds,
  }), [allRows, dateBounds, personId, projectId, search, status]);
  const statuses = useMemo(() => Array.from(new Set(allRows.map((row) => row.status))).sort(), [allRows]);
  const selectedTask = analytics.tasks.find((task) => task.id === selectedTaskId) || null;
  const uniquePeople = new Set(rows.map((row) => row.personId).filter(Boolean)).size;
  const uniqueProjects = new Set(rows.map((row) => row.projectId).filter(Boolean)).size;
  const urgent = rows.filter((row) => ["critical", "high", "overdue", "blocked"].includes(row.priority.toLowerCase()) || ["overdue", "changes requested"].includes(row.status.toLowerCase())).length;
  const contributionRows = useMemo(
    () => buildMonthlyContributionLeaderboard(analytics.deptEmployees, analytics.tasks, analytics.facts),
    [analytics.deptEmployees, analytics.facts, analytics.tasks],
  );

  const changeKind = (next: DepartmentReportKind) => {
    setKind(next);
    setStatus("all");
    setSelectedTaskId(undefined);
  };

  const exportRows = (format: "csv" | "pdf") => {
    const columns: ReportColumn<DepartmentReportRow>[] = [
      { key: "title", header: "Work item", value: (row) => row.title },
      { key: "parent", header: "Parent / transition", value: (row) => row.parent },
      { key: "person", header: "Person", value: (row) => row.person },
      { key: "role", header: "Role", value: (row) => row.role },
      { key: "project", header: "Project", value: (row) => row.project },
      { key: "status", header: "Status", value: (row) => row.status },
      { key: "priority", header: "Priority / severity", value: (row) => row.priority },
      { key: "progress", header: "Progress", value: (row) => typeof row.progress === "number" ? `${row.progress}%` : "—" },
      { key: "metric", header: "Signal", value: (row) => row.metric },
      { key: "event", header: "Event date", value: (row) => row.eventAt ? formatDate(row.eventAt) : "—" },
      { key: "due", header: "Due date", value: (row) => row.dueAt ? formatDate(row.dueAt) : "—" },
      { key: "detail", header: "Detail", value: (row) => row.detail },
    ];
    const filters = {
      Person: personId === "all" ? "All people" : analytics.deptEmployees.find((employee) => employee.id === personId)?.name || personId,
      Project: projectId === "all" ? "All projects" : analytics.projects.find((project) => project.id === projectId)?.title || projectId,
      Status: status === "all" ? "All statuses" : status,
      Period: period === "custom" ? `${fromDate || "Beginning"} to ${toDate || "Today"}` : period === "0" ? "All time" : `Last ${period} days`,
      Search: search || "None",
    };
    const meta = {
      title: definition.title,
      subtitle: "eFlow · Department Head reports",
      filters,
      totals: { "Visible rows": rows.length, People: uniquePeople, Projects: uniqueProjects, "Urgent signals": urgent },
    };
    format === "csv" ? exportCsv(rows, columns, meta) : exportPdf(rows, columns, meta);
  };

  if (analytics.loading) return <div className="p-8"><LoadingState label="Building live department reports…" /></div>;

  return (
    <div className="min-h-full min-w-0 bg-neutral-50/30 p-3 sm:p-8">
      <PageHeader
        eyebrow="Dept. Head · Reports"
        title="Reports"
        subtitle="Operational, contribution, review, evidence, and risk reports from one permission-scoped source of truth."
        actions={(
          <>
            <ManagementBriefPanel title={definition.title} rows={rows} />
            <ExportMenu onCsv={() => exportRows("csv")} onPdf={() => exportRows("pdf")} disabled={rows.length === 0} />
          </>
        )}
      />

      {analytics.error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[11.5px] text-red-700">Some workflow facts could not be loaded: {analytics.error}</div>}

      <div className="mb-4"><ContributionSummaryCard rows={contributionRows} title="Department contribution this month" /></div>

      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-4">
        <Card title="Report library" subtitle="Select a live operational lens" bodyClassName="p-2 h-fit">
          <div className="space-y-1">
            {DEPARTMENT_REPORTS.map((report) => (
              <button
                type="button"
                key={report.id}
                onClick={() => changeKind(report.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${kind === report.id ? "bg-neutral-900 text-white" : "hover:bg-neutral-50 text-neutral-700"}`}
              >
                <div className="flex items-center gap-2 text-[11.5px] font-medium">{reportIcons[report.id]} {report.title}</div>
                <p className={`text-[9.5px] leading-4 mt-1 ${kind === report.id ? "text-neutral-300" : "text-neutral-400"}`}>{report.description}</p>
              </button>
            ))}
          </div>
        </Card>

        <div className="min-w-0">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Visible rows" value={rows.length} icon={<BarChart3 size={14} />} />
            <StatCard label="People represented" value={uniquePeople} icon={<Users size={14} />} />
            <StatCard label="Projects represented" value={uniqueProjects} icon={<BriefcaseBusiness size={14} />} />
            <StatCard label="Urgent signals" value={urgent} tone={urgent ? "bad" : "good"} icon={<AlertTriangle size={14} />} />
          </div>

          <Card title={definition.title} subtitle={definition.description} bodyClassName="p-0">
            <div className="p-3 border-b border-neutral-100 space-y-2">
              <div className="flex flex-wrap gap-2">
                <SearchInput value={search} onChange={setSearch} placeholder="Search visible report fields…" className="min-w-[230px] flex-1" />
                <WSelect value={personId} onChange={setPersonId} options={[{ value: "all", label: "All people" }, ...analytics.deptEmployees.map((employee) => ({ value: employee.id, label: employee.name }))]} />
                <WSelect value={projectId} onChange={setProjectId} options={[{ value: "all", label: "All projects" }, ...analytics.projects.map((project) => ({ value: project.id, label: project.title }))]} />
                <WSelect value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, ...statuses.map((value) => ({ value, label: value.replace(/_/g, " ") }))]} />
                <WSelect value={period} onChange={setPeriod} options={[
                  { value: "7", label: "Last 7 days" },
                  { value: "30", label: "Last 30 days" },
                  { value: "90", label: "Last 90 days" },
                  { value: "0", label: "All time" },
                  { value: "custom", label: "Custom dates" },
                ]} />
              </div>
              {period === "custom" && (
                <div className="flex items-center gap-2 text-[10.5px] text-neutral-500">
                  <label className="flex items-center gap-1.5">From <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-[32px] border border-neutral-200 rounded-lg px-2 text-[11px]" /></label>
                  <label className="flex items-center gap-1.5">To <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-[32px] border border-neutral-200 rounded-lg px-2 text-[11px]" /></label>
                </div>
              )}
            </div>
            {rows.length ? (
              <DepartmentReportTable rows={rows} onOpenTask={setSelectedTaskId} />
            ) : (
              <SectionEmpty icon={<BarChart3 size={28} />} title="No report rows match" description="Change the people, project, status, date, or search filters." />
            )}
          </Card>
        </div>
      </div>

      <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTaskId(undefined)} canReview canPostProgress={false} />
    </div>
  );
}
