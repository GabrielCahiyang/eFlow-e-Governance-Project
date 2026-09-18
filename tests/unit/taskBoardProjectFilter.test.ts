import { describe, expect, it } from "vitest";
import {
  buildProjectFilterOptions,
  filterTasksByProject,
  getTaskProjectKey,
  getTaskProjectLabel,
} from "../../src/app/features/tasks/components/board/model";
import type { Task } from "../../src/app/types";

const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Setup solar panels",
    status: "in_progress",
    projectId: "proj-solar",
    projectTitle: "City Solar Initiative",
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: "task-2",
    title: "Inspect inverter wiring",
    status: "todo",
    projectId: "proj-solar",
    projectTitle: "City Solar Initiative",
    createdAt: 2000,
    updatedAt: 2000,
  },
  {
    id: "task-3",
    title: "Deploy public Wi-Fi hotspots",
    status: "todo",
    projectId: "proj-wifi",
    projectTitle: "Public Wi-Fi Mesh",
    createdAt: 3000,
    updatedAt: 3000,
  },
  {
    id: "task-4",
    title: "Roadside tree planting",
    status: "for_review",
    projectTitle: "Green Ormoc Urban Greening",
    createdAt: 4000,
    updatedAt: 4000,
  },
  {
    id: "task-5",
    title: "General administrative report",
    status: "todo",
    createdAt: 5000,
    updatedAt: 5000,
  },
];

describe("Task Board Project Filter", () => {
  it("determines correct project key and label for each task", () => {
    expect(getTaskProjectKey(sampleTasks[0])).toBe("proj-solar");
    expect(getTaskProjectLabel(sampleTasks[0])).toBe("City Solar Initiative");

    // Task with projectTitle but no projectId
    expect(getTaskProjectKey(sampleTasks[3])).toBe("title:green ormoc urban greening");
    expect(getTaskProjectLabel(sampleTasks[3])).toBe("Green Ormoc Urban Greening");

    // Task with no project
    expect(getTaskProjectKey(sampleTasks[4])).toBe("unassigned");
    expect(getTaskProjectLabel(sampleTasks[4])).toBe("Unlinked / No project");
  });

  it("builds project filter options with item counts and All projects summary", () => {
    const options = buildProjectFilterOptions(sampleTasks);

    expect(options[0]).toEqual({
      value: "all",
      label: "All projects (5)",
      count: 5,
    });

    // Check project options
    const solarOption = options.find((opt) => opt.value === "proj-solar");
    expect(solarOption).toEqual({
      value: "proj-solar",
      label: "City Solar Initiative (2)",
      count: 2,
    });

    const wifiOption = options.find((opt) => opt.value === "proj-wifi");
    expect(wifiOption).toEqual({
      value: "proj-wifi",
      label: "Public Wi-Fi Mesh (1)",
      count: 1,
    });

    const unassignedOption = options.find((opt) => opt.value === "unassigned");
    expect(unassignedOption).toEqual({
      value: "unassigned",
      label: "Unlinked / No project (1)",
      count: 1,
    });
  });

  it("filters tasks by selected project key", () => {
    // "all" returns everything
    expect(filterTasksByProject(sampleTasks, "all")).toHaveLength(5);
    expect(filterTasksByProject(sampleTasks, "")).toHaveLength(5);

    // Filter by specific project ID
    const solarTasks = filterTasksByProject(sampleTasks, "proj-solar");
    expect(solarTasks).toHaveLength(2);
    expect(solarTasks.map((t) => t.id)).toEqual(["task-1", "task-2"]);

    // Filter by project title key
    const greenTasks = filterTasksByProject(sampleTasks, "title:green ormoc urban greening");
    expect(greenTasks).toHaveLength(1);
    expect(greenTasks[0].id).toBe("task-4");

    // Filter by unassigned
    const unlinkedTasks = filterTasksByProject(sampleTasks, "unassigned");
    expect(unlinkedTasks).toHaveLength(1);
    expect(unlinkedTasks[0].id).toBe("task-5");
  });
});