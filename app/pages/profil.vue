<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold text-navy mb-8">{{ t('profile.title') }}</h1>

    <div v-if="pageLoading" class="space-y-4">
      <div class="h-32 bg-white rounded-lg border border-gray-100 animate-pulse" />
      <div class="h-48 bg-white rounded-lg border border-gray-100 animate-pulse" />
    </div>

    <template v-else>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-6">
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <div class="relative w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
              <img
                v-if="avatarDisplayUrl"
                :src="avatarDisplayUrl"
                alt=""
                class="w-full h-full object-cover"
              />
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
              accept="image/jpeg,image/jpg,image/png"
              @change="onAvatarFile"
            />
            <UiButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="avatarUploading"
              @click="avatarInputRef?.click()"
            >
              {{ avatarUploading ? t('profile.avatar.uploading') : (avatarDisplayUrl ? t('profile.avatar.change') : t('profile.avatar.upload')) }}
            </UiButton>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-navy text-lg">{{ form.firstName }} {{ form.lastName }}</h2>
            <p class="text-sm text-gray-500">{{ form.email }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 flex-shrink-0">
            {{ roleNames || t('profile.access.role') }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold text-navy mb-5">{{ t('profile.personalData.title') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <UiInput v-model="form.firstName" :label="t('profile.personalData.firstName')" required />
          <UiInput v-model="form.lastName" :label="t('profile.personalData.lastName')" required />
          <UiInput v-model="form.email" :label="t('profile.personalData.email')" type="email" disabled />
        </div>
        <div class="mt-6">
          <UiButton :disabled="saving" @click="saveProfile">
            {{ saving ? t('profile.personalData.saving') : t('profile.personalData.save') }}
          </UiButton>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-bold text-navy mb-4">{{ t('profile.access.title') }}</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-gray-500">{{ t('profile.access.role') }}</dt>
            <dd class="font-medium text-navy">{{ roleNames || '-' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">{{ t('profile.access.email') }}</dt>
            <dd class="font-medium text-navy">{{ form.email }}</dd>
          </div>
        </dl>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-red-100 p-6 mt-6">
        <h2 class="text-lg font-bold text-red-700 mb-2">Vymazať účet</h2>
        <p class="text-sm text-gray-600 mb-4">Táto akcia anonymizuje váš účet a nie je možné ju vrátiť späť.</p>
        <UiButton variant="danger" :disabled="deletingAccount" @click="deleteAccount">
          {{ deletingAccount ? 'Mažem účet...' : 'Vymazať účet' }}
        </UiButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['evaluator', 'predseda_komisie'],
})

const api = useApi()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { addToast } = useToast()
const { t } = useI18n()

useHead({ title: t('profile.title') })

const pageLoading = ref(true)
const saving = ref(false)
const avatarUploading = ref(false)
const deletingAccount = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
})

const roleNames = computed(() => {
  const roles = authStore.user?.roles
  if (!roles || !roles.length) return ''
  return roles.map((role: any) => role.name).join(', ')
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

onMounted(async () => {
  pageLoading.value = true
  try {
    await authStore.getCurrentUser()
    syncFormFromUser()
  } finally {
    pageLoading.value = false
  }
})

async function onAvatarFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const mimeOk = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
  if (!mimeOk) {
    addToast({ message: t('profile.toast.avatarTypeError'), type: 'error' })
    return
  }
  if (file.size > 4 * 1024 * 1024) {
    addToast({ message: t('profile.toast.avatarSizeError'), type: 'error' })
    return
  }

  const u = authStore.user
  if (!u) return

  const fd = new FormData()
  fd.append('avatar', file)

  avatarUploading.value = true
  try {
    const res = await api.post('/profile/avatar', fd) as {
      avatar_url?: string | null
      avatar?: string | null
    }
    authStore.patchUser({
      ...(res.avatar_url !== undefined ? { avatar_url: res.avatar_url } : {}),
      ...(res.avatar !== undefined ? { avatar: res.avatar } : {}),
    })
    syncFormFromUser()
    addToast({ message: t('profile.toast.avatarSuccess'), type: 'success' })
  } catch (err: any) {
    addToast({ message: err?.data?.message ?? t('profile.toast.avatarError'), type: 'error' })
  } finally {
    avatarUploading.value = false
  }
}

async function saveProfile() {
  const u = authStore.user
  if (!u) return

  const roleIds = u.roles?.map((r: any) => r.id) ?? []
  if (!roleIds.length) {
    addToast({ message: t('profile.toast.saveError'), type: 'error' })
    return
  }

  saving.value = true
  try {
    await api.put('/profile', {
      name: form.firstName,
      surname: form.lastName,
      email: form.email,
      roles: roleIds,
    })
    await authStore.getCurrentUser({ force: true })
    syncFormFromUser()
    addToast({ message: t('profile.toast.saveSuccess'), type: 'success' })
  } catch (err: any) {
    addToast({ message: err?.data?.message ?? t('profile.toast.saveError'), type: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteAccount() {
  const u = authStore.user
  if (!u) return

  const confirmed = window.confirm('Naozaj chcete anonymizovať a vymazať účet? Túto akciu nie je možné vrátiť späť.')
  if (!confirmed) return

  deletingAccount.value = true
  try {
    await api.post(`/users/anonymize-user/${u.id}`)
    authStore.$reset()
    addToast({ message: 'Účet bol anonymizovaný.', type: 'success' })
    await navigateTo('/auth/login')
  } catch (err: any) {
    addToast({ message: err?.data?.message ?? 'Anonymizácia účtu zlyhala.', type: 'error' })
  } finally {
    deletingAccount.value = false
  }
}
</script>
