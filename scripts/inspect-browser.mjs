import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (error) => console.log('PAGEERROR', error.message))
if (!process.env.REAL_MAP)
  await page.route('https://tiles.openfreemap.org/styles/positron', (route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#e3ede9' } },
        ],
      },
    }),
  )
if (process.env.STATIC_ONLY) {
  await mkdir('artifacts', { recursive: true })
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('http://127.0.0.1:5182/#day=day-10&memory=day-10-memory-03')
  await page.getByRole('dialog').waitFor()
  if (requests.some((url) => url.includes('/api/') || url.includes(':5181')))
    throw Error('Static site depends on editor')
  console.log(
    'STATIC PASS: independent server, editor stopped; day, story and display assets work without editor API.',
  )
  await page.screenshot({ path: 'artifacts/static-independent.png' })
  await browser.close()
  process.exit(0)
}
await page.goto('http://127.0.0.1:5181/')
const button = page.getByRole('button', { name: '雷克雅維克 · 5 天', exact: true })
await button.waitFor()
console.log('REGION', await button.boundingBox())
try {
  await button.click({ timeout: 5000 })
  console.log('CLICKED')
} catch (error) {
  console.log(error.message)
}
await mkdir('artifacts', { recursive: true })
if (process.env.REAL_MAP)
  await page
    .waitForFunction(
      () =>
        !!document
          .querySelector('.maplibregl-ctrl-attrib-inner')
          ?.textContent?.includes('OpenStreetMap'),
      {},
      { timeout: 15000 },
    )
    .catch(() => {})
await page.screenshot({ path: 'artifacts/overview-desktop.png' })
console.log((await page.locator('body').innerText()).slice(0, 2500))
await page.goto('http://127.0.0.1:5181/editor.html')
await page.getByLabel('共同短文', { exact: true }).waitFor()
await page.screenshot({ path: 'artifacts/editor-desktop.png', fullPage: true })
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://127.0.0.1:5181/#day=day-10')
await page.getByRole('heading', { level: 1 }).filter({ hasText: '求婚驚喜' }).waitFor()
if (!(await page.getByLabel('當日回憶清單').isVisible()))
  await page.getByRole('button', { name: /當日回憶/ }).click()
await page.getByLabel('當日回憶清單').getByRole('button').filter({ hasText: '求婚' }).click()
await page.screenshot({ path: 'artifacts/album-mobile.png' })
await browser.close()
