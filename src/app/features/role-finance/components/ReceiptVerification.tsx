import { useState } from "react";
import { AlertTriangle, CheckCircle2, Filter, Receipt, RefreshCw, ScanLine, Sparkles } from "lucide-react";
import { Btn, PageHeader, Stat, peso } from "./primitives";

type ReceiptLine = { desc: string; qty: number; unit: number; total: number };

type ReceiptDoc = {
  id: string;
  employee: string;
  dept: string;
  submitted: string;
  caRef: string;
  imgBg: string;
  extracted: {
    vendor: string;
    tin: string;
    date: string;
    orNumber: string;
    total: number;
    lines: ReceiptLine[];
  };
  confidence: number;
  status: "pending" | "verified" | "flagged";
};

const RECEIPTS: ReceiptDoc[] = [
  {
    id: "RCP-2026-1842",
    employee: "Engr. R. Mapalad",
    dept: "Engineering",
    submitted: "2026-04-19 14:22",
    caRef: "CA-2026-0091",
    imgBg: "linear-gradient(135deg,#fef3c7 0%,#fde68a 40%,#fef9c3 100%)",
    extracted: {
      vendor: "Oriental Hardware Trading",
      tin: "219-482-557-000",
      date: "2026-04-19",
      orNumber: "OR #48217",
      total: 4285,
      lines: [
        { desc: "Cement (40kg)", qty: 12, unit: 285, total: 3420 },
        { desc: "Rebar tie wire", qty: 5, unit: 120, total: 600 },
        { desc: "Construction nails", qty: 1, unit: 265, total: 265 },
      ],
    },
    confidence: 0.97,
    status: "pending",
  },
  {
    id: "RCP-2026-1843",
    employee: "Dr. M. Sabando",
    dept: "Health",
    submitted: "2026-04-19 16:04",
    caRef: "CA-2026-0088",
    imgBg: "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 40%,#eff6ff 100%)",
    extracted: {
      vendor: "MedEast Supply Inc.",
      tin: "004-218-992-000",
      date: "2026-04-18",
      orNumber: "OR #10041",
      total: 18450,
      lines: [
        { desc: "Paracetamol 500mg (100s)", qty: 20, unit: 620, total: 12400 },
        { desc: "Gauze pads sterile", qty: 15, unit: 320, total: 4800 },
        { desc: "Surgical gloves (box)", qty: 5, unit: 250, total: 1250 },
      ],
    },
    confidence: 0.92,
    status: "pending",
  },
  {
    id: "RCP-2026-1844",
    employee: "L. Bascon",
    dept: "LEDIPO",
    submitted: "2026-04-20 09:41",
    caRef: "CA-2026-0093",
    imgBg: "linear-gradient(135deg,#fce7f3 0%,#fbcfe8 40%,#fdf2f8 100%)",
    extracted: {
      vendor: "Visayan Print Works",
      tin: "182-667-441-000",
      date: "2026-04-19",
      orNumber: "OR #88203",
      total: 6780,
      lines: [
        { desc: "Tarpaulin print 8x4ft", qty: 8, unit: 480, total: 3840 },
        { desc: "A4 flyer 500pcs", qty: 3, unit: 980, total: 2940 },
      ],
    },
    confidence: 0.68,
    status: "flagged",
  },
  {
    id: "RCP-2026-1845",
    employee: "J. Pomentil",
    dept: "Social Welfare",
    submitted: "2026-04-20 11:18",
    caRef: "CA-2026-0087",
    imgBg: "linear-gradient(135deg,#dcfce7 0%,#bbf7d0 40%,#f0fdf4 100%)",
    extracted: {
      vendor: "Ormoc Catering Services",
      tin: "003-882-140-000",
      date: "2026-04-20",
      orNumber: "OR #22108",
      total: 8400,
      lines: [
        { desc: "Senior citizen meals (120 pax)", qty: 120, unit: 70, total: 8400 },
      ],
    },
    confidence: 0.98,
    status: "pending",
  },
];

