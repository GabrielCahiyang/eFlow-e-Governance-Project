// ─── Super Admin: System Settings ────────────────────────────────
// Reads/writes system_config table in Supabase.

import { useState, useEffect } from "react";
import { fetchAllConfig, updateConfig } from "../../../lib/supabaseService";
import { useToast } from "../ui/Toast";
import { useAiRuntimeStatus } from "../../features/ai";

const AUTOMATIC_AI_CONFIG_KEYS = new Set([
  "ai_endpoint",
  "ai_endpoint_status",
  "ai_endpoint_status_message",
]);

export function SystemSettings() {
  const { toast } = useToast();
  const aiRuntime = useAiRuntimeStatus();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllConfig()
      .then((data) => {
        const formData: Record<string, string> = {};
        data.forEach((c) => { formData[c.key] = c.value; });
        setForm(formData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(form)) {
        if (AUTOMATIC_AI_CONFIG_KEYS.has(key)) continue;
        await updateConfig(key, value);
      }
      toast("Settings saved successfully", "success");
    } catch (err: any) {
      toast(err?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const appVersion = form["app_version"] || "2.0.0";
  const aiStatus = aiRuntime.status;
  const aiEndpoint = aiRuntime.endpoint || form["ai_endpoint"] || "";
  const aiStatusMessage = aiRuntime.message || form["ai_endpoint_status_message"] || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-normal text-neutral-400 mb-3">
        Administration <span className="mx-1.5">/</span> <span className="text-neutral-700">Settings</span>
      </div>

      <h2 className="font-semibold text-[20px] text-neutral-900 mb-6">
        System Settings
      </h2>

      <div className="space-y-4 max-w-2xl">
        {/* AI Configuration Card */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
            <span className="text-[13px] font-semibold text-neutral-800">
              AI Configuration
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
              <div>
                <div className="text-[11px] font-medium text-neutral-700">
                  Local eFlow AI Node
                </div>
                <div className="mt-0.5 text-[10px] text-neutral-400">
                  The Quick Tunnel publisher updates this automatically.
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                aiStatus === "online"
                  ? "bg-emerald-100 text-emerald-700"
                  : aiStatus === "starting" || aiStatus === "restarting"
                    ? "bg-amber-100 text-amber-700"
                    : aiStatus === "offline"
                      ? "bg-red-100 text-red-700"
                      : "bg-neutral-200 text-neutral-600"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  aiStatus === "online"
                    ? "bg-emerald-500"
                    : aiStatus === "starting" || aiStatus === "restarting"
                      ? "bg-amber-500"
                      : aiStatus === "offline"
                        ? "bg-red-500"
                        : "bg-neutral-400"
                }`} />
                {aiStatus.charAt(0).toUpperCase() + aiStatus.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1.5">
                Automatically Published AI Endpoint
              </label>
              <input
                type="text"
                value={aiEndpoint}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[12px] font-normal text-neutral-600"
                placeholder="Waiting for the AI server to publish its endpoint"
              />
              <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-400">
                Managed automatically by the AI server. Administrators never need to paste a Cloudflare URL.
              </p>
              {aiStatus !== "online" && aiStatusMessage && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                  {aiStatusMessage}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1.5">
                AI Model
              </label>
              <input
                type="text"
                value={form["ai_model"] || ""}
                onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[12px] font-normal placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                placeholder="deepseek-r1:8b"
              />
            </div>
          </div>
        </div>

        {/* App Info Card */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
            <span className="text-[13px] font-semibold text-neutral-800">
              Application
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-normal text-neutral-600">
                App Version
              </span>
              <span className="text-[12px] font-mono text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                {appVersion}
              </span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1.5">
                Version String
              </label>
              <input
                type="text"
                value={form["app_version"] || ""}
                onChange={(e) => setForm({ ...form, app_version: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[12px] font-normal placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-[12px] font-medium hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
