// ─── Empty State Component ───────────────────────────────────────
import React from "react";
import { EmptyState as VibeEmptyState } from "@vibe/core";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16">
      <VibeEmptyState
        title={title}
        description={description || "There is nothing to display here yet."}
        visual={icon}
      />
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
