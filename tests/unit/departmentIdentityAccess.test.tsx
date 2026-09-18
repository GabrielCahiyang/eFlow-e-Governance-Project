// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Employee } from "../../src/app/services/employeeService";
import { getCoreRoleNavigation } from "../../src/app/components/Layout/coreWorkflowNavigation";
import { getNavigationPermission } from "../../src/app/features/navigation/navigationPermissions";
import { isRoleNavigationItemVisible } from "../../src/app/features/navigation/roleNavigation";

const setAccounting = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock(
  "../../src/app/features/team-management/services/departmentIdentityService",
  () => ({ setDepartmentAccountingStaff: setAccounting }),
);
import { DepartmentIdentityAccessPanel } from "../../src/app/features/team-management/components/supervision/DepartmentIdentityAccessPanel";

const employees: Employee[] = [
  {
    id: "employee-1",
    name: "Ana Santos",
    email: "ana@example.test",
    jobTitle: "Employee",
    jobDescription: "",
    currentWorkload: 20,
    department: "org-1",
    initials: "AS",
  },
  {
    id: "employee-2",
    name: "Ben Cruz",
    email: "ben@example.test",
    jobTitle: "Employee",
    jobDescription: "",
    currentWorkload: 30,
    department: "org-1",
    initials: "BC",
  },
  {
    id: "head-1",
    name: "Department Head",
    email: "head@example.test",
    jobTitle: "Head",
    jobDescription: "",
    currentWorkload: 10,
    department: "org-1",
    initials: "DH",
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("department Identity & Access", () => {
  it("appears under People only for a Department Head", () => {
    const identity = getCoreRoleNavigation("depthead")?.navItems.find(
      (item) => item.id === "identity",
    );
    expect(identity).toMatchObject({
      group: "People",
      label: "Identity & Access",
      page: "Identity & Access",
      requiresDepartmentHead: true,
    });
    expect(isRoleNavigationItemVisible(identity!, false, "dept_head")).toBe(
      true,
    );
    expect(
      isRoleNavigationItemVisible(identity!, false, "assistant_head"),
    ).toBe(false);
    expect(getNavigationPermission("depthead", "identity")).toBe(
      "navigation.team_supervision",
    );
  });

  it("supports no Accounting Staff and protects leadership roles", () => {
    render(
      <DepartmentIdentityAccessPanel
        employees={employees}
        roles={new Map([["head-1", "dept_head"]])}
      />,
    );
    expect(screen.getByText("No Accounting Staff assigned")).toBeTruthy();
    expect(screen.getByText("Leadership role protected")).toBeTruthy();
  });

  it("can assign more than one employee without replacing the first", async () => {
    render(
      <DepartmentIdentityAccessPanel
        employees={employees.slice(0, 2)}
        roles={new Map()}
      />,
    );
    const assign = screen.getAllByRole("button", {
      name: /Assign accounting access/i,
    });
    fireEvent.click(assign[0]);
    await waitFor(() =>
      expect(setAccounting).toHaveBeenCalledWith("employee-1", true),
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: /Assign accounting access/i })[0],
    );
    await waitFor(() =>
      expect(setAccounting).toHaveBeenCalledWith("employee-2", true),
    );
    expect(screen.getByText("2 accounting staff members")).toBeTruthy();
  });
});
