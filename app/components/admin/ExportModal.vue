<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleBackdrop"
        />

        <!-- Modal Card -->
        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          appear
        >
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            <!-- Header -->
            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Download class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 class="font-semibold text-gray-900 text-sm leading-tight">
                    {{ title }}
                  </h2>
                  <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5">
                    {{ subtitle }}
                  </p>
                </div>
              </div>

              <button
                v-if="step !== 'generating'"
                class="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-1"
                @click="close"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Content Body -->
            <div class="px-6 py-5 min-h-[200px]">
              
              <!-- Step: Idle (Format Picker) -->
              <div v-if="step === 'idle'">
                <p class="text-sm text-gray-500 mb-4">
                  {{ $t('common.select_export_format', 'Vyberte formát exportu:') }}
                </p>

                <!-- Language picker (optional) -->
                <div v-if="showLangPicker" class="flex items-center gap-2 mb-4">
                  <span class="text-sm text-gray-500">Jazyk / Language:</span>
                  <div class="flex gap-1">
                    <button
                      v-for="lang in ['sk', 'en']"
                      :key="lang"
                      :class="[
                        'px-3 py-1 rounded-lg text-xs font-semibold uppercase border-2 transition-all',
                        selectedLang === lang
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300',
                      ]"
                      @click="selectedLang = lang"
                    >
                      {{ lang }}
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="fmt in activeFormats"
                    :key="fmt.value"
                    :class="[
                      'flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all text-center focus:outline-none',
                      selectedFormat === fmt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700',
                    ]"
                    @click="selectedFormat = fmt.value"
                  >
                    <component
                      :is="fmt.icon"
                      :class="['w-6 h-6', selectedFormat === fmt.value ? 'text-blue-600' : fmt.color]"
                    />
                    <span class="text-xs font-bold uppercase tracking-widest">
                      {{ fmt.label }}
                    </span>
                    <span class="text-[10px] text-gray-400 leading-snug">
                      {{ fmt.desc }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Step: Generating (Loading Spin) -->
              <div v-else-if="step === 'generating'" class="flex flex-col items-center justify-center py-6 gap-4">
                <div class="relative w-16 h-16">
                  <div class="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div class="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <FileDown class="w-5 h-5 text-blue-500" />
                  </div>
                </div>

                <div class="text-center">
                  <p class="font-medium text-gray-800 text-sm">
                    {{ $t('common.generating_export', 'Generujem export...') }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('common.generating_export_hint', 'Počkajte prosím, kým súbor pripravíme.') }}
                  </p>
                </div>

                <div class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                </div>
              </div>

              <!-- Step: Done (Success) -->
              <div v-else-if="step === 'done'" class="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div class="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle class="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-sm">
                    {{ $t('common.export_success_title', 'Export úspešne dokončený') }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('common.export_success_hint', 'Váš súbor bol úspešne prevzatý.') }}
                  </p>
                </div>
              </div>

              <!-- Step: Error -->
              <div v-else-if="step === 'error'" class="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle class="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-sm">
                    {{ $t('common.export_error_title', 'Chyba pri generovaní') }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('common.export_error_hint', 'Nastal problém. Skúste to prosím znova.') }}
                  </p>
                </div>
              </div>

            </div>

            <!-- Footer Action Buttons -->
            <div class="flex items-center justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">
              <template v-if="step === 'idle'">
                <UiButton variant="ghost" @click="close">
                  {{ $t('common.cancel') }}
                </UiButton>
                <UiButton :disabled="!selectedFormat" @click="executeExport">
                  <Download class="w-4 h-4 mr-1.5" />
                  {{ $t('common.export_btn', 'Exportovať') }}
                </UiButton>
              </template>

              <template v-else-if="step === 'generating'">
                <UiButton variant="ghost" @click="cancelPolling">
                  {{ $t('common.cancel') }}
                </UiButton>
              </template>

              <template v-else-if="step === 'done'">
                <UiButton @click="close">
                  {{ $t('common.close') }}
                </UiButton>
              </template>

              <template v-else-if="step === 'error'">
                <UiButton variant="ghost" @click="close">
                  {{ $t('common.close') }}
                </UiButton>
                <UiButton @click="retry">
                  {{ $t('common.retry') }}
                </UiButton>
              </template>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Download,
  X,
  FileText,
  FileSpreadsheet,
  Table,
  CheckCircle,
  AlertCircle,
  FileDown,
} from 'lucide-vue-next'

type Step = 'idle' | 'generating' | 'done' | 'error'

