import { describe, expect, it } from "vitest";
import { mergeTaskComments, type TaskComment } from "../../src/app/services/taskDiscussionService";

const comment = (id: string, createdAt: number, body = id): TaskComment => ({
  id,
  taskId: "task-1",
  authorName: "User",
  body,
  createdAt,
});

describe("task discussion realtime reconciliation", () => {
  it("shows a confirmed local post immediately without duplicating its realtime copy", () => {
    const posted = comment("comment-2", 2, "Ready for review");
    const immediate = mergeTaskComments([comment("comment-1", 1)], posted);
    expect(immediate.map((item) => item.body)).toEqual(["comment-1", "Ready for review"]);

    const realtime = mergeTaskComments(immediate, [posted]);
    expect(realtime).toHaveLength(2);
  });

  it("keeps comments in chronological order after reconnect reloads", () => {
    expect(mergeTaskComments([comment("later", 20)], [comment("earlier", 10)]).map((item) => item.id))
      .toEqual(["earlier", "later"]);
  });
});

