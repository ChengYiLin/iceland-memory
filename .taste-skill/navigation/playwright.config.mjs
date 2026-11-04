import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: '../../e2e', testMatch: 'viewer-navigation.spec.ts',
  outputDir: './test-results', reporter: [['list']], workers: 1, timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-unsafe-swiftshader'] } },
  projects: [
    { name:'desktop', use:{ viewport:{ width:1440, height:900 } } },
    { name:'mobile', use:{ viewport:{ width:390, height:844 } } },
    { name:'small-mobile', use:{ viewport:{ width:320, height:568 } } },
  ],
})
