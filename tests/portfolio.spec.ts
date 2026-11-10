import { expect, test } from "@playwright/test";
import { entryLinks, profileMetadata, selectionCookie } from "../lib/profiles";
import { clientContent, defaultContent, employerContent } from "../lib/portfolio-content";

const entries = Object.fromEntries(
  Object.entries(entryLinks).map(([code, entry]) => [entry.profileId, `/r/${code}`]),
);

const variants = [
  { id: "default", ...defaultContent },
  { id: "client", ...clientContent },
  { id: "software", ...employerContent.software },
  { id: "web-cms", ...employerContent["web-cms"] },
  { id: "admin-excel", ...employerContent["admin-excel"] },
] as const;

for (const variant of variants) {
  for (const width of [1440, 390]) {
    test(`${variant.id} at ${width}px`, async ({ page, request }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const initialHeadings: string[] = [];
      await page.exposeFunction("recordPortfolioHeading", (heading: string) => {
        initialHeadings.push(heading);
      });
      await page.addInitScript(() => {
        const observer = new MutationObserver(() => {
          const heading = document.querySelector("main h1")?.textContent;
          if (heading) {
            const record = (window as typeof window & {
              recordPortfolioHeading: (heading: string) => Promise<void>;
            }).recordPortfolioHeading;
            void record(heading);
          }
        });
        observer.observe(document, { childList: true, subtree: true, characterData: true });
      });
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(entries[variant.id] ?? "/");
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(variant.headline);
      await expect(page).toHaveTitle(profileMetadata[variant.id].title);
      await expect(page).toHaveURL(/\/$/);
      await expect.poll(() => [...new Set(initialHeadings)]).toEqual([variant.headline]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (process.env.PORTFOLIO_SCREENSHOTS) {
        await page.screenshot({ path: `/tmp/portfolio-review-${variant.id}-${width}.png`, fullPage: true });
      }

      if (variant.id === "client") {
        await expect(page.getByRole("heading", { name: "AI enablement" })).toBeVisible();
        await page.getByRole("link", { name: "Discuss your project" }).first().click();
        await expect(page).toHaveURL(/\/contact$/);
        await expect(page.getByRole("link", { name: "contact@luigigirke.com" })).toBeVisible();
        await page.getByRole("link", { name: "Back to portfolio" }).click();
      } else if (variant.id !== "default") {
        const resume = page.getByRole("link", { name: "Download résumé" });
        const path = `/resumes/${variant.id}.pdf`;
        await expect(resume).toHaveAttribute("href", path);
        expect((await request.get(path)).headers()["content-type"]).toContain("application/pdf");
        await expect(page.getByRole("link", { name: "Discuss your project" })).toHaveCount(0);
      }

      const slug = variant.projects[0];
      const selected = page.locator(`#projects [data-track=project_open][data-track-target="${slug}"]`);
      await expect(selected).toBeVisible();
      await selected.click();
      await expect(page).toHaveURL(new RegExp(`/project/${slug}$`));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://girke.dev/project/${slug}`);
      await expect(page.getByText("Video Coming Soon")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (process.env.PORTFOLIO_SCREENSHOTS) {
        await page.screenshot({ path: `/tmp/portfolio-review-${slug}-${variant.id}-${width}.png`, fullPage: true });
      }
      await page.getByRole("link", { name: "Back to projects" }).click();
      await expect(page).toHaveURL(/\/#projects$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(variant.headline);
      expect(errors).toEqual([]);
    });
  }
}

test("renders the selected profile on the server and applies valid entries before saved selections", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  const heading = page.getByRole("heading", { level: 1 });
  const response = await page.goto(entries.software);
  expect(await response?.text()).toContain(employerContent.software.headline);
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  await expect(heading).toHaveText(employerContent.software.headline);
  await expect(page).toHaveURL(new RegExp(`${entries.software}$`));
  const saved = (await context.cookies()).find((cookie) => cookie.name === selectionCookie);
  expect(saved?.httpOnly).toBe(true);
  expect(saved?.expires).toBeGreaterThan(Date.now() / 1000 + 89 * 86400);

  await page.goto(entries["admin-excel"]);
  await expect(heading).toHaveText(employerContent["admin-excel"].headline);
  await page.goto("/r/not-a-valid-entry");
  await expect(heading).toHaveText(employerContent["admin-excel"].headline);
  await page.goto("/");
  await expect(heading).toHaveText(employerContent["admin-excel"].headline);
  await context.clearCookies();
  await page.goto("/r/not-a-valid-entry");
  await expect(heading).toHaveText(defaultContent.headline);
  await context.close();

  const fresh = await browser.newContext({ baseURL });
  const freshPage = await fresh.newPage();
  await freshPage.goto("/");
  await expect(freshPage.getByRole("heading", { level: 1 })).toHaveText(defaultContent.headline);
  await fresh.close();
});

test("client visitors can return to selected work from a job page", async ({ page }) => {
  await page.goto(entries.client);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/job/rbc");
  await expect(page).toHaveTitle("RBC Capital Markets | Luigi Girke");
  await page.getByRole("link", { name: "Back to selected work" }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(clientContent.headline);
});
