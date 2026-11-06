import { expect, test } from "@playwright/test";
import { remembered } from "./preferences-helper.ts";

for (const side of ["left", "right"] as const) {
  test(`QUA-020 APP-002: dernier côté ${side} repris, puis changé en marche et mémorisé`, async ({ page }) => {
    await remembered(page, { side });
    await page.goto("/");
    await expect(page.getByLabel("À droite")).toHaveCount(0);
    await page.getByRole("button", { name: "Version PC" }).click();
    await expect(page.locator("#app")).toHaveAttribute("data-panel-side", side);
    await page.getByText("Préférences de marche", { exact: true }).click();
    const button = page.getByRole("button", { name: /^Côté du panneau/ });
    await button.click();
    const changed = side === "left" ? "right" : "left";
    await expect(page.locator("#app")).toHaveAttribute("data-panel-side", changed);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("drwil_walk.preferences-v1") ?? "{}") as unknown)).toMatchObject({ side: changed });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Version PC" }).click();
    await expect(page.locator("#app")).toHaveAttribute("data-panel-side", changed);
  });
}

test("QUA-020 APP-002: sans choix, panneau à droite ; les anciens côtés sont ignorés", async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("drwil_walk.cote-panneau", "left"); });
  await page.goto("/");
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.locator("#app")).toHaveAttribute("data-panel-side", "right");
});
