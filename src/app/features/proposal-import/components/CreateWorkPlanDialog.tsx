import * as Icons from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { ManualPlanBuilder } from "./ManualPlanBuilder";
import ProposalImport from "./ProposalImport";

export type WorkPlanCreationMode = "manual" | "import";

interface CreateWorkPlanDialogProps {
  open: boolean;
  mode: WorkPlanCreationMode;
  onModeChange: (mode: WorkPlanCreationMode) => void;
  onClose: () => void;
}

export function CreateWorkPlanDialog({
  open,
  mode,
  onModeChange,
  onClose,
}: CreateWorkPlanDialogProps) {
  const isManual = mode === "manual";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      width="max-w-6xl"
      className="!max-h-[92vh] overflow-hidden"
      bodyClassName="!p-0 !overflow-hidden flex flex-col flex-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-100 bg-white shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 shrink-0">
            {isManual ? <Icons.FileEdit size={20} /> : <Icons.FileUp size={20} />}
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-600 font-sans">
              Planning Workspace
            </span>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Create a work plan
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <Icons.X size={18} />
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] flex-1 overflow-hidden bg-neutral-50/50">
        {/* Left Column: Form & Tabs */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-6 max-h-[calc(92vh-80px)]">
          {/* Segmented Pill Tabs */}
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-neutral-200/60 rounded-xl border border-neutral-200/80">
            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isManual
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
              }`}
            >
              <Icons.FilePlus size={15} className={isManual ? "text-indigo-600" : "text-neutral-400"} />
              <span>New work plan</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange("import")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isManual
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
              }`}
            >
              <Icons.FileText size={15} className={!isManual ? "text-indigo-600" : "text-neutral-400"} />
              <span>Import proposal</span>
            </button>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
            {isManual
              ? "Build a structured plan in eFlow. Your draft autosaves and becomes operational only after approval and commit."
              : "Bring a government proposal into eFlow. We will prepare an editable draft for your review before anything becomes operational."}
          </p>

          {/* Form Content */}
          <div className="pt-2">
            <div hidden={!isManual}>
              <ManualPlanBuilder inDialog embedded onClose={onClose} />
            </div>
            <div hidden={isManual}>
              <ProposalImport inDialog embedded onClose={onClose} />
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Card */}
        <div className="hidden lg:flex flex-col justify-between p-6 border-l border-neutral-200/70 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/70 overflow-y-auto max-h-[calc(92vh-80px)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-sans">
                {isManual ? "Build with structure" : "AI-Assisted Proposal"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-indigo-100 text-[10.5px] font-semibold text-indigo-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Draft
              </span>
            </div>

            {/* Visual Board Mockup */}
            <div className="relative py-4 flex items-center justify-center">
              <div className="w-48 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-2xl p-4 shadow-lg shadow-indigo-100/50 space-y-2.5 transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="h-2 w-3/4 bg-indigo-200 rounded-full" />
                <div className="h-2 w-full bg-neutral-100 rounded-full" />
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className="h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">P</div>
                  <div className="h-6 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">A</div>
                  <div className="h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">T</div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {isManual ? "From idea to delivery" : "A safer path from PDF to plan"}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isManual
                  ? "Keep programs, projects, activities, and tasks connected from the first draft."
                  : "Review the editable decomposition, scope, and assignments before requesting approval."}
              </p>
            </div>

            {/* Step list */}
            <ol className="space-y-2.5 pt-2">
              {(isManual
                ? ["Set the plan scope", "Shape the delivery hierarchy", "Review and commit"]
                : ["Upload the proposal", "Review the AI draft", "Request approval"]
              ).map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-xs font-semibold text-neutral-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold shadow-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-6 border-t border-indigo-100/80 mt-6">
            <div className="flex items-start gap-2 text-[11px] text-neutral-600 leading-snug">
              <Icons.CheckCircle2 size={15} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>Drafts autosave · no operational work is created before approval</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
