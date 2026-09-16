import { useState } from "react";
import { Award, BookOpen, ExternalLink, Hash, Link2, RefreshCw, Scale, Sparkles } from "lucide-react";
import { Btn, PageHeader } from "./primitives";

type IPCRTarget = {
  id: number;
  mfo: string;
  output: string;
  target: string;
  actualQ: number;
  actualE: number;
  actualT: number;
  workflowsCited: number;
  evidenceHash: string;
};

type AppraisalEmployee = {
  id: string;
  name: string;
  position: string;
  dept: string;
  rating: number;
  label: string;
  period: string;
  workflows: number;
  slaMet: number;
  revisions: number;
  aheadOfSchedule: number;
  targets: IPCRTarget[];
};

const APPRAISALS: AppraisalEmployee[] = [
  {
    id: "emp-001",
    name: "Engr. Arnel Dela Cruz",
    position: "Sr. Civil Engineer · SG-19",
    dept: "Engineering",
    rating: 4.5,
    label: "Very Satisfactory",
    period: "Jan–Jun 2026",
    workflows: 142,
    slaMet: 94,
    revisions: 2,
    aheadOfSchedule: 38,
    targets: [
      { id: 1, mfo: "MFO 1 · Infrastructure", output: "Site permit reviews", target: "120 reviews, ≤5d each", actualQ: 5, actualE: 4, actualT: 5, workflowsCited: 142, evidenceHash: "0x4f8a...c72e" },
      { id: 2, mfo: "MFO 1 · Infrastructure", output: "Drainage inspections", target: "48 inspections, ≤7d", actualQ: 5, actualE: 5, actualT: 4, workflowsCited: 51, evidenceHash: "0x9a12...bd8c" },
      { id: 3, mfo: "MFO 2 · Coordination", output: "Barangay compliance audits", target: "24 audits, monthly", actualQ: 4, actualE: 4, actualT: 5, workflowsCited: 26, evidenceHash: "0x27fe...4a09" },
      { id: 4, mfo: "MFO 3 · Capacity Building", output: "Junior engineer mentoring logs", target: "Weekly standups, 6mo", actualQ: 4, actualE: 5, actualT: 5, workflowsCited: 24, evidenceHash: "0x881d...6f02" },
    ],
  },
  {
    id: "emp-002",
    name: "Arch. Patricia Odal",
    position: "City Planning Architect · SG-22",
    dept: "Planning",
    rating: 5.0,
    label: "Outstanding",
    period: "Jan–Jun 2026",
    workflows: 187,
    slaMet: 98,
    revisions: 1,
    aheadOfSchedule: 62,
    targets: [
      { id: 1, mfo: "MFO 1 · Zoning", output: "Zoning clearance reviews", target: "80 reviews, ≤10d", actualQ: 5, actualE: 5, actualT: 5, workflowsCited: 94, evidenceHash: "0x3e7f...0d41" },
      { id: 2, mfo: "MFO 2 · Planning", output: "Subdivision plan approvals", target: "12 plans, quality ≥4.0", actualQ: 5, actualE: 5, actualT: 5, workflowsCited: 14, evidenceHash: "0xab33...1779" },
    ],
  },
  {
    id: "emp-003",
    name: "Lynnette Bascon",
    position: "LEDIPO Coordinator · SG-18",
    dept: "LEDIPO",
    rating: 3.2,
    label: "Satisfactory",
    period: "Jan–Jun 2026",
    workflows: 68,
    slaMet: 72,
    revisions: 14,
    aheadOfSchedule: 8,
    targets: [
      { id: 1, mfo: "MFO 1 · Investment", output: "Investor briefs", target: "20 briefs, ≤14d", actualQ: 3, actualE: 3, actualT: 4, workflowsCited: 21, evidenceHash: "0x51c0...ee22" },
      { id: 2, mfo: "MFO 2 · Promotion", output: "Tourism campaign coordination", target: "8 campaigns", actualQ: 3, actualE: 3, actualT: 3, workflowsCited: 8, evidenceHash: "0x7722...9e51" },
    ],
  },
  {
    id: "emp-004",
    name: "Juanito Pomentil",
    position: "Social Worker III · SG-15",
    dept: "Social Welfare",
    rating: 2.4,
    label: "Unsatisfactory",
    period: "Jan–Jun 2026",
    workflows: 34,
    slaMet: 48,
    revisions: 22,
    aheadOfSchedule: 2,
    targets: [
      { id: 1, mfo: "MFO 1 · Welfare", output: "Case assessments", target: "60 cases, ≤5d", actualQ: 2, actualE: 2, actualT: 3, workflowsCited: 34, evidenceHash: "0xcc29...01a4" },
    ],
  },
];

