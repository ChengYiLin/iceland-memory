import { test, expect, type Page } from '@playwright/test'
import sharp from 'sharp'

async function chooseDay(page: Page, id: string) {
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  const menu = page.getByRole('dialog', { name: '旅程與回憶' })
  const allDays = menu.getByRole('button', { name: '全部旅行日', exact: false })
  if (await allDays.isVisible()) await allDays.click()
  await menu
    .getByRole('button', { name: new RegExp(`^選擇 Day ${Number(id.slice(-2))}：`) })
    .click()
  await expect(menu.getByLabel('當日回憶清單')).toBeVisible()
  await menu.getByRole('button', { name: '關閉旅程與回憶' }).click()
  await expect(menu).toBeHidden()
}

test.beforeEach(async ({ page }) => {
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
})

test('all 18 days and flight stories are available without coordinates or photos', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('冰島，沿途的我們')
  await expect(page.locator('.day-pin')).toHaveCount(16)
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  const menu = page.getByRole('dialog', { name: '旅程與回憶' })
  await expect(menu.locator('.journey-day-option')).toHaveCount(18)
  await page.getByRole('button', { name: '關閉旅程與回憶', exact: true }).click()
  await page.getByRole('button', { name: '從第一天出發' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('出發')
  await page
    .getByLabel('當日回憶清單')
    .getByRole('button')
    .filter({ hasText: '航程' })
    .first()
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.full-story')).toContainText('TPE')
  await page.getByRole('button', { name: '關閉照片故事' }).click()
  await chooseDay(page, 'day-18')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('返抵台灣')
  await expect(page.getByRole('button', { name: '後一天', exact: true })).toBeDisabled()
  expect(errors).toEqual([])
})

test('local edits and processed photos survive reopening and appear in a static export', async ({
  page,
}) => {
  const jpeg = await sharp({
    create: { width: 70, height: 110, channels: 3, background: '#496a57' },
  })
    .jpeg()
    .toBuffer()
  const png = await sharp({
    create: { width: 140, height: 80, channels: 3, background: '#bca477' },
  })
    .png()
    .toBuffer()
  await page.goto('/editor.html')
  await page.getByLabel('共同短文', { exact: true }).fill('森林裡的暖湯，是我們一起留下的回憶。')
  await page.locator('input[type=file]').setInputFiles([
    { name: 'portrait.jpg', mimeType: 'image/jpeg', buffer: jpeg },
    { name: 'landscape.png', mimeType: 'image/png', buffer: png },
  ])
  await expect(page.locator('.photo-grid>li')).toHaveCount(2)
  await page.getByRole('button', { name: '照片往前移' }).nth(1).click()
  await page.getByRole('button', { name: '儲存修改', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('已儲存到本機檔案')
  await page.reload()
  await expect(page.getByLabel('共同短文', { exact: true })).toHaveValue(
    '森林裡的暖湯，是我們一起留下的回憶。',
  )
  await expect(page.locator('.photo-grid>li')).toHaveCount(2)
  await page.getByRole('button', { name: '匯出靜態網站', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('靜態匯出完成', { timeout: 60000 })
  await page.route('**/api/**', (route) => route.abort())
  await page.goto('/export/#day=day-06&memory=day-06-memory-01')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.album-track img')).toHaveCount(2)
  await expect(page.locator('.album-photo-count')).toContainText('1 / 2')
  await page.getByRole('button', { name: '下一張', exact: false }).click()
  await expect(page.locator('.album-photo-count')).toContainText('2 / 2')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.album-photo-count')).toContainText('2 / 2')
  await page.getByRole('button', { name: '下一段回憶', exact: false }).click()
  await expect(page.getByRole('dialog')).toContainText('眾神瀑布')
  await page.getByRole('button', { name: '上一段回憶', exact: false }).click()
  await expect(page.locator('.album-photo-count')).toContainText('1 / 2')
  await page.getByRole('button', { name: '關閉照片故事' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('森林溫泉')
})

test('overlapping area choices and map failure leave every story reachable on a small screen', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: '走進第 15 天：藍湖溫泉', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('藍湖')
  await expect(page.locator('.memory-pin')).toHaveCount(1)
  await page.getByRole('button', { name: '返回全島總覽', exact: true }).click()
  await expect(page.locator('.day-pin')).toHaveCount(16)
  await page.getByRole('button', { name: '走進第 16 天：黃金圈・Gullfoss', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('黃金圈')
  await chooseDay(page, 'day-17')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('公寓浪貓')
  await page.unroute('https://tiles.openfreemap.org/styles/positron')
  await page.route('https://tiles.openfreemap.org/**', (route) => route.abort())
  const pendingData = await (await page.request.get('/api/journey')).json()
  pendingData.days[9].memories.forEach(
    (memory: { coordinate: null; locationStatus: string; coordinateSource?: string }) => {
      memory.coordinate = null
      memory.locationStatus = 'pending'
      delete memory.coordinateSource
    },
  )
  const reset = await page.request.post('/api/save', {
    data: JSON.stringify(pendingData),
    headers: { 'X-Memory-Editor': '1', Origin: 'http://127.0.0.1:5173' },
  })
  expect(reset.ok(), await reset.text()).toBe(true)
  await page.goto('/?day=day-10')
  await page.getByLabel('當日回憶清單').getByRole('button').filter({ hasText: '求婚' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.full-story')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: '關閉照片故事' }).click()
  await page.goto('/#day=invalid&memory=invalid')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('冰島，沿途的我們')
})

test('confirmed locations, same-position stories, rapid day changes and reduced motion stay usable', async ({
  page,
}) => {
  const response = await page.request.get('/api/journey')
  const data = await response.json()
  const memories = data.days[5].memories
  memories.forEach(
    (memory: { coordinate: null; locationStatus: string; coordinateSource?: string }) => {
      memory.coordinate = null
      memory.locationStatus = 'pending'
      delete memory.coordinateSource
    },
  )
  memories[0].title = '森林溫泉（測試）'
  for (const [index, position] of [
    [0, [-18.09, 65.68]],
    [1, [-17.54, 65.68]],
    [2, [-18.09, 65.68]],
  ] as const) {
    memories[index].coordinate = position
    memories[index].locationStatus = 'confirmed'
  }
  const saved = await page.request.post('/api/save', {
    data: JSON.stringify(data),
    headers: { 'X-Memory-Editor': '1', Origin: 'http://127.0.0.1:5173' },
  })
  expect(saved.ok()).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#day=day-06')
  const pin = page.locator('.memory-pin').filter({ hasText: '2 段' })
  await expect(pin).toHaveAccessibleName(/2 段回憶$/)
  await expect(page.locator('.memory-pin')).toHaveCount(2)
  await pin.click()
  await expect(page.getByLabel('選擇同位置的回憶')).toBeVisible()
  await page
    .getByLabel('選擇同位置的回憶')
    .getByRole('button')
    .filter({ hasText: '森林溫泉（測試）' })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: '關閉照片故事' }).click()
  await chooseDay(page, 'day-07')
  await chooseDay(page, 'day-08')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('生氣爬火山')
  await page.getByRole('button', { name: '回到冰島總覽' }).click()
  await expect(
    page.getByRole('button', { name: '走進第 15 天：藍湖溫泉', exact: true }),
  ).toBeVisible()
  const forbidden = await page.request.post('/api/save', {
    data: '{}',
    headers: { Origin: 'https://example.invalid', 'X-Memory-Editor': '1' },
  })
  expect(forbidden.status()).toBe(403)
})

test('day markers remain distinct and menu supports dismissal, reselection and overview', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('.day-pin')).toHaveCount(16)
  await expect
    .poll(async () =>
      page.locator('.day-pin').evaluateAll((elements) => {
        const boxes = elements.map((e) => e.getBoundingClientRect())
        return boxes.every((a, i) =>
          boxes
            .slice(i + 1)
            .every(
              (b) =>
                a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top,
            ),
        )
      }),
    )
    .toBe(true)
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: '旅程與回憶' })).toBeHidden()
  await chooseDay(page, 'day-05')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('牧場綿羊')
  await chooseDay(page, 'day-05')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('牧場綿羊')
  await page.getByRole('button', { name: '開啟旅程與回憶', exact: true }).click()
  await page
    .getByRole('dialog', { name: '旅程與回憶' })
    .getByRole('button', { name: '全島總覽', exact: true })
    .click()
  await expect(page.locator('.day-pin')).toHaveCount(16)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('冰島，沿途的我們')
})
