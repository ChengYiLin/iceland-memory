import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-unsafe-swiftshader'] })
const report = []
try {
  for (const [name,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['small-mobile',320,568]]) {
    const page = await browser.newPage({ viewport:{width,height}, reducedMotion:'reduce' })
    await page.goto('http://127.0.0.1:4173')
    await page.locator('.day-pin').nth(15).waitFor({timeout:30000})
    await page.waitForTimeout(1000)
    if(name!=='small-mobile') await page.screenshot({path:`.taste-skill/menu-hierarchy/screens/${name}-overview.png`})
    await page.getByRole('button',{name:'開啟旅程與回憶',exact:true}).click()
    const panel = page.getByRole('dialog',{name:'旅程與回憶',exact:true})
    if(name!=='small-mobile') await page.screenshot({path:`.taste-skill/menu-hierarchy/screens/${name}-days.png`})
    await panel.getByRole('button',{name:/^選擇 Day 6：/}).click()
    await page.screenshot({path:`.taste-skill/menu-hierarchy/screens/${name}-memories.png`})
    const inside = await panel.evaluate(e=> { const r=e.getBoundingClientRect(); return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight })
    await panel.getByRole('button',{name:'關閉旅程與回憶'}).click()
    const layout = await page.evaluate(()=> {
      const toolbar=document.querySelector('.journey-toolbar').getBoundingClientRect()
      const zoom=document.querySelector('.maplibregl-ctrl-bottom-left .maplibregl-ctrl-group').getBoundingClientRect()
      const pins=[...document.querySelectorAll('.memory-pin')].map(e=>e.getBoundingClientRect())
      return { overflow:document.documentElement.scrollWidth>innerWidth, controlsOverlap: toolbar.left<zoom.right && zoom.left<toolbar.right && toolbar.top<zoom.bottom && zoom.top<toolbar.bottom, zoom:{x:zoom.x,y:zoom.y,width:zoom.width,height:zoom.height}, toolbar:{x:toolbar.x,y:toolbar.y,width:toolbar.width,height:toolbar.height}, memoryPins:pins.length }
    })
    report.push({name,inside,...layout})
    await page.close()
  }
} finally {await browser.close()}
await writeFile('.taste-skill/menu-hierarchy/screens/report.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
if(report.some(r=>!r.inside||r.overflow||r.controlsOverlap))process.exitCode=1
