<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">

      <!-- Loading -->
      <div
        v-if="status === 'loading'"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-4"
      >
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <svg class="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
          </div>
        </div>
        <h1 class="text-xl font-bold text-slate-900">Overujem e-mail...</h1>
        <p class="text-sm text-gray-500">Prosím čakajte, overujeme platnosť odkazu.</p>
      </div>

      <!-- Success -->
      <div
        v-else-if="status === 'success'"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5"
      >
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">E-mail overený</h1>
          <p class="text-sm text-gray-500 leading-relaxed">
            Váš e-mail bol úspešne overený. Pokračujte nastavením profilu.
          </p>
        </div>
        <button
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          @click="goToOnboarding"
        >
          Pokračovať
        </button>
      </div>

      <!-- Error -->
      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5"
      >
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Odkaz vypršal</h1>
          <p class="text-sm text-gray-500 leading-relaxed">
            Overovací odkaz je neplatný alebo jeho platnosť vypršala.
          </p>
        </div>

        <div v-if="!resendSuccess" class="space-y-3 pt-4 border-t border-gray-100">
          <p class="text-xs text-left font-medium text-gray-700">Zaslať nový odkaz:</p>
          <UiInput
            v-model="resendEmail"
            type="email"
            placeholder="Váš registrovaný e-mail"
            :error="resendError"
          />
          <button
            :disabled="isResending"
            class="w-full bg-slate-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            @click="handleResend"
          >
            <svg v-if="isResending" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            {{ isResending ? 'Odosielam...' : 'Odoslať nový e-mail' }}
          </button>
        </div>

        <div
          v-else
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
        >
          Nový overovací e-mail bol odoslaný.
        </div>

        <NuxtLink
          :to="localePath('/auth/login')"
          class="block text-sm text-gray-500 hover:text-slate-900 transition-colors"
        >
          ← Späť na prihlásenie
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route      = useRoute()
const router     = useRouter()
const authStore  = useAuthStore()
const localePath = useLocalePath()
const config     = useRuntimeConfig()

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const status        = ref<'loading' | 'success' | 'error'>('loading')
const resendEmail   = ref('')
const resendError   = ref('')
const isResending   = ref(false)
const resendSuccess = ref(false)

onMounted(async () => {
  // id and hash come from route path segments
  const id   = route.params.id as string
  const hash = route.params.hash as string

  // expires and signature come from query string
  const expires   = route.query.expires as string
  const signature = route.query.signature as string

  if (!id || !hash || !expires || !signature) {
    status.value = 'error'
    return
  }

  try {
    const res = await $fetch<{ user: any; token: string }>(
      `/auth/verify-email/${id}/${hash}`,
      {
        baseURL: config.public.apiBase,
        method:  'GET',
        params: {
          expires,
          // decode in case email client re-encoded the signature
          signature: decodeURIComponent(signature),
        },
      }
    )

    localStorage.setItem('_t', res.token)
    authStore.user = res.user
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
})

const api = useApi()

const goToOnboarding = () => {
  router.push(localePath('/auth/onboarding'))
}

const handleResend = async () => {
  resendError.value = ''

  if (!resendEmail.value) {
    resendError.value = 'Zadajte e-mail'
    return
  }

  isResending.value = true
 try {
  await api.post('/auth/resend-verification', {
    email: resendEmail.value,
  })

  resendSuccess.value = true
} catch (err: any) {
  resendError.value =
    err?.response?._data?.message ??
    'Nepodarilo sa odoslať e-mail.'
} finally {
  isResending.value = false
}
}
</script>