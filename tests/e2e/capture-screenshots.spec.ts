import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const shot = (name: string) => path.join("docs", "screenshots", name);

test.describe("README screenshots", () => {
  test.skip(!process.env.CAPTURE_SCREENSHOTS, "Set CAPTURE_SCREENSHOTS=1 to refresh docs/screenshots");

  test("capture current product surfaces", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "README shots are desktop");
    await hideDevBadge(page);
    await page.goto("/");
    await expect(page.getByText("Who is learning today?")).toBeVisible();
    await page.getByTestId("child-name-input").fill("Fatima");
    await expect(page.getByRole("button", { name: "LET'S GO!" })).toBeEnabled();
    await snap(page, "name-setup.png");

    await seedChild(page);
    await page.goto("/");
    await expect(page.getByTestId("lets-play")).toBeVisible();
    await expect(page.getByText("Ready, Fatima?")).toBeVisible();
    await expect(page.getByTestId("open-dress-up")).toBeVisible();
    await expect(page.getByTestId("open-wardrobe")).toBeVisible();
    await snap(page, "home.png");

    await page.getByTestId("open-dress-up").click();
    await expect(page.getByRole("heading", { name: "Magic Mirror" })).toBeVisible();
    await expect(page.getByTestId("dress-up-astronaut")).toBeVisible();
    await snap(page, "dress-up.png");

    await page.getByTestId("open-wardrobe").click();
    await expect(page.getByText(/treasures/i)).toBeVisible();
    await snap(page, "treasure-hats.png");

    await page.goto("/");
    await page.getByTestId("more-adventures").click();
    await expect(page.getByRole("button", { name: "PLAY ▶" })).toBeVisible();
    await snap(page, "map.png");

    await page.getByRole("button", { name: "PLAY ▶" }).click();
    await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");
    await expect(page.getByTestId("association")).toContainText(/FISH/i);
    await expect(page.getByTestId("visual-keyboard")).toBeVisible();
    await snap(page, "lesson-f.png");
    await page.evaluate(() => {
      document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    });
    await page.getByTestId("visual-keyboard").screenshot({
      path: shot("lesson-keyboard.png"),
      animations: "disabled",
    });

    await page.getByTestId("parent-settings").click();
    await expect(page.getByRole("heading", { name: "Parent settings" })).toBeVisible();
    await expect(page.getByTestId("keyboard-layout")).toBeVisible();
    await page.getByTestId("keyboard-layout").selectOption("auto");
    await snap(page, "parent-settings.png");

    await page.getByRole("heading", { name: "Voice" }).scrollIntoViewIfNeeded();
    await snap(page, "parent-voice.png");
  });
});

async function snap(page: Page, name: string) {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
  });
  await page.screenshot({ path: shot(name), animations: "disabled" });
}

async function hideDevBadge(page: Page) {
  await page.addInitScript(() => {
    const hide = () => {
      document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    };
    hide();
    new MutationObserver(hide).observe(document.documentElement, { childList: true, subtree: true });
  });
}

async function seedChild(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "keyboard-adventure-settings-v1",
      JSON.stringify({
        childName: "Fatima",
        sound: true,
        keyboardLayout: "en-us",
        fingerHints: true,
        keyboardHighlight: true,
      }),
    );
  });
}
