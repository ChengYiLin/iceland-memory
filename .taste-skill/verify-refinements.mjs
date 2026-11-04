import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-unsafe-swiftshader'] })
const results = []
try {
  for (const [name, width, height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:4173')
    await page.locator('.day-pin').nth(15).waitFor({ timeout: 30000 })
    await page.waitForTimeout(1800)
    const layout = await page.evaluate(() => {
      const pins = Array.from(document.querySelectorAll('.day-pin'))
      const boxes = pins.map(e => e.getBoundingClientRect())
      const collisions = []
      boxes.forEach((a,i) => boxes.slice(i+1).forEach((b,j) => {
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) collisions.push([i,i+j+1])
      }))
      return { collisions, clippedLabels: pins.filter(e => { const label=e.querySelector('strong'); return label.scrollWidth > label.clientWidth + 1 }).map(e=>e.innerText), overflow: document.documentElement.scrollWidth > innerWidth, labels: pins.map(e => ({ text:e.innerText, size: getComputedStyle(e.querySelector('strong')).fontSize, secondarySize:getComputedStyle(e.querySelector(':scope > span')).fontSize })), outside:boxes.filter(b => b.left<0 || b.right>innerWidth || b.top<0 || b.bottom>innerHeight).length }
    })
    await page.screenshot({ path: `.taste-skill/after/interaction/${name}-overview.png` })
    await page.getByRole('button', { name: '開啟行程選單', exact: true }).click()
    await page.screenshot({ path: `.taste-skill/after/interaction/${name}-menu.png` })
    await page.keyboard.press('Escape')
    const restoredFocus = await page.getByRole('button', { name: '開啟行程選單', exact: true }).evaluate(e => document.activeElement === e)
    await page.getByRole('button', { name: '走進第 15 天：藍湖溫泉', exact: true }).click()
    await page.waitForTimeout(1000)
    const pin = page.locator('.memory-pin').first()
    await pin.click()
    if (width < 768) await page.locator('.memory-preview > button').first().click()
    await page.getByRole('dialog').waitFor()
    await page.screenshot({ path: `.taste-skill/after/interaction/${name}-album.png` })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: '返回全島總覽', exact: true }).click()
    await page.locator('.day-pin').nth(15).waitFor()
    results.push({ name, width, height, ...layout, restoredFocus, returnedToOverview: await page.locator('.day-pin').count() === 16, errors })
    await page.close()
  }
} finally { await browser.close() }
await writeFile('.taste-skill/after/interaction/report.json', JSON.stringify(results,null,2))
console.log(JSON.stringify(results,null,2))
if(results.some(r => r.collisions.length || r.clippedLabels.length || r.overflow || r.outside || r.errors.length || !r.restoredFocus || !r.returnedToOverview)) process.exitCode=1
