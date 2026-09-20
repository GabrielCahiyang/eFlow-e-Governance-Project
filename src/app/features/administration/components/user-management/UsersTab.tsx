import { useMemo, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { useOrgs, useProfiles } from "../../../../hooks/useSupabaseData";
import { toggleUserActive } from "../../../../../lib/supabaseService";
import { DataTable, type Column } from "../../../../components/ui/DataTable";
import { useToast } from "../../../../components/ui/Toast";
import type { UserProfile } from "../../../../types";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { UserDirectoryFiltersBar } from "./UserDirectoryFiltersBar";
import { RoleBadge, StatusBadge, WorkloadBar } from "./userManagementPrimitives";
import {
  DEFAULT_USER_DIRECTORY_FILTERS,
  filterAndSortUserDirectory,
  type UserDirectoryFilters,
} from "../../selectors/userDirectory";

export function UsersTab({ onOpenAccess }: { onOpenAccess: (userId: string) => void }) {
  const { profiles, loading } = useProfiles();
  const { orgs } = useOrgs();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [filters, setFilters] = useState<UserDirectoryFilters>(DEFAULT_USER_DIRECTORY_FILTERS);
  const orgOptions = useMemo(() => orgs.filter((org) => org.is_active).map((org) => ({ value: org.id, label: org.name })).sort((left, right) => left.label.localeCompare(right.label)), [orgs]);
  const orgMap = useMemo(() => Object.fromEntries(orgs.map((org) => [org.id, org.name])), [orgs]);
  const directoryProfiles = useMemo(
    () => filterAndSortUserDirectory(profiles, orgMap, filters),
    [filters, orgMap, profiles],
  );

  const handleToggleStatus = async (profile: UserProfile) => {
    try {
      await toggleUserActive(profile.id, !profile.is_active);
      toast(`${profile.full_name} ${profile.is_active ? "deactivated" : "activated"}`, profile.is_active ? "warning" : "success");
    } catch (error: any) { toast(error?.message || "Failed to update status", "error"); }
  };

  const columns: Column<UserProfile>[] = [
    { key: "name", header: "Name", sortable: true, sortValue: (profile) => profile.full_name, render: (profile) => <div className="flex items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[10px] font-semibold text-neutral-600">{profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><div className="text-[11.5px] font-medium text-neutral-900">{profile.full_name}</div><div className="text-[9.5px] text-neutral-500">{profile.email}</div></div></div> },
    { key: "role", header: "Role", sortable: true, sortValue: (profile) => profile.role, render: (profile) => <RoleBadge role={profile.role} /> },
    { key: "organization", header: "Organization", sortable: true, sortValue: (profile) => orgMap[profile.org_id || ""] || "", render: (profile) => <span className="text-[11px] text-neutral-700">{orgMap[profile.org_id || ""] || "—"}</span> },
    { key: "workload", header: "Workload", sortable: true, sortValue: (profile) => profile.workload, render: (profile) => <WorkloadBar value={profile.workload} /> },
    { key: "status", header: "Status", sortable: true, sortValue: (profile) => profile.is_active ? 1 : 0, render: (profile) => <StatusBadge active={profile.is_active} /> },
    { key: "actions", header: "", width: "230px", render: (profile) => <div className="flex items-center justify-end gap-1.5"><button type="button" onClick={(event) => { event.stopPropagation(); onOpenAccess(profile.id); }} disabled={profile.role === "super_admin"} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[9.5px] font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40" title={profile.role === "super_admin" ? "Super Admin access is immutable" : "Manage individual access"}><KeyRound size={11} /> Access</button><button type="button" onClick={(event) => { event.stopPropagation(); setEditUser(profile); }} className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[9.5px] font-medium text-neutral-600 hover:bg-neutral-200">Edit</button><button type="button" onClick={(event) => { event.stopPropagation(); void handleToggleStatus(profile); }} className={`rounded-lg px-2.5 py-1.5 text-[9.5px] font-medium ${profile.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{profile.is_active ? "Deactivate" : "Activate"}</button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="text-[14px] font-semibold text-neutral-900">Account directory</h3><p className="mt-0.5 text-[10.5px] text-neutral-500">Identity, role, organization, workload, and access are managed from one workspace.</p></div><button type="button" onClick={() => setShowCreate(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-neutral-800"><Plus size={14} /> Create user</button></div>
      <DataTable
        key={filters.sort}
        data={directoryProfiles}
        totalRecords={profiles.length}
        columns={columns}
        keyExtractor={(profile) => profile.id}
        onRowClick={setEditUser}
        loading={loading}
        searchPlaceholder="Search by name, email, role, or organization…"
        searchFilter={(profile, query) => profile.full_name.toLowerCase().includes(query) || profile.email.toLowerCase().includes(query) || (orgMap[profile.org_id || ""] || "").toLowerCase().includes(query) || profile.role.toLowerCase().includes(query)}
        emptyMessage="No accounts match the current filters"
        toolbar={<UserDirectoryFiltersBar value={filters} organizations={orgOptions} onChange={setFilters} />}
      />
      <CreateUserModal isOpen={showCreate} onClose={() => setShowCreate(false)} orgOptions={orgOptions} organizations={orgs} profiles={profiles} />
      <EditUserModal isOpen={Boolean(editUser)} onClose={() => setEditUser(null)} user={editUser} orgOptions={orgOptions} organizations={orgs} profiles={profiles} />
    </div>
  );
}
