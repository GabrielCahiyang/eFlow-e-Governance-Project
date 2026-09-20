// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommittedProposalDeliveryPanel } from "../../src/app/features/interdepartment-collaboration/components/CommittedProposalDeliveryPanel";
import { buildCommittedProposalDeliverySummary } from "../../src/app/features/interdepartment-collaboration/selectors/deliveryProgress";
import type { Project } from "../../src/app/features/projects";
import type { Task } from "../../src/app/features/tasks";

afterEach(cleanup);

describe("committed proposal archive", () => {
  it("restores the archive action if the server rejects the archive", async () => {
    const project = {
      id: "project-1", title: "Project", description: "", status: "completed",
      priority: "medium", sourceCollaborationDraftId: "draft-1", createdAt: 1, updatedAt: 1,
    } as Project;
    const task = {
      id: "task-1", title: "Task", status: "completed", percentComplete: 100,
      linkedProjectId: project.id, sourceCollaborationDraftId: "draft-1", createdAt: 1, updatedAt: 1,
    } as Task;
    const onArchive = vi.fn().mockRejectedValue(new Error("Archive blocked"));
    render(<CommittedProposalDeliveryPanel
      summary={buildCommittedProposalDeliverySummary("draft-1", [project], [task])}
      canManage busy={false} onOpenProject={vi.fn()}
      onMarkCompleted={vi.fn()} onArchive={onArchive}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Archive completed proposal" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm archive" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Archive completed proposal" })).toBeTruthy());
    expect(screen.queryByText("Delivery archived.")).toBeNull();
    expect(onArchive).toHaveBeenCalledOnce();
  });
});
