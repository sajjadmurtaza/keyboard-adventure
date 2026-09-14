import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test.use({ viewport: { width: 1440, height: 900 } });

test("desktop lesson keyboard looks like a keyboard", async ({ page }) => {
  await seedChild(page);
  await page.goto("/");
  await page.getByRole("button", { name: "⭐ START! ⭐" }).click();
  await page.getByRole("button", { name: "PLAY ▶" }).click();
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");

  await expect(page.getByTestId("global-mute")).toHaveCount(1);
  await expect(page.getByTestId("parent-settings")).toHaveCount(1);
  await expect(page.getByTestId("repeat-instruction")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Repeat instruction" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Turn sound/ })).toHaveCount(1);
  await expect(page.getByTestId("association")).toContainText(/FISH/i);

  const space = page.getByTestId("key-space");
  const letter = page.getByTestId("key-k");
  const spaceBox = await space.boundingBox();
  const keyBox = await letter.boundingBox();
  expect(spaceBox && keyBox).toBeTruthy();
  expect(spaceBox!.width).toBeGreaterThan(keyBox!.width * 4.5);

  const row1 = await page.getByTestId("keyboard-row-0").locator("[data-key=q]").boundingBox();
  const row2 = await page.getByTestId("keyboard-row-1").locator("[data-key=a]").boundingBox();
  const row3 = await page.getByTestId("keyboard-row-2").locator("[data-key=z]").boundingBox();
  expect(row1 && row2 && row3).toBeTruthy();
  expect(row2!.x).toBeGreaterThan(row1!.x + 8);
  expect(row3!.x).toBeGreaterThan(row2!.x + 8);

  const before = await page.getByTestId("keyboard-row-1").boundingBox();
  await page.locator("[data-key=f]").evaluate((node) => {
    node.setAttribute("data-measured", "1");
  });
  const after = await page.getByTestId("keyboard-row-1").boundingBox();
  expect(Math.abs((before?.width ?? 0) - (after?.width ?? 0))).toBeLessThan(2);

  await expect(page.locator("[data-testid=key-f] .key-bump")).toHaveCount(1);
  await expect(page.locator("[data-testid=key-j] .key-bump")).toHaveCount(1);

  const stage = page.getByTestId("play-stage");
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 8),
  ).toBe(true);
  await expect(stage).toBeVisible();
});

test("finger hint sits under the target key, not under space", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "keyboard-adventure-settings-v1",
      JSON.stringify({
        unlockAll: true,
        sound: false,
        fingerHints: true,
        keyboardHighlight: true,
        childName: "Fatima",
      }),
    );
  });
  await page.goto("/");
  await page.getByRole("button", { name: "⭐ START! ⭐" }).click();
  await page.getByRole("button", { name: "View all lessons" }).click();
  await page.getByRole("button", { name: "Lesson 3: D and K" }).click();
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");
  await expect(page.getByTestId("association")).toContainText(/DOG/i);
  await expect(page.getByTestId("finger-guide")).toHaveAttribute("data-hand", "left");

  const dKey = await page.getByTestId("key-d").boundingBox();
  const dHint = await page.getByTestId("finger-guide").boundingBox();
  expect(dKey && dHint).toBeTruthy();
  expect(Math.abs(dHint!.x + dHint!.width / 2 - (dKey!.x + dKey!.width / 2))).toBeLessThan(40);

  await page.keyboard.press("d");
  await expect(page.getByTestId("association")).toContainText(/KITE/i, { timeout: 8000 });
  await expect(page.getByTestId("finger-guide")).toHaveAttribute("data-hand", "right");

  const kKey = await page.getByTestId("key-k").boundingBox();
  const hint = await page.getByTestId("finger-guide").boundingBox();
  const space = await page.getByTestId("key-space").boundingBox();
  expect(kKey && hint && space).toBeTruthy();
  const hintCenter = hint!.x + hint!.width / 2;
  const kCenter = kKey!.x + kKey!.width / 2;
  const spaceCenter = space!.x + space!.width / 2;
  expect(Math.abs(hintCenter - kCenter)).toBeLessThan(36);
  expect(Math.abs(hintCenter - spaceCenter)).toBeGreaterThan(40);
});
