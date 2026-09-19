import { AlertCircle, FilePenLine, Layers, Plus } from "lucide-react";
import { AssignmentModal } from "./AssignmentModal";
import { DraftCockpit } from "./DraftCockpit";
import { useManualPlanController } from "../hooks/useManualPlanController";
import { OrganizationScopePicker } from "../../interdepartment-collaboration";
import { ProposalTaskBudgetSummary } from "../../budget";

export function ManualPlanBuilder({
  onClose,
  inDialog = false,
  embedded = false,
}: {
  onClose: () => void;
  inDialog?: boolean;
  embedded?: boolean;
}) {
  const {
    allEmployees,
    orgs,
    collaborationOrganizations,
    setCollaborationOrganizations,
    employeesLoading,
    employeeNotes,
    planTitle,
    planDescription,
    draftTasks,
    committing,
    autoSaveState,
    commitMessage,
    validationIssues,
    assignModalTaskKey,
    currentDraftTask,
    setPlanDescription,
    setAssignModalTaskKey,
    updatePlanTitle,
    handleAddProgram,
    handleAddProject,
    handleAddActivity,
    handleAddTask,
    handleDraftUpdate,
    handleDraftDelete,
    handleRenameProgram,
    handleRenameProject,
    handleUpdateActivity,
    handleCommit,
  } = useManualPlanController(onClose);

  return (
    <div
      className={`${embedded ? "p-0" : "p-6"} font-sans ${inDialog ? "eflow-creation-builder" : ""}`}
      data-testid="manual-plan-builder"
    >
      <div
        className={`mx-auto min-w-0 space-y-6 ${embedded ? "max-w-none" : "max-w-4xl"}`}
      >
        {!embedded && (
          <header className="flex items-start justify-between gap-5 border-b border-neutral-100 pb-4">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <FilePenLine size={19} />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-neutral-900">
                  Manual work-plan builder
                </h1>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                  Build Programs, Projects, Activities, and Tasks yourself. AI
                  is not used here. Your review draft autosaves; operational
                  work is created only after approval and commit.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 text-xs font-semibold text-neutral-500 transition hover:text-neutral-900"
            >
              Cancel
            </button>
          </header>
        )}

        <section className="grid gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs md:grid-cols-[1fr_1.35fr]">
          <label className="block">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-700">
              Plan title <span className="text-red-500">*</span>
            </span>
            <input
              aria-label="Plan title"
              data-testid="manual-plan-title"
              value={planTitle}
              onChange={(event) => updatePlanTitle(event.target.value)}
              placeholder="e.g. 2026 Coastal Resilience Plan"
              className="mt-2 h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/60 px-3.5 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <label className="block">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-700">
              Plan description
            </span>
            <textarea
              aria-label="Plan description"
              data-testid="manual-plan-description"
              value={planDescription}
              onChange={(event) => setPlanDescription(event.target.value)}
              placeholder="What is this plan intended to deliver?"
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/60 px-3.5 py-2.5 text-xs text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
        </section>

        <OrganizationScopePicker
          organizations={orgs}
          value={collaborationOrganizations}
          ownerOrgId={
            collaborationOrganizations.find(
              (item) => item.participationRole === "owner",
            )?.orgId || ""
          }
          onChange={setCollaborationOrganizations}
        />

        {draftTasks.length > 0 && (
          <ProposalTaskBudgetSummary tasks={draftTasks} />
        )}

        {validationIssues.length > 0 && (
          <section
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Complete these items before creating the work plan
                </h2>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-900">
                  {validationIssues.map((issue) => (
                    <li key={issue.id}>• {issue.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {draftTasks.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm border border-indigo-100">
              <Layers size={22} />
            </div>
            <h2 className="mt-4 text-sm font-bold text-neutral-800">
              Start with a Program
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-neutral-500">
              A Program can contain multiple Projects. Each Project can contain
              Activities, and every Activity can contain one or more tasks.
            </p>
            <button
              data-testid="manual-plan-add-first-program"
              onClick={handleAddProgram}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 cursor-pointer"
            >
              <Plus size={14} /> Add first Program
            </button>
          </section>
        ) : (
          <DraftCockpit
            source="manual"
            proposalTitle={planTitle || "Untitled plan"}
            draftTasks={draftTasks}
            employees={allEmployees}
            employeeNotes={employeeNotes}
            onUpdate={handleDraftUpdate}
            onDelete={handleDraftDelete}
            onAdd={handleAddTask}
            onOpenModal={setAssignModalTaskKey}
            onCommit={handleCommit}
            committing={committing}
            autoSaveState={autoSaveState}
            commitMessage={commitMessage}
            onAddProgram={handleAddProgram}
            onAddProject={handleAddProject}
            onAddActivity={handleAddActivity}
            onRenameProgram={handleRenameProgram}
            onRenameProject={handleRenameProject}
            onUpdateActivity={handleUpdateActivity}
          />
        )}
      </div>

      <AssignmentModal
        open={Boolean(assignModalTaskKey)}
        onClose={() => setAssignModalTaskKey(null)}
        employees={allEmployees}
        loading={employeesLoading}
        employeeNotes={employeeNotes}
        selectedIds={currentDraftTask?.assignedMemberIds || []}
        leadId={currentDraftTask?.leadMemberId || null}
        onConfirm={(memberIds, leadMemberId) => {
          if (assignModalTaskKey) {
            handleDraftUpdate(assignModalTaskKey, {
              assignedMemberIds: memberIds,
              leadMemberId,
            });
          }
          setAssignModalTaskKey(null);
        }}
      />
    </div>
  );
}
