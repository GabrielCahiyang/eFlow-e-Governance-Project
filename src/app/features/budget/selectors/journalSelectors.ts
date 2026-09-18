import type { GeneralJournalEntry, JournalAdjustmentLineInput } from "../types";

export function getJournalTotals(entries: GeneralJournalEntry[]) {
  return entries.reduce((totals, entry) => {
    entry.lines.forEach((line) => { totals.debit += line.debit; totals.credit += line.credit; });
    totals.delta = totals.debit - totals.credit;
    return totals;
  }, { debit: 0, credit: 0, delta: 0 });
}

export function isBalancedJournalLines(lines: JournalAdjustmentLineInput[], tolerance = .009) {
  const totals = lines.reduce((sum, line) => ({ debit: sum.debit + Number(line.debit || 0), credit: sum.credit + Number(line.credit || 0) }), { debit: 0, credit: 0 });
  return totals.debit > 0 && Math.abs(totals.debit - totals.credit) <= tolerance
    && lines.length >= 2 && lines.every((line) => Boolean(line.accountCode) && ((line.debit > 0) !== (line.credit > 0)));
}
