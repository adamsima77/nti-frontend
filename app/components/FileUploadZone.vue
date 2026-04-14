<template>
  <div class="space-y-3">
    <!-- Drop zone -->
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

    <!-- Error message -->
    <span
      v-if="hasError"
      class="text-xs text-danger-600"
      >{{ error }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, File, X } from 'lucide-vue-next'

interface Props {
  modelValue?: File | File[] | undefined
  maxFileSize?: number // bytes, default 10MB
  allowMultiple?: boolean
  accept?: string // MIME types comma-separated, e.g., 'image/*,application/pdf'
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: File | File[] | undefined): void
  (e: 'change', files: File[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowMultiple: false,
  accept: '*',
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])
const uploadProgress = ref<Record<number, number>>({})

const acceptTypes = computed(() => {
  return props.accept === '*' ? '' : props.accept
})

const hasError = computed(() => !!props.error)

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

const processFiles = (files: File[]) => {
  const validFiles: File[] = []

  for (const file of files) {
    // Validate file size
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

  // Emit update
  const valueToEmit = props.allowMultiple ? selectedFiles.value : selectedFiles.value[0] || undefined
  emit('update:modelValue', valueToEmit)
  emit('change', selectedFiles.value)

  // Reset input
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
