import { useMemo, useState } from "react";
import { AlertTriangle, Award } from "lucide-react";
import { PageHeader, Stat } from "./primitives";

const BELL_BUCKETS = [
  { rating: 1, label: "Poor", count: 42, color: "#dc2626", flag: "Mandatory retraining" },
  { rating: 2, label: "Unsatisfactory", count: 148, color: "#f97316", flag: "Performance plan" },
  { rating: 3, label: "Satisfactory", count: 1204, color: "#10b981", flag: "Baseline" },
  { rating: 4, label: "Very Satisfactory", count: 548, color: "#3b82f6", flag: "Merit increase eligible" },
  { rating: 5, label: "Outstanding", count: 126, color: "#8b5cf6", flag: "Promotion fast-track" },
];

export function TaskCompletionRates() {
  const [period, setPeriod] = useState<"q1" | "q2" | "compare">("q2");
  const total = BELL_BUCKETS.reduce((s, b) => s + b.count, 0);
  const maxCount = Math.max(...BELL_BUCKETS.map((b) => b.count));

  const W = 800;
  const H = 260;
  const pad = 50;

  // Smooth bell curve path
  const curvePoints = useMemo(() => {
    const mean = 3;
    const sd = 0.9;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const r = 1 + (i / 100) * 4;
      const y = Math.exp(-0.5 * Math.pow((r - mean) / sd, 2));
      pts.push({ x: r, y });
    }
    const maxY = Math.max(...pts.map((p) => p.y));
    return pts.map((p) => ({
      px: pad + ((p.x - 1) / 4) * (W - pad * 2),
      py: H - pad - (p.y / maxY) * (H - pad * 2),
    }));
  }, []);

  const curveD = curvePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.px} ${p.py}`).join(" ");

  return (
    <div>
      <PageHeader
        title="Departmental Velocity · Bell Curve"
        subtitle="2,068 employees distributed by evidence-based rating · outliers auto-flagged"
        actions={
          <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5">
            {(["q1", "q2", "compare"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
                  period === p ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {p === "compare" ? "Q1 vs Q2" : p.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Total Tasks Assigned" value="38,412" trend={period === "q2" ? "Q2 2026" : "Q1 2026"} />
        <Stat label="Ahead of Schedule" value="14,082" trend="36.7% of assignments" tone="good" />
        <Stat label="SLA Breaches" value="1,284" trend="3.3% overdue" tone="warn" />
        <Stat label="Avg Cycle Time" value="4.8d" trend="↓ 22% vs Q1" tone="good" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px]">
          <defs>
            <linearGradient id="bellFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Baseline */}
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e5e5e5" />

          {/* Area */}
          <path d={`${curveD} L ${W - pad} ${H - pad} L ${pad} ${H - pad} Z`} fill="url(#bellFill)" />
          <path d={curveD} fill="none" stroke="#3b82f6" strokeWidth="1.5" />

          {/* Bars */}
          {BELL_BUCKETS.map((b, i) => {
            const barW = (W - pad * 2) / BELL_BUCKETS.length - 12;
            const cx = pad + (i / (BELL_BUCKETS.length - 1)) * (W - pad * 2);
            const bx = cx - barW / 2;
            const barH = (b.count / maxCount) * (H - pad * 2);
            return (
              <g key={b.rating}>
                <rect x={bx} y={H - pad - barH} width={barW} height={barH} fill={b.color} opacity="0.85" rx="2" />
                <text x={cx} y={H - pad - barH - 6} textAnchor="middle" fontSize="11" fontFamily="Figtree" fill={b.color} fontWeight="600">
                  {b.count}
                </text>
                <text x={cx} y={H - pad + 16} textAnchor="middle" fontSize="11" fontFamily="Figtree" fill="#525252">
                  {b.rating} · {b.label}
                </text>
                <text x={cx} y={H - pad + 30} textAnchor="middle" fontSize="9" fontFamily="Figtree" fill="#a3a3a3">
                  {((b.count / total) * 100).toFixed(1)}%
                </text>
                {/* Outlier flags */}
                {(b.rating === 1 || b.rating === 5) && (
                  <>
                    <line x1={cx} y1={H - pad - barH - 18} x2={cx} y2={20} stroke={b.color} strokeDasharray="2 2" />
                    <rect x={cx - 50} y={10} width="100" height="18" fill={b.color} rx="3" />
                    <text x={cx} y={22} textAnchor="middle" fontSize="9" fontFamily="Figtree" fill="white" fontWeight="600">
                      {b.rating === 5 ? "TOP 5% · FAST-TRACK" : "BOTTOM 5% · RETRAIN"}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {BELL_BUCKETS.map((b) => (
          <div key={b.rating} className="bg-white border border-neutral-200 rounded-xl p-4" style={{ borderTopColor: b.color, borderTopWidth: 3 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: b.color }}>
                Rating {b.rating}
              </span>
              {b.rating === 5 && <Award size={12} style={{ color: b.color }} />}
              {b.rating === 1 && <AlertTriangle size={12} style={{ color: b.color }} />}
            </div>
            <div className="text-[18px] font-semibold text-neutral-900">{b.count}</div>
            <div className="text-[11px] font-normal text-neutral-600">{b.label}</div>
            <div className="mt-2 pt-2 border-t border-neutral-100 text-[10px] font-normal text-neutral-500">
              {b.flag}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 11.1.C — EFLOW DATA INTEGRATION (EVIDENCE LOCKER) ====================