export function ReceiptVerification() {
  const [selected, setSelected] = useState<ReceiptDoc>(RECEIPTS[0]);
  const [verified, setVerified] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);

  function bulkScan() {
    setScanning(true);
    setTimeout(() => setScanning(false), 1400);
  }

  return (
    <div>
      <PageHeader
        title="Audit Queue: Submitted Receipts"
        subtitle="AI-extracted OR data · auditor just looks and confirms"
        actions={
          <>
            <Btn icon={<Filter size={14} />} label="Filter: All Depts" />
            <Btn
              icon={scanning ? <RefreshCw size={14} className="animate-spin" /> : <ScanLine size={14} />}
              label={scanning ? "Scanning..." : "Bulk AI Scan"}
              variant="primary"
              onClick={bulkScan}
            />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="In Queue" value={String(RECEIPTS.length - verified.size)} trend="awaiting verify" />
        <Stat label="High Confidence" value={String(RECEIPTS.filter((r) => r.confidence >= 0.9).length)} trend="≥ 90% OCR match" tone="good" />
        <Stat label="Flagged Low Conf." value={String(RECEIPTS.filter((r) => r.confidence < 0.8).length)} trend="requires manual review" tone="warn" />
        <Stat label="Avg Verification Time" value="12s" trend="vs 4.5 min manual" tone="good" />
      </div>

      <div className="grid grid-cols-[300px_1fr_1fr] gap-4">
        {/* Queue */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-neutral-200 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Receipt Queue
          </div>
          {RECEIPTS.map((r) => {
            const active = selected.id === r.id;
            const done = verified.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors ${
                  active ? "bg-neutral-900 text-white" : done ? "bg-emerald-50" : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-mono text-[10px] ${active ? "text-neutral-400" : "text-neutral-400"}`}>{r.id}</span>
                  {done && <CheckCircle2 size={10} className="text-emerald-600 ml-auto" />}
                  {r.confidence < 0.8 && !done && <AlertTriangle size={10} className="text-amber-500 ml-auto" />}
                </div>
                <div className={`text-[12px] font-medium ${active ? "text-white" : "text-neutral-900"} truncate`}>
                  {r.employee}
                </div>
                <div className={`text-[10px] font-normal mt-0.5 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                  {r.dept} · {peso(r.extracted.total)}
                </div>
                <div className="mt-1.5 h-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${r.confidence >= 0.9 ? "bg-emerald-500" : r.confidence >= 0.8 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width: `${r.confidence * 100}%` }}
                  />
                </div>
                <div className={`text-[9px] mt-0.5 ${active ? "text-neutral-400" : "text-neutral-500"} font-normal`}>
                  OCR confidence {Math.round(r.confidence * 100)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Receipt photo */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-2">
            <Receipt size={13} className="text-neutral-700" />
            <span className="text-[12px] font-medium text-neutral-700">Official Receipt · Photo</span>
            <span className="ml-auto text-[10px] text-neutral-400 font-mono">{selected.id}</span>
          </div>
          <div className="p-5 bg-neutral-100">
            <div
              className="relative mx-auto rounded shadow-xl overflow-hidden"
              style={{ background: selected.imgBg, width: "100%", maxWidth: 360, aspectRatio: "3/4" }}
            >
              {/* Mock OR layout */}
              <div className="absolute inset-0 p-4 text-neutral-800">
                <div className="text-center pb-2 border-b-2 border-dashed border-neutral-400/60">
                  <div className="text-[14px] font-semibold uppercase tracking-wider">{selected.extracted.vendor}</div>
                  <div className="text-[8px] mt-0.5 font-mono">TIN {selected.extracted.tin}</div>
                  <div className="text-[8px] font-mono mt-0.5">OFFICIAL RECEIPT</div>
                </div>
                <div className="text-[8px] font-mono flex justify-between mt-2 text-neutral-700">
                  <span>{selected.extracted.orNumber}</span>
                  <span>{selected.extracted.date}</span>
                </div>
                <div className="mt-3 space-y-1">
                  {selected.extracted.lines.map((l, i) => (
                    <div key={i} className="flex justify-between text-[9px] font-mono">
                      <span className="truncate pr-2">
                        {l.qty}× {l.desc}
                      </span>
                      <span className="tabular-nums whitespace-nowrap">₱{l.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t-2 border-dashed border-neutral-400/60 flex justify-between text-[11px] font-semibold">
                  <span>TOTAL</span>
                  <span className="tabular-nums">₱{selected.extracted.total.toLocaleString()}.00</span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-center text-[7px] font-mono text-neutral-600 opacity-70">
                  VAT-INCLUSIVE · THIS SERVES AS YOUR OFFICIAL RECEIPT
                </div>
              </div>
              {/* Scan overlay animation */}
              {scanning && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-emerald-400/60 to-transparent" style={{ animation: "scanMove 1.4s ease-in-out infinite" }} />
                </div>
              )}
            </div>
            <div className="mt-3 text-center text-[10px] font-normal text-neutral-500">
              Submitted via Level 5 mobile · {selected.submitted}
            </div>
          </div>
        </div>

        {/* Extracted data */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
            <Sparkles size={13} className="text-emerald-400" />
            <span className="text-[12px] font-medium">AI-Extracted Data</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-medium">
              {Math.round(selected.confidence * 100)}% conf.
            </span>
          </div>
          <div className="p-4 space-y-3 text-[12px]">
            <ExtractRow label="Vendor" value={selected.extracted.vendor} />
            <ExtractRow label="TIN" value={selected.extracted.tin} mono />
            <ExtractRow label="Date" value={selected.extracted.date} mono />
            <ExtractRow label="OR Number" value={selected.extracted.orNumber} mono />
            <ExtractRow label="Cash Advance Ref" value={selected.caRef} mono />
            <div className="border-t border-neutral-800 pt-3">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Line items</div>
              <div className="space-y-1.5">
                {selected.extracted.lines.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] font-normal">
                    <span className="text-neutral-300 truncate pr-2">{l.qty}× {l.desc}</span>
                    <span className="tabular-nums font-mono text-emerald-400 whitespace-nowrap">₱{l.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Extracted total</span>
              <span className="text-[20px] font-semibold text-emerald-400 tabular-nums">{peso(selected.extracted.total)}</span>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-neutral-800 flex gap-2">
            <button className="flex-1 py-2 rounded-md bg-neutral-800 text-neutral-300 text-[11px] font-medium hover:bg-neutral-700 cursor-pointer">
              Re-scan
            </button>
            <button
              onClick={() => setVerified((v) => new Set([...v, selected.id]))}
              disabled={verified.has(selected.id)}
              className="flex-1 py-2 rounded-md bg-emerald-500 text-white text-[11px] font-medium hover:bg-emerald-400 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <CheckCircle2 size={12} /> {verified.has(selected.id) ? "Verified" : "Match & Verify"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanMove {
          0% { top: -20%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
}

function ExtractRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[9px] text-neutral-400 uppercase tracking-wider">{label}</div>
      <div className={`text-[12px] text-white ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}

// ==================== 13.1.B — EXACT COST REVIEW (PRICE ANOMALY) ====================
