import { useEffect, useState } from "react";
import { getCachedSubtasks, subscribeToSubtasks, type Subtask } from "../../../services/subtaskService";

export function useTaskSubtasks(taskId?: string | null) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    if (!taskId) return [];
    return typeof getCachedSubtasks === "function" ? (getCachedSubtasks(taskId) ?? []) : [];
  });

  useEffect(() => {
    if (!taskId) {
      setSubtasks([]);
      return;
    }
    const cached = typeof getCachedSubtasks === "function" ? getCachedSubtasks(taskId) : undefined;
    if (cached) {
      setSubtasks(cached);
    }
    return subscribeToSubtasks(taskId, setSubtasks);
  }, [taskId]);

  return { subtasks, setSubtasks };
}
