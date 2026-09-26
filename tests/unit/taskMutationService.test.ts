import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  rpc: vi.fn(),
  fetchTaskById: vi.fn(),
  notifyTaskListeners: vi.fn(),
}));

vi.mock("../../src/lib/supabase", () => ({
  supabase: { from: api.from, rpc: api.rpc },
}));

vi.mock("../../src/app/features/tasks/services/taskRealtimeService", () => ({
  fetchTaskById: api.fetchTaskById,
  notifyTaskListeners: api.notifyTaskListeners,
}));

import { updateTask } from "../../src/app/features/tasks/services/taskMutationService";

const currentTask = {
  id: "task-1",
  status: "todo",
  assigned_to: "lead-1",
  team_id: "engineering",
  team_name: "Engineering",
  team_member_ids: ["lead-1", "member-1"],
  team_member_names: ["Task Lead", "Team Member"],
  reviewer_id: "reviewer-1",
  backup_reviewer_id: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  api.from.mockReturnValue({ update: api.update });
  api.update.mockReturnValue({ eq: api.eq });
  api.eq.mockResolvedValue({ error: null });
  api.rpc.mockResolvedValue({ error: null });
  api.fetchTaskById.mockResolvedValue(currentTask);
  api.notifyTaskListeners.mockResolvedValue(undefined);
});

describe("updateTask assignment follow-up", () => {
  it("does not run the protected assignment RPC for an unchanged editor snapshot", async () => {
    await updateTask("task-1", {
      title: "Updated title",
      assigneeId: "lead-1",
      teamId: "engineering",
      teamName: "Engineering",
      teamMemberIds: ["lead-1", "member-1"],
      teamMemberNames: ["Task Lead", "Team Member"],
      reviewerId: "reviewer-1",
      backupReviewerId: "",
    });

    expect(api.update).toHaveBeenCalledExactlyOnceWith({ title: "Updated title" });
    expect(api.rpc).not.toHaveBeenCalled();
    expect(api.notifyTaskListeners).toHaveBeenCalledOnce();
  });

  it("continues to use the protected assignment RPC for a real team change", async () => {
    await updateTask("task-1", {
      teamMemberIds: ["lead-1", "member-1", "member-2"],
      teamMemberNames: ["Task Lead", "Team Member", "New Member"],
    });

    expect(api.rpc).toHaveBeenCalledExactlyOnceWith("assign_task_with_details", {
      p_task_id: "task-1",
      p_assignee: "lead-1",
      p_assignee_name: null,
      p_team_id: null,
      p_team_name: null,
      p_team_member_ids: ["lead-1", "member-1", "member-2"],
      p_team_member_names: ["Task Lead", "Team Member", "New Member"],
      p_reviewer: "reviewer-1",
      p_backup_reviewer: null,
      p_set_reviewers: false,
    });
  });

  it("reports the committed task fields when the assignment step fails and refreshes them", async () => {
    api.rpc.mockResolvedValue({ error: { message: "Team member is outside your organization scope" } });
    await expect(updateTask("task-1", {
      title: "Saved title", assigneeId: "other-lead",
    })).rejects.toThrow(
      "Saved task details, but could not save team and reviewer changes. Team member is outside your organization scope",
    );
    expect(api.update).toHaveBeenCalledWith({ title: "Saved title" });
    expect(api.notifyTaskListeners).toHaveBeenCalledOnce();
  });

  it("keeps the database error when the first write fails and does not claim anything saved", async () => {
    api.eq.mockResolvedValue({ error: { message: "Deadline is outside the activity schedule" } });
    await expect(updateTask("task-1", { deadline: "2027-01-01" })).rejects.toThrow(
      "Could not save task details. Deadline is outside the activity schedule",
    );
    expect(api.rpc).not.toHaveBeenCalled();
    expect(api.notifyTaskListeners).not.toHaveBeenCalled();
  });

  it("preserves the primary reviewer when only the backup reviewer changes", async () => {
    await updateTask("task-1", { backupReviewerId: "backup-1" });
    expect(api.rpc).toHaveBeenCalledWith("assign_task_with_details", expect.objectContaining({
      p_reviewer: "reviewer-1", p_backup_reviewer: "backup-1", p_set_reviewers: true,
    }));
  });

  it("uses assignment to advance a pending task even if its assigned identity is unchanged", async () => {
    api.fetchTaskById.mockResolvedValueOnce({ ...currentTask, status: "pending_assignment" });
    await updateTask("task-1", { assigneeId: "lead-1", status: "todo" });
    expect(api.rpc).toHaveBeenCalledExactlyOnceWith("assign_task_with_details", expect.objectContaining({
      p_assignee: "lead-1",
    }));
  });

  it("reports committed assignment changes if a later lifecycle operation fails", async () => {
    api.rpc.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: { message: "Review required" } });
    await expect(updateTask("task-1", { assigneeId: "other-lead", status: "completed" })).rejects.toThrow(
      "Saved team and reviewer changes, but could not save status change. Review required",
    );
    expect(api.notifyTaskListeners).toHaveBeenCalledOnce();
  });
});
