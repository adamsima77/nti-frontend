<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <!-- Breadcrumbs -->
    <div class="mb-8">
      <UiBreadcrumbs :items="[{ label: 'Tímy', to: '/timy' }, { label: 'Vytvoriť nový tím' }]" />
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-2">Vytvoriť nový tím</h1>
      <p class="text-gray-600">Začnite tým, že pozvete členov vášho tímu. Môžete ich pozvať aj neskôr.</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
      <!-- Team name -->
      <UiInput
        v-model="formData.name"
        type="text"
        label="Názov tímu"
        placeholder="napr. GreenTech Innovators"
        required
        :error="errors.name"
      />

      <!-- Description -->
      <UiTextarea
        v-model="formData.description"
        label="Popis (voliteľné)"
        placeholder="Krátky popis činnosti a zamerania vášho tímu..."
      />

      <!-- Members section -->
      <div class="space-y-4 pt-6 border-t">
        <h2 class="text-lg font-semibold text-navy">Členovia tímu</h2>

        <!-- Help text -->
        <p class="text-sm text-gray-600">
          Môžete vyzvať členov. Každý dostane pozvánku cez email a bude sa môcť zapojiť do tímu.
        </p>

        <!-- Members list -->
        <div v-if="formData.members.length > 0" class="space-y-2">
          <div
            v-for="(member, index) in formData.members"
            :key="index"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <p class="text-sm font-medium text-navy">{{ member.email }}</p>
              <p class="text-xs text-gray-500">{{ member.role }}</p>
            </div>
            <button
              type="button"
              @click="removeMember(index)"
              class="p-1 text-red-600 hover:bg-red-50 rounded transition"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Add member form -->
        <div class="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="text-sm font-medium text-navy">Pridať člena</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UiInput
              v-model="newMember.email"
              type="email"
              label="Email"
              placeholder="clen@example.com"
              :error="errors.memberEmail"
            />

            <UiSelect
              v-model="newMember.role"
              label="Úloha"
              :options="roleOptions"
            />
          </div>

          <button
            type="button"
            @click="addMember"
            class="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            + Pridať člena
          </button>
        </div>
      </div>

      <!-- Form actions -->
      <div class="flex gap-3 pt-6 border-t">
        <NuxtLink
          to="/timy"
          class="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Zrušiť
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          <span v-if="!isSubmitting">Vytvoriť tím</span>
          <span v-else>Vytváram...</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { X } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  // middleware: 'auth', // TODO: re-enable when backend is available
})

useHead({ title: 'Vytvoriť tím | NTI' })

const router = useRouter()
const teamsStore = useTeamsStore()
const { addToast } = useToast()

const formData = reactive({
  name: '',
  description: '',
  members: [] as Array<{ email: string; role: string }>,
})

const newMember = reactive({
  email: '',
  role: 'Developer',
})

const errors = reactive({
  name: '',
  memberEmail: '',
})

const isSubmitting = ref(false)

const roleOptions = [
  { label: 'Developer', value: 'Developer' },
  { label: 'Team Lead', value: 'Team Lead' },
  { label: 'Designer', value: 'Designer' },
  { label: 'Analyst', value: 'Analyst' },
  { label: 'Manager', value: 'Manager' },
]

const validateForm = () => {
  errors.name = ''

  if (!formData.name.trim()) {
    errors.name = 'Názov tímu je povinný'
    return false
  }

  if (formData.name.trim().length < 2) {
    errors.name = 'Názov tímu musí mať aspoň 2 znaky'
    return false
  }

  return true
}

const addMember = () => {
  errors.memberEmail = ''

  if (!newMember.email) {
    errors.memberEmail = 'Email je povinný'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
    errors.memberEmail = 'Neplatný email'
    return
  }

  // Check if member already exists
  if (formData.members.some((m) => m.email.toLowerCase() === newMember.email.toLowerCase())) {
    errors.memberEmail = 'Tento člen je už pridaný'
    return
  }

  formData.members.push({
    email: newMember.email,
    role: newMember.role,
  })

  newMember.email = ''
  newMember.role = 'Developer'
}

const removeMember = (index: number) => {
  formData.members.splice(index, 1)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const team = await teamsStore.createTeam({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      members: formData.members.length > 0 ? formData.members.map((m) => m.email) : undefined,
    })

    addToast({
      message: `Tím "${team.name}" bol úspešne vytvorený`,
      type: 'success',
    })

    await router.push(`/timy/${team.id}`)
  } catch (err) {
    addToast({
      message: 'Chyba pri vytváraní tímu',
      type: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
