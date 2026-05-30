<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold text-navy mb-8">{{ t('student_dashboard.profile.title') }}</h1>

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <div class="h-32 bg-white rounded-lg border border-gray-100 animate-pulse" />
      <div class="h-64 bg-white rounded-lg border border-gray-100 animate-pulse" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-6">
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <div class="relative w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
              <img
                v-if="avatarDisplayUrl"
                :src="avatarDisplayUrl"
                alt=""
                class="w-full h-full object-cover"
              >
              <div
                v-else
                class="w-full h-full bg-navy text-white text-xl font-bold flex items-center justify-center"
              >
                {{ userInitials }}
              </div>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              class="sr-only"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              @change="onAvatarFile"
            >
            <UiButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="avatarUploading"
              @click="avatarInputRef?.click()"
            >
              {{ avatarUploading ? t('student_dashboard.profile.photo_uploading') : (avatarDisplayUrl ? t('student_dashboard.profile.change_photo') : t('student_dashboard.profile.upload_photo')) }}
            </UiButton>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-navy text-lg">{{ form.firstName }} {{ form.lastName }}</h2>
            <p class="text-sm text-gray-500">{{ form.email }}</p>
          </div>
          <div class="flex items-center gap-4 flex-shrink-0">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
            >
              {{ t('student_dashboard.profile.badge_student') }}
            </span>
            <div class="text-right text-sm text-gray-500">
              {{ t('student_dashboard.profile.teams_count', { count: teamsCount }) }} · {{ t('student_dashboard.profile.applications_count', { count: applicationsCount }) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Osobné údaje (uloženie cez API users) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold text-navy mb-5">{{ t('student_dashboard.profile.personal_data') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <UiInput
            v-model="form.firstName"
            :label="t('student_dashboard.profile.first_name')"
            required
          />
          <UiInput
            v-model="form.lastName"
            :label="t('student_dashboard.profile.last_name')"
            required
          />
          <UiInput
            v-model="form.email"
            :label="t('student_dashboard.common.email')"
            type="email"
            disabled
          />
        </div>
        <div class="mt-6">
          <UiButton
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? t('student_dashboard.common.saving') : t('student_dashboard.common.save_changes') }}
          </UiButton>
        </div>
      </div>

      <!-- Študentský záznam (GET /students/me) -->
      <div
        v-if="studentRecord"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
      >
        <h2 class="text-lg font-bold text-navy mb-5">{{ t('student_dashboard.profile.student_profile') }}</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-gray-500">{{ t('student_dashboard.profile.university') }}</dt>
            <dd class="font-medium text-navy">{{ studentRecord.university?.name ?? t('student_dashboard.common.not_available') }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">{{ t('student_dashboard.profile.study_program') }}</dt>
            <dd class="font-medium text-navy">{{ studentRecord.study_program?.study_program_translations?.[0]?.name ?? t('student_dashboard.common.not_available') }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">{{ t('student_dashboard.profile.study_field') }}</dt>
            <dd class="font-medium text-navy">{{ studentRecord.study_field?.study_field_translations?.[0]?.name ?? t('student_dashboard.common.not_available') }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">{{ t('student_dashboard.profile.study_year') }}</dt>
            <dd class="font-medium text-navy">{{ studentRecord.study_year.study_year_translations?.[0]?.name ?? t('student_dashboard.common.not_available') }}</dd>
          </div>
          <div
            v-if="studentRecord.portfolio_url"
            class="md:col-span-2"
          >
            <dt class="text-gray-500">{{ t('student_dashboard.profile.portfolio') }}</dt>
            <dd>
              <a
                :href="studentRecord.portfolio_url"
                class="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >{{ studentRecord.portfolio_url }}</a>
            </dd>
          </div>
        </dl>
      </div>

      <div
        v-else-if="studentLoaded"
        class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600"
      >
        {{ t('student_dashboard.profile.no_student_record') }}
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-red-100 p-6">
        <h2 class="text-lg font-bold text-red-700 mb-2">Vymazať účet</h2>
        <p class="text-sm text-gray-600 mb-4">Táto akcia anonymizuje váš účet a nie je možné ju vrátiť späť.</p>
        <UiButton
          variant="danger"
          :disabled="deletingAccount"
          @click="deleteAccount"
        >
          {{ deletingAccount ? 'Mažem účet...' : 'Vymazať účet' }}
        </UiButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useApplications } from '~/composables/modules/student/useApplications'

const api = useApi()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()
const { applications, refresh: refreshApplications } = useApplications()
const { addToast } = useToast()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: t('student_dashboard.profile.seo_title') })

