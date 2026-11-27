import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test.describe("Magic Dress-Up", () => {
  test("opens gallery without starting camera when parent toggle is off", async ({
    page,
  }) => {
    await seedChild(page);
    await page.goto("/");
    await page.getByTestId("open-dress-up").click();
    await expect(page.getByRole("heading", { name: "Magic Mirror" })).toBeVisible();
    await expect(page.getByTestId("dress-up-astronaut")).toBeVisible();
    await expect(page.getByTestId("dress-up-parent-hint")).toBeVisible();
    // Local illustrated assets (not emoji-only cards)
    await expect(
      page.getByTestId("dress-up-astronaut").locator('img[src*="/dress-up/astronaut.svg"]'),
    ).toBeVisible();

    await page.getByTestId("start-magic-mirror").click();
    await expect(page.getByTestId("dress-up-error")).toContainText(/grown-up|Parent settings/i);
  });

  test("parent can allow camera setting without auto-start", async ({ page }) => {
    await seedChild(page);
    await page.addInitScript(() => {
      const key = "keyboard-adventure-settings-v1";
      const previous = JSON.parse(window.localStorage.getItem(key) || "{}") as Record<
        string,
        unknown
      >;
      window.localStorage.setItem(
        key,
        JSON.stringify({ ...previous, childName: "Fatima", cameraDressUp: true, sound: false }),
      );
    });
    await page.goto("/");
    await page.getByTestId("open-dress-up").click();
    await expect(page.getByTestId("dress-up-parent-hint")).toHaveCount(0);
    await expect(page.getByTestId("start-magic-mirror")).toBeVisible();
    // Mirror canvas stays hidden until Start
    await expect(page.getByTestId("dress-up-mirror")).toBeHidden();
  });
});
