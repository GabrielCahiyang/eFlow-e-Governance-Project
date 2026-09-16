import { useMemo, useState, useEffect } from "react";
import { Loader } from "@vibe/core";
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
  const [tab, setTab] = useState<ProjectCommandTab>(initialTool || initialTab);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (initialTool) {
      setTab(initialTool);
    }
  }, [initialTool]);

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
    setTab(nextTab);
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
          className="flex min-h-[300px] items-center justify-center gap-2 text-sm text-neutral-500"
          aria-live="polite"
        >
          <Loader size="medium" /> Loading project workspace…
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
