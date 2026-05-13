<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <!-- Breadcrumbs -->
    <div class="mb-8">
        <UiBreadcrumbs :items="[{ label: t('student_dashboard.teams.title'), to: localePath('/student/timy') }, { label: t('student_dashboard.teams.create_new_title') }]" />
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-2">{{ t('student_dashboard.teams.create_new_title') }}</h1>
      <p class="text-gray-600">{{ t('student_dashboard.teams.create_description') }}</p>
    </div>

    <!-- Form -->
    <form
      @submit.prevent="handleSubmit"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6"
    >
      <!-- Team name -->
      <UiInput
        v-model="formData.name"
        type="text"
        :label="t('student_dashboard.teams.team_name')"
        :placeholder="t('student_dashboard.teams.team_name_placeholder')"
        required
        :error="errors.name"
      />

      <!-- Description -->
      <UiTextarea
        v-model="formData.description"
        :label="t('student_dashboard.teams.description_optional')"
        :placeholder="t('student_dashboard.teams.description_placeholder')"
      />

      <!-- Members section -->
      <div class="space-y-4 pt-6 border-t">
        <h2 class="text-lg font-semibold text-navy">{{ t('student_dashboard.teams.members_section') }}</h2>

        <!-- Help text -->
        <p class="text-sm text-gray-600">
          {{ t('student_dashboard.teams.members_help') }}
        </p>

        <!-- Members list -->
        <div
          v-if="formData.members.length > 0"
          class="space-y-2"
        >
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
          <h3 class="text-sm font-medium text-navy">{{ t('student_dashboard.teams.add_member') }}</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UiInput
              v-model="newMember.email"
              type="email"
              :label="t('student_dashboard.common.email')"
              placeholder="clen@example.com"
              :error="errors.memberEmail"
            />

            <UiSelect
              v-model="newMember.role"
              :label="t('student_dashboard.teams.role')"
              :options="roleOptions"
            />
          </div>

          <button
            type="button"
            @click="addMember"
            class="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            + {{ t('student_dashboard.teams.add_member') }}
          </button>
        </div>
      </div>

      <!-- Form actions -->
      <div class="flex gap-3 pt-6 border-t">
        <NuxtLink
          to="/timy"
          class="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          {{ t('student_dashboard.common.cancel') }}
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          <span v-if="!isSubmitting">{{ t('student_dashboard.teams.create_team') }}</span>
          <span v-else>{{ t('student_dashboard.teams.creating') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { X } from 'lucide-vue-next'

const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  // middleware: 'auth', // TODO: re-enable when backend is available
})

useSeoMeta({
  title: t('student_dashboard.teams.create_seo_title'),
  description: t('student_dashboard.teams.create_seo_description'),
  ogTitle: t('student_dashboard.teams.create_og_title'),
  ogDescription: t('student_dashboard.teams.create_og_description'),
  ogType: 'website',
  ogUrl: 'https://nti.sk/timy/vytvorit',
  twitterCard: 'summary_large_image',
  twitterTitle: t('student_dashboard.teams.create_og_title'),
  twitterDescription: t('student_dashboard.teams.create_twitter_description'),
})

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
  role: 'Člen tímu',
})

const errors = reactive({
  name: '',
  memberEmail: '',
})

const isSubmitting = ref(false)

const roleOptions = [
  { label: 'Člen tímu', value: 'Člen tímu' },
]

const validateForm = () => {
  errors.name = ''

  if (!formData.name.trim()) {
    errors.name = t('student_dashboard.teams.errors.name_required')
    return false
  }

  if (formData.name.trim().length < 2) {
    errors.name = t('student_dashboard.teams.errors.name_min')
    return false
  }

  return true
}

const addMember = () => {
  errors.memberEmail = ''

  if (!newMember.email) {
    errors.memberEmail = t('student_dashboard.common.errors.email_required')
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
    errors.memberEmail = t('student_dashboard.common.errors.invalid_email')
    return
  }

  // Check if member already exists
  if (formData.members.some((m) => m.email.toLowerCase() === newMember.email.toLowerCase())) {
    errors.memberEmail = t('student_dashboard.teams.errors.member_exists')
    return
  }

  formData.members.push({
    email: newMember.email,
    role: newMember.role,
  })

  newMember.email = ''
  newMember.role = 'Člen tímu'
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
      message: t('student_dashboard.teams.toasts.created', { name: team.name }),
      type: 'success',
    })

    await router.push(`/student/timy/${team.id}`)
  } catch (err: any) {
    const message = err?.data?.message ?? t('student_dashboard.teams.toasts.create_error')
    addToast({
      message,
      type: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
