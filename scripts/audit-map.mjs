import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
const url = process.argv[2] || 'http://127.0.0.1:4173/'
const output = process.argv[3] || 'test-results/map-performance.json'
const count = Number(process.argv[4] || 3)
const browser = await chromium.launch()
const runs = []
try {
  for (let index = 0; index < count; index++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    const session = await context.newCDPSession(page)
    await session.send('Network.enable')
    await session.send('Network.setCacheDisabled', { cacheDisabled: true })
    const requests = []
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('request', (r) => requests.push({ url: r.url(), type: r.resourceType(), request: r }))
    await page.addInitScript(() => {
      window.__mapAudit = { marks: {}, longTasks: 0 }
      const audit = window.__mapAudit
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) audit.longTasks += entry.duration
      }).observe({ type: 'longtask', buffered: true })
      new MutationObserver(() => {
        if (!audit.marks.canvas && document.querySelector('.maplibregl-canvas'))
          audit.marks.canvas = performance.now()
        if (!audit.marks.markers && document.querySelector('.day-marker'))
          audit.marks.markers = performance.now()
        if (
          !audit.marks.basemap &&
          document.querySelector('.maplibregl-canvas') &&
          !document.querySelector('.journey-map [role=status]')
        )
          audit.marks.basemap = performance.now()
      }).observe(document, { childList: true, subtree: true })
    })
    const runUrl = url.split(',')[index % url.split(',').length]
    await page.goto(runUrl)
    await page.locator('.day-marker').first().waitFor({ timeout: 45000 })
    await page.locator('.journey-map [role=status]').waitFor({ state: 'detached', timeout: 45000 })
    await page.waitForTimeout(2500)
    const metrics = await page.evaluate(() => ({
      ...window.__mapAudit,
      paint: performance
        .getEntriesByType('paint')
        .map((e) => ({ name: e.name, time: Math.round(e.startTime) })),
      navigation: performance.getEntriesByType('navigation').map((e) => ({
        dcl: Math.round(e.domContentLoadedEventEnd),
        loaded: Math.round(e.loadEventEnd),
      })),
    }))
    const resources = []
    for (const entry of requests) {
      const response = await entry.request.response().catch(() => null)
      let size = 0
      if (response) size = (await response.body().catch(() => Buffer.alloc(0))).length
      resources.push({
        url: entry.url,
        type: entry.type,
        size,
        status: response?.status(),
        timing: entry.request.timing(),
      })
    }
    const summary = {
      url: runUrl,
      run: index + 1,
      ...metrics,
      errors,
      totalRequests: resources.length,
      tileRequests: resources.filter((r) => /\/\d+\/\d+\/\d+(?:\?|\.|$)/.test(r.url)).length,
      jsBytes: resources.filter((r) => r.type === 'script').reduce((sum, r) => sum + r.size, 0),
      remoteBytes: resources
        .filter((r) => !r.url.startsWith('http://127.0.0.1'))
        .reduce((sum, r) => sum + r.size, 0),
    }
    runs.push({ summary, resources })
    console.log(JSON.stringify(summary))
    await context.close()
  }
} finally {
  await browser.close()
}
await mkdir(dirname(output), { recursive: true })
await writeFile(output, JSON.stringify(runs, null, 2))
