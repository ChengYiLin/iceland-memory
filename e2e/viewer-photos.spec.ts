import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'
import sharp from 'sharp'
import type { Collection } from '../src/types/content'

const captureDirectory = '.taste-skill/photo-groups/screens'
async function capture(page: Page, info: TestInfo, name: string) {
  if (!process.env.CAPTURE_PHOTO_GROUPS) return
  await mkdir(captureDirectory, { recursive: true })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.allSettled(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    )
  })
  await page.screenshot({ path: `${captureDirectory}/${info.project.name}-${name}.png` })
}
async function photoGroups(page: Page, counts = [7, 2], brokenFirst = false) {
  const data: Collection = JSON.parse(
    await readFile(new URL('../public/journey.json', import.meta.url), 'utf8'),
  )
  const colors = ['#7c9c91', '#bc987d', '#778eaa', '#b9b688', '#90aba4', '#927a85', '#a8bab8']
  const dimensions = colors.map((_, i) =>
    i === 1 ? [640, 960] : i === 3 ? [1400, 600] : [960, 640],
  )
  const images = await Promise.all(
    colors.map((color, i) => {
      const [width, height] = dimensions[i]!
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="#fff" font-size="48" text-anchor="middle">Photo ${i + 1} (test)</text></svg>`
      return sharp(Buffer.from(svg)).png().toBuffer()
    }),
  )
  counts.forEach((count, memoryIndex) => {
    const memory = data.days[5]!.memories[memoryIndex]!
    memory.title = memoryIndex ? '另一段回憶' : '一段回憶，七張照片'
    memory.story = '這段回憶由一組依序排列的照片組成。這是瀏覽器測試內容。'
    memory.photos = Array.from({ length: count }, (_, i) => ({
      id: `photo-${memoryIndex}-${i}`,
      src: `/__test-photos/${brokenFirst && !memoryIndex && !i ? 'missing' : i}.png`,
      thumbnail: `/__test-photos/${i}.png`,
      width: dimensions[i]![0]!,
      height: dimensions[i]![1]!,
      alt: `測試照片 ${i + 1}`,
      caption: `第 ${i + 1} 張照片的圖說`,
    }))
  })
  await page.route('**/journey.json', (route) => route.fulfill({ json: data }))
  await page.route('**/__test-photos/*', (route) => {
    const filename = new URL(route.request().url()).pathname.split('/').pop()!
    if (filename === 'missing.png')
      return route.fulfill({ status: 404, body: 'Missing test image' })
    return route.fulfill({
      contentType: 'image/png',
      body: images[Number(filename.split('.')[0])]!,
    })
  })
  await page.route('https://tiles.openfreemap.org/styles/positron', (route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [{ id: 'ground', type: 'background', paint: { 'background-color': '#e3ede9' } }],
      },
    }),
  )
  return data.days[5]!.memories[0]!.id
}

test('a memory exposes its ordered photo group and keeps photo and memory navigation separate', async ({
  page,
}, info) => {
  await photoGroups(page)
  await page.goto('/#day=day-06')
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  const card = page
    .getByRole('dialog', { name: '旅程與回憶' })
    .locator('.journey-memory-option')
    .first()
  await expect(card).toContainText('7 張精選照片')
  await expect(card.locator('.journey-photo-set img')).toHaveCount(3)
  await capture(page, info, 'photo-group')
  await card.click()
  const gallery = page.getByRole('region', { name: '精選照片組' })
  await expect(gallery.locator('.album-thumbnails button')).toHaveCount(7)
  await expect(gallery.locator('.album-photo-count')).toContainText('1 / 7')
  await expect(gallery.getByRole('button', { name: '上一張', exact: false })).toBeDisabled()
  await capture(page, info, 'gallery')
  await gallery.getByRole('button', { name: '下一張', exact: false }).click()
  await expect(gallery.locator('.album-photo-count')).toContainText('2 / 7')
  await expect(gallery.locator('figure[aria-hidden="false"] figcaption')).toHaveText(
    '第 2 張照片的圖說',
  )
  await expect
    .poll(async () =>
      gallery.locator('.album-track').evaluate((e) => Math.abs(e.scrollLeft / e.clientWidth - 1)),
    )
    .toBeLessThan(0.02)
  await capture(page, info, 'portrait')
  await gallery.getByRole('button', { name: /^查看第 6 張照片/ }).click()
  await gallery.getByRole('button', { name: '下一張', exact: false }).click()
  await expect(gallery.locator('.album-track')).toBeFocused()
  await expect(gallery.locator('.album-photo-count')).toContainText('7 / 7')
  await expect(gallery.getByRole('button', { name: '下一張', exact: false })).toBeDisabled()
  await gallery.locator('.album-track').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('heading', { name: '一段回憶，七張照片', exact: true })).toBeVisible()
  await page.keyboard.press('Home')
  await expect(gallery.locator('.album-photo-count')).toContainText('1 / 7')
  await page.getByRole('button', { name: '下一段回憶', exact: false }).click()
  await expect(page.getByRole('heading', { name: '另一段回憶', exact: true })).toBeVisible()
  await expect(page.locator('.album-photo-count')).toContainText('1 / 2')
  await page.getByRole('button', { name: '上一段回憶', exact: false }).click()
  await expect(page.locator('.album-photo-count')).toContainText('1 / 7')
})

test('thumbnail, keyboard, resize and mouse dragging retain the correct photo', async ({
  page,
}) => {
  const id = await photoGroups(page)
  await page.goto(`/#day=day-06&memory=${id}`)
  const gallery = page.getByRole('region', { name: '精選照片組' })
  await gallery.getByRole('button', { name: /^查看第 5 張照片/ }).click()
  await page.keyboard.press('End')
  await expect(gallery.locator('.album-photo-count')).toContainText('7 / 7')
  const viewport = page.viewportSize()!
  await page.setViewportSize({
    width: viewport.width > 767 ? 900 : viewport.width === 320 ? 390 : 320,
    height: viewport.height,
  })
  await expect
    .poll(async () =>
      gallery.locator('.album-track').evaluate((e) => Math.abs(e.scrollLeft / e.clientWidth - 6)),
    )
    .toBeLessThan(0.02)
  await expect(gallery.getByRole('button', { name: /^查看第 7 張照片/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await gallery.getByRole('button', { name: /^查看第 1 張照片/ }).click()
  await expect
    .poll(async () => gallery.locator('.album-track').evaluate((e) => e.scrollLeft))
    .toBeLessThan(1)
  const track = gallery.locator('.album-track')
  await track.scrollIntoViewIfNeeded()
  const box = (await track.boundingBox())!
  await page.mouse.move(box.x + box.width * 0.8, box.y + 60)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.2, box.y + 60, { steps: 10 })
  await page.mouse.up()
  await expect(gallery.locator('.album-photo-count')).toContainText('2 / 7')
  await expect
    .poll(async () => track.evaluate((e) => Math.abs(e.scrollLeft / e.clientWidth - 1)))
    .toBeLessThan(0.02)
  await track.evaluate((e) => {
    e.scrollLeft = e.clientWidth * 2
  })
  await expect(gallery.locator('.album-photo-count')).toContainText('3 / 7')
  await expect(page.locator('.full-story')).toContainText('這段回憶由一組依序排列的照片組成')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('one photo and no photos retain their own honest states', async ({ page }) => {
  const id = await photoGroups(page, [1, 0])
  await page.goto(`/#day=day-06&memory=${id}`)
  await expect(page.locator('.album-photo-count')).toContainText('1 / 1')
  await expect(page.locator('.album-thumbnails')).toHaveCount(0)
  await expect(page.getByRole('region', { name: '精選照片組' }).getByRole('button')).toHaveCount(0)
  const next = page.getByRole('button', { name: '下一段回憶', exact: false })
  const before = await next.boundingBox()
  await next.click()
  await expect(page.locator('.album-empty')).toBeVisible()
  await expect(page.locator('.album-photo-count')).toHaveCount(0)
  expect(await next.boundingBox()).toEqual(before)
  await expect(next).toBeFocused()
  await page.getByRole('button', { name: '上一段回憶', exact: false }).click()
  await expect(page.locator('.album-photo-count')).toContainText('1 / 1')
})

test('an unavailable image does not prevent reading the rest of the photo group', async ({
  page,
}) => {
  const id = await photoGroups(page, [7, 2], true)
  await page.goto(`/#day=day-06&memory=${id}`)
  await expect(page.locator('figure[aria-hidden="false"] .failed-photo')).toBeVisible()
  await page.getByRole('button', { name: '下一張', exact: false }).click()
  await expect(page.locator('.album-photo-count')).toContainText('2 / 7')
  await expect
    .poll(async () =>
      page
        .locator('figure[aria-hidden="false"] img')
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0)
  await expect(page.locator('figure[aria-hidden="false"] .failed-photo')).toBeHidden()
})
