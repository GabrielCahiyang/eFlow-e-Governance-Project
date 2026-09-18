import { useState } from "react";
import { AlertTriangle, Archive, Banknote, BookOpenCheck, BriefcaseBusiness, Clock3, Landmark, ListChecks, LockKeyhole, ReceiptText, TrendingUp, WalletCards } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useTasks } from "../../../hooks/useFirebaseData";
import { useDepartmentBudget } from "../hooks/useDepartmentBudget";
import { getBudgetUtilizationSignal } from "../selectors/budgetSelectors";
import { AnnualBudgetSetup } from "./AnnualBudgetSetup";
import { BudgetApprovalQueue } from "./BudgetApprovalQueue";
import { BudgetCard, BudgetEmpty, peso } from "./budgetUi";
import { FiscalYearControl } from "./FiscalYearControl";
import { BudgetFundingHierarchy } from "./BudgetFundingHierarchy";
import { BudgetReleasesPanel } from "./BudgetReleasesPanel";
import { BudgetExpensesReport } from "./BudgetExpensesReport";
import { BudgetOperationalSignals } from "./BudgetOperationalSignals";
import { getCurrentFiscalYear } from "../constants";
import { useGeneralJournal } from "../hooks/useGeneralJournal";
import { GeneralJournalWorkspace } from "./GeneralJournalWorkspace";
import { AccountingTrailPanel } from "./AccountingTrailPanel";

type Tab = "overview" | "annual" | "funding" | "approvals" | "releases" | "expenses" | "journal" | "audit";

