<template>
  <UiModal
    v-model="isOpen"
    :title="t('student_dashboard.teams.invite_modal_title')"
    @close="handleClose"
  >
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

      <!-- Message -->
      <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p class="text-xs text-blue-700">
          <strong>{{ t('student_dashboard.common.note') }}:</strong> {{ t('student_dashboard.teams.invite_note') }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end pt-4 border-t">
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
  </UiModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

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

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

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
</script>
