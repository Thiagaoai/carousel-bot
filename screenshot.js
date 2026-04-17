// Usage: node screenshot.js <url> <filename.png> <width>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const parseWidth = (rawWidth) => {
  const width = Number.parseInt(rawWidth, 10);
  if (!Number.isFinite(width) || width < 200) {
    throw new Error('Width must be an integer >= 200');
  }
  return width;
};

const ensureOutputDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

(async () => {
  const [, , url, filename, width] = process.argv;

  if (!url || !filename || !width) {
    console.error('Usage: node screenshot.js <url> <filename.png> <width>');
    process.exit(1);
  }

  const viewportWidth = parseWidth(width);
  const viewportHeight = viewportWidth <= 480 ? 812 : 900;
  const outputDir = path.join(process.cwd(), 'entregas');
  const outputPath = path.join(outputDir, filename);

  ensureOutputDir(outputDir);

  let browser;

  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`Screenshot saved: ${outputPath}`);
  } catch (error) {
    console.error(`Screenshot failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})().catch((error) => {
  console.error(`Unexpected screenshot failure: ${error.message}`);
  process.exit(1);
});
