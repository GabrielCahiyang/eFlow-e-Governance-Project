import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@vibe/core";
import type { Organization } from "../../../../types";
import { useProfiles } from "../../../../hooks/useSupabaseData";
import { useTasks } from "../../../../hooks/useFirebaseData";
import { useToast } from "../../../../components/ui/Toast";
import { TaskDetailDrawer } from "../../../../components/workflow/TaskDetailDrawer";
import { tasksForProject } from "../../../../services/taskSelectors";
import type { Project } from "../../services/projectService";
import { useProjectCommandData } from "../../hooks/useProjectCommandData";
import { ProjectDeleteDialog } from "../ProjectDeleteDialog";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { ProjectWorkTab } from "./ProjectWorkTab";
import { ProjectTimelineView } from "./ProjectTimelineView";
import { ProjectCalendarView } from "./ProjectCalendarView";
import { ProjectTeamTab } from "./ProjectTeamTab";
import { ProjectReportsTab } from "./ProjectReportsTab";
import { ProjectReviewsTab } from "./ProjectReviewsTab";
import { ProjectActivityTab } from "./ProjectActivityTab";
import { ProjectDashboardTab } from "./ProjectDashboardTab";
import { ProjectProposalContextTab } from "./ProjectProposalContextTab";
import { ProjectGovernanceTab } from "./ProjectGovernanceTab";
import { ProjectBudgetTab } from "./ProjectBudgetTab";
import { ProjectViewTabBar } from "./ProjectViewTabBar";
import type { ProjectCommandTab } from "./types";
import "../projectsVibe.css";

export interface ProjectCommandWorkspaceProps {
  project: Project;
  initialTab?: ProjectCommandTab;
  initialTool?: "reviews" | "activity" | "reports";
  onWorkspaceTabChange?: (tab: ProjectCommandTab) => void;
  onBack: () => void;
  orgs: Organization[];
  canArchive: boolean;
  canManage: boolean;
  canDelete: boolean;
  onDeleted: () => void;
  canReviewTasks: boolean;
  canExport?: boolean;
  onOpenSourceGovernance?: (draftId: string) => void;
}

const projectTabFromUrl = (value: string | null): ProjectCommandTab | null => {
  const valid: ProjectCommandTab[] = ["overview", "tasks", "timeline", "calendar", "reports", "proposal_context", "activity", "reviews", "dashboard", "workload", "budget", "signoff", "evidence", "decisions"];
  return value && valid.includes(value as ProjectCommandTab) ? value as ProjectCommandTab : null;
};

