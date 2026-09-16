import * as React from "react";
import type { Organization, UserProfile } from "../../../../types";
import { ROLE_COLORS, ROLE_LABELS } from "./orgTreeModel";

export function UsersPanel({
  profiles,
  orgs,
  search,
  setSearch,
  onCreateUser,
}: {
  profiles: UserProfile[];
  orgs: Organization[];
  search: string;
  setSearch: (v: string) => void;
  onCreateUser: () => void;
}) {
  const orgMap = React.useMemo(
    () => Object.fromEntries(orgs.map((o) => [o.id, o.name])),
    [orgs]
  );

  const filtered = React.useMemo(
    () =>
      search
        ? profiles.filter(
            (p) =>
              p.full_name.toLowerCase().includes(search.toLowerCase()) ||
              p.email.toLowerCase().includes(search.toLowerCase()) ||
              p.role.toLowerCase().includes(search.toLowerCase())
          )
        : profiles,
    [profiles, search]
  );

  const unassigned = profiles.filter((p) => !p.org_id).length;
  const assigned = profiles.filter((p) => p.org_id).length;

  return (
    <div className="w-[280px] shrink-0 bg-white border-l border-neutral-200 flex flex-col h-full">
      <div className="p-3 border-b border-neutral-100">
        <div className="text-[12px] font-semibold text-neutral-800 mb-2">
          Users
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[12px] font-normal placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('userId', p.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 cursor-grab active:cursor-grabbing transition-colors border border-transparent hover:border-neutral-200"
          >
            <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-semibold text-neutral-600">
                {p.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-neutral-900 truncate">
                {p.full_name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`px-1 py-0.5 rounded-full text-[8px] font-medium ${ROLE_COLORS[p.role] || 'bg-neutral-100 text-neutral-600'}`}
                >
                  {ROLE_LABELS[p.role] || p.role}
                </span>
                {p.org_id ? (
                  <span className="text-[9px] font-normal text-neutral-500 truncate">
                    {orgMap[p.org_id] || '—'}
                  </span>
                ) : (
                  <span className="text-[9px] font-normal text-neutral-400">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-[11px] text-neutral-400 text-center py-8">No users found</div>
        )}
      </div>

      <div className="p-3 border-t border-neutral-100 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-normal text-neutral-500">
          <span>Unassigned: {unassigned}</span>
          <span>Assigned: {assigned}</span>
        </div>
        <button
          onClick={onCreateUser}
          className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-[12px] font-medium hover:bg-neutral-800 cursor-pointer transition-colors"
        >
          + Create User
        </button>
      </div>
    </div>
  );
}

// ─── Main Org Tree Builder Component ────────────────────────────
