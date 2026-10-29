import { expect, test } from "@playwright/test";

test("starts with one board and five seeded columns", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  await expect(page.locator("[data-column-id]")).toHaveCount(5);
  await expect(page.locator("[data-card-id]")).toHaveCount(8);
});

test("renames a column", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Rename Backlog" }).click();
  const nameInput = page.getByRole("textbox", { name: "Column name" });
  await nameInput.fill("Ideas");
  await nameInput.press("Enter");

  await expect(page.locator('[data-column-id="backlog"]')).toHaveAttribute(
    "aria-label",
    "Ideas column",
  );
});

test("adds and deletes cards", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Add a card to Ready" }).click();
  await page.getByRole("textbox", { name: "Card title" }).fill("Plan the launch");
  await page.getByRole("textbox", { name: "Card details" }).fill("Set a date.");
  await page.getByRole("button", { name: "Add card" }).click();
  await expect(page.getByText("Plan the launch")).toBeVisible();
  await expect(page.getByText("Set a date.")).toBeVisible();

  await page
    .getByRole("button", { name: "Delete Plan the launch", exact: true })
    .click();
  await expect(page.getByText("Plan the launch")).toHaveCount(0);
});

test("moves a card between columns with drag and drop", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Move Review brand direction" }).dragTo(
    page.locator('[data-card-id="card-kickoff"]'),
    { steps: 12 },
  );

  await expect(
    page.locator('[data-column-id="done"] [data-card-id="card-brand-audit"]'),
  ).toHaveCount(1);
});

test("keeps the board usable on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  const dimensions = await page.locator(".board-scroll").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
});
