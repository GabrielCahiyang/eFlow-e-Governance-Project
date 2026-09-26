import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const supervision = read("src/app/features/team-management/components/supervision/TeamSupervisionWorkspace.tsx");
const intelligence = read("src/app/features/team-management/components/intelligence/TeamIntelligenceWorkspace.tsx");
const reports = read("src/app/features/reports/components/DeptHeadReportsWorkspace.tsx");
const reportTable = read("src/app/features/reports/components/DepartmentReportTable.tsx");
const announcementCenter = read("src/app/features/announcements/components/center/AnnouncementCenter.tsx");
const adminAnnouncements = read("src/app/features/announcements/components/admin/AdminAnnouncements.tsx");

describe("Phase 8 people, reports, and communications presentation", () => {
  it("uses layout-matched skeletons instead of blocking spinner surfaces", () => {
    for (const source of [supervision, intelligence, reports, announcementCenter, adminAnnouncements]) {
      expect(source).toContain("WorkspaceLoadingSkeleton");
      expect(source).not.toContain("LoadingState");
    }
  });

  it("keeps the report library rail, sticky filters, and task drill-down contract", () => {
    expect(reports).toContain('title="Report library"');
    expect(reports).toContain("sticky top-3");
    expect(reports).toContain("setSelectedTaskId");
    expect(reports).toContain("ExportMenu");
  });

  it("constrains long report fields so work-item text wraps inside the table", () => {
    expect(reportTable).toContain("table-fixed");
    expect(reportTable).toContain("break-words");
    expect(reportTable).toContain("whitespace-normal");
  });
});
