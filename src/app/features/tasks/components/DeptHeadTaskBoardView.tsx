import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, ListChecks, Send } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { PageHeader, StatCard } from "../../../components/workflow/primitives";
import { getHeadWorkspaceLabel } from "../../../shared/roles";
import { MondayBoard } from "./board/MondayBoard";
import { filterTasksByProject } from "./board/model";

/**
 * Department Head task-board presentation boundary.
 *
 * Data scoping remains in the Department Head adapter so the current
 * organization and permission behavior stay unchanged while the board UI is
 * owned by the tasks feature.
 */
export function DeptHeadTaskBoardView(
  props: ComponentProps<typeof MondayBoard>,
) {
  const { userProfile } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const activeProjectId = props.selectedProjectId ?? selectedProjectId;
  const onSelectProject = props.onSelectProject ?? setSelectedProjectId;

  const activeTasks = useMemo(() => {
    const active = props.tasks.filter((task) => !task.archivedAt);
    return filterTasksByProject(active, activeProjectId);
  }, [props.tasks, activeProjectId]);

  const openCount = activeTasks.filter((task) => !["completed", "cancelled"].includes(task.status)).length;
  return (
    <div className="eflow-operational-workspace min-h-full bg-neutral-50 p-4 sm:p-8">
      <PageHeader
        eyebrow={`${getHeadWorkspaceLabel(userProfile?.role)} · Tasks`}
        title="Task Board"
        subtitle="Track department work, manage ownership, and move tasks through one governed operational workspace."
      />
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open work" value={openCount} tone="info" icon={<ListChecks size={15} />} />
        <StatCard label="In progress" value={activeTasks.filter((task) => task.status === "in_progress").length} tone="warn" icon={<Clock3 size={15} />} />
        <StatCard label="For review" value={activeTasks.filter((task) => task.status === "for_review").length} icon={<Send size={15} />} />
        <StatCard label="Completed" value={activeTasks.filter((task) => task.status === "completed").length} tone="good" icon={<CheckCircle2 size={15} />} />
      </div>
      <MondayBoard
        {...props}
        selectedProjectId={activeProjectId}
        onSelectProject={onSelectProject}
      />
    </div>
  );
}
