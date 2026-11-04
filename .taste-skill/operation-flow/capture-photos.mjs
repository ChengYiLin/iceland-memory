// Shows how pins, the list and the album look once photos exist, using intercepted test images.
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const base = process.argv[2] ?? 'http://127.0.0.1:5190'
const root = dirname(fileURLToPath(import.meta.url))
const shots = join(root, 'after', 'photos')
mkdirSync(shots, { recursive: true })
const journey = JSON.parse(readFileSync(join(root, '../../public/journey.json'), 'utf8'))
const colors = ['#496a57', '#bca477', '#7a8fa3', '#a3705a', '#5f7f6a']
const portrait = { width: 600, height: 900 }
const landscape = { width: 1200, height: 800 }
const eight = journey.days[7].memories
eight.forEach((memory, index) => {
  memory.photos = Array.from({ length: index === 0 ? 5 : index === 1 ? 1 : 3 }, (_, i) => ({
    id: `${memory.id}-${i}`,
    src: `images/test/${i}.jpg`,
    thumbnail: `images/test/${i}.jpg`,
    width: i % 2 ? portrait.width : landscape.width,
    height: i % 2 ? portrait.height : landscape.height,
    alt: `測試照片 ${i + 1}`,
    caption: `第 ${i + 1} 張照片的圖說`,
  }))
})
eight[0].story = `${eight[0].story}\n我們在洞穴口站了很久，水氣從岩縫裡慢慢升上來，誰都沒有先開口。後來才發現，這裡比想像中更暖，也比想像中更安靜。`

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--enable-unsafe-swiftshader'],
})
for (const [name, viewport] of Object.entries({
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
  small: { width: 320, height: 568 },
})) {
  const page = await browser.newPage({ viewport })
  await page.route('**/journey.json', (route) => route.fulfill({ json: journey }))
  await page.route('**/images/test/*', async (route) => {
    const index = Number(
      route
        .request()
        .url()
        .match(/(\d)\.jpg/)[1],
    )
    const size = index % 2 ? portrait : landscape
    const body = await sharp({
      create: { ...size, channels: 3, background: colors[index % colors.length] },
    })
      .jpeg()
      .toBuffer()
    await route.fulfill({ body, contentType: 'image/jpeg' })
  })
  await page.goto(`${base}/#day=day-08`)
  await page.waitForSelector('.memory-pin')
  await page.waitForTimeout(4500)
  await page.screenshot({ path: join(shots, `${name}-map.png`) })
  await page.locator('.memory-pin').first().click()
  await page.waitForSelector('.memory-photo-set')
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(shots, `${name}-album.png`) })
  await page
    .locator('.album-content')
    .evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await page.waitForTimeout(200)
  await page.screenshot({ path: join(shots, `${name}-album-story.png`) })
  await page.keyboard.press('Escape')
  await page.locator('.journey-menu-trigger').click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(shots, `${name}-list.png`) })
  await page.close()
}
await browser.close()
console.log(`saved to ${shots}`)
