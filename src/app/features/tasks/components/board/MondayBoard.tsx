import { useMemo, useState } from "react";
import { Tab, TabList, TabsContext } from "@vibe/core";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Archive, BarChart2, ChevronDown, Columns, FolderOpen, Layers, List } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  buildProjectFilterOptions,
  filterTasksByProject,
  uniqueValues,
  type BoardView,
  type MondayBoardProps,
} from "./model";
import { AssignmentModal } from "./AssignmentModal";
import { TaskEditorModal } from "./TaskEditorModal";
import { SubmitForReviewModal, UndoCompletedModal } from "./TaskSubmissionModals";
import { HierarchyBoardView } from "./HierarchyBoardView";
import { KanbanBoardView } from "./KanbanBoardView";
import { ListBoardView } from "./ListBoardView";
import { TimelineView } from "./TimelineView";
import { useMondayBoardController } from "./useMondayBoardController";
import { useNotificationNavigationIntent } from "../../../notifications";
import { motionTransition } from "../../../../shared/motion";

const recordScopeOptions = [
  { value: "active", label: "Active work" },
  { value: "archived", label: "Archived work" },
];

const boardViewOptions: { id: BoardView; label: string; icon: React.ReactNode }[] = [
  { id: "list", icon: <List size={13} />, label: "List" },
  { id: "kanban", icon: <Columns size={13} />, label: "Kanban" },
  { id: "timeline", icon: <BarChart2 size={13} />, label: "Timeline" },
  { id: "hierarchy", icon: <Layers size={13} />, label: "Hierarchy" },
];

