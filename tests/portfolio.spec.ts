import { expect, test } from "@playwright/test";
import { profileHome, profileIds, profileMetadata } from "../lib/profiles";
import { clientContent, defaultContent, employerContent } from "../lib/portfolio-content";

const entries = Object.fromEntries(profileIds.map(profile => [profile, profileHome(profile)]));

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
      await expect(page).toHaveURL(new RegExp(`${entries[variant.id]}$`));
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
      const selected = page.locator(`#projects [data-track="cta:project"][data-track-target="${slug}"]`);
      await expect(selected).toBeVisible();
      await selected.click();
      await expect(page).toHaveURL(new RegExp(`/project/${slug}$`));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://girke.dev/project/${slug}`);
      await expect(page.getByText("Video Coming Soon")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (process.env.PORTFOLIO_SCREENSHOTS) {
        await page.screenshot({ path: `/tmp/portfolio-review-${slug}-${variant.id}-${width}.png`, fullPage: true });
      }
      const back = page.getByRole("link", { name: "Back to projects" });
      await expect(back).toHaveAttribute("href", entries[variant.id] + "#projects");
      await back.click();
      await expect(page).toHaveURL(new RegExp(`${entries[variant.id]}#projects$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(variant.headline);
      expect(errors).toEqual([]);
    });
  }
}

test("serves the audience and contact variants without JavaScript or a selection cookie", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    const response = await page.goto(entries.software);
    expect(response?.status()).toBe(200);
    expect(await response?.text()).toContain(employerContent.software.headline);
    expect(response?.headers()["cache-control"]).not.toContain("no-store");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.goto(entries.software + "/contact");
    await expect(page.getByRole("link", { name: "job@luigigirke.com" })).toBeVisible();
    await page.getByRole("link", { name: "Back to portfolio" }).click();
    await expect(page).toHaveURL(new RegExp(`${entries.software}$`));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(defaultContent.headline);
    expect(await context.cookies()).toHaveLength(0);
  } finally {
    await context.close();
  }
});

test("client visitors can return to selected work from a job page", async ({ page }) => {
  await page.goto(entries.client);
  await expect(page).toHaveURL(new RegExp(`${entries.client}$`));
  await page.goto("/job/rbc");
  await expect(page).toHaveTitle("RBC Capital Markets | Luigi Girke");
  const back = page.getByRole("link", { name: "Back to selected work" });
  await expect(back).toHaveAttribute("href", entries.client + "#projects");
  await back.click();
  await expect(page).toHaveURL(new RegExp(`${entries.client}#projects$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(clientContent.headline);
});