export function DepartmentBudgetWorkspace() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.org_id || userProfile?.departmentId || "";
  const [fiscalYear, setFiscalYear] = useState(getCurrentFiscalYear());
  const [tab, setTab] = useState<Tab>("overview");
  const budget = useDepartmentBudget(orgId, fiscalYear);
  const journal = useGeneralJournal(orgId, fiscalYear);
  const { tasks } = useTasks();
  const canPrepare = ["dept_head", "department_head"].includes(userProfile?.role || "");
  const pendingCount = budget.allocations.filter((item) => item.status === "pending").length
    + budget.requests.filter((item) => item.status === "pending_department_approval").length
    + budget.liquidations.filter((item) => item.status === "pending_department_settlement").length
    + budget.releases.filter((item) => item.status === "scheduled" && item.scheduledDate <= new Date().toISOString().slice(0, 10)).length;
  const utilizationSignal = budget.summary
    ? getBudgetUtilizationSignal(budget.summary)
    : { utilization: 0, isQ4: false, underTarget: false };
  const { utilization, underTarget } = utilizationSignal;
  if (!orgId) return <div className="p-8 text-[12px] text-neutral-500">Your account needs an organization before a department budget can be opened.</div>;
  return <div className="min-h-full bg-neutral-50 p-6 font-normal sm:p-8"><div className="mx-auto max-w-[1500px] space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><div><div className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">Department · Fiscal control</div><h1 className="mt-1 text-[22px] font-semibold text-neutral-950">Department Budget</h1><p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-neutral-500">Annual appropriation → proposal → task funding → contextual cash request → receipts → verified expense. Every amount remains traceable to the work that authorized it.</p><div className="mt-2 flex items-center gap-2 text-[9px] text-neutral-400"><span className={`rounded-full px-2 py-1 capitalize ${budget.summary?.status === "locked" ? "bg-emerald-50 text-emerald-700" : budget.summary?.status === "closed" ? "bg-neutral-100 text-neutral-600" : "bg-amber-50 text-amber-700"}`}>{budget.summary?.status || "Not configured"}</span>{budget.summary?.updatedAt && <span>Updated {new Date(budget.summary.updatedAt).toLocaleString()}</span>}</div></div><FiscalYearControl value={fiscalYear} onChange={setFiscalYear} /></header>
    {budget.error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-[11px] text-rose-700">{budget.error}</div>}
    {budget.schemaWarnings?.map((warning) => <div key={warning} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10.5px] text-amber-900"><AlertTriangle size={15} className="mt-0.5 shrink-0" /><div><strong className="block font-semibold">Fiscal controls update pending</strong><span className="mt-0.5 block text-amber-800">{warning} Existing budgets remain readable, but audited adjustments, correction resubmission, release acknowledgement, and final financial completion guards require the update.</span></div></div>)}
    {budget.loading ? <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-[11px] text-neutral-500">Loading the department ledger…</div> : <>
      <nav className="flex flex-wrap gap-1 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">{([
        ["overview", "Overview", <Landmark size={12} />], ["annual", "Annual Budget", <BookOpenCheck size={12} />],
        ["funding", "Proposal & Task Funding", <BriefcaseBusiness size={12} />],
        ["approvals", `Funding Requests${pendingCount ? ` · ${pendingCount}` : ""}`, <WalletCards size={12} />], ["releases", "Releases & Settlement", <ListChecks size={12} />], ["expenses", "Expenses", <ReceiptText size={12} />],
        ["journal", "General Journal", <BookOpenCheck size={12} />],
        ["audit", "Accounting Trail", <Archive size={12} />],
      ] as Array<[Tab, string, React.ReactNode]>).map(([id, label, icon]) => <button key={id} onClick={() => setTab(id)} className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-medium transition ${tab === id ? "bg-neutral-950 text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}`}>{icon}{label}</button>)}</nav>
      {!budget.summary && tab !== "annual" ? <BudgetEmpty title={`No ${fiscalYear} annual budget yet`} description="The Department Head must create and lock the annual budget before proposals and task-level cash requests can be funded." action={canPrepare ? <button onClick={() => setTab("annual")} className="rounded-xl bg-neutral-950 px-4 py-2.5 text-[10.5px] font-medium text-white">Create annual budget</button> : undefined} /> : <>
        {tab === "overview" && budget.summary && <Overview data={budget} summary={budget.summary} utilization={utilization} underTarget={underTarget} commitments={budget.commitments.length} pending={pendingCount} />}
        {tab === "annual" && <AnnualBudgetSetup orgId={orgId} fiscalYear={fiscalYear} data={budget} canEdit={canPrepare} onChanged={budget.refresh} />}
        {tab === "funding" && <BudgetFundingHierarchy data={budget} tasks={tasks.filter((task) => task.orgId === orgId)} />}
        {tab === "approvals" && <BudgetApprovalQueue data={budget} onChanged={budget.refresh} />}
        {tab === "releases" && <BudgetReleasesPanel data={budget} onChanged={budget.refresh} />}
        {tab === "expenses" && <BudgetExpensesReport data={budget} />}
        {tab === "journal" && <GeneralJournalWorkspace orgId={orgId} fiscalYear={fiscalYear} fiscalBudgetId={budget.summary?.id} approvedBudget={budget.summary?.approvedAmount} settledExpenses={budget.summary?.spentAmount} returnedCash={budget.requests.reduce((sum, request) => sum + (request.status === "settled" ? request.returnedAmount || 0 : 0), 0)} />}
        {tab === "audit" && <AccountingTrailPanel data={budget} journalEntries={journal.entries} />}
      </>}
    </>}
  </div></div>;
}

function Overview({ data, summary, utilization, underTarget, commitments, pending }: { data: ReturnType<typeof useDepartmentBudget>; summary: NonNullable<ReturnType<typeof useDepartmentBudget>["summary"]>; utilization: number; underTarget: boolean; commitments: number; pending: number }) {
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><BudgetCard label="Approved annual budget" value={peso.format(summary.approvedAmount)} note={`${summary.fiscalYear} locked appropriation`} icon={<LockKeyhole size={15} />} /><BudgetCard label="Available for proposals" value={peso.format(summary.availableAmount)} note={`${commitments} published proposal commitment(s)`} icon={<Banknote size={15} />} tone={summary.availableAmount > 0 ? "good" : "warn"} /><BudgetCard label="Committed" value={peso.format(summary.committedAmount)} note="Reserved once by published task budgets" icon={<BriefcaseBusiness size={15} />} /><BudgetCard label="Actual spending" value={peso.format(summary.spentAmount)} note={`${utilization.toFixed(1)}% annual utilization`} icon={<TrendingUp size={15} />} tone={underTarget ? "warn" : "good"} /></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><BudgetCard label="Cash release room today" value={peso.format(summary.dailyReleaseRemaining)} note={`${peso.format(summary.dailyPettyCashReleaseLimit)} daily ceiling`} icon={<WalletCards size={15} />} tone="good" /><BudgetCard label="Released today" value={peso.format(summary.releasedToday)} note={`${peso.format(summary.scheduledToday)} still scheduled today`} icon={<Banknote size={15} />} /><BudgetCard label="Cash awaiting settlement" value={peso.format(summary.pettyCashReserved)} note="Backed by task allocations—not a separate pool" icon={<Clock3 size={15} />} tone="warn" /><BudgetCard label="Approval inbox" value={String(pending)} note="Allocations, cash requests, and liquidations" icon={<ReceiptText size={15} />} tone={pending ? "warn" : "good"} /></div>{underTarget && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><AlertTriangle size={18} className="shrink-0 text-amber-700" /><div><div className="text-[12px] font-semibold text-amber-950">Q4 utilization is below target</div><p className="mt-1 text-[10.5px] text-amber-800">Current utilization is {utilization.toFixed(1)}%; the department target is {summary.underutilizationThreshold}%. Review stalled commitments and pending liquidations.</p></div></div>}<section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex justify-between text-[10px] text-neutral-500"><span>Annual utilization</span><span>{utilization.toFixed(1)}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-neutral-100"><div className={`h-full rounded-full ${underTarget ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, utilization)}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-3 text-[10px]"><div><span className="text-neutral-400">Available</span><div className="mt-1 font-medium">{peso.format(summary.availableAmount)}</div></div><div><span className="text-neutral-400">Committed balance</span><div className="mt-1 font-medium">{peso.format(summary.commitmentRemaining)}</div></div><div><span className="text-neutral-400">Spent</span><div className="mt-1 font-medium">{peso.format(summary.spentAmount)}</div></div></div></section><BudgetOperationalSignals data={data} /></div>;
}
