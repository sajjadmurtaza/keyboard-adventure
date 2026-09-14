import { expect, test } from "@playwright/test";
import { seedChild } from "./helpers";

test("home is indexable and playable", async ({ page }) => {
  await seedChild(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/Keyboard Adventure/);
  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute("content", /typing adventure for children/i);
  await expect(page.getByRole("button", { name: "⭐ START! ⭐" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open parent settings" })).toBeVisible();
});

test("robots and sitemap exist", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
});