export function ProjectCommandWorkspace({
  project,
  initialTab = "overview",
  initialTool,
  onWorkspaceTabChange,
  onBack: _onBack,
  orgs,
  canArchive: _canArchive,
  canManage,
  canDelete: _canDelete,
  onDeleted,
  canReviewTasks,
  canExport = true,
  onOpenSourceGovernance: _onOpenSourceGovernance,
}: ProjectCommandWorkspaceProps) {
  const { tasks } = useTasks();
  const { profiles } = useProfiles();
  const { toast } = useToast();
  const [tab, setTabState] = useState<ProjectCommandTab>(() => projectTabFromUrl(typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("view") : null) || initialTool || initialTab);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (initialTool) {
      setTabState(initialTool);
    }
  }, [initialTool]);

  useEffect(() => {
    const onPopState = () => {
      const next = projectTabFromUrl(new URLSearchParams(window.location.search).get("view"));
      const projectId = new URLSearchParams(window.location.search).get("project");
      if (next && (!projectId || projectId === project.id)) setTabState(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [project.id]);

  const projectTasks = useMemo(
    () => tasksForProject(tasks, project.id),
    [project.id, tasks],
  );
  const data = useProjectCommandData(project, projectTasks);
  const openTask = projectTasks.find((task) => task.id === openTaskId) || null;

  // Map legacy tab requests (plan, work, people, delivery)
  const activeTabId =
    tab === "plan" || tab === "delivery"
      ? "timeline"
      : tab === "work"
        ? "tasks"
        : tab === "people" || tab === "team"
          ? "workload"
          : tab;

  const selectTab = (nextTab: ProjectCommandTab) => {
    setTabState(nextTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = "/projects";
      url.searchParams.set("page", "Projects");
      url.searchParams.set("project", project.id);
      url.searchParams.set("view", nextTab);
      window.history.pushState({ page: "Projects", project: project.id, view: nextTab }, "", `${url.pathname}?${url.searchParams.toString()}`);
    }
    onWorkspaceTabChange?.(nextTab);
  };

  const hasBudgetData = Boolean(
    data.financial &&
      data.financial.summary &&
      data.financial.summary.approvedAmount > 0,
  );

  return (
    <div className="eflow-project-command space-y-4 font-sans">
      {/* Extensible Workspace Tab Bar (Permanent core views + optional dynamic views) */}
      <ProjectViewTabBar
        projectId={project.id}
        activeTab={activeTabId}
        onSelectTab={selectTab}
        hasProposalContext={Boolean(project.sourceCollaborationDraftId)}
        hasBudgetData={hasBudgetData}
      />

      {activeTabId === "overview" && (
        <ProjectHeader
          project={project}
          organizations={orgs}
          profiles={profiles}
          metrics={data.metrics}
        />
      )}

      {/* Main Workspace Canvas Body */}
      {data.loading ? (
        <div
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5"
          aria-live="polite"
          role="status"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <Skeleton type="text" width={230} />
              <Skeleton type="text" width={320} />
            </div>
            <Skeleton type="rectangle" size="custom" width={120} height={32} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton type="rectangle" size="custom" height={82} fullWidth />
            <Skeleton type="rectangle" size="custom" height={82} fullWidth />
            <Skeleton type="rectangle" size="custom" height={82} fullWidth />
          </div>
          <Skeleton type="rectangle" size="custom" height={260} fullWidth />
        </div>
      ) : data.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"
        >
          {data.error}
        </div>
      ) : (
        <div className="pt-1">
          {activeTabId === "overview" && (
            <ProjectOverviewTab
              data={data}
              profiles={profiles}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "tasks" && (
            <ProjectWorkTab
              data={data}
              profiles={profiles}
              canManage={canManage}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "timeline" && (
            <ProjectTimelineView
              data={data}
              profiles={profiles}
              canManage={canManage}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "calendar" && (
            <ProjectCalendarView
              data={data}
              profiles={profiles}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "reports" && (
            <ProjectReportsTab
              data={data}
              canExport={canExport}
            />
          )}
          {activeTabId === "proposal_context" && (
            <ProjectProposalContextTab
              draftId={project.sourceCollaborationDraftId || null}
              organizations={orgs}
              profiles={profiles}
            />
          )}
          {activeTabId === "activity" && (
            <ProjectActivityTab data={data} />
          )}
          {activeTabId === "reviews" && (
            <ProjectReviewsTab
              data={data}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "dashboard" && (
            <ProjectDashboardTab
              data={data}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "workload" && (
            <ProjectTeamTab
              data={data}
              profiles={profiles}
              canManage={canManage && project.status !== "archived"}
            />
          )}
          {activeTabId === "budget" && (
            <ProjectBudgetTab data={data} />
          )}
          {activeTabId === "signoff" && (
            <ProjectGovernanceTab
              data={data}
              view="signoff"
              organizations={orgs}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "evidence" && (
            <ProjectGovernanceTab
              data={data}
              view="evidence"
              organizations={orgs}
              onOpenTask={setOpenTaskId}
            />
          )}
          {activeTabId === "decisions" && (
            <ProjectGovernanceTab
              data={data}
              view="decisions"
              organizations={orgs}
              onOpenTask={setOpenTaskId}
            />
          )}
        </div>
      )}

      {/* Slide-over Task Detail Drawer */}
      <TaskDetailDrawer
        task={openTask}
        onClose={() => setOpenTaskId(null)}
        canReview={canReviewTasks}
      />

      {/* Delete Confirmation Dialog */}
      <ProjectDeleteDialog
        projectId={project.id}
        projectTitle={project.title}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          setDeleteOpen(false);
          toast(
            "Project permanently deleted. Existing tasks were retained.",
            "success",
          );
          onDeleted();
        }}
      />
    </div>
  );
}
