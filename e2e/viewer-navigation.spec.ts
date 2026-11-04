import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/styles/positron', (route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [{ id: 'ground', type: 'background', paint: { 'background-color': '#e3ede9' } }],
      },
    }),
  )
})

test('one panel connects all days to their memories without stacking dialogs', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const trigger = page.getByRole('button', { name: '開啟旅程與回憶', exact: true })
  const panel = page.getByRole('dialog', { name: '旅程與回憶', exact: true })
  await trigger.click()
  await expect(panel.locator('.journey-day-option')).toHaveCount(18)
  await expect(panel.getByRole('heading', { name: '全部旅行日', exact: true })).toBeVisible()
  await expect(panel.locator('time').nth(1)).toHaveText('09/24')
  await expect(panel.locator('time').nth(1)).toHaveAttribute('datetime', '2026-09-24')
  await expect(panel.locator('.journey-day-option').nth(1)).toHaveAccessibleName(/09\/24/)
  await panel.getByRole('button', { name: /^選擇 Day 15：/ }).click()
  await expect(panel.getByLabel('當日回憶清單')).toBeVisible()
  await expect(panel.getByRole('heading', { name: '10月7日的回憶' })).toBeFocused()
  await expect(panel.locator('.journey-menu-header')).toHaveClass(/is-memory-view/)
  const centeredCloseIcon = await panel.locator('.journey-menu-close').evaluate((button) => {
    const circle = button.getBoundingClientRect()
    const icon = button.querySelector('svg')!.getBoundingClientRect()
    return (
      Math.abs(circle.x + circle.width / 2 - icon.x - icon.width / 2) < 1 &&
      Math.abs(circle.y + circle.height / 2 - icon.y - icon.height / 2) < 1
    )
  })
  expect(centeredCloseIcon).toBe(true)
  await expect(page).toHaveURL(/#day=day-15$/)
  await panel.getByRole('button', { name: '全部旅行日', exact: false }).click()
  await expect(panel.locator('.journey-day-option')).toHaveCount(18)
  await panel.getByRole('button', { name: /^選擇 Day 2：/ }).click()
  await expect(panel).not.toContainText('行程更正')
  await panel.getByRole('button', { name: '全部旅行日', exact: false }).click()
  await panel.getByRole('button', { name: /^選擇 Day 6：/ }).click()
  const firstMemory = panel.locator('.journey-memory-option').first()
  const memoryTitle = await firstMemory.locator('strong').innerText()
  await firstMemory.click()
  await expect(panel).toBeHidden()
  const album = page.getByRole('dialog', { name: memoryTitle, exact: true })
  await expect(album).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(panel.getByRole('heading', { name: '9月28日的回憶' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(
    page.locator('.viewer-actions, .overview-home, .maplibregl-ctrl-top-right button'),
  ).toHaveCount(0)
  const zoom = await page
    .locator('.maplibregl-ctrl-bottom-left .maplibregl-ctrl-group')
    .boundingBox()
  expect(zoom?.x).toBeLessThan(100)
  expect(zoom!.y).toBeGreaterThan(page.viewportSize()!.height / 2)
  await page.getByRole('button', { name: '返回全島總覽', exact: true }).click()
  await expect(page).not.toHaveURL(/day=/)
  await expect(page.getByRole('button', { name: '前一天', exact: true })).toBeDisabled()
  expect(errors).toEqual([])
})

test('flight and map failures use the same panel, and deep links open only the album', async ({
  page,
}) => {
  await page.unroute('https://tiles.openfreemap.org/styles/positron')
  await page.route('https://tiles.openfreemap.org/**', (route) => route.abort())
  await page.goto('/#day=day-01')
  const panel = page.getByRole('dialog', { name: '旅程與回憶', exact: true })
  await expect(panel.getByLabel('當日回憶清單')).toBeVisible()
  await panel.locator('.journey-memory-option').first().click()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await expect(panel).toBeHidden()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  await panel.getByRole('button', { name: '全部旅行日', exact: false }).click()
  await panel.getByRole('button', { name: /^選擇 Day 18：/ }).click()
  await expect(panel.getByRole('heading', { name: '10月10日的回憶' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '後一天', exact: true })).toBeDisabled()
})

test('sharing stays with the selected day and memory, with a readable failure state', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          document.documentElement.dataset.shared = value
        },
      },
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  const panel = page.getByRole('dialog', { name: '旅程與回憶', exact: true })
  await panel.getByRole('button', { name: /^選擇 Day 15：/ }).click()
  await panel.getByRole('button', { name: '分享這一天', exact: false }).click()
  await expect(panel.getByRole('status')).toHaveText('連結已複製')
  await expect(page.locator('html')).toHaveAttribute('data-shared', /#day=day-15$/)
  await panel.locator('.journey-memory-option').first().click()
  const album = page.getByRole('dialog')
  await album.getByRole('button', { name: '分享這段回憶', exact: false }).click()
  await expect(page.locator('html')).toHaveAttribute('data-shared', /day=day-15&memory=/)
  await expect(album.getByRole('status')).toHaveText('連結已複製')
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard unavailable')
        },
      },
    })
  })
  await page.reload()
  await page.getByRole('dialog').getByRole('button', { name: '分享這段回憶', exact: false }).click()
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('可複製瀏覽器網址')
})

