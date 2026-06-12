<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Backdrop Mask (Clicking handles local close sequence) -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="handleClose"
        />

        <!-- Modal Wrapper Dialog Container -->
        <div
          class="relative bg-white rounded-lg shadow-2xl max-w-md w-11/12 md:max-w-3xl max-h-[90vh] overflow-y-auto z-10"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-navy">
              {{ t('student_dashboard.teams.invite_modal_title') }}
            </h2>
            <button
              class="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
              aria-label="Zatvoriť"
              @click="handleClose"
            >
              <!-- Manual SVG fallback replacing internal lucide icon safely if imported outside -->
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="w-5 h-5 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content Base Inner Body View -->
          <div class="px-6 py-4">
            <div class="space-y-4">
              <!-- Email input -->
              <UiInput
                v-model="formData.email"
                type="email"
                :label="t('student_dashboard.common.email')"
                placeholder="clen@example.com"
                required
                :error="errors.email"
              />

              <!-- Role select -->
              <UiSelect
                v-model="formData.role"
                :label="t('student_dashboard.teams.role_in_team')"
                :options="roleOptions"
                :placeholder="t('student_dashboard.teams.select_role')"
              />

              <!-- Informative Banner Notice Box -->
              <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p class="text-xs text-blue-700">
                  <strong>{{ t('student_dashboard.common.note') }}:</strong> {{ t('student_dashboard.teams.invite_note') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Control Actions Row -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition"
            >
              {{ t('student_dashboard.common.cancel') }}
            </button>
            <button
              @click="handleSubmit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">{{ t('student_dashboard.teams.send_invite') }}</span>
              <span v-else>{{ t('student_dashboard.common.sending') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  teamId: number | string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'invited', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const teamsStore = useTeamsStore()
const { addToast } = useToast()

// Synchronized local tracking with native scroll lock system engine integration
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })

const formData = reactive({
  email: '',
  role: 'Člen tímu',
})

const errors = reactive({
  email: '',
})

const isSubmitting = ref(false)

const roleOptions = [
  { label: 'Člen tímu', value: 'Člen tímu' },
]

const validateForm = () => {
  errors.email = ''

  if (!formData.email) {
    errors.email = t('student_dashboard.common.errors.email_required')
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('student_dashboard.common.errors.invalid_email')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const result = await teamsStore.inviteMember(props.teamId, {
      email: formData.email,
      role: formData.role,
    })

    addToast({
      message: t('student_dashboard.teams.toasts.invite_sent', { email: formData.email }),
      type: 'success',
    })

    emit('invited', result)
    handleClose()
  } catch (err: any) {
    addToast({
      message: err?.data?.message ?? t('student_dashboard.teams.toasts.invite_error'),
      type: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  isOpen.value = false
  formData.email = ''
  formData.role = 'Člen tímu'
  errors.email = ''
}

// Global Keyboard Listener Sequence for accessible Escape Key exits
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = '' // Safety restoration safeguard
})
</script>

<style scoped>
/* Scoped layout animations ensuring smooth CSS transforms natively */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>