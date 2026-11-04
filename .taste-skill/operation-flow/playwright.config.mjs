import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const workspace = mkdtempSync(join(tmpdir(), 'iceland-browser-'))
const launchOptions = {
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--enable-unsafe-swiftshader'],
}
export default defineConfig({
  testDir: '../../e2e',
  outputDir: './test-results',
  timeout: 90000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: [['line']],
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, launchOptions },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: undefined } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'node scripts/editor.mjs',
    cwd: '../..',
    url: 'http://127.0.0.1:5173/editor.html',
    reuseExistingServer: false,
    env: { MEMORY_PORT: '5173', MEMORY_WORKSPACE: workspace },
  },
})
