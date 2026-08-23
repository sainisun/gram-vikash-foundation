import { chromium } from "playwright-core";
import { COOKIE_NAME } from "../shared/const";
import { ENV } from "../server/_core/env";
import { sdk } from "../server/_core/sdk";

const baseUrl = process.env.ACCESSIBILITY_BASE_URL ?? "http://localhost:3000";
const token = await sdk.createSessionToken(ENV.ownerOpenId, { name: ENV.ownerName, expiresInMs: 60_000 });
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const output = [];

for (const path of ["/my-donations", "/admin"]) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  await context.addCookies([{ name: COOKIE_NAME, value: token, url: baseUrl, httpOnly: true, sameSite: "Lax", secure: false }]);
  await context.setExtraHTTPHeaders({ Cookie: `${COOKIE_NAME}=${token}` });
  const hasSessionCookie = (await context.cookies(baseUrl)).some(cookie => cookie.name === COOKIE_NAME);
  const page = await context.newPage();
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  const focusOrder = [];
  for (let index = 0; index < 4; index += 1) { await page.keyboard.press("Tab"); focusOrder.push(await page.evaluate(() => { const element = document.activeElement; if (!(element instanceof HTMLElement)) return "none"; return `${element.tagName.toLowerCase()}:${element.textContent?.trim().slice(0, 32) ?? ""}:outline=${getComputedStyle(element).outlineStyle}`; })); }
  const standard = await page.evaluate(() => ({ url: location.pathname, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, labels: document.querySelectorAll("label").length, liveRegions: document.querySelectorAll("[aria-live], [role=status]").length }));
  const zoom = await page.evaluate(() => { document.documentElement.style.zoom = "2"; const result = { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }; document.documentElement.style.zoom = ""; return result; });
  output.push({ requestedPath: path, hasSessionCookie, ...standard, zoom200: zoom, focusOrder });
  await context.close();
}

await browser.close();
console.log(JSON.stringify(output, null, 2));
