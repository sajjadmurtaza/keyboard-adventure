import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test("asks for a name until one is saved on this device", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Who is learning today?")).toBeVisible();
  await expect(page.getByRole("button", { name: "LET'S GO!" })).toBeDisabled();
  await page.getByTestId("child-name-input").fill("   ");
  await expect(page.getByRole("button", { name: "LET'S GO!" })).toBeDisabled();
  await page.getByTestId("child-name-input").fill("Fatima");
  await page.getByRole("button", { name: "LET'S GO!" }).click();
  await expect(page.getByRole("button", { name: "⭐ START! ⭐" })).toBeVisible();
  await expect(page.getByText("Ready, Fatima?")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "⭐ START! ⭐" })).toBeVisible();
  await expect(page.getByText("Who is learning today?")).toHaveCount(0);
});

test("keeps a saved name after refresh", async ({ page }) => {
  await seedChild(page, "Fatima");
  await page.goto("/");
  await expect(page.getByText("Who is learning today?")).toHaveCount(0);
  await expect(page.getByText("Ready, Fatima?")).toBeVisible();
});
