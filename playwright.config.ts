import process from 'node:process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'
const workspace = mkdtempSync(join(tmpdir(), 'iceland-browser-'))
export default defineConfig({
  testDir: './e2e',
  timeout: 90000,
  expect: { timeout: 10000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'html',
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'on-first-retry', headless: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'node scripts/editor.mjs',
    url: 'http://127.0.0.1:5173/editor.html',
    reuseExistingServer: false,
    env: { MEMORY_PORT: '5173', MEMORY_WORKSPACE: workspace },
  },
})
