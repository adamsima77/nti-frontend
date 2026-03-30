<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium text-navy mb-1.5"
    >
      {{ label }}
    </label>
    <div
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed pointer-events-none border-gray-200'
          : isDragging
            ? 'border-blue-400 bg-blue-50/30'
            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer',
      ]"
      @click="openFilePicker"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <Upload class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-sm text-gray-500 mb-1">{{ description }}</p>
      <p class="text-xs text-gray-400">{{ accept }}</p>
    </div>
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onFileSelect"
    />

    <!-- Selected files -->
    <div
      v-if="fileList.length"
      class="mt-3 space-y-2"
    >
      <div
        v-for="(file, i) in fileList"
        :key="file.name + i"
        class="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
      >
        <div class="flex items-center gap-2 min-w-0">
          <FileIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span class="text-sm text-navy truncate">{{ file.name }}</span>
          <span class="text-xs text-gray-400 flex-shrink-0">{{ formatSize(file.size) }}</span>
        </div>
        <button
          type="button"
          class="p-1 text-gray-400 hover:text-danger-500 transition-colors flex-shrink-0"
          @click.stop="removeFile(i)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, File as FileIcon, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: File | File[] | null
    accept?: string
    maxSize?: number
    multiple?: boolean
    label?: string
    description?: string
    disabled?: boolean
  }>(),
  {
    accept: '.pdf,.docx,.doc,.jpg,.png',
    maxSize: 10,
    multiple: false,
    label: undefined,
    description: 'Presuňte súbor sem alebo kliknite',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const fileList = computed<File[]>(() => {
  if (!props.modelValue) return []
  return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
})

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    handleFiles(Array.from(input.files))
  }
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files.length) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

function handleFiles(files: File[]) {
  const allowedExtensions = props.accept.split(',').map((ext) => ext.trim().toLowerCase())

  const validated: File[] = []

  for (const file of files) {
    const fileName = file.name.toLowerCase()
    const matchesExt = allowedExtensions.some((ext) => {
      if (ext.startsWith('.')) return fileName.endsWith(ext)
      return file.type === ext || file.type.startsWith(ext.replace('*', ''))
    })

    if (!matchesExt) {
      emit('error', `Nepodporovaný typ súboru: ${file.name}`)
      continue
    }

    if (file.size > props.maxSize * 1024 * 1024) {
      emit('error', `Súbor ${file.name} presahuje maximálnu veľkosť ${props.maxSize} MB`)
      continue
    }

    validated.push(file)
  }

  if (!validated.length) return

  if (props.multiple) {
    const current = fileList.value
    emit('update:modelValue', [...current, ...validated])
  } else {
    emit('update:modelValue', validated[0])
  }
}

function removeFile(index: number) {
  if (props.multiple) {
    const updated = fileList.value.filter((_, i) => i !== index)
    emit('update:modelValue', updated.length ? updated : null)
  } else {
    emit('update:modelValue', null)
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
