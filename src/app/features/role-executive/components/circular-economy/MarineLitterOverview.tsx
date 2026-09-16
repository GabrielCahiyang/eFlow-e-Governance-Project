import * as Carbon from "@carbon/icons-react";
import * as Charts from "recharts";
import * as UI from "../TransformPrimitives";
import { businessRegistry, campaignData, trashTraps } from "./data";

export function MarineLitterOverview() {
  const totalKg = trashTraps.reduce((s, t) => s + t.kgWeekly, 0);
  const totalParticipation = Object.values(campaignData).flat().reduce((s, t) => s + t.participation, 0);

  return (
    <div>
      <UI.PageHeader
        title="Marine Litter & Circular Economy"
        subtitle="Project Transform · Flagship Initiative #2"
        actions={<>
          <UI.Btn icon={<Carbon.Analytics size={14} />} label="Campaign Analytics" />
          <UI.Btn icon={<Carbon.Download size={14} />} label="Initiative Report" variant="primary" />
        </>}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <UI.StatCard label="Weekly Interception" value={`${totalKg.toLocaleString()} kg`} sub="Across 6 traps" trend="up" />
        <UI.StatCard label="Citizen Engagement" value={totalParticipation.toLocaleString()} sub="Campaign participants" trend="up" />
        <UI.StatCard label="Businesses Audited" value={`${businessRegistry.length}`} sub={`${businessRegistry.filter(b => b.status === "Passed").length} compliant`} />
        <UI.StatCard label="Active Barangays" value={`${Object.keys(campaignData).length}`} sub="#SHInEOrmoc reach" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* SHInE Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Carbon.Group size={16} className="text-emerald-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">#SHInEOrmoc</h4>
              <p className="text-[10px] font-normal text-neutral-500">Community engagement</p>
            </div>
          </div>
          <Charts.ResponsiveContainer width="100%" height={80}>
            <Charts.BarChart data={Object.entries(campaignData).map(([k, v]) => ({ brgy: k.replace("Brgy. ", ""), count: v.reduce((s, t) => s + t.participation, 0) }))}>
              <Charts.Bar key="count" dataKey="count" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Charts.XAxis key="x" dataKey="brgy" tick={{ fontSize: 9 }} />
              <Charts.Tooltip key="t" />
            </Charts.BarChart>
          </Charts.ResponsiveContainer>
          <p className="text-[10px] font-normal text-neutral-500 mt-2">{Object.values(campaignData).flat().length} activities this month</p>
        </div>

        {/* Plastic Compliance Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Carbon.Security size={16} className="text-blue-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Plastic Regulation</h4>
              <p className="text-[10px] font-normal text-neutral-500">Ordinance enforcement</p>
            </div>
          </div>
          <Charts.ResponsiveContainer width="100%" height={80}>
            <Charts.PieChart>
              <Charts.Pie key="pie" data={[
                { name: "Passed", value: businessRegistry.filter(b => b.status === "Passed").length, fill: "#10B981" },
                { name: "Warning", value: businessRegistry.filter(b => b.status === "Warning").length, fill: "#F59E0B" },
                { name: "Fined", value: businessRegistry.filter(b => b.status === "Fined").length, fill: "#EF4444" },
              ]} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value">
                {[
                  { fill: "#10B981" },
                  { fill: "#F59E0B" },
                  { fill: "#EF4444" },
                ].map((entry, i) => <Charts.Cell key={`c-${i}`} fill={entry.fill} />)}
              </Charts.Pie>
              <Charts.Tooltip key="t" />
            </Charts.PieChart>
          </Charts.ResponsiveContainer>
          <p className="text-[10px] font-normal text-neutral-500 mt-2">{businessRegistry.length} businesses in registry</p>
        </div>

        {/* Trash Trap Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Carbon.Flag size={16} className="text-amber-600" /></div>
            <div>
              <h4 className="text-[13px] font-semibold text-neutral-900">Trash Trap Network</h4>
              <p className="text-[10px] font-normal text-neutral-500">IoT interception monitoring</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {trashTraps.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.capacity > 85 ? "#EF4444" : t.capacity > 60 ? "#F59E0B" : "#10B981" }} />
                <span className="text-[10px] font-normal text-neutral-600 flex-1 truncate">{t.id}: {t.name.split(" — ")[1]}</span>
                <span className="text-[10px] font-medium text-neutral-900">{t.capacity}%</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-normal text-neutral-500 mt-2">{totalKg.toLocaleString()} kg intercepted this week</p>
        </div>
      </div>

      {/* Weekly trend */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Monthly Interception Trend (kg)</h3>
        <Charts.ResponsiveContainer width="100%" height={200}>
          <Charts.AreaChart data={[
            { week: "W1", kg: 1450 },
            { week: "W2", kg: 1620 },
            { week: "W3", kg: 1380 },
            { week: "W4", kg: 1830 },
          ]}>
            <Charts.CartesianGrid key="g" strokeDasharray="3 3" stroke="#f0f0f0" />
            <Charts.XAxis key="x" dataKey="week" tick={{ fontSize: 11 }} />
            <Charts.YAxis key="y" tick={{ fontSize: 11 }} />
            <Charts.Tooltip key="t" />
            <Charts.Area key="a" type="monotone" dataKey="kg" stroke="#10B981" fill="#D1FAE5" name="Kg Intercepted" />
          </Charts.AreaChart>
        </Charts.ResponsiveContainer>
      </div>
    </div>
  );
}