// ── Reusable Props ────────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    endpoint: string                       // e.g., '/v1/admin/calls/export'
    filters?: Record<string, any>          // Current table active filter parameters
    allowedFormats?: ('xlsx' | 'csv' | 'pdf')[]
    filenamePrefix?: string                // Base name for saved files
    isAsync?: boolean                      // Explicit push to queue configuration
    showLangPicker?: boolean               // Show SK/EN language toggle
  }>(),
  {
    subtitle: '',
    filters: () => ({}),
    allowedFormats: () => ['xlsx', 'csv', 'pdf'],
    filenamePrefix: 'export',
    isAsync: false,
    showLangPicker: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const api = useApi()
const { addToast } = useToast()

// ── Local State ──────────────────────────────────────────────────────────────
const step = ref<Step>('idle')
const selectedFormat = ref<string>('')
const selectedLang = ref<string>('sk')
const statusUrl = ref<string | null>(null)
const downloadUrl = ref<string | null>(null)

let pollInterval: ReturnType<typeof setInterval> | null = null
let pollAttempts = 0
const MAX_POLL_ATTEMPTS = 40 // 40 x 3s = 2 minutes

// All format templates mapped out
const formatsConfig = {
 pdf: { value: 'pdf', label: 'PDF', desc: 'Dokument', icon: FileText, color: 'text-red-400' },
  xlsx: { value: 'xlsx', label: 'XLSX', desc: 'Excel Hárok', icon: FileSpreadsheet, color: 'text-green-500' },
  csv: { value: 'csv', label: 'CSV', desc: 'Čiarkami oddelené', icon: Table, color: 'text-blue-400' },
}

// Compute visible types allowed for this specific context instance
const activeFormats = computed(() => {
  return props.allowedFormats.map(f => formatsConfig[f]).filter(Boolean)
})

// ── Action Handlers ──────────────────────────────────────────────────────────
async function executeExport() {
  if (!selectedFormat.value) return
  step.value = 'generating'
  pollAttempts = 0

  // Príprava query parametrov pre GET request
  const queryParams = {
    ...props.filters,
    ...(props.showLangPicker ? { lang: selectedLang.value } : {}),
    async: props.isAsync ? 'true' : undefined
  }

  try {
    // 1. SYNCHRÓNNY REŽIM (Priamy download cez Blob)
    if (!props.isAsync) {
      const response = await api.get(`${props.endpoint}/${selectedFormat.value}`, {
        params: queryParams,
        responseType: 'blob',
      }) as Blob

      triggerBrowserDownload(response)
      step.value = 'done'
      emit('success')
      return
    }

    const res = await api.get(`${props.endpoint}/${selectedFormat.value}`, {
      params: queryParams,
    }) as any

    const exportRequest = res?.export_request ?? res
    statusUrl.value = exportRequest?.status_url ?? null
    downloadUrl.value = exportRequest?.download_url ?? null

    if (statusUrl.value) {
      startPolling()
    } else {
      step.value = 'error'
    }
  } catch {
    step.value = 'error'
  }
}

// ── Queue Polling ────────────────────────────────────────────────────────────
function startPolling() {
  if (!statusUrl.value) {
    step.value = 'error'
    return
  }

  pollInterval = setInterval(async () => {
    pollAttempts++

    if (pollAttempts > MAX_POLL_ATTEMPTS) {
      stopPolling()
      addToast({ message: 'Spracovanie trvá príliš dlho. Export bol odoslaný na pozadí.', type: 'warning' })
      step.value = 'done'
      emit('success')
      return
    }

    try {
      const res = await api.get(statusUrl.value) as any

      // API sometimes wraps the export info in { export_request: { ... } }
      const info = res?.export_request ?? res

      if (typeof info.download_url === 'string') {
        downloadUrl.value = info.download_url
      }

      if (info.status === 'completed' || info.status === 'success') {
        stopPolling()
        await downloadQueuedFile()
      } else if (info.status === 'failed') {
        stopPolling()
        step.value = 'error'
      }
    } catch {
      // Network hiccup — ignore and retry until MAX_POLL_ATTEMPTS
    }
  }, 3000)
}

async function downloadQueuedFile() {
  if (!downloadUrl.value) {
    step.value = 'error'
    return
  }

  try {
    const response = await api.get(downloadUrl.value, {
      responseType: 'blob',
    }) as Blob

    triggerBrowserDownload(response)
    step.value = 'done'
    emit('success')
  } catch {
    step.value = 'error'
  }
}

function triggerBrowserDownload(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  
  const datestamp = new Date().toISOString().slice(0, 10)
  anchor.setAttribute('download', `${props.filenamePrefix}_${datestamp}.${selectedFormat.value}`)
  
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
}

// ── Control State Cleanup Utility Definitions ────────────────────────────────
function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function cancelPolling() {
  stopPolling()
  reset()
  close()
}

function retry() {
  reset()
  executeExport()
}

function reset() {
  step.value = 'idle'
  selectedLang.value = 'sk'
  statusUrl.value = null
  downloadUrl.value = null
  pollAttempts = 0
}

function close() {
  if (step.value === 'generating') return
  stopPolling()
  emit('update:modelValue', false)
  setTimeout(reset, 200)
}

function handleBackdrop() {
  if (step.value !== 'generating') close()
}

onUnmounted(stopPolling)
</script>