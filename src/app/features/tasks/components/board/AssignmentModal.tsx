import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Crown, Search, X } from "lucide-react";
import type { Employee } from "../../../../services/employeeService";
import type { EmployeeNotesMap } from "../../../../services/employeeNotesService";
import { getInitials } from "./model";

export function AssignmentModal({
  open,
  onClose,
  employees,
  employeeNotes,
  selectedIds,
  leadId,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
  employeeNotes?: EmployeeNotesMap;
  selectedIds: string[];
  leadId: string | null;
  onConfirm: (memberIds: string[], leadId: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [draftLead, setDraftLead] = useState<string | null>(leadId);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(selectedIds);
      setDraftLead(leadId);
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.jobTitle || "").toLowerCase().includes(q) ||
        (e.departmentName || "").toLowerCase().includes(q),
    );
  }, [employees, search]);

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (draftLead && !next.includes(draftLead)) setDraftLead(next[0] || null);
      return next;
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[540px] max-h-[82vh] flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s ease" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
              Team Assignment
            </div>
            <div className="text-[16px] font-semibold text-neutral-900 mt-0.5">
              Select Team Members
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 border-b border-neutral-100 shrink-0">
          <div className="relative flex items-center bg-neutral-50 border border-neutral-200 rounded-xl h-[38px] focus-within:border-neutral-400 focus-within:bg-white transition">
            <Search size={14} className="text-neutral-400 ml-3 shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, or department…"
              className="flex-1 bg-transparent px-2 text-[12px] font-normal text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="pr-2.5 text-neutral-400 hover:text-neutral-700"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Selected chips */}
          {draft.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {draft.map((id) => {
                const emp = employees.find((e) => e.id === id);
                if (!emp) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-medium px-2 py-1 rounded-full"
                  >
                    {draftLead === id && (
                      <Crown size={10} className="text-amber-500" />
                    )}
                    {getInitials(emp.name)} · {emp.name.split(" ")[0]}
                    <button
                      onClick={() => toggle(id)}
                      className="text-violet-400 hover:text-violet-700 ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Employee list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {filtered.length === 0 ? (
            <div className="text-center text-[12px] text-neutral-400 py-10">
              No employees match "{search}"
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((emp) => {
                const selected = draft.includes(emp.id);
                const isLead = draftLead === emp.id;
                const notes = employeeNotes?.[emp.id];
                const tags = notes?.tags?.slice(0, 3) || [];
                const load = emp.currentWorkload;
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggle(emp.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      selected
                        ? "bg-violet-50 border border-violet-200"
                        : "bg-white border border-transparent hover:border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0 ${
                        load >= 80
                          ? "bg-red-500"
                          : load >= 60
                            ? "bg-amber-500"
                            : "bg-neutral-800"
                      }`}
                    >
                      {getInitials(emp.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-neutral-900 truncate">
                          {emp.name}
                        </span>
                        {isLead && (
                          <Crown
                            size={11}
                            className="text-amber-500 shrink-0"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">
                        {emp.jobTitle}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-neutral-100 text-neutral-500 text-[9px] px-1.5 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Workload */}
                    <div className="shrink-0 text-right">
                      <div
                        className={`text-[11px] font-semibold ${load >= 80 ? "text-red-600" : load >= 60 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {load}%
                      </div>
                      <div className="text-[9px] text-neutral-400">
                        workload
                      </div>
                    </div>

                    {/* Lead toggle */}
                    {selected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraftLead(isLead ? null : emp.id);
                        }}
                        className={`shrink-0 p-1.5 rounded-lg transition ${
                          isLead
                            ? "bg-amber-100 text-amber-600"
                            : "text-neutral-300 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                        title="Set as Team Lead"
                      >
                        <Crown size={13} />
                      </button>
                    )}

                    {/* Checkbox */}
                    <div
                      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                        selected
                          ? "border-violet-500 bg-violet-500"
                          : "border-neutral-300"
                      }`}
                    >
                      {selected && (
                        <Check
                          size={11}
                          className="text-white"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between shrink-0">
          <div className="text-[12px] text-neutral-500 font-normal">
            {draft.length > 0
              ? `${draft.length} selected${draftLead ? ` · Lead: ${employees.find((e) => e.id === draftLead)?.name?.split(" ")[0] || ""}` : ""}`
              : "No members selected"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(draft, draftLead);
                onClose();
              }}
              className="px-4 py-2 text-[12px] font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Chat Section ──────────────────────────────────────────────
