import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import type { AccountingAccount, GeneralJournalEntry } from "../types";
import { fetchAccountingAccounts, fetchGeneralJournal } from "../services/budgetService";

export function useGeneralJournal(orgId?: string, fiscalYear = new Date().getFullYear()) {
  const [entries, setEntries] = useState<GeneralJournalEntry[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [loading, setLoading] = useState(Boolean(orgId));
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!orgId) { setEntries([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const [nextEntries, nextAccounts] = await Promise.all([fetchGeneralJournal(orgId, fiscalYear), fetchAccountingAccounts()]);
      setEntries(nextEntries); setAccounts(nextAccounts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The general journal could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [fiscalYear, orgId]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!orgId) return;
    const channel = supabase.channel(`general-journal:${orgId}:${fiscalYear}:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "general_journal_entries", filter: `org_id=eq.${orgId}` }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "general_journal_lines" }, refresh)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [fiscalYear, orgId, refresh]);
  return { entries, accounts, loading, error, refresh };
}
