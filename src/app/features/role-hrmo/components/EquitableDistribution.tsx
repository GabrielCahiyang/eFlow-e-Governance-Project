import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader, Stat } from "./primitives";

type Emp = { id: number; x: number; y: number; dept: string; name: string; flagged?: boolean };

const DEPT_COLORS: Record<string, string> = {
  Engineering: "#ef4444",
  Health: "#06b6d4",
  LEDIPO: "#8b5cf6",
  Social: "#f59e0b",
  CENRO: "#10b981",
  Tourism: "#ec4899",
  Treasury: "#3b82f6",
  Planning: "#f97316",
  Legal: "#64748b",
  ICT: "#14b8a6",
  Agri: "#84cc16",
  GSO: "#a855f7",
};

function makeEmployees(): Emp[] {
  const depts = Object.keys(DEPT_COLORS);
  const firsts = ["A.", "J.", "M.", "R.", "L.", "C.", "P.", "D.", "E.", "F."];
  const lasts = ["Dela Cruz", "Santos", "Reyes", "Cruz", "Bacalso", "Odal", "Alcantara", "Bascon", "Lariosa", "Villamor"];
  const arr: Emp[] = [];
  // Tight cluster in middle
  for (let i = 0; i < 180; i++) {
    arr.push({
      id: i,
      x: 35 + Math.random() * 35,
      y: 25 + Math.random() * 35,
      dept: depts[i % depts.length],
      name: `${firsts[i % 10]} ${lasts[(i * 3) % 10]}`,
    });
  }
  // Bottom-left underutilized cluster
  for (let i = 180; i < 230; i++) {
    arr.push({
      id: i,
      x: 4 + Math.random() * 18,
      y: 3 + Math.random() * 15,
      dept: depts[i % depts.length],
      name: `${firsts[i % 10]} ${lasts[(i * 7) % 10]}`,
    });
  }
  // The outlier
  arr.push({ id: 999, x: 92, y: 93, dept: "Engineering", name: "Engr. A. Dela Cruz", flagged: true });
  arr.push({ id: 998, x: 86, y: 88, dept: "Planning", name: "Arch. P. Odal", flagged: true });
  return arr;
}

export function EquitableDistribution() {
  const [employees] = useState<Emp[]>(makeEmployees);
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [hover, setHover] = useState<Emp | null>(null);

  return (
    <div>
      <PageHeader
        title="Live Load Distribution"
        subtitle="2,000+ city employees · tasks × complexity · watching the GA play fair"
        actions={
          <>
            <button
              onClick={() => setAutoRebalance((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors border ${
                autoRebalance ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-neutral-700 border-neutral-200"
              }`}
            >
              <span className={`w-7 h-4 rounded-full relative transition-colors ${autoRebalance ? "bg-emerald-500" : "bg-neutral-300"}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${autoRebalance ? "left-3.5" : "left-0.5"}`} />
              </span>
              Auto-Rebalance
            </button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Employees Tracked" value="2,068" trend="all depts · live" />
        <Stat label="Cluster Tightness" value="0.74" trend="Gini of load" tone="warn" />
        <Stat label="Underutilized" value="312" trend="bottom-left cluster" />
        <Stat label="Overburdened" value="2" trend="outlier zone" tone="bad" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[12px] font-medium text-neutral-700">The Fairness Graph</div>
            <div className="text-[11px] font-normal text-neutral-500">
              Ideal state is a tight cluster. Outliers are the story.
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-normal text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> tight cluster
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> underutilized
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> overburdened
            </span>
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 600 360" className="w-full h-[420px] bg-gradient-to-br from-neutral-50 to-white rounded-lg border border-neutral-200">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <g key={i}>
                <line x1={40 + t * 540} y1="20" x2={40 + t * 540} y2="320" stroke="#f5f5f5" strokeWidth="1" />
                <line x1="40" y1={20 + t * 300} x2="580" y2={20 + t * 300} stroke="#f5f5f5" strokeWidth="1" />
              </g>
            ))}
            {/* Ideal zone */}
            <rect x={40 + 0.3 * 540} y={20 + (1 - 0.6) * 300} width={0.4 * 540} height={0.35 * 300} fill="#10b981" opacity="0.05" stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.3" />
            <text x={40 + 0.5 * 540} y={20 + (1 - 0.6) * 300 - 6} textAnchor="middle" fontSize="9" fill="#10b981" fontFamily="Figtree">
              equitable cluster
            </text>

            {/* Axes */}
            <line x1="40" y1="320" x2="580" y2="320" stroke="#a3a3a3" strokeWidth="1" />
            <line x1="40" y1="20" x2="40" y2="320" stroke="#a3a3a3" strokeWidth="1" />
            <text x="310" y="350" textAnchor="middle" fontSize="10" fill="#525252" fontFamily="Figtree">
              Task Complexity (BPA-weighted) →
            </text>
            <text x="14" y="170" textAnchor="middle" fontSize="10" fill="#525252" fontFamily="Figtree" transform="rotate(-90 14 170)">
              Active Task Count →
            </text>

            {/* Dots */}
            {employees.map((e) => {
              const cx = 40 + (e.x / 100) * 540;
              const cy = 20 + (1 - e.y / 100) * 300;
              const color = e.flagged ? "#dc2626" : e.x < 22 ? "#f59e0b" : DEPT_COLORS[e.dept] || "#10b981";
              return (
                <g key={e.id}>
                  {e.flagged && (
                    <circle cx={cx} cy={cy} r="12" fill="#dc2626" opacity="0.15">
                      <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={e.flagged ? 5 : 3}
                    fill={color}
                    opacity={e.flagged ? 1 : 0.7}
                    stroke={e.flagged ? "#7f1d1d" : "none"}
                    strokeWidth={e.flagged ? 1 : 0}
                    onMouseEnter={() => setHover(e)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>

          {hover && (
            <div className="absolute top-4 right-4 bg-neutral-900 text-white rounded-lg px-3 py-2 text-[11px] font-normal shadow-xl pointer-events-none">
              <div className="font-medium">{hover.name}</div>
              <div className="text-neutral-300">
                {hover.dept} · {Math.round(hover.y * 0.4)} tasks · complexity {Math.round(hover.x)}
              </div>
              {hover.flagged && <div className="text-red-400 mt-0.5">⚠ Overburdened — candidate for rebalance</div>}
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertTriangle size={14} className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <div className="text-[12px] font-medium text-red-700">Inequity detected</div>
            <div className="text-[12px] font-normal text-red-600">
              2 employees in the top-right outlier zone are carrying 40+ complex tasks. 312 employees in the bottom-left are underutilized. Head to <span className="font-medium">GA Allocation Review</span> to rebalance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 9.2.B — GA ALLOCATION REVIEW ====================
