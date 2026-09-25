import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = (name: string) => readFileSync(
  new URL(`../../supabase/migrations/${name}`, import.meta.url),
  "utf8",
).toLowerCase();

describe("cash and discussion guard migrations", () => {
  it("publishes task comments for realtime delivery", () => {
    expect(migration("20260925000000_task_discussion_realtime.sql"))
      .toContain("alter publication supabase_realtime add table public.task_comments");
  });

  it("rejects past needed-by dates at the database boundary", () => {
    const sql = migration("20260925000001_cash_request_future_dates.sql");
    expect(sql).toContain("new.needed_by < current_date");
    expect(sql).toContain("before insert or update of needed_by");
  });

  it("sets fifteen days and reserves late approval for the Department Head", () => {
    const sql = migration("20260925000002_fifteen_day_liquidation_head_approval.sql");
    expect(sql).toContain("alter column liquidation_due_days set default 15");
    expect(sql).toContain("new.submitted_at > request_row.liquidation_due_at");
    expect(sql).toContain("caller_role is null or caller_role not in ('dept_head', 'department_head')");
  });
});
