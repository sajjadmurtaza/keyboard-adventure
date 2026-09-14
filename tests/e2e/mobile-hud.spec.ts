import { expect, test, type Locator } from "@playwright/test";

function overlap(a: { x: number; y: number; width: number; height: number }, b: typeof a) {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).toBeTruthy();
  return value!;
}

test.use({ viewport: { width: 390, height: 430 } });

test("keyboard-open HUD does not overlap core lesson pieces", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "⭐ START! ⭐" }).click();
  await page.getByRole("button", { name: "PLAY ▶" }).click();
  await expect(page.locator("[data-testid=play-stage]")).toBeVisible();
  await expect(page.locator("[data-testid=play-stage]")).toHaveClass(/mobile-keyboard-open/);
  await expect(page.getByRole("button", { name: /START TYPING/i })).toHaveCount(0);

  const association = page.locator("[data-testid=association]");
  const target = page.locator("[data-testid=target-letter]");
  const instruction = page.locator("[data-testid=lesson-instruction]");

  await expect(association).toBeVisible();
  await expect(instruction).toHaveText(/Type F/i);
  await expect(page.locator("[data-testid=mini-key]")).toHaveCount(0);

  const a = await box(association);
  const t = await box(target);
  const i = await box(instruction);

  expect(overlap(t, a)).toBe(false);
  expect(overlap(t, i)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 8)).toBe(true);
});
