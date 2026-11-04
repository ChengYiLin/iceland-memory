import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { MemoryWorkspace, allFiles } from '../lib/workspace.mjs'

test('traveler-provided Google location sources survive saving while other URLs are rejected', async () => {
  const root = await mkdtemp(join(tmpdir(), 'iceland-location-source-'))
  try {
    const work = new MemoryWorkspace(root)
    const data = await work.read()
    const memory = data.days[1].memories[1]
    memory.locationStatus = 'confirmed'
    memory.coordinate = [-21.9255345, 64.1446917]
    for (const source of [
      'https://maps.app.goo.gl/42QUGD3EYgpSGcHy5',
      'https://share.google/XXgQTg2l4tXg2znTz',
      'https://www.google.com/maps/@64.9375359,-23.3568645,13a,75y,247.55h,94.75t/data=!3m4!1e1!3m2!1slRVuq_jYjXHJAwOzgQ3p7g!2e0',
    ]) {
      memory.coordinateSource = source
      await work.save(data)
      assert.equal((await work.read()).days[1].memories[1].coordinateSource, source)
    }
    for (const source of [
      'javascript:alert(1)',
      'https://maps.app.goo.gl.example.com/place',
      'https://share.google@example.com/place',
      'http://maps.app.goo.gl/42QUGD3EYgpSGcHy5',
      'https://www.google.com.example.com/maps/@64.9375359,-23.3568645',
      'https://www.google.com/maps-redirect/@64.9375359,-23.3568645',
    ]) {
      memory.coordinateSource = source
      await assert.rejects(work.save(data), /景點參考來源不合法/)
    }
    assert.equal(
      (await work.read()).days[1].memories[1].coordinateSource,
      'https://www.google.com/maps/@64.9375359,-23.3568645,13a,75y,247.55h,94.75t/data=!3m4!1e1!3m2!1slRVuq_jYjXHJAwOzgQ3p7g!2e0',
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a memory survives reopening and exports only its public display files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'iceland-workspace-'))
  try {
    const work = new MemoryWorkspace(root)
    const data = await work.read()
    const memory = data.days[5].memories[0]
    data.days[5].notes = ['行程更正：取消珍珠樓。', '一起留下的旅行片刻']
    memory.story = '森林溫泉的回憶'
    const image = await sharp({
      create: { width: 80, height: 120, channels: 3, background: '#668877' },
    })
      .jpeg()
      .toBuffer()
    memory.photos = [await work.importPhoto(image, 'portrait.jpg')]
    data.privateNote = 'PRIVATE_NEVER_PUBLISH'
    await work.save(data)
    const reopened = await new MemoryWorkspace(root).read()
    assert.equal(reopened.days[5].memories[0].story, '森林溫泉的回憶')
    assert.equal(reopened.days[5].memories[0].photos.length, 1)
    const display = await sharp(await readFile(work.mediaPath(memory.photos[0].src))).metadata()
    assert.equal(display.width, 80)
    assert.equal(display.height, 120)
    assert.equal(display.exif, undefined)
    const errors = await work.validate(reopened)
    assert.equal(errors.errors.length, 0)
    assert.ok(errors.warnings.length > 0)
    const limits = await work.validate(reopened, { maxFiles: 19 })
    assert.ok(limits.errors.some((message) => message.includes('上限')))
    await work.export()
    const published = await readFile(join(root, 'export', 'journey.json'), 'utf8')
    assert.equal(published.includes('PRIVATE_NEVER_PUBLISH'), false)
    assert.equal(JSON.parse(published).days[5].memories[0].photos.length, 1)
    assert.deepEqual(JSON.parse(published).days[5].notes, ['一起留下的旅行片刻'])
    const files = await allFiles(join(root, 'export'))
    assert.equal(
      files.some((path) => /originals|editor\.html/.test(path)),
      false,
    )
    assert.deepEqual(await readFile(join(root, 'originals', memory.photos[0].id + '.jpeg')), image)
    for (const file of files.filter((path) => path.endsWith('.js')))
      assert.equal((await readFile(file, 'utf8')).includes('/api/save'), false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('invalid location saves retain the previous content with an actionable error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'iceland-invalid-'))
  try {
    const work = new MemoryWorkspace(root),
      data = await work.read()
    await work.save(data)
    data.days[0].memories[0].locationStatus = 'confirmed'
    data.days[0].memories[0].coordinate = null
    await assert.rejects(work.save(data), /位置狀態與座標/)
    assert.equal((await work.read()).days[0].memories[0].locationStatus, 'flight')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('photo import refuses managed directory symlinks instead of writing outside the workspace', async () => {
  const { mkdir, symlink, readdir } = await import('node:fs/promises')
  const root = await mkdtemp(join(tmpdir(), 'iceland-confined-')),
    outside = await mkdtemp(join(tmpdir(), 'iceland-outside-'))
  try {
    await mkdir(root, { recursive: true })
    await symlink(outside, join(root, 'originals'))
    const image = await sharp({
      create: { width: 30, height: 30, channels: 3, background: '#aaaaaa' },
    })
      .jpeg()
      .toBuffer()
    await assert.rejects(new MemoryWorkspace(root).importPhoto(image, 'photo.jpg'), /符號連結/)
    assert.deepEqual(await readdir(outside), [])
  } finally {
    await rm(root, { recursive: true, force: true })
    await rm(outside, { recursive: true, force: true })
  }
})

test('bad imports and missing display references do not replace a valid saved version', async () => {
  const root = await mkdtemp(join(tmpdir(), 'iceland-recovery-'))
  try {
    const work = new MemoryWorkspace(root),
      data = await work.read()
    await work.save(data)
    await assert.rejects(work.importPhoto(Buffer.from('broken image'), 'broken.jpg'))
    await assert.rejects(work.importPhoto(Buffer.from('not supported'), 'photo.heic'), /HEIC/)
    data.days[0].memories[0].photos = [
      {
        id: 'missing',
        src: '/media/' + 'a'.repeat(64) + '/view.webp',
        thumbnail: '/media/' + 'a'.repeat(64) + '/thumb.webp',
        width: 100,
        height: 100,
        alt: 'missing',
      },
    ]
    await assert.rejects(work.save(data), /展示圖片遺失/)
    assert.equal((await work.read()).days[0].memories[0].photos.length, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
