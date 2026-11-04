import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const failures = [],
  responses = []
page.on('requestfailed', (r) => {
  if (r.url().includes('openfreemap')) failures.push([r.url(), r.failure()?.errorText])
})
page.on('response', (r) => {
  if (r.url().includes('openfreemap')) responses.push([r.url(), r.status()])
})
await page.goto('http://127.0.0.1:5181/')
await page.getByRole('button', { name: '雷克雅維克 · 5 天', exact: true }).waitFor()
await page
  .waitForFunction(
    () => document.querySelector('.canvas-wrap')?.__vueParentComponent?.setupState?.map?.loaded(),
    {},
    { timeout: 15000 },
  )
  .catch(() => {})

console.log(
  'MAPSTATE',
  await page.locator('.canvas-wrap').evaluate((el) => {
    const setup = el.__vueParentComponent?.setupState
    const map = setup?.map
    return map
      ? {
          zoom: map.getZoom(),
          center: map.getCenter(),
          loaded: map.loaded(),
          sources: Object.keys(map.getStyle().sources),
          layers: map.getStyle().layers.length,
        }
      : Object.keys(setup ?? {})
  }),
)
console.log(
  JSON.stringify({
    responses: responses.slice(0, 15),
    failures: failures.slice(0, 10),
    sizes: await page.locator('canvas').evaluateAll((xs) =>
      xs.map((x) => ({
        width: x.width,
        height: x.height,
        box: x.getBoundingClientRect().toJSON(),
      })),
    ),
    credits: await page.locator('.maplibregl-ctrl-attrib').allTextContents(),
  }),
)
await page.screenshot({ path: 'artifacts/basemap-loaded.png' })
await browser.close()
