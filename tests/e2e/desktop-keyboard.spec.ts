import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test.use({ viewport: { width: 1440, height: 900 } });

test("desktop lesson keyboard looks like a keyboard", async ({ page }) => {
  await seedChild(page);
  await page.goto("/");
  await page.getByTestId("lets-play").click();
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

test("keyboard and letter stay put on success and miss", async ({ page }) => {
  await seedChild(page);
  await page.goto("/");
  await page.getByTestId("lets-play").click();
    await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");

  const letter = page.getByTestId("target-letter");
  const board = page.getByTestId("visual-keyboard");
  const idleLetter = await letter.boundingBox();
  const idleBoard = await board.boundingBox();
  expect(idleLetter && idleBoard).toBeTruthy();

  const header = page.locator("header");
  const headerBox = await header.boundingBox();
  const stageBox = await page.getByTestId("play-stage").boundingBox();
  expect(headerBox && stageBox).toBeTruthy();
  expect(stageBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 2);

  const idleGap = await page.evaluate(() => {
    const shell = document.querySelector(".keyboard-shell");
    if (!shell) return 0;
    return window.innerHeight - shell.getBoundingClientRect().bottom;
  });
  // Single-screen shell keeps a small safe inset; do not require large dead space.
  expect(idleGap).toBeGreaterThanOrEqual(4);

  const wanted = (await letter.innerText()).replace(/\s+/g, "").slice(0, 1).toLowerCase() || "f";
  const wrongKey = wanted === "a" ? "b" : "a";
  await page.keyboard.press(wrongKey);
  await expect(page.getByTestId("lesson-instruction")).toBeVisible();
  const missLetter = await letter.boundingBox();
  const missBoard = await board.boundingBox();
  expect(Math.abs((missLetter?.y ?? 0) - idleLetter!.y)).toBeLessThan(3);
  expect(Math.abs((missBoard?.y ?? 0) - idleBoard!.y)).toBeLessThan(3);
  expect(Math.abs((missBoard?.height ?? 0) - idleBoard!.height)).toBeLessThan(3);

  await page.keyboard.press(wanted === " " ? "Space" : wanted);
  await expect(page.getByTestId("success-teach")).toBeVisible();
  await expect(page.getByTestId("lesson-instruction")).toHaveCount(0);
  const winLetter = await letter.boundingBox();
  const winBoard = await board.boundingBox();
  expect(Math.abs((winLetter?.y ?? 0) - idleLetter!.y)).toBeLessThan(3);
  expect(Math.abs((winBoard?.y ?? 0) - idleBoard!.y)).toBeLessThan(3);
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
  await page.getByTestId("more-adventures").click();
  await page.getByRole("button", { name: "View all lessons" }).click();
  await page.getByRole("button", { name: /D and K/ }).click();
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");
  await expect(page.getByTestId("association")).toContainText(/DOG/i);
  await expect(page.getByTestId("finger-guide")).toHaveAttribute("data-hand", "left");

  await expect(page.getByTestId("finger-guide")).toHaveAttribute("data-hand", "left");
  const hint = await page.getByTestId("finger-guide").boundingBox();
  const shell = await page.locator(".keyboard-shell").boundingBox();
  expect(hint && shell).toBeTruthy();
  // Finger guide is centered under the keyboard board for readability.
  expect(Math.abs(hint!.x + hint!.width / 2 - (shell!.x + shell!.width / 2))).toBeLessThan(80);

  await page.keyboard.press("d");
  await expect(page.getByTestId("association")).toContainText(/KITE/i, { timeout: 12000 });
  await expect(page.getByTestId("finger-guide")).toHaveAttribute("data-hand", "right");
});
