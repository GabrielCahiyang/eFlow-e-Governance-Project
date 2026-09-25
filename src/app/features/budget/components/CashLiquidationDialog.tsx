import { useRef, useState } from "react";
import { AttentionBox, Button } from "@vibe/core";
import * as m from "motion/react-m";
import { FileText, Plus, Trash2, X } from "lucide-react";
import type { PettyCashRequest, ReceiptDraft } from "../types";
import { submitPettyCashLiquidation } from "../services/budgetService";
import { peso } from "./budgetUi";
import {
  getPhilippineCalendarDate,
  isLiquidationCurrentlyOverdue,
} from "../selectors/cashWorkflowRules";

export function CashLiquidationDialog({ request, orgId, perReceiptLimit, liquidationDueDays, allowReceiptOverride, onClose, onSaved }: {
  request: PettyCashRequest;
  orgId: string;
  perReceiptLimit: number;
  liquidationDueDays: number;
  allowReceiptOverride: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const approved = request.releasedAmount || 0;
  const [spent, setSpent] = useState(approved);
  const [note, setNote] = useState("");
  const [receipts, setReceipts] = useState<ReceiptDraft[]>([blankReceipt(approved)]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refundReceiptNumber, setRefundReceiptNumber] = useState("");
  const [refundDate, setRefundDate] = useState(getPhilippineCalendarDate());
  const idempotencyKey = useRef(crypto.randomUUID());
  const receiptTotal = receipts.reduce((sum, receipt) => sum + (Number(receipt.amount) || 0), 0);
  const overdue = isLiquidationCurrentlyOverdue(request);
  const update = (id: string, patch: Partial<ReceiptDraft>) => setReceipts((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await submitPettyCashLiquidation({ orgId, requestId: request.id, spent, note, receipts, refundReceiptNumber, refundDate, idempotencyKey: idempotencyKey.current });
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Receipts could not be submitted.");
    } finally {
      setBusy(false);
    }
  };

  const invalid = busy || spent < 0 || spent > approved || Math.abs(receiptTotal - spent) > .009 || !note.trim()
    || (approved - spent > .009 && (!refundReceiptNumber.trim() || !refundDate))
    || receipts.some((item) => !item.vendor.trim() || !item.description.trim() || !item.file
      || (item.amount > perReceiptLimit && (!allowReceiptOverride || !item.overrideReason?.trim())));

  return <>
    <div className="fixed inset-0 z-[80] bg-neutral-950/40" onClick={onClose} />
    <div className="fixed inset-x-4 top-1/2 z-[81] mx-auto max-h-[90vh] max-w-2xl -translate-y-1/2 overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl">
      <header className="flex items-start justify-between border-b border-neutral-100 p-4">
        <div><h2 className="text-[15px] font-semibold">Upload receipts and return balance</h2><p className="mt-1 text-[10px] text-neutral-500">Released {peso.format(approved)} · unused cash {peso.format(Math.max(0, approved - spent))}</p></div>
        <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-800"><X size={17} /></button>
      </header>
      <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4">
        <AttentionBox type="primary" title="Immutable receipt record" text="After submission, receipt rows and uploaded evidence are locked. Corrections are recorded as a new liquidation version so the audit history stays intact." />
        <AttentionBox
          type={overdue ? "warning" : "primary"}
          title={overdue ? "Late liquidation · Department Head approval required" : `${liquidationDueDays}-day liquidation window`}
          text={overdue
            ? `The receipt deadline was ${request.liquidationDueAt ? new Date(request.liquidationDueAt).toLocaleDateString() : "already reached"}. You may still submit this package, but only the Department Head can approve and settle it.`
            : `Upload the complete receipt package by ${request.liquidationDueAt ? new Date(request.liquidationDueAt).toLocaleDateString() : `the ${liquidationDueDays}-day deadline after full release`}.`}
        />
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Actual amount spent" type="number" value={spent} onChange={(value) => setSpent(Number(value))} /><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3"><div className="text-[9px] uppercase tracking-wide text-neutral-400">Receipt total</div><div className={`mt-1 text-[14px] font-semibold ${Math.abs(receiptTotal - spent) > .009 ? "text-rose-600" : "text-emerald-700"}`}>{peso.format(receiptTotal)}</div></div></div>
        <div className="space-y-3">{receipts.map((receipt, index) => <div key={receipt.id} className="rounded-xl border border-neutral-200 p-3"><div className="flex items-center justify-between"><div className="text-[10px] font-medium">Receipt {index + 1}</div><button type="button" disabled={receipts.length === 1} onClick={() => setReceipts((current) => current.filter((item) => item.id !== receipt.id))} className="text-neutral-400 hover:text-rose-600 disabled:opacity-30"><Trash2 size={12} /></button></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><Field label="Vendor / payee" value={receipt.vendor} onChange={(value) => update(receipt.id, { vendor: value })} /><Field label="OR/AR number" value={receipt.receiptNumber} onChange={(value) => update(receipt.id, { receiptNumber: value })} /><Field label="Receipt date" type="date" value={receipt.receiptDate} onChange={(value) => update(receipt.id, { receiptDate: value })} /><Field label="Amount" type="number" value={receipt.amount || ""} onChange={(value) => update(receipt.id, { amount: Number(value) })} /><label className="sm:col-span-2"><span className="text-[9.5px] text-neutral-500">Expense description</span><input value={receipt.description} onChange={(event) => update(receipt.id, { description: event.target.value })} className="mt-1 h-9 w-full rounded-lg border border-neutral-200 px-2.5 text-[10px]" /></label>{receipt.amount > perReceiptLimit && <label className="sm:col-span-2"><span className="text-[9.5px] text-amber-700">Threshold exception · above {peso.format(perReceiptLimit)}</span><textarea disabled={!allowReceiptOverride} value={receipt.overrideReason || ""} onChange={(event) => update(receipt.id, { overrideReason: event.target.value })} rows={2} placeholder={allowReceiptOverride ? "Explain why the larger receipt was necessary." : "Department policy does not allow an override."} className="mt-1 w-full rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] disabled:opacity-60" /></label>}<label className="sm:col-span-2"><span className="text-[9.5px] text-neutral-500">Receipt image or PDF</span><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => update(receipt.id, { file: event.target.files?.[0] })} className="mt-1 block w-full text-[9.5px] text-neutral-500 file:mr-2 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-[9.5px]" /></label></div></div>)}</div>
        <button type="button" onClick={() => setReceipts((current) => [...current, blankReceipt(0)])} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-[9.5px]"><Plus size={11} /> Add receipt</button>
        {approved - spent > .009 && <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 sm:grid-cols-2"><Field label="Official refund receipt number" value={refundReceiptNumber} onChange={setRefundReceiptNumber} /><Field label="Cash return date" type="date" value={refundDate} onChange={setRefundDate} /><p className="sm:col-span-2 text-[9.5px] text-blue-800">Returned change of {peso.format(approved - spent)} will post as a debit to Cash and a credit that clears the employee advance.</p></m.div>}
        <label className="block"><span className="text-[10px] text-neutral-500">Liquidation note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="What was purchased and how much cash is being returned?" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-[10.5px]" /></label>
        {error && <div className="rounded-lg bg-rose-50 p-3 text-[10px] text-rose-700">{error}</div>}
        <div className="flex justify-end gap-2"><Button kind="secondary" size="small" onClick={onClose} disabled={busy}>Cancel</Button><Button kind="primary" size="small" disabled={invalid} loading={busy} onClick={() => void submit()}><FileText size={11} /> Submit liquidation</Button></div>
      </m.div>
    </div>
  </>;
}

function blankReceipt(amount: number): ReceiptDraft {
  return { id: crypto.randomUUID(), vendor: "", receiptNumber: "", receiptDate: getPhilippineCalendarDate(), description: "", amount };
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return <label><span className="text-[9.5px] text-neutral-500">{label}</span><input type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-neutral-200 px-2.5 text-[10px]" /></label>;
}
