import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: ".next/playwright-results",
  use: { baseURL: process.env.PORTFOLIO_TEST_URL ?? "http://localhost:3100" },
});
