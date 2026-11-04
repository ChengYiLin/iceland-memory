import { writeFileSync } from 'node:fs'
import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs'

const browser = await Browser.launch()
const failures = []
try {
  const page = await browser.newPage({ width: 1440, height: 900 })
  await page.send('Network.enable')
  browser.on(page.sessionId, 'Network.loadingFailed', (event) => {
    failures.push({ error: event.errorText, type: event.type })
  })
  await page.goto('http://127.0.0.1:5173', { settleMs: 1500 })
  await sleep(15000)
  const overview = await page.eval(() => ({
    text: document.body.innerText,
    markers: document.querySelectorAll('.area-pin').length,
    resources: performance.getEntriesByType('resource')
      .filter((r) => r.name.includes('openfreemap'))
      .map((r) => ({ url: r.name, duration: r.duration })),
  }))
  await page.screenshot({ path: '.taste-skill/before/desktop-settled.jpg', quality: 85 })
  await page.eval(() => document.querySelector('.viewer-primary')?.click())
  await sleep(2000)
  await page.screenshot({ path: '.taste-skill/before/day-one.jpg', quality: 85 })
  const day = await page.eval(() => document.body.innerText)
  writeFileSync('.taste-skill/before/loading-evidence.json', JSON.stringify({ overview, day, failures }, null, 2))
  console.log(JSON.stringify({ overview, day, failures }, null, 2))
} finally {
  await browser.close()
}
