import { expect, test } from "@playwright/test";
import { entryLinks, selectionCookie } from "../lib/profiles";

test("résumé links redirect to the exact registered destination", async ({ request, baseURL }) => {
  const routes = [
    ["/go/software/project/rbc-analytics/demo", "https://rbc-analytics.demo.girke.dev/"],
    ["/go/web-cms/project/sitings/live-site", "https://sitings.ca/property/?available=true"],
    ["/go/software/project/etpzp-sms/repository", "https://github.com/devdogfish/etpzp-sms"],
    ["/go/admin-excel/profile/linkedin/external", "https://www.linkedin.com/in/luigigirke"],
    ["/go/software/profile/portfolio/external", new URL('/', baseURL).href],
    ["/go/web-cms/profile/github/external", "https://github.com/devdogfish"],
  ];
  for (const [path, target] of routes) {
    const response = await request.head(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(302);
    expect(response.headers().location).toBe(target);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["referrer-policy"]).toBe("no-referrer");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    expect(response.headers()["set-cookie"]).toBeUndefined();
  }
});

test("an opted-out case-study click still selects the résumé variant", async ({ request, baseURL }) => {
  const response = await request.get("/go/software/project/rbc-analytics/case-study", {
    headers: { "Sec-GPC": "1" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe(new URL("/project/rbc-analytics", baseURL).href);
  const code = Object.keys(entryLinks).find(key => entryLinks[key].profileId === "software");
  expect(response.headers()["set-cookie"]).toContain(`${selectionCookie}=${code}`);
  expect(response.headers()["set-cookie"]).toContain("HttpOnly");
});

test("unregistered routes cannot be used as open redirects", async ({ request }) => {
  const invalid = [
    "/go/unknown/project/rbc-analytics/demo",
    "/go/software/project/rbc-analytics/repository",
    "/go/software/project/unknown/demo",
    "/go/web-cms/project/etpzp-sms/repository",
    "/go/admin-excel/profile/github/external",
    "/go/software/profile/unknown/external?url=https://example.com",
  ];
  for (const path of invalid) {
    const response = await request.head(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
    expect(response.headers().location).toBeUndefined();
  }
  const response = await request.head(
    "/go/software/project/rbc-analytics/demo?url=https://example.com",
    { maxRedirects: 0 },
  );
  expect(response.headers().location).toBe("https://rbc-analytics.demo.girke.dev/");
});
