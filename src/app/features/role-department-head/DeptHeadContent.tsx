import { Settings } from "@carbon/icons-react";
import {
  DeptHeadTaskBoardView,
  YouAreLeadingView,
  useDeptHeadTaskBoard,
} from "../tasks";
import { SubtasksWorkspace } from "../subtasks";
import { DeptHeadProjectsWorkspace } from "../projects";
import { DeptHeadReportsWorkspace } from "../reports";
import { ForReviewInbox } from "../reviews";
import {
  assignTask,
  createTask,
  deleteTask,
  updateTask,
  verifyTask,
} from "../../services/taskService";
import { DeptHeadDashboard } from "../../components/DeptHead/DeptHeadDashboard";
import { AnnouncementCenter } from "../../components/workflow/AnnouncementCenter";
import {
  RolePageRouter,
  type RolePageSections,
} from "../../components/Layout/RolePageRouter";
import { EmployeeInsights } from "./components/EmployeeInsights";
import { TeamSupervision } from "./components/TeamSupervision";
import { useAuth } from "../../contexts/AuthContext";
import { getHeadWorkspaceLabel } from "../../shared/roles";
import { DepartmentBudgetWorkspace } from "../budget";
import { DepartmentIdentityAccessWorkspace } from "../team-management/components/supervision/DepartmentIdentityAccessWorkspace";

export function DeptHeadTaskBoard() {
  const {
    allEmployees,
    deptEmployees,
    deptTasks,
    isLoading,
    notes,
    userProfile,
  } = useDeptHeadTaskBoard();
  const workspaceLabel = getHeadWorkspaceLabel(userProfile?.role);

  return (
    <DeptHeadTaskBoardView
      loading={isLoading}
      tasks={deptTasks}
      employees={deptEmployees}
      allEmployees={allEmployees}
      employeeNotes={notes}
      role="depthead"
      departmentFilter={userProfile?.departmentId}
      currentUserId={userProfile?.uid}
      currentUserName={userProfile?.fullName || userProfile?.email || ""}
      onCreateTask={createTask}
      onAssign={assignTask}
      onVerify={(taskId, approve, feedback) =>
        verifyTask(taskId, approve, feedback, {
          id: userProfile?.uid,
          name: userProfile?.fullName || userProfile?.email || workspaceLabel,
        })
      }
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
    />
  );
}

function HeadAnnouncementCenter() {
  const { userProfile } = useAuth();
  return (
    <AnnouncementCenter
      eyebrow={`${getHeadWorkspaceLabel(userProfile?.role)} · Updates`}
    />
  );
}

// ==================== ROUTER ====================

// ── Core Workflow (Phase 1) screens ──

export const deptheadPages: RolePageSections = {
  dashboard: {
    Dashboard: DeptHeadDashboard,
  },
  projects: {
    Projects: DeptHeadProjectsWorkspace,
  },
  tasks: {
    "Task Board": DeptHeadTaskBoard,
  },
  budget: {
    "Department Budget": DepartmentBudgetWorkspace,
  },
  subtasks: {
    "My Subtasks": SubtasksWorkspace,
  },
  reviews: {
    "For Review": ForReviewInbox,
  },
  team: {
    "Team Supervision": TeamSupervision,
  },
  identity: {
    "Identity & Access": DepartmentIdentityAccessWorkspace,
  },
  intelligence: {
    "Team Intelligence": EmployeeInsights,
  },
  leading: {
    "Leading Work": YouAreLeadingView,
  },
  reports: {
    Reports: DeptHeadReportsWorkspace,
  },
  announcements: {
    Announcements: HeadAnnouncementCenter,
  },

  // Compatibility aliases for sessions opened before this navigation cleanup.
  command: {
    Dashboard: DeptHeadDashboard,
    Projects: DeptHeadProjectsWorkspace,
    "Pinned — You're Leading": YouAreLeadingView,
    "For Review": ForReviewInbox,
    Reports: DeptHeadReportsWorkspace,
    Announcements: HeadAnnouncementCenter,
  },
  leader: {
    "Pinned — You're Leading": YouAreLeadingView,
    "For Review": ForReviewInbox,
    "Team Workload": TeamSupervision,
  },
  deptportfolio: {
    "Task Board & Composer": DeptHeadTaskBoard,
    "Team Supervision": TeamSupervision,
    "Team Intelligence": EmployeeInsights,
  },
};

export const deptheadDefaultPages: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Task Board",
  budget: "Department Budget",
  subtasks: "My Subtasks",
  reviews: "For Review",
  team: "Team Supervision",
  identity: "Identity & Access",
  intelligence: "Team Intelligence",
  leading: "Leading Work",
  reports: "Reports",
  announcements: "Announcements",
  command: "Dashboard",
  leader: "Pinned — You're Leading",
  deptportfolio: "Task Board & Composer",
};

export function DeptHeadContent({
  activeSection,
  activePage,
}: {
  activeSection: string;
  activePage?: string;
}) {
  return (
    <RolePageRouter
      sections={deptheadPages}
      defaults={deptheadDefaultPages}
      activeSection={activeSection}
      activePage={activePage}
      fallback={(section) => (
        <div className="flex h-full items-center justify-center text-neutral-400">
          <div className="text-center">
            <Settings size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-normal">Section unavailable</p>
            <p className="mt-1 text-[12px]">Section: {section}</p>
          </div>
        </div>
      )}
    />
  );
}
