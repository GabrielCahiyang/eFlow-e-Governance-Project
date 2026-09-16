import { ArrowRight } from 'lucide-react';
import type { Task } from '../../services/taskService';
import { formatDate, relativeDays } from '../workflow/primitives';
import { TaskStatusBadge } from '../workflow/StatusBadges';

export function TaskRow({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const rel = relativeDays(task.deadline || task.dueDate);
  return (
    <button onClick={onOpen} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-neutral-50">
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium text-neutral-900 truncate">{task.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10.5px] font-normal text-neutral-400 truncate">
            {task.assigneeName || "Unassigned"}{task.teamMemberNames && task.teamMemberNames.length > 1 ? ` + ${task.teamMemberNames.length - 1}` : ""}
          </span>
          <span className="text-neutral-300">·</span>
          <span className={`text-[10.5px] font-medium ${rel.overdue ? "text-red-600" : "text-neutral-400"}`}>
            {formatDate(task.deadline || task.dueDate)}
          </span>
        </div>
      </div>
      <TaskStatusBadge status={task.status} size="sm" />
      <ArrowRight size={14} className="text-neutral-300 shrink-0" />
    </button>
  );
}
