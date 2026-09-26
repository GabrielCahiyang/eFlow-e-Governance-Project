import { useMemo, useState } from "react";
import {
  AttentionBox,
  Button,
  Label,
  Loader,
  Search as VibeSearch,
} from "@vibe/core";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Plus,
  Scale,
  X,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useGeneralJournal } from "../hooks/useGeneralJournal";
import {
  getJournalTotals,
  isBalancedJournalLines,
} from "../selectors/journalSelectors";
import { postGeneralJournalAdjustment } from "../services/budgetService";
import type { AccountingAccount, JournalAdjustmentLineInput } from "../types";
import { peso } from "./budgetUi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export function GeneralJournalWorkspace({
  orgId: providedOrgId,
  fiscalYear = new Date().getFullYear(),
  fiscalBudgetId,
  approvedBudget,
  settledExpenses,
  returnedCash,
}: {
  orgId?: string;
  fiscalYear?: number;
  fiscalBudgetId?: string;
  approvedBudget?: number;
  settledExpenses?: number;
  returnedCash?: number;
}) {
  const { userProfile, can } = useAuth();
  const orgId =
    providedOrgId || userProfile?.org_id || userProfile?.departmentId || "";
  const journal = useGeneralJournal(orgId, fiscalYear);
  const [query, setQuery] = useState("");
  const [classification, setClassification] = useState("all");
  const [startDate, setStartDate] = useState(`${fiscalYear}-01-01`);
  const [endDate, setEndDate] = useState(`${fiscalYear}-12-31`);
  const [adjusting, setAdjusting] = useState(false);
  const accountByCode = useMemo(
    () => new Map(journal.accounts.map((account) => [account.code, account])),
    [journal.accounts],
  );
  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return journal.entries
      .map((entry) => ({
        ...entry,
        lines: entry.lines.filter(
          (line) =>
            classification === "all" ||
            accountByCode.get(line.accountCode)?.classification ===
              classification,
        ),
      }))
      .filter(
        (entry) =>
          entry.entryDate >= startDate &&
          entry.entryDate <= endDate &&
          entry.lines.length > 0 &&
          (!needle ||
            `${entry.referenceNumber} ${entry.memo} ${entry.postedByName || ""} ${entry.lines.map((line) => `${line.accountCode} ${line.accountTitle}`).join(" ")}`
              .toLowerCase()
              .includes(needle)),
      );
  }, [
    accountByCode,
    classification,
    endDate,
    journal.entries,
    query,
    startDate,
  ]);
  const totals = useMemo(
    () => getJournalTotals(filteredEntries),
    [filteredEntries],
  );
  const available =
    approvedBudget == null
      ? undefined
      : approvedBudget - (settledExpenses || 0) + (returnedCash || 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <JournalMetric
          icon={<Scale size={16} />}
          label="Trial balance"
          value={peso.format(totals.debit)}
          note={`Credits ${peso.format(totals.credit)}`}
          good={Math.abs(totals.delta) <= 0.009}
        />
        <JournalMetric
          icon={<CheckCircle2 size={16} />}
          label="Balance delta"
          value={peso.format(Math.abs(totals.delta))}
          note={
            Math.abs(totals.delta) <= 0.009
              ? "Debits equal credits"
              : "Reconciliation required"
          }
          good={Math.abs(totals.delta) <= 0.009}
        />
        <JournalMetric
          icon={<BookOpenCheck size={16} />}
          label="Appropriation available"
          value={
            available == null
              ? "Linked to annual budget"
              : peso.format(available)
          }
          note={
            approvedBudget == null
              ? `${fiscalYear} journal view`
              : "Authorized − expense + refund"
          }
          good={available == null || available >= 0}
        />
      </div>
      {journal.error && (
        <AttentionBox
          type="negative"
          title="Journal unavailable"
          text={journal.error}
        />
      )}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <header className="flex flex-col gap-3 border-b border-neutral-100 p-4 xl:flex-row xl:items-center">
          <VibeSearch
            className="min-w-0 flex-1"
            clearIconLabel="Clear journal search"
            inputAriaLabel="Search journal"
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="Search voucher, account, memo, or recorder…"
            showClearIcon
            size="small"
            value={query}
          />
          <div className="flex flex-wrap gap-2">
            <JournalDateInput
              ariaLabel="Journal start date"
              value={startDate}
              onChange={setStartDate}
            />
            <JournalDateInput
              ariaLabel="Journal end date"
              value={endDate}
              onChange={setEndDate}
            />
            <select
              aria-label="Account classification"
              value={classification}
              onChange={(event) => setClassification(event.target.value)}
              className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-[12px]"
            >
              <option value="all">All account classes</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            {fiscalBudgetId && can("accounting.post_journal") && (
              <Button
                kind="primary"
                size="small"
                onClick={() => setAdjusting(true)}
              >
                <Plus size={13} /> Post adjustment
              </Button>
            )}
          </div>
        </header>
        {journal.loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-[12px] text-neutral-500">
            <Loader size="small" /> Loading balanced entries…
          </div>
        ) : filteredEntries.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Date / JEV</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Chart of accounts title</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                  <th className="px-4 py-3">Memo / recorded by</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredEntries.flatMap((entry) =>
                    entry.lines.map((line, index) => (
                      <m.tr
                        layout
                        key={line.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-neutral-100 align-top"
                      >
                        <td className="px-4 py-3 text-[12px] text-neutral-600">
                          {index === 0 && (
                            <>
                              <div>
                                {new Date(
                                  `${entry.entryDate}T00:00:00`,
                                ).toLocaleDateString()}
                              </div>
                              <div className="mt-1 font-mono text-[11px] text-neutral-400">
                                JEV-{fiscalYear}-
                                {String(entry.entryNumber).padStart(6, "0")}
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-neutral-700">
                          {index === 0 ? entry.referenceNumber : ""}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[12px] font-medium text-neutral-800">
                            {line.accountTitle}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-neutral-400">
                            {line.accountCode}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] tabular-nums">
                          {line.debit ? peso.format(line.debit) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] tabular-nums">
                          {line.credit ? peso.format(line.credit) : "—"}
                        </td>
                        <td className="max-w-[260px] px-4 py-3 text-[11px] text-neutral-500">
                          {index === 0 && (
                            <>
                              <div>{entry.memo}</div>
                              <div className="mt-1">
                                {entry.postedByName || "Automated posting"}
                              </div>
                            </>
                          )}
                        </td>
                      </m.tr>
                    )),
                  )}
                </AnimatePresence>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-[12px]">
                    Filtered trial balance
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] tabular-nums">
                    {peso.format(totals.debit)}
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] tabular-nums">
                    {peso.format(totals.credit)}
                  </td>
                  <td className="px-4 py-3">
                    <Label
                      color={
                        Math.abs(totals.delta) <= 0.009
                          ? "positive"
                          : "negative"
                      }
                      text={
                        Math.abs(totals.delta) <= 0.009
                          ? "Balanced"
                          : `Delta ${peso.format(totals.delta)}`
                      }
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <BookOpenCheck size={30} className="mx-auto text-neutral-300" />
            <h3 className="mt-3 text-[12px] font-semibold">
              No journal entries match
            </h3>
            <p className="mt-1 text-[12px] text-neutral-500">
              Cash releases and settled liquidations post here automatically.
            </p>
          </div>
        )}
      </section>
      {adjusting && fiscalBudgetId && (
        <JournalAdjustmentDialog
          fiscalBudgetId={fiscalBudgetId}
          accounts={journal.accounts}
          onClose={() => setAdjusting(false)}
          onSaved={async () => {
            setAdjusting(false);
            await journal.refresh();
          }}
        />
      )}
    </div>
  );
}

