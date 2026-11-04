import { createServer } from 'vite'
import { MemoryWorkspace } from './lib/workspace.mjs'
import { readFile, lstat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const workspace = new MemoryWorkspace(process.env.MEMORY_WORKSPACE || undefined)
const port = Number(process.env.MEMORY_PORT || 5181)
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}
let mutation = Promise.resolve()
const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true },
  plugins: [
    {
      name: 'local-memory-editor',
      configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, 'http://127.0.0.1')
          if (
            !['/api/', '/media/', '/export/'].some((prefix) => url.pathname.startsWith(prefix)) &&
            url.pathname !== '/journey.json'
          )
            return next()
          const origin = `http://${req.headers.host}`
          if (
            ![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host) ||
            (req.headers.origin && req.headers.origin !== origin)
          ) {
            res.statusCode = 403
            return res.end('僅允許本機同來源操作')
          }
          res.setHeader('Cache-Control', 'no-store')
          try {
            if (
              url.pathname === '/journey.json' ||
              (url.pathname === '/api/journey' && req.method === 'GET')
            )
              return json(res, await workspace.read())
            if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
              if (req.headers['x-memory-editor'] !== '1') throw Error('缺少本機編輯請求標記')
              const body = await readBody(req)
              // Serialize all writes, including export, so a concurrent save cannot overtake an import.
              const action = mutation.then(async () => {
                if (url.pathname === '/api/save') return workspace.save(JSON.parse(body.toString()))
                if (url.pathname === '/api/photos')
                  return workspace.importPhoto(body, url.searchParams.get('name') || 'photo')
                if (url.pathname === '/api/check') return workspace.validate(await workspace.read())
                if (url.pathname === '/api/export') return workspace.export()
                throw Error('找不到操作')
              })
              mutation = action.catch(() => {})
              return json(res, await action)
            }
            if (req.method !== 'GET') {
              res.statusCode = 405
              return res.end('Method not allowed')
            }
            if (url.pathname.startsWith('/media/')) {
              res.setHeader('Content-Type', 'image/webp')
              return res.end(
                await readFile(
                  await workspace.checkPath(workspace.mediaPath(decodeURIComponent(url.pathname))),
                ),
              )
            }
            if (url.pathname.startsWith('/export/')) {
              const root = resolve(workspace.root, 'export')
              const path = resolve(root, decodeURIComponent(url.pathname.slice(8)) || 'index.html')
              if (!path.startsWith(root + sep)) throw Error('不合法的路徑')
              await workspace.checkPath(path)
              const stat = await lstat(path)
              if (!stat.isFile() || stat.isSymbolicLink()) throw Error('找不到成品檔案')
              res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream')
              return res.end(await readFile(path))
            }
            res.statusCode = 404
            res.end('找不到操作')
          } catch (error) {
            res.statusCode = 400
            json(res, { error: error.message || '操作失敗' })
          }
        })
      },
    },
  ],
})
await server.listen()
console.log(
  `\n本機內容工具：http://127.0.0.1:${port}/editor.html\n觀看預覽：http://127.0.0.1:${port}/\n資料只保存在本機，使用完可關閉。\n`,
)
function json(res, value) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(value))
}
async function readBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > 40 * 1024 * 1024) throw Error('單次檔案超過 40 MB，請縮小原始照片')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}
