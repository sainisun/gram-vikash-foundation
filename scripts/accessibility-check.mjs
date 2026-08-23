import { chromium } from "playwright-core";

const baseUrl = process.env.ACCESSIBILITY_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const results = [];

for (const path of ["/ledger", "/my-donations", "/admin"]) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  const focusOrder = [];
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("Tab");
    focusOrder.push(await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return "none";
      const style = getComputedStyle(element);
      return `${element.tagName.toLowerCase()}:${element.textContent?.trim().slice(0, 32) ?? ""}:outline=${style.outlineStyle}`;
    }));
  }
  const evidence = await page.evaluate(() => ({
    url: location.pathname,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    labels: document.querySelectorAll("label").length,
    liveRegions: document.querySelectorAll("[aria-live], [role=status]").length,
  }));
  results.push({ requestedPath: path, ...evidence, focusOrder });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
