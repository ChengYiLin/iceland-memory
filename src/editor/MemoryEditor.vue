<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { Collection } from '@/types/content'
const data = ref<Collection>()
const dayId = ref('day-06')
const memoryId = ref('')
const day = computed(() => data.value?.days.find((d) => d.id === dayId.value))
const memory = computed(() => day.value?.memories.find((m) => m.id === memoryId.value))
const dirty = ref(false),
  busy = ref(false),
  message = ref(''),
  errors = ref<string[]>([]),
  warnings = ref<string[]>([])
const imported = ref(0),
  totalImport = ref(0),
  dragged = ref<number | null>(null)
const coordinateText = computed({
  get: () => memory.value?.coordinate?.join(', ') ?? '',
  set: (value: string) => {
    if (!memory.value) return
    const parts = value.split(',').map((s) => Number(s.trim()))
    memory.value.coordinate =
      value.trim() && parts.length === 2 ? (parts as [number, number]) : null
    memory.value.coordinateSource = undefined
    dirty.value = true
  },
})
async function request(path: string, body: BodyInit = '{}') {
  const response = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'X-Memory-Editor': '1' },
    body,
  })
  const value = await response.json()
  if (!response.ok) throw Error(value.error || '操作失敗')
  return value
}
async function load() {
  try {
    const response = await fetch('/api/journey')
    if (!response.ok) throw Error('請使用 npm run editor 啟動本機工具')
    data.value = await response.json()
    memoryId.value = day.value?.memories[0]?.id ?? ''
  } catch (error) {
    message.value = String(error)
  }
}
function locationChanged() {
  if (memory.value && memory.value.locationStatus !== 'confirmed') {
    memory.value.coordinate = null
    memory.value.coordinateSource = undefined
  }
}
function chooseDay(id: string) {
  if (dirty.value && !confirm('有未儲存內容。要先留在這裡儲存嗎？按「確定」留在此頁。')) {
  } else if (dirty.value) return
  dayId.value = id
  memoryId.value = day.value?.memories[0]?.id ?? ''
}
async function action(work: () => Promise<void>) {
  busy.value = true
  message.value = ''
  errors.value = []
  try {
    await work()
  } catch (error) {
    message.value = String(error)
  } finally {
    busy.value = false
  }
}
async function save() {
  await action(async () => {
    if (!data.value) return
    const result = await request('save', JSON.stringify(data.value))
    dirty.value = false
    warnings.value = result.warnings
    message.value = '已儲存到本機檔案，關閉後可繼續整理。'
  })
}
async function check() {
  await action(async () => {
    const result = await request('check')
    errors.value = result.errors
    warnings.value = result.warnings
    message.value = `檢查完成：${result.errors.length} 個錯誤、${result.warnings.length} 個待補項目（依已儲存版本）`
  })
}
async function exportSite() {
  if (dirty.value) {
    message.value = '請先儲存修改，再匯出正式成品。'
    return
  }
  await action(async () => {
    const result = await request('export')
    warnings.value = result.warnings
    message.value = `靜態匯出完成：${result.files} 個檔案、${result.photos} 張照片。成品位於 .local-memory/export，可關閉工具後獨立部署。`
  })
}
async function importFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  const target = memory.value
  if (!target) return
  await action(async () => {
    totalImport.value = files.length
    imported.value = 0
    for (const file of files) {
      try {
        const photo = await request(`photos?name=${encodeURIComponent(file.name)}`, file)
        if (!target.photos.some((p) => p.id === photo.id)) target.photos.push(photo)
        dirty.value = true
      } catch (error) {
        errors.value.push(`${file.name}：${String(error)}`)
      }
      imported.value++
    }
    message.value = `已處理 ${files.length} 個檔案。新增照片後請按儲存。`
  })
  input.value = ''
}
function move(index: number, to: number) {
  if (!memory.value || to < 0 || to >= memory.value.photos.length) return
  const photo = memory.value.photos.splice(index, 1)[0]
  if (photo) memory.value.photos.splice(to, 0, photo)
  dirty.value = true
}
function removePhoto(index: number) {
  memory.value?.photos.splice(index, 1)
  dirty.value = true
}
function drop(index: number) {
  if (dragged.value !== null) move(dragged.value, index)
  dragged.value = null
}
function leave(event: BeforeUnloadEvent) {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onMounted(() => {
  load()
  window.addEventListener('beforeunload', leave)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', leave))
</script>
<template>
  <div class="editor-shell">
    <header class="editor-header">
      <a href="/" target="_blank" rel="noopener">ICELAND MEMORY ↗</a><span>本機回憶整理室</span
      ><small>只存於這台電腦</small>
    </header>
    <div v-if="!data" class="editor-loading" role="status">
      {{ message || '正在打開旅行手帳…' }}
    </div>
    <template v-else>
      <aside class="editor-sidebar">
        <p class="eyebrow">18 DAYS · OUR MEMORIES</p>
        <h1>把當時的故事<br />留在這裡。</h1>
        <p class="editor-hint">
          選一天、選一段回憶，再加入照片。原檔會另外保存，網站只匯出展示版本。
        </p>
        <label
          >旅行日<select
            :value="dayId"
            :disabled="busy"
            @change="chooseDay(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="d in data.days" :key="d.id" :value="d.id">
              Day {{ d.number }} · {{ d.date.slice(5) }} {{ d.title }}
            </option>
          </select></label
        >
        <nav aria-label="回憶清單">
          <button
            v-for="(m, index) in day?.memories"
            :key="m.id"
            :class="{ active: m.id === memoryId }"
            :disabled="busy"
            @click="memoryId = m.id"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span
            ><span
              >{{ m.title
              }}<small
                >{{ m.photos.length ? `${m.photos.length} 張照片` : '待補照片' }} ·
                {{
                  m.locationStatus === 'pending'
                    ? '位置待確認'
                    : m.locationStatus === 'flight'
                      ? '航程故事'
                      : '已設定位置'
                }}</small
              ></span
            >
          </button>
        </nav>
      </aside>
      <main v-if="memory" class="editor-main">
        <div class="editor-toolbar">
          <p>
            {{ day?.date }} <strong>DAY {{ day?.number }}</strong>
          </p>
          <span>{{ dirty ? '● 有未儲存修改' : '已儲存版本' }}</span
          ><button class="primary" :disabled="busy || !dirty" @click="save">
            {{ busy ? '處理中…' : '儲存修改' }}
          </button>
        </div>
        <div class="editor-fields" @input="dirty = true" @change="dirty = true">
          <label>回憶名稱<input v-model="memory.title" :disabled="busy" /></label
          ><label>地點或位置線索<input v-model="memory.locationName" :disabled="busy" /></label>
          <label>共同短文<textarea v-model="memory.story" rows="5" :disabled="busy" /></label
          ><label
            >旅伴補充（選填）<textarea v-model="memory.remarks" rows="2" :disabled="busy" />
          </label>
          <div class="location-fields">
            <label
              >位置狀態<select
                v-model="memory.locationStatus"
                :disabled="busy"
                @change="locationChanged"
              >
                <option value="pending">位置待確認 · 從清單開啟</option>
                <option value="confirmed">已確認冰島位置</option>
                <option value="flight">航程與返家故事卡</option>
              </select></label
            ><label v-if="memory.locationStatus === 'confirmed'"
              >經度, 緯度<input
                v-model="coordinateText"
                placeholder="經度, 緯度（不填猜測座標）"
                :disabled="busy"
            /></label>
          </div>
        </div>
        <p
          v-if="memory.coordinateSource && memory.locationStatus === 'confirmed'"
          class="editor-hint"
        >
          此位置依公開具名景點定位，是景點參考點，不代表你們實際拍照或停車的位置。<a
            :href="memory.coordinateSource"
            target="_blank"
            rel="noopener"
            >查看地點來源 ↗</a
          >
        </p>
        <section class="editor-photos">
          <div class="section-heading">
            <div>
              <p class="eyebrow">SELECTED MOMENTS</p>
              <h2>
                這段回憶的照片 <small>{{ memory.photos.length }}</small>
              </h2>
            </div>
            <label class="upload-button"
              >＋ 加入照片<input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                :disabled="busy"
                @change="importFiles"
            /></label>
          </div>
          <p class="editor-hint">
            JPEG、PNG、WebP · 自動轉正與壓縮 ·
            第一張作封面。可拖曳排序，也可用按鈕移動。加入後請儲存。
          </p>
          <p v-if="busy && totalImport" role="status">
            正在處理 {{ imported }} / {{ totalImport }}
          </p>
          <div v-if="!memory.photos.length" class="photo-empty">
            照片下週再補也沒關係。<br /><small
              >故事已經可以先寫，原始照片不會出現在公開網站。</small
            >
          </div>
          <ol class="photo-grid">
            <li
              v-for="(photo, index) in memory.photos"
              :key="photo.id"
              :draggable="!busy"
              @dragstart="dragged = index"
              @dragover.prevent
              @drop.prevent="drop(index)"
            >
              <img :src="photo.thumbnail" :alt="photo.alt" /><span class="photo-badge">{{
                index === 0 ? '代表照片' : `第 ${index + 1} 張`
              }}</span
              ><label
                >照片描述<input v-model="photo.alt" :disabled="busy" @input="dirty = true" /></label
              ><label
                >照片說明<input v-model="photo.caption" :disabled="busy" @input="dirty = true"
              /></label>
              <div class="photo-actions">
                <button :disabled="busy || index === 0" @click="move(index, 0)">設為封面</button
                ><button
                  :disabled="busy || index === 0"
                  aria-label="照片往前移"
                  @click="move(index, index - 1)"
                >
                  ←</button
                ><button
                  :disabled="busy || index === memory.photos.length - 1"
                  aria-label="照片往後移"
                  @click="move(index, index + 1)"
                >
                  →</button
                ><button :disabled="busy" @click="removePhoto(index)">移除</button>
              </div>
            </li>
          </ol>
        </section>
        <section class="export-panel">
          <h2>預覽，然後好好留下。</h2>
          <p>儲存內容後檢查並匯出。成品只包含網站、故事與精選圖片。</p>
          <div>
            <a
              class="secondary"
              :href="`/?day=${dayId}&memory=${memoryId}`"
              target="_blank"
              rel="noopener"
              >觀看目前內容 ↗</a
            ><button :disabled="busy" @click="check">檢查待補項目</button
            ><button class="primary" :disabled="busy || dirty" @click="exportSite">
              {{ busy ? '處理中…' : '匯出靜態網站' }}</button
            ><a href="/export/" target="_blank" rel="noopener">開啟已匯出成品 ↗</a>
          </div>
        </section>
        <p v-if="message" class="editor-message" role="status">{{ message }}</p>
        <ul v-if="errors.length" class="editor-errors" role="alert">
          <li v-for="e in errors" :key="e">{{ e }}</li>
        </ul>
        <details v-if="warnings.length">
          <summary>{{ warnings.length }} 個待補項目</summary>
          <ul>
            <li v-for="w in warnings" :key="w">{{ w }}</li>
          </ul>
        </details>
      </main>
    </template>
  </div>
</template>
