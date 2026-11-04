import { MemoryWorkspace } from './lib/workspace.mjs'
try {
  const result = await new MemoryWorkspace(process.env.MEMORY_WORKSPACE || undefined).export()
  console.log(
    `匯出完成：${result.output}（${result.files} 個檔案）\n${result.warnings.length} 個待補項目；原始照片與編輯服務不在公開成品中。`,
  )
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
