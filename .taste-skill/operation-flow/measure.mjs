// Usage: node .taste-skill/operation-flow/measure.mjs <before|after> [baseUrl]
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const label = process.argv[2] ?? 'after'
const base = process.argv[3] ?? 'http://127.0.0.1:5190'
const root = dirname(fileURLToPath(import.meta.url))
const shots = join(root, label, 'screens')
mkdirSync(shots, { recursive: true })

const viewports = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
  small: { width: 320, height: 568 },
}
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--enable-unsafe-swiftshader'],
})
const report = {}

async function settle(page, ms = 3500) {
  await page.waitForTimeout(ms)
}

function pinStats() {
  const pins = [...document.querySelectorAll('.day-pin, .memory-pin')]
  const boxes = pins.map((pin) => pin.getBoundingClientRect())
  let overlaps = 0
  boxes.forEach((a, i) =>
    boxes.slice(i + 1).forEach((b) => {
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
        overlaps += 1
    }),
  )
  const area = boxes.reduce((sum, box) => sum + box.width * box.height, 0)
  const offscreen = boxes.filter(
    (box) => box.left < 0 || box.top < 0 || box.right > innerWidth || box.bottom > innerHeight,
  ).length
  const readable = pins.filter((pin) => {
    const text = [...pin.querySelectorAll('strong, span')].find(
      (node) => getComputedStyle(node).display !== 'none' && node.textContent.trim().length > 1,
    )
    return text && text.getBoundingClientRect().width > 0 && text.scrollWidth <= text.clientWidth
  }).length
  return {
    pins: pins.length,
    readableAtRest: readable,
    overlaps,
    offscreen,
    coverage: Number((area / (innerWidth * innerHeight)).toFixed(3)),
    overflowX: document.documentElement.scrollWidth > innerWidth,
    introHeight: Math.round(
      document.querySelector('.viewer-intro')?.getBoundingClientRect().height ?? 0,
    ),
  }
}

for (const [name, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport, hasTouch: name !== 'desktop' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const result = (report[name] = {})

  await page.goto(`${base}/`)
  await page.waitForSelector('.day-pin', { timeout: 30000 })
  await settle(page)
  result.overview = await page.evaluate(pinStats)
  await page.screenshot({ path: join(shots, `${name}-overview.png`) })

  for (const day of ['day-08', 'day-10', 'day-17']) {
    await page.goto(`${base}/#day=${day}`)
    await page.reload()
    await page.waitForSelector('.viewer-intro')
    await settle(page, 4500)
    if (await page.locator('dialog.journey-menu[open]').count()) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    }
    const stats = await page.evaluate(pinStats)
    const memories = await page.locator('.journey-menu-trigger small').innerText()
    result[day] = { ...stats, memories }
    await page.screenshot({ path: join(shots, `${name}-${day}.png`) })
  }

  await page.goto(`${base}/#day=day-08`)
  await page.reload()
  await page.waitForSelector('.memory-pin')
  await settle(page, 4500)
  let taps = 0
  const pin = page.locator('.memory-pin').nth(2)
  const name3 = await pin.getAttribute('aria-label')
  await pin.click()
  taps += 1
  await page.waitForTimeout(400)
  if (!(await page.locator('dialog.memory-album[open]').count())) {
    await page.locator('.memory-preview button').first().click()
    taps += 1
    await page.waitForTimeout(400)
  }
  const album = await page.evaluate(() => {
    const dialog = document.querySelector('dialog.memory-album')
    const story = dialog.querySelector('.full-story p')
    const active = document.activeElement
    return {
      focus: active?.getAttribute('aria-label') || active?.id || active?.tagName,
      storyVisibleWithoutClick: Boolean(story && story.getBoundingClientRect().height > 0),
      overflowX: dialog.scrollWidth > dialog.clientWidth,
      controls: dialog.querySelectorAll('button').length,
    }
  })
  result.album = { pin: name3, tapsFromPinToAlbum: taps, ...album }
  await page.screenshot({ path: join(shots, `${name}-album.png`) })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  await page.locator('.journey-menu-trigger').click()
  await page.waitForTimeout(500)
  result.list = await page.evaluate(() => {
    const content = document.querySelector('.journey-menu-content')
    const rows = [...document.querySelectorAll('.journey-memory-option')]
    const fold = content.getBoundingClientRect().bottom
    return {
      rows: rows.length,
      rowHeight: Math.round(rows[0].getBoundingClientRect().height),
      fullyVisibleRows: rows.filter((row) => row.getBoundingClientRect().bottom <= fold).length,
      photoPendingNotes: rows.filter((row) => row.textContent.includes('照片待補')).length,
      numbered: rows.filter((row) => row.querySelector('.journey-memory-number')).length,
    }
  })
  await page.screenshot({ path: join(shots, `${name}-list.png`) })
  result.pageErrors = errors
  await context.close()
}
await browser.close()
writeFileSync(join(root, label, 'metrics.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
