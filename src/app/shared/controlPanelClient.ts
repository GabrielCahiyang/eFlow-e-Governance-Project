import { supabase } from "../../lib/supabase";
import { fetchConfig } from "../../lib/supabaseService";

const RETRYABLE_GATEWAY_STATUSES = new Set([502, 503, 504, 530]);

export const AI_RESTARTING_MESSAGE =
  "The AI service is down. The system detected the outage and is automatically restarting the secure connection. Please try again shortly.";

export const CONTROL_PANEL_UNAVAILABLE_MESSAGE =
  "The secure eFlow control service is unavailable. Please try again shortly.";

const AI_HEARTBEAT_MAX_AGE_MS = 45_000;
const AI_CONNECTION_MODE = import.meta.env.VITE_AI_CONNECTION_MODE?.trim().toLowerCase();

export type AiRuntimeStatus =
  | "online"
  | "offline"
  | "starting"
  | "restarting"
  | "unknown";

export type AiRuntimeState = {
  endpoint: string;
  status: AiRuntimeStatus;
  message: string;
};

export class AiServiceUnavailableError extends Error {
  constructor(message = AI_RESTARTING_MESSAGE) {
    super(message);
    this.name = "AiServiceUnavailableError";
  }
}

export class ControlPanelUnavailableError extends Error {
  constructor(message = CONTROL_PANEL_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "ControlPanelUnavailableError";
  }
}

export type ControlPanelFetchOptions = {
  timeoutMs?: number;
  retryOnEndpointChange?: boolean;
  requireAiOnline?: boolean;
};

export function normalizeControlPanelBase(rawValue: string): string {
  const value = rawValue.trim().replace(/\/+$/, "");
  if (!value) return "";
  if (value === "/api" || value.endsWith("/controlpanelEflow/api")) return value;
  if (value.endsWith("/controlpanelEflow")) return `${value}/api`;

  try {
    const url = new URL(value);
    if (!url.pathname || url.pathname === "/") {
      return `${value}/controlpanelEflow/api`;
    }
  } catch {
    // Relative development proxy paths are valid and remain unchanged.
  }
  return value;
}

function isLocalBrowser(): boolean {
  return typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

async function readPublishedEndpoint(): Promise<string | null> {
  // The published Cloudflare endpoint is the only route for online clients.
  // Build-time environment variables must never redirect a deployed browser
  // back to its own /api path.
  try {
    const endpoint = await fetchConfig("ai_endpoint");
    if (endpoint?.trim()) return endpoint;
  } catch {
    // Local development may continue through Vite's proxy when Supabase is
    // unavailable. Online clients fail clearly instead of using /api.
  }

  return isLocalBrowser()
    ? import.meta.env.VITE_CONTROL_PANEL_BASE?.trim() || "/api"
    : null;
}

export async function resolveControlPanelBase(): Promise<string> {
  const endpoint = normalizeControlPanelBase((await readPublishedEndpoint()) || "");
  if (!endpoint) throw new ControlPanelUnavailableError();
  return endpoint;
}

export async function resolveAiControlPanelBase(): Promise<string> {
  const runtime = await getAiEndpointStatus();

  // Supabase status and heartbeat are advisory. The Cloudflare endpoint can
  // still be live while a state update is delayed or another host has just
  // restarted. Do not reject an import before attempting the authenticated
  // request; the gateway is the authoritative availability check.
  if (!runtime.endpoint) {
    throw new AiServiceUnavailableError(runtime.message || AI_RESTARTING_MESSAGE);
  }
  return runtime.endpoint;
}

export async function getAiEndpointStatus(): Promise<AiRuntimeState> {
  const [publishedEndpoint, configuredStatus, configuredMessage, heartbeat] = await Promise.all([
    readPublishedEndpoint(),
    fetchConfig("ai_endpoint_status").catch(() => null),
    fetchConfig("ai_endpoint_status_message").catch(() => null),
    fetchConfig("ai_endpoint_heartbeat").catch(() => null),
  ]);
  const status = configuredStatus?.trim().toLowerCase();
  const effectiveStatus = status === "online" && !isAiHeartbeatFresh(heartbeat)
    ? "restarting"
    : status;
  return {
    endpoint: normalizeControlPanelBase(publishedEndpoint || ""),
    status:
      effectiveStatus === "online" ||
      effectiveStatus === "offline" ||
      effectiveStatus === "starting" ||
      effectiveStatus === "restarting"
        ? effectiveStatus
        : "unknown",
    message: effectiveStatus === "restarting" && status === "online"
      ? AI_RESTARTING_MESSAGE
      : configuredMessage?.trim() || (
      effectiveStatus === "offline" || effectiveStatus === "starting" || effectiveStatus === "restarting"
        ? AI_RESTARTING_MESSAGE
        : ""
    ),
  };
}

export function isAiHeartbeatFresh(
  heartbeat: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!heartbeat) return false;
  const timestamp = Date.parse(heartbeat);
  return Number.isFinite(timestamp) && now - timestamp <= AI_HEARTBEAT_MAX_AGE_MS;
}

export function isAiServiceUnavailableError(
  error: unknown,
): error is AiServiceUnavailableError {
  return error instanceof AiServiceUnavailableError;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

function joinEndpoint(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function authenticatedFetch(
  base: string,
  path: string,
  init: RequestInit,
  timeoutMs?: number,
): Promise<Response> {
  const accessToken = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const controller = new AbortController();
  const timeout = timeoutMs
    ? globalThis.setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    return await fetch(joinEndpoint(base, path), {
      ...init,
      headers,
      signal: init.signal || controller.signal,
    });
  } finally {
    if (timeout !== null) globalThis.clearTimeout(timeout);
  }
}

export async function controlPanelFetch(
  path: string,
  init: RequestInit = {},
  options: ControlPanelFetchOptions = {},
): Promise<Response> {
  const retryOnEndpointChange = options.retryOnEndpointChange !== false;
  const resolveBase = options.requireAiOnline
    ? resolveAiControlPanelBase
    : resolveControlPanelBase;
  const firstBase = await resolveBase();

  try {
    const response = await authenticatedFetch(firstBase, path, init, options.timeoutMs);
    if (!retryOnEndpointChange || !RETRYABLE_GATEWAY_STATUSES.has(response.status)) {
      return response;
    }
  } catch (error) {
    if (!retryOnEndpointChange || (error instanceof DOMException && error.name === "AbortError")) {
      throw error;
    }
  }

  // A Quick Tunnel can rotate after discovery. Refetch and retry exactly once.
  const refreshedBase = await resolveBase();
  return authenticatedFetch(refreshedBase, path, init, options.timeoutMs);
}
