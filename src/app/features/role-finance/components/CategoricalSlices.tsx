import React, { useState } from "react";
import { Hammer, HandHeart, Layers, Lock, Megaphone, Shield, Unlock } from "lucide-react";
import { Btn, PageHeader, peso } from "./primitives";

type Slice = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  amount: number;
};

export function CategoricalSlices() {
  const MASTER = 50_000_000; // Eco-Park Infrastructure master bucket
  const [slices, setSlices] = useState<Slice[]>([
    { id: "facilities", label: "Facilities", icon: <Hammer size={14} />, color: "#f97316", amount: 40_000_000 },
    { id: "marketing", label: "Marketing", icon: <Megaphone size={14} />, color: "#3b82f6", amount: 5_000_000 },
    { id: "community", label: "Community Engagement", icon: <HandHeart size={14} />, color: "#10b981", amount: 5_000_000 },
  ]);
  const [locked, setLocked] = useState(false);

  const allocated = slices.reduce((s, x) => s + x.amount, 0);
  const remaining = MASTER - allocated;

  function adjustSlice(id: string, newAmount: number) {
    if (locked) return;
    const other = slices.filter((s) => s.id !== id).reduce((s, x) => s + x.amount, 0);
    const maxAllowed = MASTER - other;
    const capped = Math.max(0, Math.min(maxAllowed, newAmount));
    setSlices((ss) => ss.map((s) => (s.id === id ? { ...s, amount: capped } : s)));
  }

  return (
    <div>
      <PageHeader
        title="Categorical Slice Allocation"
        subtitle="Programmatic Bucket · Eco-Park Infrastructure · SP Ord. 2026-014"
        actions={
          <>
            <Btn
              icon={locked ? <Lock size={14} /> : <Unlock size={14} />}
              label={locked ? "Sealed" : "Seal Allocation"}
              variant={locked ? "success" : "primary"}
              onClick={() => setLocked((l) => !l)}
            />
          </>
        }
      />

      {/* Master Bucket Visualization */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Master Bucket</div>
            <div className="text-[16px] font-semibold text-neutral-900">Eco-Park Infrastructure</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-neutral-400 font-normal">Locked by ordinance</div>
            <div className="text-[24px] font-semibold text-neutral-900 tabular-nums">{peso(MASTER)}</div>
          </div>
        </div>

        {/* Stacked visualization */}
        <div className="h-14 rounded-lg overflow-hidden flex relative bg-neutral-100 border border-neutral-200">
          {slices.map((s) => {
            const pct = (s.amount / MASTER) * 100;
            return (
              <div
                key={s.id}
                className="flex items-center justify-center gap-1.5 text-white text-[11px] font-medium transition-all duration-300"
                style={{ width: `${pct}%`, background: s.color }}
              >
                {pct > 8 && (
                  <>
                    {s.icon} {s.label}
                  </>
                )}
              </div>
            );
          })}
          {remaining > 0 && (
            <div
              className="flex items-center justify-center text-neutral-500 text-[11px] font-medium border-l-2 border-dashed border-neutral-400"
              style={{ width: `${(remaining / MASTER) * 100}%` }}
            >
              Unallocated
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-normal">
          <span className="text-neutral-500">
            Allocated: <span className="text-neutral-900 font-medium">{peso(allocated)}</span>
          </span>
          <span className={remaining === 0 ? "text-emerald-600" : "text-amber-600"}>
            {remaining === 0 ? "✓ Fully allocated" : `${peso(remaining)} unallocated`}
          </span>
          <span className="text-neutral-500">
            Ceiling: <span className="text-neutral-900 font-medium">{peso(MASTER)}</span>
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Layers size={14} className="text-neutral-700" />
          <span className="text-[13px] font-semibold">Allocation Controls</span>
          <span className="ml-auto text-[10px] text-neutral-400 font-normal">
            Sliders physically cannot exceed the master bucket total
          </span>
        </div>

        <div className="space-y-5">
          {slices.map((s) => {
            const pct = (s.amount / MASTER) * 100;
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white" style={{ background: s.color }}>
                      {s.icon}
                    </div>
                    <span className="text-[13px] font-medium text-neutral-900">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[18px] font-semibold tabular-nums" style={{ color: s.color }}>
                      {peso(s.amount)}
                    </span>
                    <span className="text-[11px] font-normal text-neutral-400 tabular-nums">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={MASTER}
                    step={100_000}
                    value={s.amount}
                    onChange={(e) => adjustSlice(s.id, Number(e.target.value))}
                    disabled={locked}
                    className="w-full cursor-pointer disabled:cursor-not-allowed"
                    style={{ accentColor: s.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {locked && (
          <div className="mt-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
            <Shield size={14} className="text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-[12px] font-medium text-emerald-700">Allocation sealed</div>
              <div className="text-[11px] font-normal text-emerald-700">
                Categorical slices committed. Sub-bucket ceilings now enforce ORS validation downstream.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 12.2.A — OBLIGATION REQUESTS (ORS) ====================
