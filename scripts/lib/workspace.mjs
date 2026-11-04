import { readFile, writeFile, mkdir, rename, cp, rm, readdir, lstat } from 'node:fs/promises'
import { resolve, join, dirname, relative } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { build } from 'vite'

const project = resolve(import.meta.dirname, '../..')
const isText = (value) => typeof value === 'string' && value.length <= 50000
const safeId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value)
export class MemoryWorkspace {
  constructor(root = resolve(project, '.local-memory')) {
    this.root = resolve(root)
    this.busy = false
  }
  async checkPath(path) {
    const local = relative(this.root, resolve(path))
    if (local.startsWith('..') || resolve(path) === resolve(this.root, '..'))
      throw Error('路徑超出本機工作目錄')
    let current = this.root
    for (const segment of ['', ...local.split('/').filter(Boolean)]) {
      current = segment ? join(current, segment) : current
      try {
        if ((await lstat(current)).isSymbolicLink()) throw Error('工作目錄不能包含符號連結')
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
    return path
  }
  async read() {
    await this.checkPath(join(this.root, 'journey.json'))
    try {
      return JSON.parse(await readFile(join(this.root, 'journey.json'), 'utf8'))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      return JSON.parse(await readFile(join(project, 'content/journey.json'), 'utf8'))
    }
  }
  mediaPath(url) {
    if (typeof url !== 'string' || !/^\/media\/[a-f0-9]{64}\/(?:view|thumb)\.webp$/.test(url))
      throw Error('圖片路徑不合法')
    return join(this.root, url.slice(1))
  }
  async validate(data, { maxFiles = 20000, maxBytes = 25 * 1024 * 1024 } = {}) {
    const errors = [],
      warnings = [],
      ids = new Set(),
      paths = new Set()
    const problem = (message) => errors.push(message)
    if (
      data?.schemaVersion !== 1 ||
      !isText(data.title) ||
      data.totalDays !== 18 ||
      !Array.isArray(data.days) ||
      data.days.length !== 18 ||
      !Array.isArray(data.regions)
    )
      return { errors: ['旅程必須包含完整 18 天與有效的內容格式'], warnings }
    for (const region of data.regions) {
      if (!safeId(region.id) || !isText(region.title) || !coordinate(region.anchor))
        problem('區域入口格式不正確')
    }
    for (const [index, day] of data.days.entries()) {
      const expected = new Date(Date.UTC(2026, 8, 23 + index))
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', '/')
      if (
        !safeId(day.id) ||
        ids.has(day.id) ||
        day.number !== index + 1 ||
        day.date !== expected ||
        !isText(day.title) ||
        !isText(day.summary) ||
        !Array.isArray(day.memories) ||
        !Array.isArray(day.regionIds) ||
        day.regionIds.some((id) => !data.regions.some((r) => r.id === id))
      ) {
        problem(`第 ${index + 1} 天格式或日期錯誤`)
        continue
      }
      ids.add(day.id)
      for (const memory of day.memories) {
        const label = `Day ${day.number} · ${memory.title || '未命名回憶'}`
        if (!safeId(memory.id) || ids.has(memory.id)) problem(`${label}：識別重複或不合法`)
        ids.add(memory.id)
        if (
          ![memory.title, memory.locationName, memory.story, memory.remarks ?? ''].every(isText) ||
          !Array.isArray(memory.photos)
        ) {
          problem(`${label}：文字或照片格式不正確`)
          continue
        }
        if (
          !['confirmed', 'pending', 'flight'].includes(memory.locationStatus) ||
          (memory.coordinate !== null && !coordinate(memory.coordinate)) ||
          (memory.locationStatus === 'confirmed' && !coordinate(memory.coordinate)) ||
          (memory.locationStatus !== 'confirmed' && memory.coordinate !== null)
        )
          problem(`${label}：請確認位置狀態與座標`)
        if (
          memory.locationStatus === 'confirmed' &&
          coordinate(memory.coordinate) &&
          (memory.coordinate[0] < -25 ||
            memory.coordinate[0] > -12 ||
            memory.coordinate[1] < 63 ||
            memory.coordinate[1] > 68)
        )
          problem(`${label}：冰島地圖座標超出範圍，航程請使用故事卡`)
        if (
          memory.coordinateSource &&
          !/^https:\/\/(?:www\.openstreetmap\.org\/(?:node|way|relation)\/\d+|maps\.app\.goo\.gl\/[A-Za-z0-9]+|share\.google\/[A-Za-z0-9]+|www\.google\.com\/maps\/@[^\s#]+)$/.test(
            memory.coordinateSource,
          )
        )
          problem(`${label}：景點參考來源不合法`)
        if (!memory.photos.length) warnings.push(`${label}：待補照片`)
        if (memory.locationStatus === 'pending') warnings.push(`${label}：位置待確認`)
        if (!memory.story.trim()) warnings.push(`${label}：待補共同短文`)
        const photoIds = new Set()
        for (const photo of memory.photos) {
          if (
            !safeId(photo.id) ||
            photoIds.has(photo.id) ||
            !isText(photo.alt) ||
            !isText(photo.caption ?? '') ||
            !Number.isInteger(photo.width) ||
            !Number.isInteger(photo.height) ||
            photo.width < 1 ||
            photo.height < 1
          )
            problem(`${label}：照片資訊不正確`)
          photoIds.add(photo.id)
          for (const url of [photo.src, photo.thumbnail]) {
            try {
              const path = await this.checkPath(this.mediaPath(url))
              const stat = await lstat(path)
              if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxBytes) throw Error()
              paths.add(path)
            } catch {
              problem(
                `${label}：展示圖片遺失或不合法（${typeof url === 'string' ? url : '未指定'}）`,
              )
            }
          }
        }
      }
    }
    if (paths.size + 20 > maxFiles) problem(`展示檔案超出 ${maxFiles} 個上限`)
    return { errors: [...new Set(errors)], warnings }
  }
  async save(data) {
    const report = await this.validate(data)
    if (report.errors.length) throw Error(report.errors.join('\n'))
    await this.checkPath(join(this.root, 'journey.json'))
    await mkdir(this.root, { recursive: true })
    const temp = join(this.root, `journey-${randomUUID()}.tmp`)
    await writeFile(temp, JSON.stringify(data, null, 2) + '\n')
    await rename(temp, join(this.root, 'journey.json'))
    return report
  }
  async importPhoto(buffer, name) {
    if (!/\.(jpe?g|png|webp)$/i.test(name))
      throw Error('僅支援 JPEG、PNG、WebP；HEIC 請先轉成 JPEG。')
    const meta = await sharp(buffer, { limitInputPixels: 80000000, failOn: 'error' }).metadata()
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages ?? 1) > 1)
      throw Error('請使用靜態 JPEG、PNG 或 WebP 圖片')
    const digest = createHash('sha256').update(buffer).digest('hex')
    await this.checkPath(join(this.root, 'originals'))
    await this.checkPath(join(this.root, 'media', digest))
    const folder = join(this.root, 'media', digest)
    const temporary = join(this.root, 'media', `${digest}-${randomUUID()}`)
    await mkdir(temporary, { recursive: true })
    try {
      for (const [kind, size, quality] of [
        ['thumb', 480, 78],
        ['view', 1920, 86],
      ])
        await sharp(buffer)
          .autoOrient()
          .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
          .webp({ quality })
          .toFile(join(temporary, `${kind}.webp`))
      await mkdir(join(this.root, 'originals'), { recursive: true })
      await writeFile(join(this.root, 'originals', `${digest}.${meta.format}`), buffer, {
        flag: 'wx',
      }).catch((error) => {
        if (error.code !== 'EEXIST') throw error
      })
      try {
        await rename(temporary, folder)
      } catch (error) {
        if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error
      }
    } finally {
      await rm(temporary, { recursive: true, force: true })
    }
    const image = await sharp(join(folder, 'view.webp')).metadata()
    return {
      id: digest,
      src: `/media/${digest}/view.webp`,
      thumbnail: `/media/${digest}/thumb.webp`,
      width: image.width,
      height: image.height,
      alt: name.replace(/\.[^.]+$/, ''),
      caption: '',
    }
  }
  async export() {
    if (this.busy) throw Error('已有匯出進行中，請稍候')
    this.busy = true
    const staging = join(this.root, `export-${randomUUID()}`)
    try {
      const data = await this.read(),
        report = await this.validate(data)
      if (report.errors.length) throw Error(report.errors.join('\n'))
      await this.checkPath(staging)
      await this.checkPath(join(this.root, 'export'))
      await this.checkPath(join(this.root, 'export-previous'))
      await build({
        root: project,
        base: './',
        logLevel: 'warn',
        build: { outDir: staging, emptyOutDir: true },
      })
      // Only explicit public fields and referenced display files may leave the workspace.
      const published = publicContent(data)
      await writeFile(join(staging, 'journey.json'), JSON.stringify(published))
      const media = new Set(
        data.days.flatMap((d) =>
          d.memories.flatMap((m) => m.photos.flatMap((p) => [p.src, p.thumbnail])),
        ),
      )
      for (const url of media) {
        const dest = join(staging, url.slice(1))
        await mkdir(dirname(dest), { recursive: true })
        await cp(await this.checkPath(this.mediaPath(url)), dest)
      }
      const files = await allFiles(staging)
      if (files.length > 20000) throw Error('匯出超出免費靜態檔案數限制')
      for (const file of files)
        if ((await lstat(file)).size > 25 * 1024 * 1024)
          throw Error(`檔案超過 25 MiB：${relative(staging, file)}`)
      const output = join(this.root, 'export'),
        backup = join(this.root, 'export-previous')
      await rm(backup, { recursive: true, force: true })
      try {
        await rename(output, backup)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      try {
        await rename(staging, output)
      } catch (error) {
        await rename(backup, output).catch(() => {})
        throw error
      }
      return {
        ...report,
        files: files.length,
        photos: media.size / 2,
        output: '.local-memory/export',
        url: '/export/',
      }
    } finally {
      this.busy = false
      await rm(staging, { recursive: true, force: true })
    }
  }
}
export function coordinate(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(Number.isFinite) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  )
}
function publicContent(data) {
  return {
    schemaVersion: 1,
    title: data.title,
    totalDays: 18,
    regions: data.regions.map(({ id, title, anchor }) => ({ id, title, anchor })),
    days: data.days.map((d) => ({
      id: d.id,
      number: d.number,
      date: d.date,
      title: d.title,
      summary: d.summary,
      regionIds: [...d.regionIds],
      notes: (d.notes ?? []).filter((note) => isText(note) && !note.startsWith('行程更正')),
      memories: d.memories.map((m) => ({
        id: m.id,
        title: m.title,
        locationName: m.locationName,
        coordinate: m.coordinate,
        coordinateSource: m.coordinateSource || undefined,
        locationStatus: m.locationStatus,
        story: m.story,
        remarks: m.remarks ?? '',
        photos: m.photos.map((p) => ({
          id: p.id,
          src: p.src,
          thumbnail: p.thumbnail,
          width: p.width,
          height: p.height,
          alt: p.alt,
          caption: p.caption ?? '',
        })),
      })),
    })),
  }
}
export async function allFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? allFiles(join(folder, e.name)) : [join(folder, e.name)],
      ),
    )
  ).flat()
}
