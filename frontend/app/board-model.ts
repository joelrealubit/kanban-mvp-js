export type Card = {
  id: string;
  title: string;
  details: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  cards: Card[];
};

const initialColumns: BoardColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      {
        id: "card-brand-audit",
        title: "Review brand direction",
        details: "Bring the latest visual references together.",
      },
      {
        id: "card-customer-notes",
        title: "Gather customer notes",
        details: "Pull the most useful feedback into one place.",
      },
    ],
  },
  {
    id: "ready",
    title: "Ready",
    cards: [
      {
        id: "card-content-outline",
        title: "Draft the content outline",
        details: "Give each page a clear purpose and flow.",
      },
      {
        id: "card-photo-shortlist",
        title: "Shortlist photography",
        details: "Find a warm, consistent image direction.",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In progress",
    cards: [
      {
        id: "card-homepage",
        title: "Shape the homepage",
        details: "Explore a cleaner story for the first screen.",
      },
      {
        id: "card-design-system",
        title: "Build the design system",
        details: "Set up the foundations for a consistent UI.",
      },
    ],
  },
  {
    id: "review",
    title: "In review",
    cards: [
      {
        id: "card-navigation",
        title: "Refine navigation",
        details: "Check labels and make the key paths obvious.",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "card-kickoff",
        title: "Project kickoff",
        details: "Aligned on goals, audience, and next steps.",
      },
    ],
  },
];

export function createInitialBoard(): BoardColumn[] {
  return initialColumns.map((column) => ({
    ...column,
    cards: column.cards.map((card) => ({ ...card })),
  }));
}

export function renameColumn(
  columns: BoardColumn[],
  columnId: string,
  title: string,
): BoardColumn[] {
  const nextTitle = title.trim();
  if (!nextTitle) return columns;

  return columns.map((column) =>
    column.id === columnId ? { ...column, title: nextTitle } : column,
  );
}

export function addCard(
  columns: BoardColumn[],
  columnId: string,
  card: Card,
): BoardColumn[] {
  return columns.map((column) =>
    column.id === columnId ? { ...column, cards: [...column.cards, card] } : column,
  );
}

export function deleteCard(
  columns: BoardColumn[],
  cardId: string,
): BoardColumn[] {
  return columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  }));
}

export function moveCard(
  columns: BoardColumn[],
  cardId: string,
  destinationColumnId: string,
  beforeCardId?: string,
): BoardColumn[] {
  const sourceColumn = columns.find((column) =>
    column.cards.some((card) => card.id === cardId),
  );
  const destinationColumn = columns.find(
    (column) => column.id === destinationColumnId,
  );
  if (!sourceColumn || !destinationColumn || beforeCardId === cardId) {
    return columns;
  }

  const card = sourceColumn.cards.find((item) => item.id === cardId);
  const sourceIndex = sourceColumn.cards.findIndex((item) => item.id === cardId);
  const destinationIndex = destinationColumn.cards.findIndex(
    (item) => item.id === beforeCardId,
  );
  if (!card) return columns;

  const next = columns.map((column) => ({
    ...column,
    cards: [...column.cards],
  }));
  const nextSource = next.find((column) => column.id === sourceColumn.id);
  const nextDestination = next.find(
    (column) => column.id === destinationColumnId,
  );
  if (!nextSource || !nextDestination) return columns;

  nextSource.cards = nextSource.cards.filter((item) => item.id !== cardId);
  const beforeIndex = beforeCardId
    ? nextDestination.cards.findIndex((item) => item.id === beforeCardId)
    : -1;
  const moveAfterTarget =
    sourceColumn.id === destinationColumnId &&
    beforeIndex >= 0 &&
    sourceIndex < destinationIndex;
  nextDestination.cards.splice(
    beforeIndex < 0
      ? nextDestination.cards.length
      : beforeIndex + (moveAfterTarget ? 1 : 0),
    0,
    card,
  );
  return next;
}
