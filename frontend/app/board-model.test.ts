import { describe, expect, it } from "vitest";
import {
  addCard,
  createInitialBoard,
  deleteCard,
  moveCard,
  renameColumn,
} from "./board-model";

describe("board model", () => {
  it("creates independent copies of the seeded board", () => {
    const first = createInitialBoard();
    const second = createInitialBoard();

    first[0].cards.pop();

    expect(second[0].cards).toHaveLength(2);
    expect(second).toHaveLength(5);
  });

  it("renames a column and ignores an empty name", () => {
    const board = createInitialBoard();
    const renamed = renameColumn(board, "backlog", "  Ideas  ");
    const unchanged = renameColumn(renamed, "backlog", "   ");

    expect(renamed[0].title).toBe("Ideas");
    expect(unchanged).toBe(renamed);
    expect(board[0].title).toBe("Backlog");
  });

  it("adds a card to the requested column without changing the source", () => {
    const board = createInitialBoard();
    const card = { id: "card-new", title: "Plan the launch", details: "Set a date." };
    const updated = addCard(board, "ready", card);

    expect(updated[1].cards.at(-1)).toEqual(card);
    expect(board[1].cards).toHaveLength(2);
    expect(updated[0].cards).toHaveLength(2);
  });

  it("deletes a card from the board", () => {
    const board = createInitialBoard();
    const updated = deleteCard(board, "card-customer-notes");

    expect(updated.flatMap((column) => column.cards)).toHaveLength(7);
    expect(updated[0].cards.some((card) => card.id === "card-customer-notes")).toBe(
      false,
    );
    expect(board[0].cards).toHaveLength(2);
  });

  it("moves a card to another column and inserts it before the target card", () => {
    const board = createInitialBoard();
    const updated = moveCard(
      board,
      "card-brand-audit",
      "done",
      "card-kickoff",
    );

    expect(updated[0].cards.map((card) => card.id)).toEqual([
      "card-customer-notes",
    ]);
    expect(updated[4].cards.map((card) => card.id)).toEqual([
      "card-brand-audit",
      "card-kickoff",
    ]);
    expect(board[0].cards).toHaveLength(2);
  });

  it("reorders cards within a column", () => {
    const board = createInitialBoard();
    const updated = moveCard(
      board,
      "card-customer-notes",
      "backlog",
      "card-brand-audit",
    );

    expect(updated[0].cards.map((card) => card.id)).toEqual([
      "card-customer-notes",
      "card-brand-audit",
    ]);
  });

  it("moves a card down within a column when dropped on a later card", () => {
    const board = createInitialBoard();
    const updated = moveCard(
      board,
      "card-brand-audit",
      "backlog",
      "card-customer-notes",
    );

    expect(updated[0].cards.map((card) => card.id)).toEqual([
      "card-customer-notes",
      "card-brand-audit",
    ]);
  });
});
