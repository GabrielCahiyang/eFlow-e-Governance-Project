// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSubtasks = [
  {
    id: "sub-1",
    taskId: "task-100",
    title: "Prepare report draft",
    isCompleted: false,
    status: "todo" as const,
    percentComplete: 0,
    assignedToIds: ["user-1"],
    position: 0,
    isStandalone: false,
    source: "manual" as const,
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "sub-2",
    taskId: "task-100",
    title: "Review budget lines",
    isCompleted: true,
    status: "completed" as const,
    percentComplete: 100,
    assignedToIds: ["user-2"],
    position: 1,
    isStandalone: false,
    source: "manual" as const,
    createdAt: 2000,
    updatedAt: 2000,
  },
];

vi.mock("../../src/lib/supabase", () => {
  const selectMock = vi.fn().mockReturnThis();
  const eqMock = vi.fn().mockReturnThis();
  const orderMock = vi.fn().mockResolvedValue({
    data: [
      {
        id: "sub-1",
        task_id: "task-100",
        title: "Prepare report draft",
        is_completed: false,
        status: "todo",
        percent_complete: 0,
        assigned_to_ids: ["user-1"],
        position: 0,
        is_standalone: false,
        source: "manual",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
    error: null,
  });

  return {
    supabase: {
      from: vi.fn(() => ({
        select: selectMock,
        eq: eqMock,
        order: orderMock,
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      })),
      removeChannel: vi.fn().mockResolvedValue(undefined),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    },
  };
});

import {
  clearSubtaskCache,
  deleteSubtask,
  getCachedSubtasks,
  setCachedSubtasks,
  subtaskMemoryCache,
  subscribeToSubtasks,
} from "../../src/app/services/subtaskService";
import { useTaskSubtasks } from "../../src/app/features/subtasks/hooks/useTaskSubtasks";

describe("Phase 1: Subtask Cache & Instant Rendering", () => {
  beforeEach(() => {
    clearSubtaskCache();
  });

  afterEach(() => {
    cleanup();
    clearSubtaskCache();
  });

  it("exports cache functions and stores subtasks in subtaskMemoryCache", () => {
    expect(getCachedSubtasks("task-100")).toBeUndefined();
    setCachedSubtasks("task-100", mockSubtasks);
    expect(getCachedSubtasks("task-100")).toEqual(mockSubtasks);
    expect(subtaskMemoryCache.get("task-100")).toEqual(mockSubtasks);

    clearSubtaskCache("task-100");
    expect(getCachedSubtasks("task-100")).toBeUndefined();
  });

  it("delivers cached subtasks synchronously on subscribeToSubtasks", () => {
    setCachedSubtasks("task-100", mockSubtasks);
    const callback = vi.fn();

    const unsubscribe = subscribeToSubtasks("task-100", callback);
    // Callback must be called synchronously with cached items
    expect(callback).toHaveBeenCalledWith(mockSubtasks);
    unsubscribe();
  });

  it("initializes useTaskSubtasks hook synchronously with cached subtasks without layout shift", () => {
    setCachedSubtasks("task-100", mockSubtasks);

    // Initial render must have subtasks immediately on frame 0
    const { result } = renderHook(() => useTaskSubtasks("task-100"));
    expect(result.current.subtasks).toEqual(mockSubtasks);
  });

  it("updates cache when deleteSubtask is executed", async () => {
    setCachedSubtasks("task-100", mockSubtasks);
    expect(getCachedSubtasks("task-100")?.length).toBe(2);

    await deleteSubtask("sub-1");
    const updated = getCachedSubtasks("task-100");
    expect(updated?.length).toBe(1);
    expect(updated?.[0].id).toBe("sub-2");
  });
});