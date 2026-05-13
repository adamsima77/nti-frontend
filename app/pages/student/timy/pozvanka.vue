<template>
  <div class="max-w-lg mx-auto px-6 py-16 text-center">
    <div
      v-if="pending"
      class="text-gray-600"
    >
      {{ t('student_dashboard.teams.invite_accepting') }}
    </div>
    <div
      v-else-if="errorMessage"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
    >
      {{ errorMessage }}
    </div>
    <div
      v-else-if="successMessage"
      class="space-y-4"
    >
      <p class="text-navy font-medium">{{ successMessage }}</p>
      <NuxtLink
        :to="localePath(`/student/timy/${joinedTeamId}`)"
        class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
      >
        {{ t('student_dashboard.teams.invite_open_team') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const api = useApi()

const pending = ref(true)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const joinedTeamId = ref<number | null>(null)

useHead({
  title: t('student_dashboard.teams.invite_accept_seo'),
})

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    pending.value = false
    errorMessage.value = t('student_dashboard.teams.invite_missing_token')
    return
  }

  try {
    const res = (await api.post('/teams/invitations/accept', { token })) as {
      message?: string
      team?: { id?: number }
    }
    successMessage.value = res?.message ?? t('student_dashboard.teams.invite_accept_ok')
    joinedTeamId.value = typeof res?.team?.id === 'number' ? res.team.id : null
    await router.replace({ query: {} })
  } catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode
    const msg = err?.data?.message ?? err?.data?.error
    if (status === 401) {
      await router.push({
        path: localePath('/auth/login'),
        query: { redirect: route.fullPath },
      })
      return
    }
    errorMessage.value =
      typeof msg === 'string' && msg.length > 0
        ? msg
        : t('student_dashboard.teams.invite_accept_failed')
  } finally {
    pending.value = false
  }
})
</script>
