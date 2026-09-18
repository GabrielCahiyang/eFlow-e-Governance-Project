import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(new URL("../../supabase/migrations/20260919000000_phase04_phase05_accounting.sql", import.meta.url), "utf8");

describe("Phase 4 and 5 accounting migration", () => {
  it("keeps accounting staffing optional, repeatable, and scoped to the current Head's department", () => {
    expect(sql).toContain("'accounting_staff'");
    expect(sql).toContain("organization.head_user_id is distinct from caller");
    expect(sql).toContain("target_profile.org_id is distinct from organization.id");
    expect(sql).toContain("set_department_accounting_staff");
    expect(sql).not.toContain("unique (org_id, role)");
  });

  it("creates append-only balanced journal records for release and settlement", () => {
    expect(sql).toContain("general_journal_entries");
    expect(sql).toContain("general_journal_lines");
    expect(sql).toContain("post_cash_release_general_journal");
    expect(sql).toContain("post_liquidation_general_journal");
    expect(sql).toContain("Posted accounting and receipt records are immutable");
    expect(sql).toContain("Journal debits and credits must balance");
  });

  it("routes cash and cheque release plus department accounting settlement without granting request approval", () => {
    expect(sql).toContain("record_accounting_petty_cash_release");
    expect(sql).toContain("p_release_method not in ('cash', 'cheque')");
    expect(sql).toContain("settle_accounting_liquidation");
    expect(sql).toContain("can_manage_department_accounting");
    expect(sql).not.toContain("accounting_staff', 'tasks.verify'");
  });

  it("requires refund evidence and prevents referenced receipt files from deletion", () => {
    expect(sql).toContain("Enter the official refund receipt number and return date");
    expect(sql).toContain("petty_cash_receipts_append_only");
    expect(sql).toContain("not exists (select 1 from public.petty_cash_receipts receipt where receipt.file_path = name)");
  });
});
