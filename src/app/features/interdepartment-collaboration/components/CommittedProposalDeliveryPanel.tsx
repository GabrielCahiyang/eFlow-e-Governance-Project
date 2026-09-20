import * as React from "react";
import { Button, Label } from "@vibe/core";
import { Open } from "@vibe/icons";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { motionTransition } from "../../../shared/motion/motionTokens";
import { formatDate } from "../../../components/workflow/primitives";
import type {
  CommittedProposalDeliverySummary,
  ProposalDeliveryStage,
} from "../selectors/deliveryProgress";

export const DELIVERY_STAGE_LABELS: Record<ProposalDeliveryStage, string> = {
  publishing: "Preparing delivery",
  active: "Delivery active",
  attention: "Attention required",
  awaiting_review: "Awaiting review",
  ready_to_complete: "Ready to complete",
  ready_to_archive: "Ready to archive",
  archived: "Delivery archived",
};

export function CommittedProposalDeliveryPanel({
  summary,
  canManage,
  busy,
  onOpenProject,
  onMarkCompleted,
  onArchive,
}: {
  summary: CommittedProposalDeliverySummary;
  canManage: boolean;
  busy: boolean;
  onOpenProject: (projectId: string) => void;
  onMarkCompleted: () => Promise<void>;
  onArchive: () => Promise<void>;
}) {
  const [confirmArchive, setConfirmArchive] = React.useState(false);
  const [isArchivedOptimistic, setIsArchivedOptimistic] = React.useState(false);

  const effectiveStage = isArchivedOptimistic ? "archived" : summary.stage;

  const stageColor =
    effectiveStage === "attention"
      ? "negative"
      : effectiveStage === "awaiting_review"
        ? "working_orange"
        : ["ready_to_complete", "ready_to_archive", "archived"].includes(
              effectiveStage,
            )
          ? "positive"
          : "primary";

  const totalAttention =
    summary.overdueCount + summary.changesRequestedCount;

  const handleConfirmArchive = async () => {
    setIsArchivedOptimistic(true);
    setConfirmArchive(false);
    try {
      await onArchive();
    } catch {
      setIsArchivedOptimistic(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stage Alert when attention or action is required */}
      {effectiveStage === "attention" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Delivery requires attention:</span>{" "}
            {summary.overdueCount} overdue and{" "}
            {summary.changesRequestedCount} revision item(s) need review or updates.
          </div>
        </div>
      )}

      {effectiveStage === "awaiting_review" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
          <Clock3 size={16} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Review decisions waiting:</span>{" "}
            {summary.awaitingReviewCount} task submission(s) are waiting for reviewer action.
          </div>
        </div>
      )}

      {effectiveStage === "ready_to_complete" && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">All delivery tasks are approved.</span>{" "}
              Mark the operational projects completed to close proposal delivery.
            </div>
          </div>
          {canManage && (
            <Button
              size="small"
              disabled={busy}
              onClick={() => void onMarkCompleted()}
            >
              {busy ? "Updating…" : "Mark projects completed"}
            </Button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {effectiveStage === "ready_to_archive" && !confirmArchive && (
          <m.div
            key="ready-to-archive-banner"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={motionTransition.productive}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-800"
          >
            <div>
              <span className="font-semibold">Delivery is complete.</span> Archive
              the operational projects when the records no longer need to remain active.
            </div>
            {canManage && (
              <Button
                kind="secondary"
                size="small"
                disabled={busy}
                onClick={() => setConfirmArchive(true)}
              >
                Archive completed proposal
              </Button>
            )}
          </m.div>
        )}

        {confirmArchive && !isArchivedOptimistic && (
          <m.div
            key="confirm-archive-banner"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={motionTransition.productive}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
          >
            <span>
              Archive all completed operational projects? Governance history and audit logs remain intact.
            </span>
            <div className="flex gap-2">
              <Button
                kind="tertiary"
                size="small"
                onClick={() => setConfirmArchive(false)}
              >
                Cancel
              </Button>
              <Button
                size="small"
                disabled={busy}
                onClick={() => void handleConfirmArchive()}
              >
                Confirm archive
              </Button>
            </div>
          </m.div>
        )}

        {effectiveStage === "archived" && (
          <m.div
            key="archived-banner"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition.productive}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 p-3.5 text-xs text-neutral-700"
          >
            <Archive size={16} className="mt-0.5 shrink-0 text-neutral-500" />
            <div>
              <span className="font-semibold">Delivery archived.</span> All operational projects for this proposal have been archived.
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Operational Pulse Strip */}
      <div className="eflow-health-strip">
        <div className="eflow-health-item">
          <span className="eflow-health-item-label">Delivery progress</span>
          <div className="flex items-center gap-2">
            <span className="eflow-health-item-value">{summary.progress}%</span>
            <span className="text-xs text-secondary">
              ({summary.completedTaskCount}/{summary.taskCount} tasks approved)
            </span>
          </div>
        </div>

        <div className="eflow-health-item">
          <span className="eflow-health-item-label">Delivery status</span>
          <div>
            <Label text={DELIVERY_STAGE_LABELS[effectiveStage]} color={stageColor} />
          </div>
        </div>

        <div className="eflow-health-item">
          <span className="eflow-health-item-label">Projects complete</span>
          <div className="flex items-center gap-1.5">
            <span className="eflow-health-item-value">
              {summary.completedProjectCount}/{summary.projectCount}
            </span>
          </div>
        </div>

        <div className="eflow-health-item">
          <span className="eflow-health-item-label">Remaining tasks</span>
          <span className="eflow-health-item-value">
            {summary.remainingTaskCount}
          </span>
        </div>

        <div className="eflow-health-item">
          <span className="eflow-health-item-label">Needs attention</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`eflow-health-item-value ${totalAttention > 0 ? "text-amber-600" : "text-neutral-900"}`}
            >
              {totalAttention}
            </span>
            {totalAttention > 0 && (
              <span className="text-xs text-secondary">
                ({summary.overdueCount} overdue)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Operational Projects List */}
      <section className="eflow-section-card">
        <header>
          <h2>Operational projects ({summary.projects.length})</h2>
          <p className="m-0 mt-1 text-xs text-secondary">
            Click on any project below to enter its workspace, manage milestone activities, assign tasks, and track execution.
          </p>
        </header>

        <div className="divide-y divide-neutral-100">
          {summary.projects.map((project) => {
            const projectTasks = summary.tasks.filter(
              (task) => task.linkedProjectId === project.id,
            );
            const completed = projectTasks.filter(
              (task) => task.status === "completed",
            ).length;
            const progress = projectTasks.length
              ? Math.round(
                  projectTasks.reduce(
                    (total, task) =>
                      total +
                      (task.status === "completed"
                        ? 100
                        : task.percentComplete || 0),
                    0,
                  ) / projectTasks.length,
                )
              : project.status === "completed" || project.status === "archived"
                ? 100
                : 0;

            return (
              <div
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-neutral-50/70 transition-colors"
              >
                <div className="min-w-[240px] flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 text-sm">
                      {project.title}
                    </span>
                    <Label
                      text={project.status.replace("_", " ")}
                      color={
                        project.status === "completed"
                          ? "positive"
                          : project.status === "active"
                            ? "primary"
                            : "dark"
                      }
                    />
                  </div>
                  <div className="mt-1 text-xs text-secondary">
                    {completed}/{projectTasks.length} tasks approved · Target:{" "}
                    {formatDate(project.targetDate) || "Unscheduled"}
                  </div>
                </div>

                <div className="flex items-center gap-6 min-w-[200px]">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-secondary font-medium">Progress</span>
                      <span className="font-semibold text-neutral-900">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    kind="secondary"
                    size="small"
                    rightIcon={Open}
                    onClick={() => onOpenProject(project.id)}
                  >
                    Open project
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
