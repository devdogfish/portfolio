import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { analyticsBatchSchema, type AnalyticsEvent } from "../lib/analytics-contract";
import { entryLinks } from "../lib/profiles";

const softwareCode = Object.entries(entryLinks).find(([, entry]) => entry.profileId === "software")![0];

function makeEvent() {
  return {
    eventId: randomUUID(),
    visitorId: randomUUID(),
    sessionId: randomUUID(),
    pageViewId: randomUUID(),
    seq: 1,
    occurredAt: new Date().toISOString(),
    cohort: "software",
    path: "/",
    type: "page_view",
    properties: { source: "resume-software", entryCode: softwareCode, device: "desktop" },
  };
}

async function intercept(page: Page, statuses: number[] = []) {
  const batches: AnalyticsEvent[][] = [];
  await page.route("**/api/events", async (route) => {
    const { events } = analyticsBatchSchema.parse(route.request().postDataJSON());
    batches.push(events);
    await route.fulfill({ status: statuses.shift() ?? 204 });
  });
  return batches;
}

test("rejects malformed event shapes, raw URLs, and oversized batches", () => {
  const valid = makeEvent();
  const accepts = (events: unknown[]) => analyticsBatchSchema.safeParse({ events }).success;
  expect(accepts([valid])).toBe(true);
  expect(accepts([{ ...valid, email: "person@example.com" }])).toBe(false);
  expect(accepts([{ ...valid, path: "/?email=person@example.com" }])).toBe(false);
  expect(accepts([{ ...valid, properties: { ...valid.properties, referrer: "https://example.com/private" } }])).toBe(false);
  expect(accepts([{ ...valid, properties: { ...valid.properties, source: "x".repeat(81) } }])).toBe(false);
  expect(accepts([{ ...valid, seq: 0 }])).toBe(false);
  expect(accepts(Array.from({ length: 21 }, makeEvent))).toBe(false);
});

test("collector enforces origin and payload limits", async ({ request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const data = { events: [makeEvent()] };
  const sameOrigin = { Origin: origin, "Content-Type": "application/json", "User-Agent": "Portfolio analytics test" };
  expect((await request.post("/api/events", { data })).status()).toBe(403);
  expect((await request.post("/api/events", { headers: { ...sameOrigin, Origin: "https://example.com" }, data })).status()).toBe(403);
  expect((await request.post("/api/events", { headers: sameOrigin, data: "{" })).status()).toBe(400);
  expect((await request.post("/api/events", { headers: sameOrigin, data: JSON.stringify({ oversized: "x".repeat(33_000) }) })).status()).toBe(413);
  expect((await request.post("/api/events", { headers: { ...sameOrigin, DNT: "1" }, data })).status()).toBe(204);
  expect((await request.post("/api/events", { headers: sameOrigin, data: { events: [{ ...makeEvent(), path: "/private-person-name" }] } })).status()).toBe(400);
  expect((await request.post("/api/events", { headers: sameOrigin, data: { events: [{ ...makeEvent(), cohort: "unknown" }] } })).status()).toBe(400);
  expect((await request.post("/api/events", { headers: sameOrigin, data: { events: [{ ...makeEvent(), properties: { source: "made-up-campaign", entryCode: softwareCode, device: "desktop" } }] } })).status()).toBe(400);
});

for (const [signal, value] of [["doNotTrack", "1"], ["globalPrivacyControl", true]] as const) {
  test(`honors ${signal} before storage or delivery`, async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(({ signal, value }) => {
      Object.defineProperty(Navigator.prototype, signal, { get: () => value, configurable: true });
    }, { signal, value });
    const batches = await intercept(page);
    await page.goto("/");
    await page.clock.runFor(16_000);
    expect(await page.evaluate(() => [
      localStorage.getItem("portfolio-visitor-v1"),
      sessionStorage.getItem("portfolio-session-v1"),
    ])).toEqual([null, null]);
    expect(batches).toEqual([]);
  });
}

test("entry cleanup keeps one view and retries a failed batch with stable event IDs", async ({ page }) => {
  await page.clock.install();
  const batches = await intercept(page, [503, 204]);
  await page.goto(`/r/${softwareCode}`);
  await expect(page).toHaveURL(/\/$/);
  await page.clock.runFor(16_000);
  await expect.poll(() => batches.length).toBe(1);
  await page.clock.runFor(16_000);
  await expect.poll(() => batches.length).toBe(2);
  const uniqueViews = new Map(batches.flat().filter(({ type }) => type === "page_view").map(event => [event.eventId, event]));
  expect(uniqueViews.size).toBe(1);
  expect(batches[1].map(({ eventId }) => eventId)).toEqual(expect.arrayContaining(batches[0].map(({ eventId }) => eventId)));
  expect([...uniqueViews.values()][0]).toMatchObject({
    path: "/", cohort: "software", properties: { entryCode: softwareCode, source: "resume-software" },
  });
});

test("records scroll and CTA intent while engagement excludes hidden time", async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    Object.defineProperty(document, "visibilityState", {
      get: () => document.documentElement.dataset.testVisibility ?? "visible",
      configurable: true,
    });
  });
  const batches = await intercept(page);
  await page.goto("/");
  await page.clock.runFor(16_000);
  await expect.poll(() => batches.length).toBeGreaterThan(0);
  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  });
  await page.clock.runFor(5_000);
  await page.evaluate(() => {
    document.documentElement.dataset.testVisibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => batches.flat().some(event => event.type === "scroll")).toBe(true);
  const beaconScroll = batches.flat().find(event => event.type === "scroll");
  await page.clock.runFor(31_000);
  await page.evaluate(() => {
    document.documentElement.dataset.testVisibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(16_000);
  await page.locator("[data-track=project_open]").first().click();
  await expect.poll(() => batches.flat().some(event => event.type === "cta_click")).toBe(true);
  await expect.poll(() => batches.flat().filter(event => event.eventId === beaconScroll?.eventId).length).toBeGreaterThan(1);
  await expect(page).toHaveURL(/\/project\//);
  await page.clock.runFor(16_000);
  await expect.poll(() => batches.flat().some(event => event.type === "page_view" && event.path.startsWith("/project/"))).toBe(true);
  const events = [...new Map(batches.flat().map(event => [event.eventId, event])).values()];
  const homeEngagement = events.filter(event => event.type === "engagement").filter(event => event.path === "/");
  expect(Math.max(...homeEngagement.map(event => event.properties.activeMs))).toBeGreaterThan(4_000);
  expect(Math.max(...homeEngagement.map(event => event.properties.visibleMs))).toBeLessThan(43_000);
  expect(events.filter(event => event.type === "scroll").map(event => event.properties.threshold)).toEqual([25, 50, 75, 90]);
});