const pageLoading = ref(true)
const saving = ref(false)
const avatarUploading = ref(false)
const deletingAccount = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)
const studentLoaded = ref(false)
const studentRecord = ref<any | null>(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
})

function syncFormFromUser() {
  const u = authStore.user
  if (!u) return
  form.firstName = u.name ?? ''
  form.lastName = u.surname ?? ''
  form.email = u.email ?? ''
}

watch(
  () => authStore.user,
  () => syncFormFromUser(),
  { deep: true },
)

const userInitials = computed(() => {
  const a = form.firstName?.trim()?.[0] ?? ''
  const b = form.lastName?.trim()?.[0] ?? ''
  return `${a}${b}`.toUpperCase() || '?'
})

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const apiBase = String(config.public.apiBase ?? '').replace(/\/?api\/?$/i, '')
  return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`
}

const avatarDisplayUrl = computed(() => {
  const u = authStore.user
  if (!u) return null
  let pathOrUrl = u.avatar_url
  if (!pathOrUrl && u.avatar) {
    const av = u.avatar.replace(/^\/+/, '')
    pathOrUrl = av.startsWith('storage/') ? `/${av}` : `/storage/${av}`
  }
  return resolveMediaUrl(pathOrUrl)
})

const teamsCount = computed(() => teamsStore.teams.length)
const applicationsCount = computed(() => applications.value.length)

onMounted(async () => {
  pageLoading.value = true
  try {
    await authStore.getCurrentUser()
    syncFormFromUser()
    await Promise.all([teamsStore.fetchTeams(), refreshApplications(), loadStudentMe()])
  } finally {
    pageLoading.value = false
  }
})

async function loadStudentMe() {
  try {
    const res = await api.get('/students/me') as { student?: any }
    studentRecord.value = res.student ?? null
  } catch {
    studentRecord.value = null
  } finally {
    studentLoaded.value = true
  }
}

async function onAvatarFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const mimeOk = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const extOk = /\.(jpe?g|png)$/i.test(file.name)
  if (!mimeOk && !extOk) {
    addToast({ message: t('student_dashboard.profile.toasts.invalid_photo_type'), type: 'error' })
    return
  }
  if (file.size > 4 * 1024 * 1024) {
    addToast({ message: t('student_dashboard.profile.toasts.photo_too_large'), type: 'error' })
    return
  }

  const u = authStore.user
  if (!u) return

  const fd = new FormData()
  fd.append('avatar', file)

  avatarUploading.value = true
  try {
    const res = await api.post(`/users/${u.id}/avatar`, fd) as {
      avatar_url?: string | null
      avatar?: string | null
    }
    authStore.patchUser({
      ...(res.avatar_url !== undefined ? { avatar_url: res.avatar_url } : {}),
      ...(res.avatar !== undefined ? { avatar: res.avatar } : {}),
    })
    syncFormFromUser()
    addToast({ message: t('student_dashboard.profile.toasts.photo_saved'), type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.profile.toasts.photo_error')
    addToast({ message: msg, type: 'error' })
  } finally {
    avatarUploading.value = false
  }
}

async function saveProfile() {
  const u = authStore.user
  if (!u) return

  const roleIds = u.roles?.map((r) => r.id) ?? []
  if (!roleIds.length) {
    addToast({ message: t('student_dashboard.profile.toasts.role_detect_error'), type: 'error' })
    return
  }

  saving.value = true
  try {
    await api.put(`/users/${u.id}`, {
      name: form.firstName,
      surname: form.lastName,
      email: form.email,
      roles: roleIds,
    })
    await authStore.getCurrentUser({ force: true })
    syncFormFromUser()
    addToast({ message: t('student_dashboard.profile.toasts.saved'), type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Uloženie zlyhalo'
    addToast({ message: msg, type: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteAccount() {
  const u = authStore.user
  if (!u) return

  const confirmed = window.confirm('Naozaj chcete anonymizovať a vymazať účet? Túto akciu nie je možné vrátiť.')
  if (!confirmed) return

  deletingAccount.value = true
  try {
    await api.post(`/users/anonymize-user/${u.id}`)
    authStore.$reset()
    addToast({ message: 'Účet bol anonymizovaný.', type: 'success' })
    await navigateTo('/auth/login')
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Anonymizácia účtu zlyhala.'
    addToast({ message: msg, type: 'error' })
  } finally {
    deletingAccount.value = false
  }
}
</script>
