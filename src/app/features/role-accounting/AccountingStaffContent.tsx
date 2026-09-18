import { AccountingStaffWorkspace, type AccountingWorkspaceView } from "../budget";

const VIEW_BY_SECTION: Record<string, AccountingWorkspaceView> = {
  accounting_overview: "overview",
  accounting_releases: "releases",
  accounting_journal: "journal",
  accounting_audit: "audit",
  accounting_budgets: "budgets",
};

export function AccountingStaffContent({ activeSection }: { activeSection: string; activePage?: string }) {
  return <AccountingStaffWorkspace view={VIEW_BY_SECTION[activeSection] || "overview"} />;
}