export const ratingTone = (r: number) =>
  r >= 4.5 ? { chip: "bg-emerald-100 text-emerald-700", text: "text-emerald-600", ring: "border-emerald-300" } :
  r >= 3.5 ? { chip: "bg-blue-100 text-blue-700", text: "text-blue-600", ring: "border-blue-200" } :
  r >= 2.5 ? { chip: "bg-amber-100 text-amber-700", text: "text-amber-600", ring: "border-amber-200" } :
  { chip: "bg-red-100 text-red-700", text: "text-red-600", ring: "border-red-300" };

export function CSCAppraisals() {
  const [selected, setSelected] = useState(APPRAISALS[0]);
  const [target, setTarget] = useState<IPCRTarget | null>(APPRAISALS[0].targets[0]);
  const [generating, setGenerating] = useState(false);

  function pickEmployee(e: AppraisalEmployee) {
    setSelected(e);
    setTarget(e.targets[0]);
  }

  function computeAvg(t: IPCRTarget) {
    return (t.actualQ + t.actualE + t.actualT) / 3;
  }

  return (
    <div>
      <PageHeader
        title="Strategic Performance Management System"
        subtitle="Semi-annual IPCR · evidence-anchored · no more last-minute Excel sheets"
        actions={
          <>
            <Btn icon={<BookOpen size={14} />} label="CSC MC No. 6, s.2012" />
            <Btn
              icon={generating ? <RefreshCw size={14} className="animate-spin" /> : <Scale size={14} />}
              label={generating ? "Generating..." : "Generate Semi-Annual Ratings"}
              variant="primary"
              onClick={() => {
                setGenerating(true);
                setTimeout(() => setGenerating(false), 1400);
              }}
            />
          </>
        }
      />

      <div className="grid grid-cols-[280px_1fr_340px] gap-4">
        {/* Left: Employee roster */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit sticky top-0">
          <div className="px-4 py-3 border-b border-neutral-200 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Roster · {APPRAISALS.length} employees
          </div>
          {APPRAISALS.map((e) => {
            const t = ratingTone(e.rating);
            const active = selected.id === e.id;
            return (
              <button
                key={e.id}
                onClick={() => pickEmployee(e)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors ${active ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
              >
                <div className={`text-[12px] font-medium ${active ? "text-white" : "text-neutral-900"}`}>{e.name}</div>
                <div className={`text-[10px] font-normal mt-0.5 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                  {e.dept}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${t.chip}`}>
                    {e.rating.toFixed(1)}
                  </span>
                  <span className={`text-[10px] font-normal ${active ? "text-neutral-300" : "text-neutral-500"}`}>{e.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Center: Official IPCR form */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="border-b border-neutral-200 px-6 py-4 bg-[linear-gradient(135deg,#fafaf9_0%,#f5f5f4_100%)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                Republic of the Philippines · Civil Service Commission
              </span>
              <span className="text-[10px] font-normal text-neutral-500">CSC Form No. IPCR</span>
            </div>
            <div className="text-[15px] font-semibold text-neutral-900">
              Individual Performance Commitment and Review
            </div>
            <div className="text-[11px] font-normal text-neutral-500 mt-0.5">
              {selected.period} · Local Government Unit · City of Ormoc
            </div>
          </div>

          <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-2 border-b border-neutral-200">
            <Field label="Ratee" value={selected.name} />
            <Field label="Position" value={selected.position} />
            <Field label="Office" value={selected.dept} />
            <Field label="Rating Period" value={selected.period} />
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-12 gap-2 px-2 py-2 bg-neutral-900 text-white rounded-t-md text-[10px] font-medium uppercase tracking-wider">
              <div className="col-span-3">MFO · Output</div>
              <div className="col-span-3">Success Indicator</div>
              <div className="col-span-1 text-center">Q</div>
              <div className="col-span-1 text-center">E</div>
              <div className="col-span-1 text-center">T</div>
              <div className="col-span-1 text-center">Avg</div>
              <div className="col-span-2 text-right">Evidence</div>
            </div>
            {selected.targets.map((t) => {
              const avg = computeAvg(t);
              const tone = ratingTone(avg);
              const isActive = target?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTarget(t)}
                  className={`w-full grid grid-cols-12 gap-2 px-2 py-3 border-b border-neutral-100 items-center text-[11px] font-normal text-left cursor-pointer transition-colors ${
                    isActive ? "bg-blue-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="col-span-3">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-400">{t.mfo}</div>
                    <div className="text-[12px] font-medium text-neutral-900">{t.output}</div>
                  </div>
                  <div className="col-span-3 text-neutral-600">{t.target}</div>
                  <RatingCell value={t.actualQ} />
                  <RatingCell value={t.actualE} />
                  <RatingCell value={t.actualT} />
                  <div className={`col-span-1 text-center font-semibold ${tone.text}`}>{avg.toFixed(1)}</div>
                  <div className="col-span-2 text-right font-mono text-[10px] text-neutral-500 flex items-center justify-end gap-1">
                    <Link2 size={9} />
                    {t.evidenceHash}
                  </div>
                </button>
              );
            })}

            <div className="mt-4 p-4 rounded-md bg-gradient-to-r from-neutral-50 to-white border-l-4 border-neutral-900">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Final Adjectival Rating</span>
                <Award size={14} className={ratingTone(selected.rating).text} />
              </div>
              <div className="flex items-baseline gap-3">
                <span className={`text-[40px] font-semibold leading-none ${ratingTone(selected.rating).text}`}>{selected.rating.toFixed(1)}</span>
                <span className={`text-[14px] font-medium ${ratingTone(selected.rating).text}`}>{selected.label}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between text-[10px] font-normal text-neutral-500">
            <span>Digitally signed · Ratee + Rater + Approver</span>
            <span className="font-mono">ipcr::{selected.id}::{selected.period.replace(/\s+/g, "")}</span>
          </div>
        </div>

        {/* Right: AI Justification */}
        <div className={`rounded-xl border-2 ${ratingTone(selected.rating).ring} bg-gradient-to-br from-white to-neutral-50 overflow-hidden h-fit`}>
          <div className="px-5 py-4 border-b border-neutral-200 bg-white">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-neutral-700" />
              <span className="text-[12px] font-medium text-neutral-700">AI Justification</span>
            </div>
            <div className="text-[10px] font-normal text-neutral-500 mt-1">
              {target ? `Target · ${target.output}` : "Select a row to see evidence"}
            </div>
          </div>

          {target && (
            <div className="p-5">
              <p className="text-[12px] font-normal text-neutral-700 leading-relaxed mb-4">
                Rating generated based on <span className="font-medium text-neutral-900">{target.workflowsCited} completed workflows</span>. <span className="font-medium text-neutral-900">{selected.slaMet}%</span> met SLA timelines. Quality score: only <span className="font-medium text-neutral-900">{selected.revisions}%</span> of submitted drafts were returned for revision.
              </p>

              <div className="space-y-2.5 mb-4">
                <MetricBar label="SLA Adherence" value={selected.slaMet} tone="good" />
                <MetricBar label="First-Pass Quality" value={100 - selected.revisions} tone="good" />
                <MetricBar label="Ahead of Schedule" value={selected.aheadOfSchedule} tone="neutral" />
              </div>

              <div className="rounded-lg bg-neutral-900 text-white p-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Evidence chain</span>
                  <Hash size={10} className="text-emerald-400" />
                </div>
                <div className="font-mono text-[10px] text-emerald-400 break-all">{target.evidenceHash}</div>
                <div className="text-[10px] font-normal text-neutral-400 mt-1">
                  Merkle-verified · {target.workflowsCited} workflows anchored
                </div>
              </div>

              <button className="w-full py-2 bg-white border border-neutral-200 rounded-lg text-[11px] font-medium hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1">
                Open Evidence Locker <ExternalLink size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="text-[12px] font-medium text-neutral-900">{value}</div>
    </div>
  );
}

function RatingCell({ value }: { value: number }) {
  const color = value >= 5 ? "text-emerald-600" : value >= 4 ? "text-blue-600" : value >= 3 ? "text-amber-600" : "text-red-600";
  return <div className={`col-span-1 text-center font-semibold ${color}`}>{value}</div>;
}

function MetricBar({ label, value, tone }: { label: string; value: number; tone: "good" | "neutral" | "bad" }) {
  const barColor = tone === "good" ? "bg-emerald-500" : tone === "bad" ? "bg-red-500" : "bg-blue-500";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-normal text-neutral-600 mb-0.5">
        <span>{label}</span>
        <span className="font-medium text-neutral-900">{value}%</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ==================== 11.1.B — TASK COMPLETION RATES (BELL CURVE) ====================
