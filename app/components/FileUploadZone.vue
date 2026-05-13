<template>
  <div class="space-y-3">
    <!-- Server-stored documents (prihláška: document_ids) -->
    <template v-if="documentUpload">
      <div
        v-if="documentIdList.length"
        class="space-y-2"
      >
        <div
          v-for="(doc, idx) in documentRows"
          :key="doc.id"
          class="flex items-center gap-3 p-3 bg-white rounded border border-gray-200"
        >
          <File class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 truncate">{{ doc.name }}</p>
            <p class="text-xs text-gray-500">ID {{ doc.id }}</p>
          </div>
          <button
            type="button"
            :disabled="documentUploading"
            @click="removeDocumentId(idx)"
            class="text-red-600 hover:text-red-800 flex-shrink-0 disabled:opacity-50"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="[
          'relative rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
          (hasError || uploadError) && 'border-danger-300 bg-danger-50',
        ]"
      >
        <input
          ref="fileInput"
          type="file"
          :accept="acceptTypes"
          :multiple="allowMultiple"
          class="hidden"
          @change="handleFileSelect"
        />

        <div
          class="text-center cursor-pointer"
          :class="documentUploading ? 'pointer-events-none opacity-60' : ''"
          @click="fileInput?.click()"
        >
          <Upload class="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p class="text-sm font-medium text-gray-700">
            {{
              documentUploading
                ? 'Nahrávam na server…'
                : documentIdList.length
                  ? 'Pridať ďalšiu prílohu'
                  : 'Presuňte súbory sem alebo kliknite na výber'
            }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Súbory sa hneď odošlú na server (PDF alebo DOCX). Max.
            {{ formatBytes(maxFileSize) }} na súbor</p>
        </div>
      </div>

      <span
        v-if="uploadError"
        class="text-xs text-danger-600"
        >{{ uploadError }}</span
      >
    </template>

    <!-- Lokálne súbory (legacy / iné formuláre) -->
    <template v-else>
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="[
          'relative rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
          hasError && 'border-danger-300 bg-danger-50',
        ]"
      >
        <input
          ref="fileInput"
          type="file"
          :accept="acceptTypes"
          :multiple="allowMultiple"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Empty state -->
        <div
          v-if="selectedFiles.length === 0"
          class="text-center cursor-pointer"
          @click="fileInput?.click()"
        >
          <Upload class="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p class="text-sm font-medium text-gray-700">Presuňte súbory sem alebo kliknite na výber</p>
          <p class="text-xs text-gray-500 mt-1">Maximálna veľkosť {{ formatBytes(maxFileSize) }} na súbor</p>
        </div>

        <!-- Files list -->
        <div
          v-else
          class="space-y-2"
        >
          <div
            v-for="(file, idx) in selectedFiles"
            :key="idx"
            class="flex items-center gap-3 p-3 bg-white rounded border border-gray-200"
          >
            <File class="w-4 h-4 text-gray-400 flex-shrink-0" />

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">{{ file.name }}</p>
              <p class="text-xs text-gray-500">{{ formatBytes(file.size) }}</p>
            </div>

            <!-- Progress bar -->
            <div
              v-if="uploadProgress[idx]"
              class="w-20 h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-blue-500 transition-all"
                :style="{ width: uploadProgress[idx] + '%' }"
              />
            </div>

            <!-- Remove button -->
            <button
              v-if="uploadProgress[idx] === undefined || uploadProgress[idx] === 100"
              type="button"
              @click="removeFile(idx)"
              class="text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Add more -->
          <button
            v-if="allowMultiple && selectedFiles.length < 5"
            type="button"
            @click="fileInput?.click()"
            class="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            + Pridať ďalší súbor
          </button>
        </div>
      </div>
    </template>

    <!-- Error message -->
    <span
      v-if="hasError"
      class="text-xs text-danger-600"
      >{{ error }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Upload, File, X } from 'lucide-vue-next'

interface Props {
  /** Lokálne súbory alebo (pri documentUpload) ID nahratých dokumentov na serveri */
  modelValue?: File | File[] | number | number[] | undefined
  maxFileSize?: number // bytes, default 10MB
  allowMultiple?: boolean
  accept?: string // MIME types comma-separated, e.g., 'image/*,application/pdf'
  error?: string
  /** Ak true, súbory sa po výbere odošlú na POST /documents a do modelu sa uložia číselné ID (pre prihlášku). */
  documentUpload?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: File | File[] | number | number[] | undefined): void
  (e: 'change', files: File[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowMultiple: false,
  accept: '*',
  documentUpload: false,
})

const emit = defineEmits<Emits>()

const api = useApi()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])
const uploadProgress = ref<Record<number, number>>({})
const uploadError = ref('')

type DocRow = { id: number; name: string }

