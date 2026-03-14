const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const http = require("http");

const htmlPath = path.resolve(__dirname, "../index.html");

let server;
let baseURL;

test.beforeAll(async () => {
  const html = fs.readFileSync(htmlPath, "utf-8");
  server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      baseURL = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.afterAll(async () => {
  if (server) server.close();
});

test.describe("Test App - QA Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test("page has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("Test App");
  });

  test("heading displays Hello World", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Hello World");
  });

  test("welcome paragraph is visible", async ({ page }) => {
    const paragraph = page.locator("p");
    await expect(paragraph).toBeVisible();
    await expect(paragraph).toHaveText("Welcome to the test app");
  });

  test("counter starts at zero", async ({ page }) => {
    const counter = page.locator("#counter");
    await expect(counter).toBeVisible();
    await expect(counter).toHaveText("Clicks: 0");
  });

  test("button click increments counter", async ({ page }) => {
    const button = page.locator("#btn");
    const counter = page.locator("#counter");

    await expect(button).toBeVisible();
    await expect(button).toHaveText("Click Me");

    // Click once
    await button.click();
    await expect(counter).toHaveText("Clicks: 1");

    // Click again
    await button.click();
    await expect(counter).toHaveText("Clicks: 2");

    // Click a third time
    await button.click();
    await expect(counter).toHaveText("Clicks: 3");
  });

  test("page structure is valid HTML", async ({ page }) => {
    const body = page.locator("body");
    await expect(body).toBeVisible();

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    const buttonCount = await page.locator("button").count();
    expect(buttonCount).toBe(1);

    const counterCount = await page.locator("#counter").count();
    expect(counterCount).toBe(1);
  });

  test("button has proper styling", async ({ page }) => {
    const button = page.locator("#btn");
    const bgColor = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
    // #2563eb = rgb(37, 99, 235)
    expect(bgColor).toBe("rgb(37, 99, 235)");
  });
});
