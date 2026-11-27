import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test("wrong key does not advance, correct key does", async ({ page }) => {
  await seedChild(page);
  await page.goto("/");
  await page.getByTestId("lets-play").click();
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");
  await expect(page.getByText("F", { exact: true }).first()).toBeVisible();
  const association = page.getByTestId("association");
  await expect(association).toHaveAttribute("data-assoc-count", "3");
  await expect(association).toContainText(/FISH/i);
  await expect(association).toHaveAttribute("data-assoc-word", /Fish/i);
  // Full tour: Fish → Frog → Flower (slow association pacing)
  await expect(association).toHaveAttribute("data-assoc-word", /Frog/i, {
    timeout: 12000,
  });
  await expect(association).toContainText(/FROG/i);
  await expect(association).toHaveAttribute("data-assoc-word", /Flower/i, {
    timeout: 12000,
  });
  await expect(association).toContainText(/FLOWER/i);
  await page.keyboard.press("g");
  await expect(page.getByTestId("lesson-instruction")).toHaveText(/Try F/i);
  await page.keyboard.press("f");
  await expect(page.getByTestId("success-teach")).toHaveText(/You found F/i);
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "success");
  await page.keyboard.press("j");
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "success");
  await expect(page.getByTestId("target-letter")).toContainText("F");
});
