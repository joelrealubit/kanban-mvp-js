"use client";

import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Grip,
  LayoutGrid,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import {
  addCard,
  createInitialBoard,
  deleteCard,
  moveCard,
  renameColumn,
  type BoardColumn,
  type Card,
} from "./board-model";

export function Board() {
  const [columns, setColumns] = useState(createInitialBoard);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const cardCount = columns.reduce(
    (total, column) => total + column.cards.length,
    0,
  );
  const activeCard = columns
    .flatMap((column) => column.cards)
    .find((card) => card.id === activeCardId);

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    if (!event.over) return;

    const overType = event.over.data.current?.type;
    const overColumnId =
      overType === "column"
        ? String(event.over.id)
        : String(event.over.data.current?.columnId ?? "");
    if (!overColumnId) return;

    setColumns((current) =>
      moveCard(
        current,
        String(event.active.id),
        overColumnId,
        overType === "card" ? String(event.over?.id) : undefined,
      ),
    );
  }

  function handleDragCancel() {
    setActiveCardId(null);
  }

  function handleRename(columnId: string, title: string) {
    setColumns((current) => renameColumn(current, columnId, title));
  }

  function handleAdd(columnId: string, title: string, details: string) {
    setColumns((current) =>
      addCard(current, columnId, {
        id: crypto.randomUUID(),
        title: title.trim(),
        details: details.trim(),
      }),
    );
  }

  function handleDelete(cardId: string) {
    setColumns((current) => deleteCard(current, cardId));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Kanban project board home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">Kanban</span>
        </Link>
        <div className="topbar-divider" />
        <div className="workspace-label">
          <LayoutGrid size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Project board</span>
        </div>
        <div className="topbar-spacer" />
        <span className="local-indicator">
          <span className="local-indicator__dot" />
          In this session
        </span>
      </header>

      <main className="board-main">
        <section className="board-intro" aria-labelledby="board-title">
          <div className="board-intro__copy">
            <div className="eyebrow">
              <span className="eyebrow__line" />
              YOUR WORKSPACE
            </div>
            <h1 id="board-title">Kanban Studio</h1>
            <p>A little progress adds up to a lot.</p>
          </div>
          <div className="board-summary">
            <div className="summary-icon">
              <LayoutGrid size={18} strokeWidth={1.8} />
            </div>
            <div>
              <span className="summary-number">{cardCount}</span>
              <span className="summary-label">
                {cardCount === 1 ? "task" : "tasks"} across 5 stages
              </span>
            </div>
            <span className="summary-divider" />
            <span className="summary-note">All in one place</span>
          </div>
        </section>

        <section className="board-area" aria-label="Project board">
          <div className="board-toolbar">
            <div className="board-toolbar__label">
              <span className="board-toolbar__dot" />
              BOARD
            </div>
            <span className="drag-hint">
              <Grip size={15} strokeWidth={1.8} />
              Drag cards to move work along
            </span>
          </div>

          <DndContext
            id="morrow-board-dnd"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="board-scroll">
              <div className="board-grid">
                {columns.map((column, index) => (
                  <BoardColumnView
                    key={column.id}
                    column={column}
                    index={index}
                    onRename={handleRename}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
            <DragOverlay dropAnimation={null}>
              {activeCard ? <TaskCard card={activeCard} overlay /> : null}
            </DragOverlay>
          </DndContext>

          <footer className="board-footer">
            <span>
              <span className="footer-spark" aria-hidden="true" />
              Keep the momentum going
            </span>
            <span>Changes are kept for this session</span>
          </footer>
        </section>
      </main>
      <div className="page-wash" aria-hidden="true" />
    </div>
  );
}

type BoardColumnViewProps = {
  column: BoardColumn;
  index: number;
  onRename: (columnId: string, title: string) => void;
  onAdd: (columnId: string, title: string, details: string) => void;
  onDelete: (cardId: string) => void;
};

function BoardColumnView({
  column,
  index,
  onRename,
  onAdd,
  onDelete,
}: BoardColumnViewProps) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });
  const accent = `column-accent-${index + 1}`;

  function saveName() {
    onRename(column.id, draftTitle);
    setDraftTitle(column.title);
    setEditing(false);
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveName();
    }
    if (event.key === "Escape") {
      setDraftTitle(column.title);
      setEditing(false);
    }
  }

  function submitCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();
    if (!title) return;
    onAdd(column.id, title, details);
    setAdding(false);
  }

  return (
    <section
      ref={setNodeRef}
      className={`board-column ${accent} ${isOver ? "board-column--over" : ""}`}
      data-column-id={column.id}
      aria-label={`${column.title} column`}
    >
      <div className="column-heading">
        <span className="column-accent" />
        {editing ? (
          <input
            className="column-title-input"
            aria-label="Column name"
            value={draftTitle}
            autoFocus
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={saveName}
            onKeyDown={handleRenameKeyDown}
          />
        ) : (
          <button
            className="column-title-button"
            type="button"
            aria-label={`Rename ${column.title}`}
            onClick={() => {
              setDraftTitle(column.title);
              setEditing(true);
            }}
          >
            <span className="column-title">{column.title}</span>
            <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
        <span className="column-count" aria-label={`${column.cards.length} cards`}>
          {String(column.cards.length).padStart(2, "0")}
        </span>
      </div>

      <div className="column-card-list">
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <SortableTaskCard
              key={card.id}
              card={card}
              columnId={column.id}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {column.cards.length === 0 && !adding && (
          <div className="column-empty">Drop a card here</div>
        )}
        {adding && (
          <form
            className="add-card-form"
            aria-label={`New card for ${column.title}`}
            onSubmit={submitCard}
          >
            <label className="sr-only" htmlFor={`title-${column.id}`}>
              Card title
            </label>
            <input
              id={`title-${column.id}`}
              name="title"
              placeholder="What needs to be done?"
              autoFocus
              required
            />
            <label className="sr-only" htmlFor={`details-${column.id}`}>
              Card details
            </label>
            <textarea
              id={`details-${column.id}`}
              name="details"
              placeholder="Add a few details..."
              rows={2}
            />
            <div className="add-card-form__actions">
              <button className="save-card-button" type="submit">
                <Check size={14} />
                Add card
              </button>
              <button
                className="cancel-card-button"
                type="button"
                aria-label="Cancel adding card"
                onClick={() => setAdding(false)}
              >
                <X size={15} />
              </button>
            </div>
          </form>
        )}
      </div>

      {!adding && (
        <button
          className="add-card-button"
          type="button"
          aria-label={`Add a card to ${column.title}`}
          onClick={() => setAdding(true)}
        >
          <Plus size={16} strokeWidth={1.8} />
          <span>Add a card</span>
        </button>
      )}
    </section>
  );
}

type SortableTaskCardProps = {
  card: Card;
  columnId: string;
  onDelete: (cardId: string) => void;
};

function SortableTaskCard({
  card,
  columnId,
  onDelete,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", columnId },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "card-ghost" : ""}>
      <TaskCard
        card={card}
        attributes={attributes}
        listeners={listeners}
        setActivatorNodeRef={setActivatorNodeRef}
        onDelete={() => onDelete(card.id)}
      />
    </div>
  );
}

type TaskCardProps = {
  card: Card;
  overlay?: boolean;
  attributes?: ReturnType<typeof useSortable>["attributes"];
  listeners?: ReturnType<typeof useSortable>["listeners"];
  setActivatorNodeRef?: (node: HTMLElement | null) => void;
  onDelete?: () => void;
};

function TaskCard({
  card,
  overlay = false,
  attributes,
  listeners,
  setActivatorNodeRef,
  onDelete,
}: TaskCardProps) {
  return (
    <article
      className={`task-card ${overlay ? "task-card--overlay" : ""}`}
      data-card-id={card.id}
    >
      <div className="task-card__topline">
        {attributes && listeners ? (
          <button
            ref={setActivatorNodeRef}
            className="task-card__handle"
            type="button"
            aria-label={`Move ${card.title}`}
            {...attributes}
            {...listeners}
          >
            <Grip size={15} strokeWidth={1.8} />
          </button>
        ) : (
          <span className="task-card__handle" aria-hidden="true">
            <Grip size={15} strokeWidth={1.8} />
          </span>
        )}
        {!overlay && onDelete && (
          <button
            className="delete-card-button"
            type="button"
            aria-label={`Delete ${card.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>
      <h3 className="task-card__title">{card.title}</h3>
      {card.details && <p className="task-card__details">{card.details}</p>}
      <span className="task-card__bottom-accent" />
    </article>
  );
}
