import { Skeleton } from "@vibe/core";

export function WorkspaceLoadingSkeleton({
  label = "Loading workspace…",
  rows = 4,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Skeleton type="text" width={220} />
          <Skeleton type="text" width={320} />
        </div>
        <Skeleton type="rectangle" size="custom" width={140} height={34} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} type="rectangle" size="custom" height={70} fullWidth />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, item) => (
          <Skeleton key={item} type="rectangle" size="custom" height={48} fullWidth />
        ))}
      </div>
    </div>
  );
}