const documentRows = ref<DocRow[]>([])
const documentUploading = ref(false)

const acceptTypes = computed(() => {
  return props.accept === '*' ? '' : props.accept
})

const hasError = computed(() => !!props.error)

function normalizeDocumentIds(val: unknown): number[] {
  if (Array.isArray(val)) {
    return val.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
  }
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
    return [val]
  }
  return []
}

const documentIdList = computed(() => normalizeDocumentIds(props.modelValue))

function emitDocumentIds(ids: number[]) {
  const capped = props.allowMultiple ? ids.slice(0, 5) : ids.slice(0, 1)
  if (props.allowMultiple) {
    emit('update:modelValue', capped.length ? capped : [])
  } else {
    emit('update:modelValue', capped[0])
  }
  emit('change', [])
}

async function fetchDocumentName(id: number): Promise<string> {
  try {
    const raw = (await api.get(`/documents/${id}`)) as {
      current_version?: { file_name?: string }
    }
    return raw?.current_version?.file_name ?? `Dokument #${id}`
  } catch {
    return `Dokument #${id}`
  }
}

async function syncDocumentRowsFromModel() {
  if (!props.documentUpload) return
  const ids = documentIdList.value
  const prevNames = new Map(documentRows.value.map((r) => [r.id, r.name]))
  documentRows.value = ids.map((id) => ({
    id,
    name: prevNames.get(id) ?? `Dokument #${id}`,
  }))
  for (let i = 0; i < documentRows.value.length; i++) {
    const row = documentRows.value[i]
    if (!row) continue
    const placeholder = `Dokument #${row.id}`
    if (row.name === placeholder) {
      const name = await fetchDocumentName(row.id)
      const cur = documentRows.value[i]
      if (cur && cur.id === row.id) {
        cur.name = name
      }
    }
  }
}

watch(
  () => [props.documentUpload, props.modelValue] as const,
  () => {
    if (props.documentUpload) {
      void syncDocumentRowsFromModel()
    }
  },
  { immediate: true, deep: true },
)

const handleDrop = (event: DragEvent) => {
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files) {
    processFiles(Array.from(files))
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
  }
}

async function uploadOneDocument(file: File): Promise<number> {
  const body = new FormData()
  body.append('file', file)
  const res = (await api.post('/documents', body)) as { document_id?: number; data?: { document_id?: number } }
  const id = res?.document_id ?? res?.data?.document_id
  if (id == null || !Number.isFinite(Number(id))) {
    throw new Error('Neplatná odpoveď servera pri nahrávaní dokumentu')
  }
  return Number(id)
}

const processFiles = async (files: File[]) => {
  uploadError.value = ''

  if (props.documentUpload) {
    const current = [...documentIdList.value]
    const incoming = files.filter((f) => f.size <= props.maxFileSize)
    if (incoming.length < files.length) {
      uploadError.value = `Niektoré súbory presahujú limit ${formatBytes(props.maxFileSize)}.`
    }
    const toAdd = props.allowMultiple ? incoming : incoming.slice(0, 1)
    const maxTotal = props.allowMultiple ? 5 : 1
    documentUploading.value = true
    try {
      for (const file of toAdd) {
        if (current.length >= maxTotal) break
        try {
          const docId = await uploadOneDocument(file)
          current.push(docId)
          emitDocumentIds(current)
        } catch (e: unknown) {
          const err = e as { data?: { message?: string }; message?: string; statusMessage?: string }
          uploadError.value = String(
            err?.data?.message ?? err?.message ?? err?.statusMessage
              ?? 'Nahrávanie zlyhalo (skontrolujte typ súboru: PDF alebo DOCX).',
          )
        }
      }
    } finally {
      documentUploading.value = false
    }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  const validFiles: File[] = []

  for (const file of files) {
    if (file.size > props.maxFileSize) {
      console.warn(`File ${file.name} exceeds max size of ${formatBytes(props.maxFileSize)}`)
      continue
    }

    validFiles.push(file)
  }

  if (!props.allowMultiple) {
    selectedFiles.value = validFiles.slice(0, 1)
  } else {
    selectedFiles.value = [...selectedFiles.value, ...validFiles].slice(0, 5)
  }

  const valueToEmit = props.allowMultiple ? selectedFiles.value : selectedFiles.value[0] || undefined
  emit('update:modelValue', valueToEmit)
  emit('change', selectedFiles.value)

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  const valueToEmit = props.allowMultiple ? selectedFiles.value : selectedFiles.value[0] || undefined
  emit('update:modelValue', valueToEmit)
  emit('change', selectedFiles.value)
}

const removeDocumentId = (index: number) => {
  const ids = [...documentIdList.value]
  ids.splice(index, 1)
  emitDocumentIds(ids)
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

defineExpose({
  formatBytes,
})
</script>
