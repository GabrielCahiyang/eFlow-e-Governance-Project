import { useMemo } from "react";
import { ArrowRight, Clock, Wallet } from "lucide-react";
import { Btn, PageHeader, Stat, peso } from "./primitives";

export function EarmarkedFunds() {
  // 30-day obligation vs release curve
  const data = useMemo(() => {
    const arr: { day: number; obligated: number; released: number }[] = [];
    let oblg = 0;
    let rel = 0;
    for (let i = 0; i < 30; i++) {
      oblg += 4 + Math.sin(i * 0.35) * 2 + Math.random() * 2.5;
      rel += 2.4 + Math.sin(i * 0.32) * 1.2 + Math.random() * 1.8;
      arr.push({ day: i + 1, obligated: oblg, released: rel });
    }
    return arr;
  }, []);

  const totalObligated = data[data.length - 1].obligated;
  const totalReleased = data[data.length - 1].released;
  const earmarkedGap = totalObligated - totalReleased;

  const W = 860;
  const H = 280;
  const pad = 50;
  const maxY = Math.max(totalObligated, totalReleased) * 1.08;
  const scaleX = (d: number) => pad + ((d - 1) / 29) * (W - pad * 2);
  const scaleY = (v: number) => H - pad - (v / maxY) * (H - pad * 2);

  const oblgPath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.day)} ${scaleY(p.obligated)}`).join(" ");
  const relPath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.day)} ${scaleY(p.released)}`).join(" ");

  // Gap ribbon
  const ribbonPath = [
    ...data.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.day)} ${scaleY(p.obligated)}`),
    ...[...data].reverse().map((p) => `L ${scaleX(p.day)} ${scaleY(p.released)}`),
    "Z",
  ].join(" ");

  const byPayee = [
    { payee: "Asian Integrated Marine", amt: 18_400_000, due: "2026-05-04" },
    { payee: "Oriental Cement Corp.", amt: 2_000_000, due: "2026-05-08" },
    { payee: "MedEast Supply Inc.", amt: 3_800_000, due: "2026-05-10" },
    { payee: "ESRI Philippines", amt: 1_200_000, due: "2026-05-15" },
    { payee: "Visayan Print Works", amt: 950_000, due: "2026-05-16" },
    { payee: "Construction Workers Union #4", amt: 8_420_000, due: "2026-04-28" },
  ];

  return (
    <div>
      <PageHeader
        title="Earmarked Funds · Treasury Liquidity View"
        subtitle="Money legally promised (obligated) but not yet released · the gap Treasurer must manage"
        actions={
          <>
            <Btn icon={<Wallet size={14} />} label="Open Treasury Cash Position" variant="primary" />
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat label="Total Obligated · 30d" value={`₱${totalObligated.toFixed(1)}M`} trend="legal commitments" tone="warn" />
        <Stat label="Total Released · 30d" value={`₱${totalReleased.toFixed(1)}M`} trend="cash actually out" tone="good" />
        <Stat label="Earmarked Gap" value={`₱${earmarkedGap.toFixed(1)}M`} trend="obligated but not released" tone="bad" />
        <Stat label="Treasury Cash on Hand" value="₱ 412.8M" trend="gap is safely covered" tone="good" />
      </div>

      {/* Burn rate chart */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold">Obligation vs Release Burn Rate</div>
            <div className="text-[11px] font-normal text-neutral-500">The shaded area is money on the hook but not yet paid.</div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-normal">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500" /> Obligated</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500" /> Released</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-200 rounded-sm" /> Earmarked gap</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[300px]">
          <defs>
            <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Y grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = H - pad - t * (H - pad * 2);
            const val = (maxY * t).toFixed(0);
            return (
              <g key={t}>
                <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="#f5f5f5" />
                <text x={pad - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#a3a3a3" fontFamily="Figtree">
                  ₱{val}M
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#d4d4d4" />
          <line x1={pad} y1={pad / 2} x2={pad} y2={H - pad} stroke="#d4d4d4" />

          {/* Gap ribbon */}
          <path d={ribbonPath} fill="url(#gapGrad)" />

          {/* Obligated line */}
          <path d={oblgPath} fill="none" stroke="#f59e0b" strokeWidth="2.25" />
          {/* Released line */}
          <path d={relPath} fill="none" stroke="#10b981" strokeWidth="2.25" />

          {/* Endpoint markers */}
          <circle cx={scaleX(30)} cy={scaleY(totalObligated)} r="4" fill="#f59e0b" />
          <circle cx={scaleX(30)} cy={scaleY(totalReleased)} r="4" fill="#10b981" />

          {/* Gap label */}
          <line
            x1={scaleX(30) + 8}
            y1={scaleY(totalObligated)}
            x2={scaleX(30) + 8}
            y2={scaleY(totalReleased)}
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <text x={scaleX(30) + 14} y={(scaleY(totalObligated) + scaleY(totalReleased)) / 2 + 3} fontSize="10" fill="#b45309" fontFamily="Figtree" fontWeight="600">
            gap ₱{earmarkedGap.toFixed(1)}M
          </text>

          {/* X axis labels */}
          {[1, 7, 14, 21, 30].map((d) => (
            <text key={d} x={scaleX(d)} y={H - pad + 14} textAnchor="middle" fontSize="9" fill="#a3a3a3" fontFamily="Figtree">
              D{d}
            </text>
          ))}
        </svg>
      </div>

      {/* Upcoming release obligations */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center gap-2">
          <Clock size={14} className="text-neutral-700" />
          <span className="text-[13px] font-semibold">Upcoming Cash-Out Windows</span>
          <span className="ml-auto text-[11px] text-neutral-500 font-normal">Plan treasury inflows accordingly</span>
        </div>
        <div className="grid grid-cols-12 px-5 py-3 bg-neutral-50 border-b border-neutral-200 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          <div className="col-span-5">Payee / Counterparty</div>
          <div className="col-span-3">Due by</div>
          <div className="col-span-2 text-right">Obligated</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {byPayee.map((p, i) => {
          const dueDate = new Date(p.due);
          const today = new Date("2026-04-21");
          const days = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const urgent = days <= 7;
          return (
            <div key={i} className="grid grid-cols-12 px-5 py-3 border-b border-neutral-100 last:border-0 items-center hover:bg-neutral-50 text-[12px] font-normal">
              <div className="col-span-5">
                <div className="font-medium text-neutral-900">{p.payee}</div>
              </div>
              <div className="col-span-3">
                <span className={`text-[11px] ${urgent ? "text-red-600 font-medium" : "text-neutral-600"}`}>
                  {p.due} · {days}d
                </span>
              </div>
              <div className="col-span-2 text-right font-semibold text-neutral-900 tabular-nums">{peso(p.amt)}</div>
              <div className="col-span-2 text-right">
                <button className="text-[11px] font-medium text-neutral-900 hover:underline cursor-pointer inline-flex items-center gap-1">
                  Release <ArrowRight size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 13.1.A — RECEIPT VERIFICATION ====================
