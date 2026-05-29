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

        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleBackdrop"
        />

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

            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Download class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 class="font-semibold text-gray-900 text-sm leading-tight">
                    {{ $t('gdpr_download.modal_title') }}
                  </h2>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ user?.name }} {{ user?.surname }}
                  </p>
                </div>
              </div>

              <button
                class="text-gray-400 hover:text-gray-600 transition-colors rounded-md p-1"
                @click="close"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="px-6 py-5 min-h-[200px]">

              <div v-if="step === 'idle'">
                <p class="text-sm text-gray-500 mb-4">
                  {{ $t('gdpr_download.select_format') }}
                </p>

                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="fmt in formats"
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
                    {{ $t('gdpr_download.generating') }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('gdpr_download.generating_hint') }}
                  </p>
                </div>

                <div class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                </div>
              </div>

              <div v-else-if="step === 'done'" class="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div class="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle class="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-sm">
                    {{ $t('gdpr_download.success_title') }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('gdpr_download.success_hint') }}
                  </p>
                </div>
              </div>

              <div v-else-if="step === 'error'" class="flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle class="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-sm">
                    {{ $t('gdpr_download.error_title') }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('gdpr_download.error_hint') }}
                  </p>
                </div>
              </div>

            </div>

            <div class="flex items-center justify-end gap-3 px-6 pb-5 border-t border-gray-100 pt-4">

              <template v-if="step === 'idle'">
                <UiButton variant="ghost" @click="close">
                  {{ $t('common.cancel') }}
                </UiButton>
                <UiButton :disabled="!selectedFormat" @click="generate">
                  <Download class="w-4 h-4 mr-1.5" />
                  {{ $t('gdpr_download.generate_btn') }}
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

// ── Props / emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: boolean
  user: { id: number; name: string; surname: string } | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'generated'): void
}>()

// ── Composables ──────────────────────────────────────────────────────────────

const { t }      = useI18n()
const api        = useApi()
const { addToast }   = useToast()

// ── Format options ───────────────────────────────────────────────────────────

const formats = [
  {
    value: 'pdf',
    label: 'PDF',
    desc:  t('gdpr_download.fmt_pdf_desc'),
    icon:  FileText,
    color: 'text-red-400',
  },
  {
    value: 'xlsx',
    label: 'XLSX',
    desc:  t('gdpr_download.fmt_xlsx_desc'),
    icon:  FileSpreadsheet,
    color: 'text-green-500',
  },
  {
    value: 'csv',
    label: 'CSV',
    desc:  t('gdpr_download.fmt_csv_desc'),
    icon:  Table,
    color: 'text-blue-400',
  },
]

// ── State ────────────────────────────────────────────────────────────────────

type Step = 'idle' | 'generating' | 'done' | 'error'

const step           = ref<Step>('idle')
const selectedFormat = ref<string>('')
const reportId       = ref<number | null>(null)

let pollInterval: ReturnType<typeof setInterval> | null = null
let pollAttempts = 0
const MAX_POLL_ATTEMPTS = 40 // 40 × 3 s = 2 minutes

// ── Generate ─────────────────────────────────────────────────────────────────

async function generate() {
  if (!props.user || !selectedFormat.value) return

  step.value   = 'generating'
  pollAttempts = 0

  try {
    const res = await api.post('/gdpr-reports/generate-report', {
      target_user_id: props.user.id,
      format:         selectedFormat.value,
    }) as { report_id: number }

    reportId.value = res.report_id
    startPolling()
  } catch {
    step.value = 'error'
  }
}

// ── Polling ───────────────────────────────────────────────────────────────────

function startPolling() {
  pollInterval = setInterval(async () => {
    pollAttempts++

    if (pollAttempts > MAX_POLL_ATTEMPTS) {
      stopPolling()
      addToast({ message: t('gdpr_download.timeout_hint'), type: 'warning' })
      step.value = 'done'
      emit('generated')
      return
    }

    try {
      const res = await api.get(`/gdpr-reports/${reportId.value}`) as { status: string }

      if (res.status === 'completed') {
        stopPolling()
        try {
          await downloadBlob(reportId.value!)
          step.value = 'done'
          emit('generated')
        } catch {
          // File was ready but download itself failed (e.g. storage issue)
          step.value = 'error'
        }
      } else if (res.status === 'failed') {
        stopPolling()
        step.value = 'error'
      }
      // 'pending' | 'processing' → keep polling
    } catch {
      // Network hiccup — keep trying until MAX_POLL_ATTEMPTS
    }
  }, 3000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// ── Download ──────────────────────────────────────────────────────────────────

/**
 * Fetches the report file as a Blob using the same Bearer token the api
 * composable attaches on every request (read from localStorage '_t').
 * Then creates a temporary object URL and clicks a hidden anchor to trigger
 * the browser's native Save dialog — no new tab, no cookie dependency.
 */
async function downloadBlob(id: number): Promise<void> {
  // api.get spreads options straight into $fetch, so responseType: 'blob'
  // makes ofetch return a Blob instead of parsed JSON.
  const blob = await api.get(`/gdpr-reports/${id}/download`, {
    responseType: 'blob',
  }) as Blob

  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href  = objectUrl
  // The server sets Content-Disposition: attachment; filename="..." so the
  // browser will use that name. The download attribute here is just a fallback.
  anchor.setAttribute('download', `gdpr_report_user_${props.user?.id}`)
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  // Release the object URL after a tick so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(objectUrl), 100)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cancelPolling() {
  stopPolling()
  reset()
  close()
}

function retry() {
  reset()
  generate()
}

function reset() {
  step.value     = 'idle'
  reportId.value = null
  pollAttempts   = 0
}

function close() {
  // Prevent accidental dismissal while the job is in flight
  if (step.value === 'generating') return
  stopPolling()
  emit('update:modelValue', false)
  setTimeout(reset, 200) // wait for the leave transition to finish
}

function handleBackdrop() {
  if (step.value !== 'generating') close()
}

// Clean up the interval if the parent unmounts the modal mid-poll
onUnmounted(stopPolling)
</script>