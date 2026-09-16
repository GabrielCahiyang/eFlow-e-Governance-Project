import { Building2, Handshake } from "lucide-react";
import type { Organization } from "../../../types";
import type { CollaborationOrganizationSelection, CollaborationSnapshotTask } from "../types";

type ResponsibilityEditorProps = {
  task: CollaborationSnapshotTask;
  organizations: Organization[];
  participating: CollaborationOrganizationSelection[];
  editable: boolean;
  onPatchActivity: (patch: Pick<CollaborationSnapshotTask, "activityPrimaryOrgId" | "activitySupportingOrgIds">) => void;
};

export function ResponsibilityEditor({
  task,
  organizations,
  participating,
  editable,
  onPatchActivity,
}: ResponsibilityEditorProps) {
  const operational = participating.filter((item) => item.participationRole === "owner" || item.participationRole === "participant");
  const nameOf = (orgId: string) => organizations.find((org) => org.id === orgId)?.name || "Unassigned";
  const toggle = (values: string[], orgId: string, primaryOrgId: string) => {
    if (orgId === primaryOrgId) return values.filter((id) => id !== orgId);
    return values.includes(orgId) ? values.filter((id) => id !== orgId) : [...values, orgId];
  };

  const OrganizationSelector = ({
    label,
    primaryOrgId,
    supportingOrgIds,
    onPrimary,
    onSupporting,
  }: {
    label: string;
    primaryOrgId: string;
    supportingOrgIds: string[];
    onPrimary: (orgId: string) => void;
    onSupporting: (orgIds: string[]) => void;
  }) => (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-neutral-500">
        <Building2 size={11} /> {label}
      </div>
      <div className="flex items-center justify-between gap-2 text-[9px] text-neutral-400">
        <span>Primary office</span>
        {editable ? (
          <select
            value={primaryOrgId}
            onChange={(event) => onPrimary(event.target.value)}
            className="h-7 max-w-[170px] rounded-lg border border-neutral-200 bg-white px-2 text-[10px] normal-case text-neutral-700"
          >
            {operational.map((item) => <option key={item.orgId} value={item.orgId}>{nameOf(item.orgId)}</option>)}
          </select>
        ) : <span className="font-medium normal-case text-neutral-700">{nameOf(primaryOrgId)}</span>}
      </div>
      <div className="mt-2">
        <div className="mb-1.5 flex items-center gap-1 text-[9px] text-neutral-400"><Handshake size={10} /> Supporting offices</div>
        <div className="flex flex-wrap gap-1.5">
          {operational.filter((item) => item.orgId !== primaryOrgId).map((item) => {
            const selected = supportingOrgIds.includes(item.orgId);
            return editable ? (
              <button
                type="button"
                key={item.orgId}
                onClick={() => onSupporting(toggle(supportingOrgIds, item.orgId, primaryOrgId))}
                className={`rounded-full border px-2 py-1 text-[8px] transition ${selected ? "border-blue-200 bg-blue-50 text-blue-700" : "border-neutral-200 bg-white text-neutral-500 hover:border-blue-200"}`}
              >
                {selected ? "Supporting · " : "+ "}{nameOf(item.orgId)}
              </button>
            ) : selected ? <span key={item.orgId} className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[8px] text-blue-700">{nameOf(item.orgId)}</span> : null;
          })}
          {!editable && supportingOrgIds.length === 0 && <span className="text-[8px] text-neutral-400">None</span>}
        </div>
      </div>
    </div>
  );

  return <OrganizationSelector
    label={`Responsible offices · ${task.activityTitle}`}
    primaryOrgId={task.activityPrimaryOrgId}
    supportingOrgIds={task.activitySupportingOrgIds}
    onPrimary={(orgId) => onPatchActivity({
      activityPrimaryOrgId: orgId,
      activitySupportingOrgIds: task.activitySupportingOrgIds.filter((id) => id !== orgId),
    })}
    onSupporting={(orgIds) => onPatchActivity({
      activityPrimaryOrgId: task.activityPrimaryOrgId,
      activitySupportingOrgIds: orgIds,
    })}
  />;
}
