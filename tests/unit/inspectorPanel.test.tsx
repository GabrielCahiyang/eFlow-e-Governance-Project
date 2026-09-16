// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotionConfig } from "motion/react";
import { EflowMotionProvider, InspectorPanel } from "../../src/app/shared/motion";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  document.getElementById("root")?.remove();
});

function renderInspector(open: boolean, onClose = vi.fn()) {
  return render(
    <EflowMotionProvider>
      <InspectorPanel open={open} onClose={onClose} ariaLabel="Task inspector">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </InspectorPanel>
    </EflowMotionProvider>,
  );
}

describe("InspectorPanel", () => {
  it("locks the application and closes from Escape", async () => {
    const appRoot = document.createElement("div");
    appRoot.id = "root";
    document.body.appendChild(appRoot);
    const onClose = vi.fn();

    renderInspector(true, onClose);

    const dialog = await screen.findByRole("dialog", { name: "Task inspector" });
    expect(document.body.style.overflow).toBe("hidden");
    expect(appRoot.inert).toBe(true);
    expect(appRoot.getAttribute("aria-hidden")).toBe("true");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByTestId("inspector-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("traps focus and restores it when closed", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open inspector";
    document.body.appendChild(trigger);
    trigger.focus();

    const view = renderInspector(true);
    const first = await screen.findByRole("button", { name: "First action" });
    const last = screen.getByRole("button", { name: "Last action" });
    await waitFor(() => expect(document.activeElement).toBe(first));

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    view.rerender(
      <EflowMotionProvider>
        <InspectorPanel open={false} onClose={vi.fn()} ariaLabel="Task inspector">
          <button type="button">First action</button>
        </InspectorPanel>
      </EflowMotionProvider>,
    );
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    trigger.remove();
  });

  it("inherits the application reduced-motion policy", () => {
    function ReducedMotionProbe() {
      return <output>{String(useReducedMotionConfig())}</output>;
    }

    render(
      <EflowMotionProvider reducedMotion="always">
        <ReducedMotionProbe />
      </EflowMotionProvider>,
    );
    expect(screen.getByText("true", { selector: "output" })).toBeTruthy();
  });
});
