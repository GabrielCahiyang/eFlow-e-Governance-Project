// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, type Column } from "../../src/app/components/ui/DataTable";
import { Modal, ModalButton } from "../../src/app/components/ui/Modal";

afterEach(() => cleanup());

describe("shared Vibe UI adapters", () => {
  it("keeps the legacy modal API while exposing an accessible Vibe dialog", async () => {
    const onClose = vi.fn();
    render(
      <Modal
        isOpen
        onClose={onClose}
        title="Archive project"
        footer={<ModalButton variant="danger">Archive</ModalButton>}
      >
        <p>This project will become read-only.</p>
      </Modal>,
    );

    expect(await screen.findByRole("dialog", { name: "Archive project" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Archive" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("makes sortable headers and actionable rows keyboard accessible", () => {
    const openRow = vi.fn();
    const columns: Column<{ id: string; name: string }>[] = [
      {
        key: "name",
        header: "Name",
        render: (item) => item.name,
        sortable: true,
        sortValue: (item) => item.name,
      },
    ];

    render(
      <DataTable
        data={[{ id: "2", name: "Zulu" }, { id: "1", name: "Alpha" }]}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={openRow}
        searchFilter={(item, query) => item.name.toLowerCase().includes(query)}
      />,
    );

    const sortButton = screen.getByRole("button", { name: "Name" });
    fireEvent.click(sortButton);
    expect(screen.getByText("Alpha").compareDocumentPosition(screen.getByText("Zulu")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const row = screen.getAllByLabelText("Open record")[0];
    fireEvent.keyDown(row, { key: "Enter" });
    expect(openRow).toHaveBeenCalledWith({ id: "1", name: "Alpha" });
  });
});
