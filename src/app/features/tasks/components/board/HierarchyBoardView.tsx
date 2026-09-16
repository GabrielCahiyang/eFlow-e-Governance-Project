import { useMemo } from "react";
import { ChevronRight, Layers } from "lucide-react";
import type { Employee } from "../../../../services/employeeService";
import type { Task } from "../../../../services/taskService";
import { getHierarchyDisplay } from "./model";
import type { MondayBoardProps } from "./model";
import { HierarchyTaskRow } from "./HierarchyTaskRow";

export function HierarchyBoardView({
  tasks,
  employees,
  role,
  onVerify,
  onExecute,
  onSubmitRequest,
  onOpenTaskEditor,
  onDeleteTaskRequest,
  onArchiveTaskRequest,
  onCancelTaskRequest,
  currentUserId,
  onUndoRequest,
}: {
  tasks: Task[];
  employees: Employee[];
  role: "depthead" | "employee";
  onVerify?: MondayBoardProps["onVerify"];
  onExecute?: MondayBoardProps["onExecute"];
  onSubmitRequest?: (task: Task) => void;
  onOpenTaskEditor?: (task: Task) => void;
  onDeleteTaskRequest?: (task: Task) => void;
  onArchiveTaskRequest?: (task: Task) => void;
  onCancelTaskRequest?: (task: Task) => void;
  currentUserId?: string;
  currentUserName?: string;
  onUndoRequest?: (task: Task) => void;
}) {
  type ActivityNode = {
    key: string;
    title: string;
    schedule?: string;
    tasks: Task[];
  };
  type ProjectNode = { key: string; title: string; activities: ActivityNode[] };
  type ProgramNode = { key: string; title: string; projects: ProjectNode[] };
  type ProposalNode = { key: string; title: string; programs: ProgramNode[] };
  const employeeById = useMemo(
    () =>
      Object.fromEntries(
        employees.map((employee) => [employee.id, employee]),
      ) as Record<string, Employee>,
    [employees],
  );

  const tree = useMemo(() => {
    const proposals: ProposalNode[] = [];

    tasks.forEach((task) => {
      const hierarchy = getHierarchyDisplay(task);
      const proposalKey = task.proposalId || hierarchy.proposalTitle;
      const programKey =
        task.programId || `${proposalKey}|${hierarchy.programTitle}`;
      const projectKey =
        task.projectId || `${programKey}|${hierarchy.projectTitle}`;
      const activityKey =
        task.activityId || `${projectKey}|${hierarchy.activityTitle}`;

      let proposal = proposals.find((item) => item.key === proposalKey);
      if (!proposal) {
        proposal = {
          key: proposalKey,
          title: hierarchy.proposalTitle,
          programs: [],
        };
        proposals.push(proposal);
      }

      let program = proposal.programs.find((item) => item.key === programKey);
      if (!program) {
        program = {
          key: programKey,
          title: hierarchy.programTitle,
          projects: [],
        };
        proposal.programs.push(program);
      }

      let project = program.projects.find((item) => item.key === projectKey);
      if (!project) {
        project = {
          key: projectKey,
          title: hierarchy.projectTitle,
          activities: [],
        };
        program.projects.push(project);
      }

      let activity = project.activities.find(
        (item) => item.key === activityKey,
      );
      if (!activity) {
        activity = {
          key: activityKey,
          title: hierarchy.activityTitle,
          schedule: hierarchy.activitySchedule,
          tasks: [],
        };
        project.activities.push(activity);
      }

      activity.tasks.push(task);
    });

    return proposals;
  }, [tasks]);

  if (tree.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-[12px] text-neutral-400">
        No tasks yet in this board.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map((proposal) => {
        const proposalTaskCount = proposal.programs.reduce(
          (sum, program) =>
            sum +
            program.projects.reduce(
              (projectSum, project) =>
                projectSum +
                project.activities.reduce(
                  (activitySum, activity) =>
                    activitySum + activity.tasks.length,
                  0,
                ),
              0,
            ),
          0,
        );

        return (
          <section
            key={proposal.key}
            className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-900">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                  Proposal
                </div>
                <div className="text-[14px] text-white font-semibold truncate">
                  {proposal.title}
                </div>
              </div>
              <div className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] uppercase tracking-wider text-white">
                {proposalTaskCount} tasks
              </div>
            </div>

            <div className="divide-y divide-neutral-100">
              {proposal.programs.map((program) => (
                <div key={program.key}>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
                    <Layers size={13} className="text-violet-600" />
                    <div className="text-[12px] font-medium text-violet-900">
                      {program.title}
                    </div>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-violet-500">
                      Program
                    </span>
                  </div>

                  <div className="space-y-2 px-4 py-3">
                    {program.projects.map((project) => (
                      <div
                        key={project.key}
                        className="rounded-xl border border-neutral-200 bg-neutral-50/70"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 bg-white">
                          <ChevronRight
                            size={12}
                            className="text-neutral-400"
                          />
                          <div className="text-[11px] font-medium text-neutral-700">
                            {project.title}
                          </div>
                          <span className="ml-auto text-[9px] uppercase tracking-wider text-neutral-400">
                            Task hierarchy · Project
                          </span>
                        </div>

                        <div className="space-y-2 p-2.5">
                          {project.activities.map((activity) => (
                            <div
                              key={activity.key}
                              className="rounded-lg border border-neutral-200 bg-white"
                            >
                              <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                <div className="text-[11px] text-neutral-700 font-medium">
                                  {activity.title}
                                </div>
                                {activity.schedule && (
                                  <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] text-emerald-700">
                                    {activity.schedule}
                                  </span>
                                )}
                              </div>

                              <div className="divide-y divide-neutral-100">
                                {activity.tasks.map((task) => (
                                  <HierarchyTaskRow
                                    key={task.id}
                                    task={task}
                                    employeeById={employeeById}
                                    role={role}
                                    currentUserId={currentUserId}
                                    onVerify={onVerify}
                                    onExecute={onExecute}
                                    onSubmitRequest={onSubmitRequest}
                                    onOpenTaskEditor={onOpenTaskEditor}
                                    onDeleteTaskRequest={onDeleteTaskRequest}
                                    onArchiveTaskRequest={onArchiveTaskRequest}
                                    onCancelTaskRequest={onCancelTaskRequest}
                                    onUndoRequest={onUndoRequest}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
