import type { Page } from "@playwright/test";

export async function seedChild(page: Page, name = "Fatima") {
  await page.addInitScript((childName) => {
    const key = "keyboard-adventure-settings-v1";
    const previous = JSON.parse(window.localStorage.getItem(key) || "{}") as Record<
      string,
      unknown
    >;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...previous,
        childName,
        sound: previous.sound ?? false,
      }),
    );
  }, name);
}
