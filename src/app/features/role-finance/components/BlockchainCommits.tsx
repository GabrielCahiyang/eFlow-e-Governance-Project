import { GitCommit, RefreshCw, Shield, Terminal } from "lucide-react";
import { Btn, PageHeader, Stat } from "./primitives";

type BlockCommit = { height: number; time: string; txCount: number; size: string; hash: string; prev: string };

const BLOCKS: BlockCommit[] = [
  { height: 88425, time: "15:12:05", txCount: 14, size: "4.2 KB", hash: "0xa49ec6da3280114411cb90ec2af8b70c", prev: "0x22ef0911c6a84bd22d71a3f408cab5e0" },
  { height: 88424, time: "15:02:01", txCount: 22, size: "6.8 KB", hash: "0x22ef0911c6a84bd22d71a3f408cab5e0", prev: "0xb9ec220f451aa88c713e609dcba4120e" },
  { height: 88423, time: "14:52:04", txCount: 9, size: "2.9 KB", hash: "0xb9ec220f451aa88c713e609dcba4120e", prev: "0x3fa1bcd09e8711244ab6ec90ffa3d8c2" },
  { height: 88422, time: "14:42:00", txCount: 31, size: "9.1 KB", hash: "0x3fa1bcd09e8711244ab6ec90ffa3d8c2", prev: "0x77229e51a44cd0fb1e8326c579b0ad14" },
  { height: 88421, time: "14:32:07", txCount: 18, size: "5.4 KB", hash: "0x77229e51a44cd0fb1e8326c579b0ad14", prev: "0x991aac7213fbee4482bde1c0a7182c44" },
];

export function BlockchainCommits() {
  return (
    <div className="p-8 min-h-full">
      <PageHeader
        title="Blockchain Commits"
        subtitle="Private LGU ledger · Live heartbeat monitor"
        actions={<><Btn icon={<RefreshCw size={13} />} label="Refresh Feed" /><Btn icon={<Terminal size={13} />} label="Open Node Console" variant="primary" /></>}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Chain Height" value="88,425" trend="Healthy · 10-min cadence" tone="good" />
        <Stat label="Pending Tx Pool" value="7" trend="Next commit in 04:22" tone="neutral" />
        <Stat label="Uptime (30d)" value="99.998%" trend="1 scheduled maintenance" tone="good" />
        <Stat label="Validator Nodes" value="5 / 5" trend="City Hall · DILG · COA · BIR · NEDA" tone="good" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="bg-neutral-950 rounded-xl p-5 text-neutral-100 min-h-[440px]">
          <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 uppercase tracking-wider mb-4">
            <Terminal size={12} /> Live Block Feed · eflow-chain://mainnet
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            {BLOCKS.map((b, i) => (
              <div key={b.height} className={`border-l-2 ${i === 0 ? "border-emerald-400" : "border-neutral-700"} pl-3 py-1.5`}>
                <div className="flex items-center gap-2 text-emerald-300">
                  <GitCommit size={12} /> <span>BLOCK #{b.height.toLocaleString()}</span>
                  <span className="text-neutral-500">· {b.time}</span>
                  {i === 0 && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 animate-pulse">LIVE</span>}
                </div>
                <div className="text-neutral-400 mt-0.5">tx:{b.txCount} · size:{b.size} · hash:<span className="text-neutral-200">{b.hash.slice(0, 18)}…</span></div>
                <div className="text-neutral-600 text-[10px]">prev: {b.prev.slice(0, 18)}…</div>
              </div>
            ))}
            <div className="text-neutral-500 pl-3">$ _<span className="animate-pulse">▮</span></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-3">Chain Health</div>
            <div className="space-y-2.5">
              {[
                { label: "Block Finality", value: "Instant", tone: "good" },
                { label: "Fork Events (30d)", value: "0", tone: "good" },
                { label: "Consensus", value: "5-of-5 PoA", tone: "good" },
                { label: "Tx Throughput", value: "~3.2 tx/s", tone: "neutral" },
                { label: "Avg. Commit Interval", value: "9m 58s", tone: "good" },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="text-[12px] font-normal text-neutral-600">{r.label}</div>
                  <div className={`text-[12px] font-medium tabular-nums ${r.tone === "good" ? "text-emerald-700" : "text-neutral-900"}`}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Shield size={14} className="text-emerald-700 mt-0.5" />
              <div className="text-[11.5px] font-normal text-emerald-900 leading-relaxed">
                <span className="font-medium">System healthy.</span> Every 10 minutes a new block seals ~20 vouchers. COA and DILG validator nodes independently confirm the chain — one corrupt official cannot rewrite history alone.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 14.2.A — PUBLIC BIDDING BYPASSES ====================
