import { IconButton } from "@vibe/core";
import { Close } from "@vibe/icons";
import { ProjectActivityTab } from "./ProjectActivityTab";
import { ProjectReportsTab } from "./ProjectReportsTab";
import { ProjectReviewsTab } from "./ProjectReviewsTab";
import type { ProjectCommandData } from "./types";
import { InspectorPanel } from "../../../../shared/motion";

export type ProjectTool = "reviews" | "activity" | "reports";

const TOOLS: Array<{ id: ProjectTool; label: string }> = [
  { id: "reviews", label: "Reviews" },
  { id: "activity", label: "Activity" },
  { id: "reports", label: "Reports" },
];

export function ProjectToolsInspector({
  tool,
  data,
  canExport,
  onOpenTask,
  onClose,
  onToolChange,
}: {
  tool: ProjectTool | null;
  data: ProjectCommandData;
  canExport: boolean;
  onOpenTask: (taskId: string) => void;
  onClose: () => void;
  onToolChange: (tool: ProjectTool) => void;
}) {
  if (!tool) return null;

  return (
    <InspectorPanel
      open={Boolean(tool)}
      onClose={onClose}
      ariaLabel="Project tools inspector"
      className="eflow-project-tools-inspector"
      layer={60}
    >
        <header className="eflow-project-tools-inspector__header">
          <div>
            <span className="eflow-project-tools-inspector__eyebrow">Project tools</span>
            <h2>{data.project.title}</h2>
          </div>
          <IconButton
            aria-label="Close project tools"
            icon={Close}
            kind="tertiary"
            size="small"
            onClick={onClose}
          />
        </header>

        <nav className="eflow-project-tools-inspector__tabs" aria-label="Project tool views" role="tablist">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              id={`project-tool-tab-${item.id}`}
              type="button"
              aria-selected={tool === item.id}
              aria-controls="project-tool-panel"
              role="tab"
              onClick={() => onToolChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div
          id="project-tool-panel"
          className="eflow-project-tools-inspector__body"
          role="tabpanel"
          aria-labelledby={`project-tool-tab-${tool}`}
        >
          {tool === "reviews" && <ProjectReviewsTab data={data} onOpenTask={onOpenTask} />}
          {tool === "activity" && <ProjectActivityTab data={data} />}
          {tool === "reports" && <ProjectReportsTab data={data} canExport={canExport} />}
        </div>
    </InspectorPanel>
  );
}
