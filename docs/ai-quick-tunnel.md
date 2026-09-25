# eFlow AI Quick Tunnel

This setup lets authenticated eFlow users reach the local DeepSeek node without exposing the raw model API or its internal key.

```text
eFlow browser
  -> Cloudflare Quick Tunnel
  -> eFlow control gateway (127.0.0.1:8322)
  -> Supabase JWT and active-profile validation
  -> private AI API (127.0.0.1:8321)
  -> local model
```

The Quick Tunnel hostname is endpoint discovery only. Authentication is provided by the user's Supabase session and enforced by the gateway.

## Shared AI queue

DeepSeek runs one eFlow job at a time. The private AI server owns an in-memory FIFO queue, and the gateway scopes every job to the authenticated Supabase user. A second department head receives a queue position instead of a model-busy error; eFlow polls the owner-scoped job status and starts displaying the result as soon as the worker completes it. Each submission carries an idempotency ID so a tunnel retry cannot enqueue a duplicate job.

Completed and failed results are retained for one hour in server memory for polling. Restarting the private AI server clears queued and retained jobs.

## Security prerequisite

The legacy service-role key previously committed in `server/main.py` must be replaced before this gateway is shared. Create a new Supabase secret API key (`sb_secret_...`), put it only in the private `SUPABASE_SERVICE_ROLE_KEY` environment variable, migrate both Python services, and then disable the compromised legacy key. Do not rotate the project's legacy JWT secret as a shortcut because that also invalidates existing sessions and legacy API keys.

Remove any `VITE_SUPABASE_SERVICE_ROLE_KEY` entry from local and hosting configuration because every `VITE_` variable must be treated as browser-visible. The local `.env.local` override currently neutralizes the obsolete value for builds, and `npm run verify:client-secrets` proves the private value is absent from `dist`; the obsolete source entry should still be deleted during credential replacement.

Both Python services need these private machine-level values:

```powershell
$env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_YOUR_REPLACEMENT_KEY"
```

The eFlow gateway also accepts `VITE_SUPABASE_URL` from the root `.env` for the project URL, but it intentionally never accepts a `VITE_` service-role key.

## Start the stack

Run eFlow and the AI host as two separate repositories on the host PC. Each repository has one top-level command; no direct `python server/main.py` command is required during normal development.

1. Start eFlow's frontend and independent gateway:

```powershell
Set-Location "C:\Users\gabri\OneDrive\Desktop\EflowWeb"
npm install
npm run dev
```

2. Start the AI API, dashboard, queue, and tunnel publisher:

```powershell
Set-Location "C:\Users\gabri\OneDrive\Desktop\Ollama reactjs LLM DeepSeek Integration"
npm install
npm run dev
```

The eFlow command starts its Vite frontend and the JWT-protected gateway on `127.0.0.1:8322`. Its launcher creates `server/.venv`, installs changed Python requirements, and replaces a verified stale eFlow gateway so backend edits are actually loaded.

The AI launcher supervises the private model API on `127.0.0.1:8321` and its own tunnel-publisher process. It does not start, stop, or own the eFlow frontend or gateway. The publisher waits for the separate gateway, starts `cloudflared` against it, detects the generated hostname, and writes it directly to Supabase. No administrator copies or enters a URL.

For an AI-only clean restart:

```powershell
Set-Location "C:\Users\gabri\OneDrive\Desktop\Ollama reactjs LLM DeepSeek Integration"
npm run restart
```

This removes stale AI API, dashboard, queue worker, tunnel-supervisor, and matching Quick Tunnel processes without terminating eFlow.

The automatic publisher writes:

```text
system_config.ai_endpoint = https://<generated>.trycloudflare.com/controlpanelEflow/api
system_config.ai_endpoint_status = online
system_config.ai_endpoint_status_message = The AI service is online...
system_config.ai_endpoint_heartbeat = <current UTC timestamp>
```

If the AI API becomes unavailable, it writes `restarting` and the AI launcher restarts it, but the gateway and tunnel remain available for Admin and other non-AI control routes. Only AI-backed screens/actions display the outage. If the gateway or public tunnel fails, the supervisor recreates the tunnel with backoff and publishes the replacement hostname. `server/start_ai_tunnel.py` in the eFlow repository remains only as a manual compatibility tool and must not be run beside the AI launcher's supervisor.

## Browser behavior

AI-aware screens subscribe to the runtime rows through Supabase Realtime and refresh them on a 15-second fallback interval. Before each AI operation, eFlow reads the current endpoint/status from `system_config`, so endpoint rotation does not require a refresh or rebuild even if a Realtime event is delayed. Non-AI control requests do not fail merely because the model status is `restarting`. The browser obtains its current Supabase access token and sends:

Online mode is the default: the browser reads `system_config.ai_endpoint` and follows the currently published Cloudflare URL. `VITE_CONTROL_PANEL_BASE` is only used when `VITE_AI_CONNECTION_MODE=local` is explicitly set; this keeps a local `/api` proxy from overriding the remote endpoint in a build.

```http
POST <ai_endpoint>/ai/jobs
Authorization: Bearer <Supabase access token>
Content-Type: application/json
```

The browser then polls `GET <ai_endpoint>/ai/jobs/<job-id>` until the state changes from `queued` to `processing` and finally `completed` or `failed`. If the hostname rotates between discovery and a request, the client refetches the endpoint and retries once. Neither the internal LLM key nor the service-role key is sent to the browser.

## Verification

- `http://127.0.0.1:8322/controlpanelEflow/api/health` returns the gateway health response.
- `<public endpoint>/health` is reachable through Cloudflare.
- `<public endpoint>/ai/chat` without a Supabase JWT returns `401`.
- An active signed-in eFlow user can run team recommendation and proposal decomposition.
- A second user receives a FIFO queue position while DeepSeek is processing the first user's job.
- Admin user creation remains reachable while the AI process is restarting.
- Stopping the publisher changes `ai_endpoint_status` to `offline`.

Quick Tunnels are for capstone/demo testing. A long-running deployment should replace the disposable hostname with a named tunnel and retain the same gateway, JWT, and loopback-only model boundary.