export function MondayBoard({
  tasks,
  projects,
  selectedProjectId,
  onSelectProject,
  employees = [],
  allEmployees = [],
  employeeNotes,
  role,
  departmentFilter,
  currentUserId,
  currentUserName,
  onAssign,
  onExecute,
  onSubmit,
  onVerify,
  onUpdateTask,
  onDeleteTask,
}: MondayBoardProps) {
  const [recordScope, setRecordScope] = useState<"active" | "archived">("active");
  const [internalProjectId, setInternalProjectId] = useState<string>("all");
  const activeProjectId = selectedProjectId ?? internalProjectId;
  const handleSelectProject = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else {
      setInternalProjectId(projectId);
    }
  };

  const scopedTasks = useMemo(
    () => tasks.filter((task) => recordScope === "archived" ? Boolean(task.archivedAt) : !task.archivedAt),
    [recordScope, tasks],
  );

  const projectOptions = useMemo(
    () => buildProjectFilterOptions(scopedTasks, projects),
    [scopedTasks, projects],
  );

  const filteredTasks = useMemo(
    () => filterTasksByProject(scopedTasks, activeProjectId),
    [scopedTasks, activeProjectId],
  );

  // ── View & composer state ─────────────────────────────────────
  const controller = useMondayBoardController({
    tasks: filteredTasks, employees, allEmployees, employeeNotes, role, departmentFilter,
    currentUserId, currentUserName, onAssign, onExecute, onSubmit, onVerify,
    onUpdateTask, onDeleteTask,
  });
  const {
    boardView, setBoardView,
    deptEmployees, employeeById, taskEditorOpen, taskEditorDraft,
    setTaskEditorDraft, taskEditorSaving, taskEditorError,
    taskEditorAssignOpen, setTaskEditorAssignOpen, submitModalOpen,
    submitModalTask, submitNote, setSubmitNote, submitFiles, setSubmitFiles,
    submitError, submitSaving, undoModalOpen, undoModalTask, undoReason,
    setUndoReason, undoError, undoSaving, deptTasks, editingTask,
    openTaskEditor, closeTaskEditor, openSubmitModal, closeSubmitModal,
    handleRemoveAttachment, handleSubmitConfirm, openUndoModal, closeUndoModal,
    handleUndoConfirm, handleTaskEditorSave, handleTaskDeleteRequest,
    handleTaskCancelRequest, handleTaskArchiveRequest, handleTaskEditorDelete,
  } = controller;

  useNotificationNavigationIntent(
    (intent) => role === "depthead" && intent.kind === "task",
    (intent) => {
      const match = tasks.find((task) => task.id === intent.taskId);
      if (match) {
        setRecordScope(match.archivedAt ? "archived" : "active");
        openTaskEditor(match);
      }
      return true;
    },
    [role, tasks, openTaskEditor],
  );

  return (
    <div className="eflow-operational-workspace flex w-full flex-col gap-5">

      {/* ─── Task Board ──────────────────────────────────────────── */}
      <div>
        {/* View switcher header */}
        <div className="relative z-30 mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-neutral-500">
            <div className="flex items-center gap-1.5 shrink-0">
              <Archive size={13} className="shrink-0" />
              <SelectPrimitive.Root value={recordScope} onValueChange={(v) => setRecordScope(v as typeof recordScope)}>
                <SelectPrimitive.Trigger className="flex h-[28px] w-[155px] items-center justify-between gap-1 rounded-[4px] border border-[#c5c7d0] bg-white px-2 text-[13px] text-[#323338] outline-none hover:border-[#1f76c2] focus:border-[#1f76c2] data-[placeholder]:text-[#676879]">
                  <SelectPrimitive.Value />
                  <SelectPrimitive.Icon asChild>
                    <ChevronDown size={14} className="shrink-0 text-[#676879]" />
                  </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content position="popper" sideOffset={4} className="z-[9999] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[4px] border border-[#c5c7d0] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                    <SelectPrimitive.Viewport>
                      {recordScopeOptions.map((opt) => (
                        <SelectPrimitive.Item key={opt.value} value={opt.value} className="flex cursor-pointer select-none items-center px-3 py-[6px] text-[13px] text-[#323338] outline-none hover:bg-[#e8f0fe] data-[state=checked]:bg-[#e8f0fe] data-[state=checked]:text-[#1f76c2]">
                          <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <FolderOpen size={13} className="shrink-0" />
              <SelectPrimitive.Root value={activeProjectId} onValueChange={handleSelectProject}>
                <SelectPrimitive.Trigger className="flex h-[28px] w-[240px] items-center justify-between gap-1 rounded-[4px] border border-[#c5c7d0] bg-white px-2 text-[13px] text-[#323338] outline-none hover:border-[#1f76c2] focus:border-[#1f76c2] data-[placeholder]:text-[#676879]">
                  <SelectPrimitive.Value />
                  <SelectPrimitive.Icon asChild>
                    <ChevronDown size={14} className="shrink-0 text-[#676879]" />
                  </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                  <SelectPrimitive.Content position="popper" sideOffset={4} className="z-[9999] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[4px] border border-[#c5c7d0] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
                    <SelectPrimitive.Viewport>
                      {projectOptions.map((opt) => (
                        <SelectPrimitive.Item key={opt.value} value={opt.value} className="flex cursor-pointer select-none items-center px-3 py-[6px] text-[13px] text-[#323338] outline-none hover:bg-[#e8f0fe] data-[state=checked]:bg-[#e8f0fe] data-[state=checked]:text-[#1f76c2]">
                          <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
              </SelectPrimitive.Root>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto">
            <TabsContext
              id="task-board-view-tabs"
              activeTabId={boardViewOptions.findIndex((view) => view.id === boardView)}
            >
              <TabList id="task-board-view-list">
                {boardViewOptions.map((view) => (
                  <Tab
                    key={view.id}
                    id={`task-board-${view.id}`}
                    active={boardView === view.id}
                    onClick={() => setBoardView(view.id)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {view.icon}
                      {view.label}
                    </span>
                  </Tab>
                ))}
              </TabList>
            </TabsContext>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={boardView}
            className="relative z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTransition.productive}
          >
        {boardView === "list" && (
          <ListBoardView
            tasks={deptTasks}
            role={role}
            employees={deptEmployees}
            employeeNotes={employeeNotes}
            onAssign={onAssign}
            onUpdateTask={onUpdateTask}
            onVerify={onVerify}
            onExecute={onExecute}
            onSubmitRequest={openSubmitModal}
            onOpenTaskEditor={role === "depthead" ? openTaskEditor : undefined}
            onDeleteTaskRequest={
              role === "depthead" ? handleTaskDeleteRequest : undefined
            }
            onArchiveTaskRequest={role === "depthead" ? handleTaskArchiveRequest : undefined}
            onCancelTaskRequest={role === "depthead" ? handleTaskCancelRequest : undefined}
            departmentFilter={departmentFilter}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onUndoRequest={role === "depthead" ? openUndoModal : undefined}
          />
        )}
        {boardView === "kanban" && (
          <KanbanBoardView
            tasks={deptTasks}
            employees={deptEmployees}
            role={role}
            onVerify={onVerify}
            onExecute={onExecute}
            onSubmitRequest={openSubmitModal}
            onOpenTaskEditor={role === "depthead" ? openTaskEditor : undefined}
            onDeleteTaskRequest={
              role === "depthead" ? handleTaskDeleteRequest : undefined
            }
            onArchiveTaskRequest={role === "depthead" ? handleTaskArchiveRequest : undefined}
            onCancelTaskRequest={role === "depthead" ? handleTaskCancelRequest : undefined}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onUndoRequest={role === "depthead" ? openUndoModal : undefined}
          />
        )}
        {boardView === "timeline" && (
          <TimelineView
            tasks={deptTasks}
            role={role}
            onOpenTaskEditor={role === "depthead" ? openTaskEditor : undefined}
          />
        )}
        {boardView === "hierarchy" && (
          <HierarchyBoardView
            tasks={deptTasks}
            employees={deptEmployees}
            role={role}
            onVerify={onVerify}
            onExecute={onExecute}
            onSubmitRequest={openSubmitModal}
            onOpenTaskEditor={role === "depthead" ? openTaskEditor : undefined}
            onDeleteTaskRequest={
              role === "depthead" ? handleTaskDeleteRequest : undefined
            }
            onArchiveTaskRequest={role === "depthead" ? handleTaskArchiveRequest : undefined}
            onCancelTaskRequest={role === "depthead" ? handleTaskCancelRequest : undefined}
            currentUserId={currentUserId}
            onUndoRequest={role === "depthead" ? openUndoModal : undefined}
          />
        )}
          </m.div>
        </AnimatePresence>
      </div>

      {/* ─── Assignment Modal — PDF draft tasks ──────────────────── */}
      <TaskEditorModal
        open={taskEditorOpen}
        task={editingTask}
        draft={taskEditorDraft}
        onChange={(patch) =>
          setTaskEditorDraft((prev) => (prev ? { ...prev, ...patch } : prev))
        }
        onClose={closeTaskEditor}
        onSave={handleTaskEditorSave}
        onDelete={handleTaskEditorDelete}
        onCancelTask={() => editingTask && handleTaskCancelRequest(editingTask)}
        onOpenTeamEditor={() => setTaskEditorAssignOpen(true)}
        saving={taskEditorSaving}
        error={taskEditorError}
        employees={deptEmployees}
        availableTasks={deptTasks}
        employeeById={employeeById}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />

      <SubmitForReviewModal
        open={submitModalOpen}
        task={submitModalTask}
        note={submitNote}
        attachments={submitFiles}
        onNoteChange={setSubmitNote}
        onAttachmentsChange={setSubmitFiles}
        onRemoveAttachment={handleRemoveAttachment}
        onClose={closeSubmitModal}
        onSubmit={handleSubmitConfirm}
        submitting={submitSaving}
        error={submitError}
      />

      <UndoCompletedModal
        open={undoModalOpen}
        task={undoModalTask}
        reason={undoReason}
        onReasonChange={setUndoReason}
        onClose={closeUndoModal}
        onSubmit={handleUndoConfirm}
        saving={undoSaving}
        error={undoError}
      />

      <AssignmentModal
        open={taskEditorAssignOpen && taskEditorOpen}
        onClose={() => setTaskEditorAssignOpen(false)}
        employees={deptEmployees}
        employeeNotes={employeeNotes}
        selectedIds={taskEditorDraft?.teamMemberIds || []}
        leadId={taskEditorDraft?.leadMemberId || null}
        onConfirm={(memberIds, leadId) => {
          setTaskEditorDraft((prev) =>
            prev
              ? {
                  ...prev,
                  teamMemberIds: uniqueValues(memberIds),
                  leadMemberId: leadId,
                }
              : prev,
          );
        }}
      />

      {/* ─── Assignment Modal — Manual composer ──────────────────── */}
    </div>
  );
}
