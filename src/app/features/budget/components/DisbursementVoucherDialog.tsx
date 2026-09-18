import { useRef, useState } from "react";
import { AttentionBox, Button } from "@vibe/core";
import * as m from "motion/react-m";
import { CheckCircle2, Copy } from "lucide-react";
import { BxsBox } from "../../../components/ui/boxicons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import type { PettyCashRelease, PettyCashRequest } from "../types";
import { markPettyCashReleased } from "../services/budgetService";
import { motionTransition } from "../../../shared/motion/motionTokens";
import { peso } from "./budgetUi";
import { useAuth } from "../../../contexts/AuthContext";

/** Derives a human-readable, deterministic voucher code from existing IDs — no DB column needed. */
export function buildDvCode(release: PettyCashRelease, request: PettyCashRequest | undefined, fiscalYear: number) {
  if (release.voucherNumber) return release.voucherNumber;
  const year = fiscalYear;
  const num  = String(request?.requestNumber ?? 0).padStart(5, "0");
  const tail = release.id.replace(/-/g, "").slice(-4).toUpperCase();
  return `DV-${year}-${num}-${tail}`;
}

export function DisbursementVoucherDialog({
  release,
  request,
  fiscalYear,
  onClose,
  onReleased,
}: {
  release: PettyCashRelease;
  request?: PettyCashRequest;
  fiscalYear: number;
  onClose: () => void;
  onReleased: () => Promise<void>;
}) {
  const { userProfile } = useAuth();
  const dvCode    = buildDvCode(release, request, fiscalYear);
  const [checked, setChecked]   = useState(false);
  const [busy,    setBusy]      = useState(false);
  const [copied,  setCopied]    = useState(false);
  const [error,   setError]     = useState("");
  const [method, setMethod] = useState<"cash" | "cheque">(release.releaseMethod || "cash");
  const [chequeNumber, setChequeNumber] = useState(release.chequeNumber || "");
  const inFlight  = useRef(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(dvCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const confirm = async () => {
    if (inFlight.current || !checked) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      if (method === "cash" && userProfile?.role !== "accounting_staff") await markPettyCashReleased(release.id);
      else await markPettyCashReleased(release.id, { method, chequeNumber });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The release could not be recorded.");
      inFlight.current = false;
      setBusy(false);
      return;
    }
    onClose();
    await onReleased();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !inFlight.current) onClose(); }}>
      <DialogContent
        className="bg-white sm:max-w-md"
        onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}
        onInteractOutside={(e) => { if (busy) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BxsBox size={18} className="text-emerald-700" />
            Disbursement Voucher
          </DialogTitle>
          <DialogDescription className="text-[11.5px] text-neutral-500">
            Official cash release authorization and physical handover record.
          </DialogDescription>
        </DialogHeader>

        <m.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTransition.productive}
          className="space-y-3.5 py-1"
        >
          {/* Vibe AttentionBox */}
          <AttentionBox
            type="positive"
            title="Physical Handover Record"
            text="Provide this stable voucher number to the recipient. eFlow validates it on the server before recording their acknowledgement."
          />

          {/* Voucher code display */}
          <div className="flex items-center justify-between rounded-xl border-2 border-emerald-300 bg-emerald-50/80 px-4 py-3">
            <span className="font-mono text-xl font-bold tracking-widest text-emerald-800">{dvCode}</span>
            <Button
              kind="tertiary"
              size="small"
              onClick={handleCopy}
              className="ml-2"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-700" /> : <Copy size={13} />}
              <span className="ml-1 text-[10.5px]">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          {/* Release details */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] text-neutral-600 space-y-1">
            <div><span className="font-medium text-neutral-800">Recipient: </span>{request?.cashRecipientName || request?.requesterName || "Assigned recipient"}</div>
            <div><span className="font-medium text-neutral-800">Amount: </span>{peso.format(release.amount)}</div>
            <div><span className="font-medium text-neutral-800">For: </span>{request?.subtaskTitle || request?.taskTitle || "Funded work"}</div>
            <div><span className="font-medium text-neutral-800">Request: </span>PC-{String(request?.requestNumber ?? 0).padStart(5, "0")}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] text-neutral-600">
              Release method
              <select aria-label="Release method" value={method} onChange={(event) => setMethod(event.target.value as "cash" | "cheque")} disabled={busy} className="mt-1 h-9 w-full rounded-lg border border-neutral-200 bg-white px-2.5 text-[10.5px]">
                <option value="cash">Cash handover</option>
                <option value="cheque">Cheque issuance</option>
              </select>
            </label>
            {method === "cheque" && <label className="text-[10px] text-neutral-600">Cheque number<input aria-label="Cheque number" value={chequeNumber} onChange={(event) => setChequeNumber(event.target.value)} disabled={busy} className="mt-1 h-9 w-full rounded-lg border border-neutral-200 bg-white px-2.5 text-[10.5px]" /></label>}
          </div>

          {/* Confirmation checkbox */}
          <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              disabled={busy}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300"
            />
            <span className="text-[11.5px] leading-snug text-neutral-800">
              I confirm the cash has been physically handed over to the recipient.
            </span>
          </label>

          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-[11px] text-rose-700">{error}</p>}
        </m.div>

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            kind="secondary"
            size="small"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            kind="primary"
            color="positive"
            size="small"
            disabled={busy || !checked || (method === "cheque" && !chequeNumber.trim())}
            loading={busy}
            onClick={() => { void confirm(); }}
          >
            Confirm &amp; Record Release
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
