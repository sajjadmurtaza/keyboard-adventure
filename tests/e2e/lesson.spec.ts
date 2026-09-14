import { test, expect } from "@playwright/test";

test("wrong key does not advance, correct key does", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "⭐ START! ⭐" }).click();
  await page.getByRole("button", { name: "PLAY ▶" }).click();
  await expect(page.getByText("F", { exact: true }).first()).toBeVisible();
  await expect(page.getByTestId("association")).toContainText(/FISH/i);
  await page.keyboard.press("g");
  await expect(page.getByText("Try F again!", { exact: true })).toBeVisible();
  await page.keyboard.press("f");
  await expect(page.getByTestId("association")).toContainText(/FISH/i);
  await expect(page.getByText(/FANTASTIC/i).first()).toBeVisible();
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "success");
  await page.keyboard.press("j");
  await expect(page.getByTestId("play-stage")).toHaveAttribute("data-lesson-phase", "success");
  await expect(page.getByTestId("target-letter")).toContainText("F");
});
