import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.route('https://tiles.openfreemap.org/styles/positron', (route) =>
  route.fulfill({
    json: {
      version: 8,
      sources: {},
      layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e3ede9' } }],
    },
  }),
)
for (const [width, height] of [
  [320, 568],
  [768, 1024],
  [1024, 768],
  [1440, 900],
]) {
  await page.setViewportSize({ width, height })
  await page.goto('http://127.0.0.1:5182/#day=day-10&memory=day-10-memory-03')
  await page.getByRole('dialog').waitFor()
  const box = await page.getByRole('button', { name: '關閉照片故事' }).boundingBox()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  if (
    !box ||
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.width > width ||
    box.y + box.height > height ||
    overflow
  )
    throw Error(`Layout fails ${width}`)
  if (!(await page.locator('.full-story').isVisible())) throw Error(`Story hidden at ${width}`)
  console.log(`PASS ${width}×${height}: no horizontal overflow, close and story visible`)
}
await browser.close()
