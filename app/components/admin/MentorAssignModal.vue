<template>
  <UiModal
    :model-value="modelValue"
    title="Priradiť mentora / PO"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <!-- Application summary -->
      <div
        v-if="application"
        class="bg-gray-50 rounded-lg p-4"
      >
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">Tím:</span>
            <span class="font-medium text-navy ml-1">{{ application.team }}</span>
          </div>
          <div>
            <span class="text-gray-500">Program:</span>
            <span class="font-medium text-navy ml-1">{{ application.program }}</span>
          </div>
          <div>
            <span class="text-gray-500">Stav:</span>
            <UiStatusBadge
              :status="application.status"
              class="ml-1"
            />
          </div>
          <div>
            <span class="text-gray-500">ID:</span>
            <span class="font-medium text-navy ml-1">{{ application.appId }}</span>
          </div>
        </div>
      </div>

      <UiFormField label="Mentor">
        <UiSelect
          v-model="form.mentorId"
          :options="mentorOptions"
          placeholder="Vybrať mentora..."
        />
      </UiFormField>

      <UiFormField label="Product Owner">
        <UiSelect
          v-model="form.productOwnerId"
          :options="poOptions"
          placeholder="Vybrať PO..."
        />
      </UiFormField>
    </div>

    <template #actions>
      <UiButton
        variant="ghost"
        @click="emit('update:modelValue', false)"
      >
        Zrušiť
      </UiButton>
      <UiButton
        :disabled="isSaving || (!form.mentorId && !form.productOwnerId)"
        @click="handleSave"
      >
        {{ isSaving ? 'Ukladanie...' : 'Priradiť' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { AdminApplication, MentorOption } from '~/types/admin'

const props = defineProps<{
  modelValue: boolean
  application: AdminApplication | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  assigned: []
}>()

const api = useApi()
const { addToast } = useToast()
const isSaving = ref(false)

const form = ref({
  mentorId: '',
  productOwnerId: '',
})

const mentors = ref<MentorOption[]>([])
const productOwners = ref<MentorOption[]>([])

const mentorOptions = computed(() =>
  mentors.value.map((m) => ({ value: String(m.id), label: `${m.name} (${m.email})` })),
)

const poOptions = computed(() =>
  productOwners.value.map((p) => ({ value: String(p.id), label: `${p.name} (${p.email})` })),
)

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      form.value = {
        mentorId: props.application?.mentor ? String(props.application.mentor.id) : '',
        productOwnerId: props.application?.product_owner ? String(props.application.product_owner.id) : '',
      }
      await fetchOptions()
    }
  },
)

async function fetchOptions() {
  try {
    const [mentorRes, poRes] = await Promise.all([
      api.get('/v1/admin/users?role=mentor'),
      api.get('/v1/admin/users?role=company'),
    ])
    mentors.value = mentorRes.data || mentorRes || []
    productOwners.value = poRes.data || poRes || []
  } catch {
    // Options will be empty
  }
}

async function handleSave() {
  if (!props.application) return
  isSaving.value = true
  try {
    await api.post(`/v1/admin/applications/${props.application.id}/mentor`, {
      mentor_id: form.value.mentorId ? Number(form.value.mentorId) : null,
      product_owner_id: form.value.productOwnerId ? Number(form.value.productOwnerId) : null,
    })
    addToast({ message: 'Mentor / PO boli priradení', type: 'success' })
    emit('assigned')
    emit('update:modelValue', false)
  } catch {
    addToast({ message: 'Nepodarilo sa priradiť mentora', type: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>
