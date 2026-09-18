import { lazy, Suspense, type ReactNode } from "react";
import { Loader } from "@vibe/core";
import { Settings } from "@vibe/icons";
import { useAuth } from "../../contexts/AuthContext";
import { getNavigationPermission, isAdministrativeNavigationSection } from "./navigationPermissions";
import { AccessDenied } from "./AccessDenied";
import { getRoleNavigation } from "./roleNavigation";
import { isAccountingSection } from "../../components/Layout/coreWorkflowNavigation";

const SettingsContent = lazy(() => import("../../components/Settings/SettingsContent").then((module) => ({ default: module.SettingsContent })));
const SuperAdminContent = lazy(() => import("../../components/SuperAdmin/SuperAdminContent").then((module) => ({ default: module.SuperAdminContent })));
const ExecutiveContent = lazy(() => import("../role-executive").then((module) => ({ default: module.ExecutiveContent })));
const LegislativeContent = lazy(() => import("../role-legislative").then((module) => ({ default: module.LegislativeContent })));
const HRMOContent = lazy(() => import("../role-hrmo").then((module) => ({ default: module.HRMOContent })));
const FinanceContent = lazy(() => import("../role-finance").then((module) => ({ default: module.FinanceContent })));
const DeptHeadContent = lazy(() => import("../role-department-head").then((module) => ({ default: module.DeptHeadContent })));
const TeamLeaderContent = lazy(() => import("../../components/TeamLeader/TeamLeaderContent").then((module) => ({ default: module.TeamLeaderContent })));
const EmployeeContent = lazy(() => import("../../components/Employee/EmployeeContent").then((module) => ({ default: module.EmployeeContent })));
const AccountingStaffContent = lazy(() => import("../role-accounting").then((module) => ({ default: module.AccountingStaffContent })));

interface RoleContentProps {
  role: string;
  activeSection: string;
  activePage?: string;
  hasLeadingWork?: boolean;
}

function PageFrame({ children, padded = true, dark = false }: { children: ReactNode; padded?: boolean; dark?: boolean }) {
  return (
    <div className={`h-full min-h-0 flex-1 overflow-hidden ${dark ? "bg-neutral-50 dark:bg-slate-950" : "bg-neutral-50"}`}>
      <div data-tour-page-content className={`h-full overflow-y-auto ${padded ? "p-6" : ""}`}>{children}</div>
    </div>
  );
}

function RoleLoading() {
  return <div className="flex h-full items-center justify-center gap-2 text-[12px] text-neutral-400"><Loader size="small" />Loading workspace...</div>;
}

export function RoleContent({ role, activeSection, activePage, hasLeadingWork = false }: RoleContentProps) {
  const { can } = useAuth();
  const isProjectsWorkspace = activeSection === "projects";
  if (activeSection === "settings") {
    return <Suspense fallback={<RoleLoading />}><PageFrame padded={false} dark><SettingsContent activePage={activePage} /></PageFrame></Suspense>;
  }

  const requiredPermission = getNavigationPermission(role, activeSection);
  const activeNavigationItem = getRoleNavigation(role).navItems.find(
    (item) => item.id === activeSection,
  );
  const hasContextualLeadershipAccess = Boolean(
    hasLeadingWork && activeNavigationItem?.requiresLeadership,
  );
  if (requiredPermission && !can(requiredPermission) && !hasContextualLeadershipAccess) {
    return <PageFrame padded={false}><AccessDenied permission={requiredPermission} /></PageFrame>;
  }

  if (role !== "superadmin" && isAdministrativeNavigationSection(activeSection)) {
    return (
      <Suspense fallback={<RoleLoading />}>
        <PageFrame><SuperAdminContent activeSection={activeSection} activePage={activePage} /></PageFrame>
      </Suspense>
    );
  }

  let content: ReactNode;
  switch (role) {
    case "superadmin":
      content = <PageFrame padded={!isProjectsWorkspace}><SuperAdminContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "executive":
      content = <PageFrame padded={!isProjectsWorkspace}><ExecutiveContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "legislative":
    case "councilor_pad":
      content = <PageFrame padded={!isProjectsWorkspace}><LegislativeContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "hrmo":
      content = <PageFrame padded={!isProjectsWorkspace}><HRMOContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "finance":
      content = <PageFrame padded={!isProjectsWorkspace}><FinanceContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "depthead":
      content = <PageFrame padded={!isProjectsWorkspace}><DeptHeadContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "teamleader":
      content = <PageFrame padded={!isProjectsWorkspace}><TeamLeaderContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "employee":
      content = <PageFrame padded={!isProjectsWorkspace}><EmployeeContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    case "accounting_staff":
      /**
       * Accounting staff keep their full employee workspace. When the active
       * section is one of the dedicated accounting destinations, render the
       * AccountingStaffContent; for all other sections (tasks, projects, etc.)
       * the standard EmployeeContent handles the page — preserving every
       * employee-facing workflow that existed before the accounting role was
       * assigned.
       */
      content = isAccountingSection(activeSection)
        ? <PageFrame padded={false}><AccountingStaffContent activeSection={activeSection} activePage={activePage} /></PageFrame>
        : <PageFrame padded={!isProjectsWorkspace}><EmployeeContent activeSection={activeSection} activePage={activePage} /></PageFrame>;
      break;
    default:
      content = (
        <div className="bg-neutral-50 h-full min-h-0 flex-1 overflow-y-auto p-6 rounded-r-2xl flex items-center justify-center">
          <div className="text-center text-neutral-400">
            <Settings size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-normal">Content coming soon</p>
            <p className="text-[12px] mt-1">Role: {role}</p>
          </div>
        </div>
      );
  }
  return <Suspense fallback={<RoleLoading />}>{content}</Suspense>;
}
