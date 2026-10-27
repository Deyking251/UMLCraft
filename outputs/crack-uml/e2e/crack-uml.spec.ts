import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 500) throw new Error(`Unexpected server error: ${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  await expect(page.getByText("Project loaded from the Crack UML backend.")).toBeVisible();
  test.info().attach("console-errors", { body: JSON.stringify(consoleErrors), contentType: "application/json" });
});

test("F01 guided lesson and empty project", async ({ page }) => {
  await page.getByRole("button", { name: "New project" }).click();
  await expect(page.getByRole("heading", { name: "Give your model a starting point" })).toBeVisible();
  await page.getByRole("button", { name: "Start lesson" }).click();
  await expect(page.getByRole("button", { name: "Library" })).toBeVisible();
  await expect(page.getByText("2/2")).toBeVisible();
});

test("F02 class model, edit, relationship, and save", async ({ page }) => {
  await page.getByRole("button", { name: "New project" }).click();
  await page.getByRole("button", { name: "＋ Class" }).click();
  await page.getByRole("button", { name: "＋ Class" }).click();
  await page.getByLabel("Name").fill("Book");
  await page.getByRole("button", { name: "↗ Association" }).click();
  await expect(page.getByText("Association added between two classes.")).toBeVisible();
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.getByText("Project saved to the Crack UML backend.")).toBeVisible();
});

test("F07 validation rejects a broken relationship", async ({ request }) => {
  const response = await request.post("/api/projects/demo/validate", {
    data: {
      project: {
        name: "Validation sample",
        lesson: null,
        elements: [{ id: "a", kind: "class", name: "Account", attributes: [], operations: [], description: "", x: 0, y: 0, width: 120, height: 80 }],
        relationships: [{ id: "broken", kind: "association", sourceId: "a", targetId: "missing", label: "owns" }]
      }
    }
  });
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ findings: [{ code: "BROKEN_RELATIONSHIP", severity: "error" }] });
});

test("F09 SVG export control is available", async ({ page }) => {
  await page.getByRole("button", { name: "Start lesson" }).click();
  await expect(page.getByRole("button", { name: "Export SVG" })).toBeEnabled();
});
