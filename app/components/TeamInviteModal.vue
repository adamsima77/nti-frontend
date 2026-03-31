<template>
  <UiModal
    v-model="isOpen"
    title="Pozvať člena do tímu"
    @close="handleClose"
  >
    <div class="space-y-4">
      <!-- Email input -->
      <UiInput
        v-model="formData.email"
        type="email"
        label="Email"
        placeholder="clen@example.com"
        required
        :error="errors.email"
      />

      <!-- Role select -->
      <UiSelect
        v-model="formData.role"
        label="Úloha v tíme"
        :options="roleOptions"
        placeholder="Vyberte úlohu"
      />

      <!-- Message -->
      <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p class="text-xs text-blue-700">
          <strong>Poznámka:</strong> Osoba dostane pozvánku a môže ju akceptovať alebo odmietnuť.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end pt-4 border-t">
        <button
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition"
        >
          Zrušiť
        </button>
        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isSubmitting">Poslať pozvánku</span>
          <span v-else>Posielam...</span>
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

const teamsStore = useTeamsStore()
const { addToast } = useToast()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formData = reactive({
  email: '',
  role: 'Developer',
})

const errors = reactive({
  email: '',
})

const isSubmitting = ref(false)

const roleOptions = [
  { label: 'Team Lead', value: 'Team Lead' },
  { label: 'Developer', value: 'Developer' },
  { label: 'Designer', value: 'Designer' },
  { label: 'Analyst', value: 'Analyst' },
  { label: 'Manager', value: 'Manager' },
]

const validateForm = () => {
  errors.email = ''

  if (!formData.email) {
    errors.email = 'Email je povinný'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Neplatný email'
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
      message: `Pozvánka poslana na ${formData.email}`,
      type: 'success',
    })

    emit('invited', result)
    handleClose()
  } catch (err) {
    addToast({
      message: 'Chyba pri poslaní pozvánky',
      type: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  isOpen.value = false
  formData.email = ''
  formData.role = 'Developer'
  errors.email = ''
}
</script>
