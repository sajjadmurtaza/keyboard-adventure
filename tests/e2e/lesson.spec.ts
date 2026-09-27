import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test("wrong key does not advance, correct key does", async ({ page }) => {
  await seedChild(page);
  await page.goto("/");
  await page.getByRole("button", { name: "⭐ START! ⭐" }).click();
  await page.getByRole("button", { name: "PLAY ▶" }).click();
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "ready");
  await expect(page.getByText("F", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("association")).toContainText(/FISH/i);
  await page.keyboard.press("g");
  await expect(page.getByTestId("lesson-instruction")).toHaveText("Try F again!");
  await page.keyboard.press("f");
  await expect(page.getByTestId("association")).toContainText(/FISH/i);
  await expect(page.getByTestId("success-teach")).toHaveText(/You found F/i);
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "success");
  await page.keyboard.press("j");
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "success");
  await expect(page.getByTestId("target-letter")).toContainText("F");
});
