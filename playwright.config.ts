import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require("dotenv").config();

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3001";
console.log(`[INFO] Using base URL "${baseUrl}"`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./tests",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    // forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    // retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    // workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [["html"], ["list"], ["json"]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: baseUrl,
        ...devices["Desktop Chrome"],

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
    },
});