test('map pins name their place and a day says what is missing from the map', async ({ page }) => {
  const journey = JSON.parse(
    await readFile(new URL('../public/journey.json', import.meta.url), 'utf8'),
  )
  await page.route('**/journey.json', (route) => route.fulfill({ json: journey }))
  await page.goto('/#day=day-08')
  const pins = page.locator('.memory-pin')
  await expect(pins).toHaveCount(7)
  await expect(pins.nth(2).locator('.memory-pin-label')).toHaveText('小臭臭地熱區')
  await expect(page.locator('.viewer-intro')).toContainText('第 8 天 · 9月30日 · 7 段回憶')
  await expect(page.locator('.viewer-unplaced')).toHaveCount(0)
  await pins.nth(2).click()
  const album = page.getByRole('dialog')
  await expect(album.locator('.full-story')).toContainText('沿冒煙的岩漿裂隙地熱行走')
  await expect(album.getByRole('heading', { level: 2 })).toBeFocused()
  await page.keyboard.press('Escape')

  await page.goto('/#day=day-10')
  await expect(pins).not.toHaveCount(0)
  const unplaced = page.locator('.viewer-unplaced')
  await expect(unplaced).toContainText(/還有 \d+ 段不在地圖上/)
  await unplaced.click()
  const panel = page.getByRole('dialog', { name: '旅程與回憶', exact: true })
  await expect(panel.locator('.journey-memory-option')).toHaveCount(10)
  await expect(panel.locator('.journey-memory-number').first()).toHaveText('1')
  await expect(panel).not.toContainText('照片待補')
  await page.keyboard.press('Escape')

  await page.goto('/#day=day-17')
  await expect(pins).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(unplaced).toHaveText('看這天的 5 段回憶 →')
})

test('every pin stays clear of the others and can be reached on the smallest screen', async ({
  page,
}) => {
  const journey = JSON.parse(
    await readFile(new URL('../public/journey.json', import.meta.url), 'utf8'),
  )
  await page.route('**/journey.json', (route) => route.fulfill({ json: journey }))
  await page.setViewportSize({ width: 320, height: 568 })
  const reachable = (selector: string) =>
    page.locator(selector).evaluateAll((pins) => {
      const boxes = pins.map((pin) => pin.getBoundingClientRect())
      const clear = boxes.every((a, i) =>
        boxes
          .slice(i + 1)
          .every(
            (b) => a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top,
          ),
      )
      const onTop = pins.every((pin, i) => {
        const box = boxes[i]!
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        return pin.contains(hit)
      })
      return clear && onTop
    })
  await page.goto('/')
  await expect(page.locator('.day-pin')).toHaveCount(16)
  await expect.poll(() => reachable('.day-pin')).toBe(true)
  await page.goto('/#day=day-08')
  await expect(page.locator('.memory-pin')).toHaveCount(7)
  await expect.poll(() => reachable('.memory-pin')).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