function JournalMetric({
  icon,
  label,
  value,
  note,
  good,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  good: boolean;
}) {
  return (
    <m.div
      layout
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500">
        {icon}
        {label}
      </div>
      <div
        className={`mt-2 text-right text-[18px] font-semibold tabular-nums ${good ? "text-neutral-950" : "text-rose-700"}`}
      >
        {value}
      </div>
      <div
        className={`mt-1 text-right text-[11px] ${good ? "text-emerald-700" : "text-rose-600"}`}
      >
        {note}
      </div>
    </m.div>
  );
}

function JournalAdjustmentDialog({
  fiscalBudgetId,
  accounts,
  onClose,
  onSaved,
}: {
  fiscalBudgetId: string;
  accounts: AccountingAccount[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [reference, setReference] = useState("");
  const [memo, setMemo] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [lines, setLines] = useState<JournalAdjustmentLineInput[]>([
    { accountCode: accounts[0]?.code || "", debit: 0, credit: 0 },
    {
      accountCode: accounts[1]?.code || accounts[0]?.code || "",
      debit: 0,
      credit: 0,
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const totals = lines.reduce(
    (sum, line) => ({
      debit: sum.debit + Number(line.debit || 0),
      credit: sum.credit + Number(line.credit || 0),
    }),
    { debit: 0, credit: 0 },
  );
  const update = (index: number, patch: Partial<JournalAdjustmentLineInput>) =>
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await postGeneralJournalAdjustment({
        fiscalBudgetId,
        entryDate,
        referenceNumber: reference,
        memo,
        lines,
      });
      await onSaved();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Adjustment could not be posted.",
      );
      setBusy(false);
    }
  };
  const invalid =
    busy || !reference.trim() || !memo.trim() || !isBalancedJournalLines(lines);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] min-w-0 overflow-y-auto bg-white"
        style={{ maxWidth: 760 }}
      >
        <DialogHeader>
          <DialogTitle>Post correcting journal entry</DialogTitle>
          <DialogDescription>
            Posted entries are permanent. Reverse an error with a new balanced
            entry instead of editing history.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          <div
            className="flex min-w-0 gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950"
            role="note"
          >
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={16}
            />
            <div className="min-w-0 text-[11px] leading-relaxed">
              <div className="font-semibold">Append-only accounting record</div>
              <p>
                Confirm the reference, accounts, and amount. This entry cannot
                be edited or deleted after posting.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Entry date"
              type="date"
              value={entryDate}
              onChange={setEntryDate}
            />
            <Field
              label="Reference number"
              value={reference}
              onChange={setReference}
            />
          </div>
          <Field
            label="Memo / correction reason"
            value={memo}
            onChange={setMemo}
          />
          <div className="min-w-0 space-y-2">
            {lines.map((line, index) => (
              <m.div
                layout
                key={index}
                className="grid min-w-0 grid-cols-2 gap-2 rounded-xl border border-neutral-200 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,112px)_minmax(0,112px)_32px]"
              >
                <label className="col-span-2 min-w-0 text-[10px] text-neutral-600 md:col-span-1">
                  Account {index + 1}
                  <select
                    aria-label={`Account line ${index + 1}`}
                    value={line.accountCode}
                    onChange={(event) =>
                      update(index, { accountCode: event.target.value })
                    }
                    className="mt-1 h-9 w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-2 text-[10px]"
                  >
                    {accounts.map((account) => (
                      <option key={account.code} value={account.code}>
                        {account.code} · {account.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0 text-[10px] text-neutral-600">
                  Debit
                  <input
                    aria-label={`Debit line ${index + 1}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.debit || ""}
                    onChange={(event) =>
                      update(index, {
                        debit: Number(event.target.value),
                        credit: event.target.value ? 0 : line.credit,
                      })
                    }
                    className="mt-1 h-9 w-full min-w-0 rounded-lg border border-neutral-200 px-2 text-[10px]"
                  />
                </label>
                <label className="min-w-0 text-[10px] text-neutral-600">
                  Credit
                  <input
                    aria-label={`Credit line ${index + 1}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={line.credit || ""}
                    onChange={(event) =>
                      update(index, {
                        credit: Number(event.target.value),
                        debit: event.target.value ? 0 : line.debit,
                      })
                    }
                    className="mt-1 h-9 w-full min-w-0 rounded-lg border border-neutral-200 px-2 text-[10px]"
                  />
                </label>
                <button
                  aria-label={`Remove line ${index + 1}`}
                  type="button"
                  disabled={lines.length <= 2}
                  onClick={() =>
                    setLines((current) =>
                      current.filter((_, lineIndex) => lineIndex !== index),
                    )
                  }
                  className="col-span-2 h-9 w-9 justify-self-end rounded-lg text-neutral-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 md:col-span-1 md:self-end"
                >
                  <X size={14} />
                </button>
              </m.div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              kind="tertiary"
              size="small"
              onClick={() =>
                setLines((current) => [
                  ...current,
                  { accountCode: accounts[0]?.code || "", debit: 0, credit: 0 },
                ])
              }
            >
              <Plus size={13} /> Add line
            </Button>
            <div className="text-[10px] text-neutral-600">
              Debit {peso.format(totals.debit)} · Credit{" "}
              {peso.format(totals.credit)} · Delta{" "}
              {peso.format(totals.debit - totals.credit)}
            </div>
          </div>
          {error && <AttentionBox type="negative" text={error} />}
        </div>
        <DialogFooter>
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
            size="small"
            loading={busy}
            disabled={invalid}
            onClick={() => void submit()}
          >
            Post balanced entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-[10px] text-neutral-600">
      {label}
      <span className="relative mt-1 block min-w-0">
        {type === "date" && (
          <CalendarDays
            aria-hidden="true"
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-neutral-500"
          />
        )}
        <input
          aria-label={label}
          type={type}
          value={value}
          onClick={type === "date" ? openDatePicker : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`h-9 w-full min-w-0 rounded-lg border border-neutral-200 pr-2.5 text-[10.5px] ${type === "date" ? "cursor-pointer pl-8" : "pl-2.5"}`}
        />
      </span>
    </label>
  );
}

function JournalDateInput({
  ariaLabel,
  value,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block min-w-[150px] flex-1 sm:flex-none">
      <CalendarDays
        aria-hidden="true"
        size={13}
        className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-neutral-500"
      />
      <input
        aria-label={ariaLabel}
        type="date"
        value={value}
        onClick={openDatePicker}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full min-w-0 cursor-pointer rounded-lg border border-neutral-200 bg-white pl-8 pr-2 text-[10px]"
      />
    </label>
  );
}

function openDatePicker(event: React.MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker?.();
  } catch {
    // Native date controls still work when a browser does not expose showPicker.
  }
}
