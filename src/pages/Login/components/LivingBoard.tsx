import { useState, useEffect, useMemo, useRef } from "react";
import {
  motion,
  LayoutGroup,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { SPRING_ENTER, SPRING_DRIFT } from "../motion";
import styles from "./LivingBoard.module.scss";

type ColumnId = "todo" | "in_progress" | "done";

interface KanbanCard {
  id: string;
  title: string;
  columnId: ColumnId;
  progress: number;
  avatars: string[];
  statusLabel: string;
  statusColor: string;
  borderColor: string;
}

const COLUMN_CONFIG: Record<
  ColumnId,
  { progress: number; statusLabel: string; statusColor: string; borderColor: string }
> = {
  todo: {
    progress: 0.2,
    statusLabel: "Queued",
    statusColor: "#0073ea",
    borderColor: "#0073ea",
  },
  in_progress: {
    progress: 0.65,
    statusLabel: "In Progress",
    statusColor: "#fdab3d",
    borderColor: "#fdab3d",
  },
  done: {
    progress: 1.0,
    statusLabel: "Completed",
    statusColor: "#00c875",
    borderColor: "#00c875",
  },
};

// Seed TO DO: 2, IN PROGRESS: 2, DONE: 2 (Total 6 cards)
const INITIAL_CARDS: KanbanCard[] = [
  {
    id: "card-1",
    title: "City Hall Solar Inspection",
    columnId: "todo",
    progress: 0.2,
    avatars: ["DG", "FB"],
    statusLabel: "Drafting",
    statusColor: "#0073ea",
    borderColor: "#0073ea",
  },
  {
    id: "card-2",
    title: "Ormoc Port Wharf Permit",
    columnId: "todo",
    progress: 0.35,
    avatars: ["JC", "AL"],
    statusLabel: "Queued",
    statusColor: "#0073ea",
    borderColor: "#0073ea",
  },
  {
    id: "card-3",
    title: "Budget Allocation Q3",
    columnId: "in_progress",
    progress: 0.6,
    avatars: ["AL", "KC", "TB"],
    statusLabel: "In Review",
    statusColor: "#fdab3d",
    borderColor: "#fdab3d",
  },
  {
    id: "card-4",
    title: "Disaster Risk Map Update",
    columnId: "in_progress",
    progress: 0.8,
    avatars: ["MR", "DG"],
    statusLabel: "Verifying",
    statusColor: "#fdab3d",
    borderColor: "#fdab3d",
  },
  {
    id: "card-5",
    title: "Review Ordinance 2026-08",
    columnId: "done",
    progress: 1.0,
    avatars: ["JC", "MR"],
    statusLabel: "Approved",
    statusColor: "#00c875",
    borderColor: "#00c875",
  },
  {
    id: "card-6",
    title: "Business Permit Automation",
    columnId: "done",
    progress: 1.0,
    avatars: ["FB", "TB"],
    statusLabel: "Completed",
    statusColor: "#00c875",
    borderColor: "#00c875",
  },
];

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export function LivingBoard() {
  const shouldReduceMotion = useReducedMotion();
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<ColumnId | null>(null);

  const columnRefs = useRef<Record<ColumnId, HTMLDivElement | null>>({
    todo: null,
    in_progress: null,
    done: null,
  });

  const cycleStepRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const isHoveringBoardRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Determine target column from horizontal cursor coordinate
  const getTargetColumn = (clientX: number): ColumnId | null => {
    const todoEl = columnRefs.current.todo;
    const inProgEl = columnRefs.current.in_progress;
    const doneEl = columnRefs.current.done;

    if (!todoEl || !inProgEl || !doneEl) return null;

    const todoRect = todoEl.getBoundingClientRect();
    const inProgRect = inProgEl.getBoundingClientRect();
    const doneRect = doneEl.getBoundingClientRect();

    if (clientX < todoRect.left - 60 || clientX > doneRect.right + 60) {
      return null;
    }

    const boundary1 = (todoRect.right + inProgRect.left) / 2;
    const boundary2 = (inProgRect.right + doneRect.left) / 2;

    if (clientX < boundary1) return "todo";
    if (clientX < boundary2) return "in_progress";
    return "done";
  };

  // Move card directly to target column
  const moveCardToColumn = (cardId: string, targetColId: ColumnId) => {
    lastInteractionRef.current = Date.now();
    setCards((prev) => {
      const cardIndex = prev.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;
      const card = prev[cardIndex];
      if (card.columnId === targetColId) return prev;

      const config = COLUMN_CONFIG[targetColId];
      const updatedCard: KanbanCard = {
        ...card,
        columnId: targetColId,
        progress: config.progress,
        statusLabel: config.statusLabel,
        statusColor: config.statusColor,
        borderColor: config.borderColor,
      };

      const remaining = prev.filter((c) => c.id !== cardId);
      remaining.push(updatedCard);
      return remaining;
    });
  };

  // Kanban auto-migration loop: only advances when user is idle, pauses for 2 seconds after user drag
  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = window.setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (isDraggingRef.current || isHoveringBoardRef.current) return;
      // Pause autonomous migrations for 2s after any user interaction
      if (Date.now() - lastInteractionRef.current < 2000) return;

      setCards((prev) => {
        const next = prev.map((c) => ({ ...c }));
        const todo = next.filter((c) => c.columnId === "todo");
        const inProgress = next.filter((c) => c.columnId === "in_progress");
        const done = next.filter((c) => c.columnId === "done");

        // Safety rebalancing if a column was emptied by user moves
        if (inProgress.length === 0 && (todo.length > 1 || done.length > 1)) {
          const source = todo.length > 1 ? todo[0] : done[0];
          source.columnId = "in_progress";
          source.progress = 0.65;
          source.statusLabel = "In Progress";
          source.statusColor = "#fdab3d";
          source.borderColor = "#fdab3d";
          return next;
        }

        const step = cycleStepRef.current % 3;

        if (step === 0 && inProgress.length > 1) {
          const card = inProgress[0];
          card.columnId = "done";
          card.progress = 1.0;
          card.statusLabel = "Completed";
          card.statusColor = "#00c875";
          card.borderColor = "#00c875";
          cycleStepRef.current++;
        } else if (step === 1 && done.length > 1) {
          const card = done[0];
          card.columnId = "todo";
          card.progress = 0.2;
          card.statusLabel = "Queued";
          card.statusColor = "#0073ea";
          card.borderColor = "#0073ea";
          cycleStepRef.current++;
        } else if (step === 2 && todo.length > 1) {
          const card = todo[0];
          card.columnId = "in_progress";
          card.progress = 0.65;
          card.statusLabel = "In Progress";
          card.statusColor = "#fdab3d";
          card.borderColor = "#fdab3d";
          cycleStepRef.current++;
        } else {
          if (inProgress.length > 1) {
            const card = inProgress[0];
            card.columnId = "done";
            card.progress = 1.0;
            card.statusLabel = "Completed";
            card.statusColor = "#00c875";
            card.borderColor = "#00c875";
          } else if (todo.length > 1) {
            const card = todo[0];
            card.columnId = "in_progress";
            card.progress = 0.65;
            card.statusLabel = "In Progress";
            card.statusColor = "#fdab3d";
            card.borderColor = "#fdab3d";
          } else if (done.length > 1) {
            const card = done[0];
            card.columnId = "todo";
            card.progress = 0.2;
            card.statusLabel = "Queued";
            card.statusColor = "#0073ea";
            card.borderColor = "#0073ea";
          }
        }

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Counts for each column
  const columnCounts = useMemo(() => {
    return {
      todo: cards.filter((c) => c.columnId === "todo").length,
      in_progress: cards.filter((c) => c.columnId === "in_progress").length,
      done: cards.filter((c) => c.columnId === "done").length,
    };
  }, [cards]);

  const handleDragStart = (cardId: string) => {
    isDraggingRef.current = true;
    lastInteractionRef.current = Date.now();
    setDraggingCardId(cardId);
  };

  const handleDrag = (_e: unknown, info: PanInfo) => {
    const colId = getTargetColumn(info.point.x);
    setHoveredColumnId(colId);
  };

  const handleDragEnd = (card: KanbanCard, _e: unknown, info: PanInfo) => {
    isDraggingRef.current = false;
    setDraggingCardId(null);
    setHoveredColumnId(null);
    lastInteractionRef.current = Date.now();

    const targetColId = getTargetColumn(info.point.x);
    if (targetColId && targetColId !== card.columnId) {
      moveCardToColumn(card.id, targetColId);
    }
  };

  const draggingSourceColId = cards.find((c) => c.id === draggingCardId)?.columnId;

  return (
    <div
      className={styles.boardWrapper}
      role="region"
      aria-label="Interactive project preview board"
    >
      <div
        className={styles.boardContainer}
        onMouseEnter={() => {
          isHoveringBoardRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveringBoardRef.current = false;
        }}
      >
        <LayoutGroup id="eflow-kanban-board">
          {COLUMNS.map((column) => {
            const columnCards = cards.filter((c) => c.columnId === column.id);
            const count = columnCounts[column.id];
            const isDropTarget = hoveredColumnId === column.id && draggingCardId !== null;
            const isSourceColumn = column.id === draggingSourceColId;

            return (
              <div
                key={column.id}
                ref={(el) => {
                  columnRefs.current[column.id] = el;
                }}
                data-column-id={column.id}
                className={`${styles.column} ${isDropTarget ? styles.isDropTarget : ""} ${isSourceColumn ? styles.isSourceColumn : ""}`}
                style={{
                  zIndex: isSourceColumn ? 100 : 1,
                  transform: isSourceColumn ? "translateZ(30px)" : undefined,
                }}
              >
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{column.label}</span>
                  <span className={styles.columnBadge}>{count}</span>
                </div>

                <div className={styles.cardList}>
                  {columnCards.map((card) => {
                    const isDone = card.columnId === "done";
                    const isThisDragging = draggingCardId === card.id;

                    return (
                      <motion.div
                        layout
                        layoutId={card.id}
                        key={card.id}
                        data-card-id={card.id}
                        className={`${styles.card} ${isThisDragging ? styles.isDragging : ""}`}
                        style={{
                          borderLeftColor: card.borderColor,
                          zIndex: isThisDragging ? 9999 : 2,
                          transform: isThisDragging ? "translateZ(60px)" : undefined,
                        }}
                        drag
                        dragSnapToOrigin
                        whileHover={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scale: 1.02,
                                y: -2,
                                transition: { duration: 0.15 },
                              }
                        }
                        whileTap={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scale: 0.98,
                              }
                        }
                        whileDrag={{
                          scale: 1.05,
                          rotate: 1.5,
                          zIndex: 9999,
                          boxShadow:
                            "0 28px 56px rgba(0, 0, 0, 0.35), 0 8px 22px rgba(0, 0, 0, 0.16)",
                          cursor: "grabbing",
                        }}
                        onDragStart={() => handleDragStart(card.id)}
                        onDrag={(_e, info) => handleDrag(_e, info)}
                        onDragEnd={(_e, info) => handleDragEnd(card, _e, info)}
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
                        animate={
                          isDone && !shouldReduceMotion
                            ? {
                                opacity: 1,
                                scale: [1, 1.04, 1],
                                transition: { duration: 0.35, ease: "easeInOut" },
                              }
                            : { opacity: 1, scale: 1, transition: SPRING_ENTER }
                        }
                      >
                        <div className={styles.cardHeader}>
                          <span className={styles.cardTitle}>{card.title}</span>
                          <div className={styles.cardHeaderRight}>
                            {isDone && (
                              <svg
                                className={styles.checkIcon}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <motion.path
                                  d="M20 6L9 17L4 12"
                                  initial={
                                    shouldReduceMotion
                                      ? { pathLength: 1 }
                                      : { pathLength: 0 }
                                  }
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                              </svg>
                            )}
                            <div
                              className={styles.dragHandle}
                              title="Drag to move task"
                              aria-hidden="true"
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="5" cy="3" r="1.5" />
                                <circle cx="11" cy="3" r="1.5" />
                                <circle cx="5" cy="8" r="1.5" />
                                <circle cx="11" cy="8" r="1.5" />
                                <circle cx="5" cy="13" r="1.5" />
                                <circle cx="11" cy="13" r="1.5" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className={styles.skeletonLine} />

                        <div className={styles.progressTrack}>
                          <motion.div
                            className={styles.progressBar}
                            style={{
                              background: card.statusColor,
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: card.progress }}
                            transition={SPRING_DRIFT}
                          />
                        </div>

                        <div className={styles.cardFooter}>
                          <div className={styles.avatarStack}>
                            {card.avatars.map((av, idx) => (
                              <div key={idx} className={styles.avatar}>
                                {av}
                              </div>
                            ))}
                          </div>

                          <span
                            className={styles.statusPill}
                            style={{
                              color: card.statusColor,
                              background: `${card.statusColor}18`,
                            }}
                          >
                            {card.statusLabel}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </LayoutGroup>
      </div>
    </div>
  );
}

export default LivingBoard;
