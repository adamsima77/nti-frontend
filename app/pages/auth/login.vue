<template>
  <UiToast />
  <div class="min-h-screen w-full flex items-center justify-center bg-gray-50 px-3">
    <div class="w-full max-w-md">

      <form
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sm:p-6 space-y-4"
        @submit.prevent="handleLogin"
      >

        <!-- Header -->
        <div class="mb-5 text-center">
          <NuxtLink :to="localePath('/')" class="inline-block mb-4" />
          <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">
            {{ $t('auth.login.title') }}
          </h1>
          <p class="text-gray-600 text-sm sm:text-base">
            {{ $t('auth.login.subtitle') }}
          </p>
        </div>

        <!-- Email -->
        <UiInput
          v-model="formData.email"
          type="email"
          :label="$t('auth.login.fields.email.label')"
          :placeholder="$t('auth.login.fields.email.placeholder')"
          required
          :error="errors.email"
        />

        <!-- Password -->
        <UiInput
          v-model="formData.password"
          type="password"
          :label="$t('auth.login.fields.password.label')"
          :placeholder="$t('auth.login.fields.password.placeholder')"
          required
          :error="errors.password"
        />

        <!-- Forgot -->
        <div class="flex justify-end">
          <NuxtLink
            :to="localePath('/auth/forgot-password')"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ $t('auth.login.forgot_password') }}
          </NuxtLink>
        </div>

        <!-- Turnstile -->
        <div class="turnstile-wrapper">
          <NuxtTurnstile
            ref="turnstile"
            v-model="turnstileToken"
            :options="{
              theme: 'light',
              size: 'flexible'
            }"
            @error="resetTurnstile"
            @expired="resetTurnstile"
          />
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading || !turnstileToken"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">{{ $t('auth.login.submit') }}</span>
          <span v-else>{{ $t('auth.login.loading') }}</span>
        </button>

        <!-- Register -->
        <p class="text-center text-gray-600 text-sm">
          {{ $t('auth.login.no_account') }}
          <NuxtLink
            :to="localePath('/auth/register')"
            class="text-blue-600 hover:underline font-medium"
          >
            {{ $t('auth.login.register') }}
          </NuxtLink>
        </p>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'

const localePath = useLocalePath()
const { t }      = useI18n()

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

useHead({
  title: computed(() => t('auth.login.title')),
})

const authStore = useAuthStore()
const route     = useRoute()
const { addToast, addToastAfterRedirect, flushPendingToast } = useToast()

const turnstile      = ref(null)
const isLoading      = ref(false)
const turnstileToken = ref('')

const formData = reactive({
  email:    '',
  password: '',
})

const errors = reactive({
  email:    null as string | null,
  password: null as string | null,
})

const resetTurnstile = () => {
  turnstileToken.value = ''
  nextTick(() => {
    turnstile.value?.reset?.()
  })
}

const getLocalizedLoginErrorKey = (backendMessage: string): string => {
  const map: Record<string, string> = {
    'The provided credentials are incorrect.':         'auth.login.errors.invalid_credentials',
    'Please verify your email before logging in.':     'auth.login.errors.unverified_email',
    'Your account is pending email approval.':         'auth.login.errors.pending_email',
    'Your account has been deactivated.':              'auth.login.errors.inactive',
    'Your account has been blocked. Contact support.': 'auth.login.errors.banned',
    'Human verification failed. Please try again.':    'auth.login.errors.turnstile',
  }
  return map[backendMessage] ?? 'auth.login.errors.generic'
}

const validateForm = () => {
  errors.email    = null
  errors.password = null

  let isValid = true

  if (!formData.email) {
    errors.email = t('auth.forgot.email_warning')
    isValid = false
  }

  if (!formData.password) {
    errors.password = t('auth.forgot.password_warn')
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  if (!turnstileToken.value) return

  isLoading.value = true

  try {
    await authStore.login(
      formData.email,
      formData.password,
      turnstileToken.value,
    )

    const redirectQuery = route.query.redirect
    const redirectRaw   = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery
    // Decode the encoded redirect URL (e.g. %2Fcms%2Fmanagement%3Ftab%3Dbannery)
    const redirectUrl   = redirectRaw ? decodeURIComponent(redirectRaw) : null

    resetTurnstile()

    addToastAfterRedirect({
      message: t('auth.login.success') ?? 'Welcome back!',
      type: 'success',
    })

    if (redirectUrl && redirectUrl.startsWith('/')) {
      // Split path and query so localePath only localizes the path
      const url = new URL(redirectUrl, window.location.origin)
      await navigateTo(localePath({
        path:  url.pathname,
        query: Object.fromEntries(url.searchParams),
      }))
    } else {
      await navigateTo(localePath(authStore.redirectUser()))
    }
  } catch (error: unknown) {
    resetTurnstile()
    const raw = error instanceof Error ? error.message : ''
    addToast({
      message: t(getLocalizedLoginErrorKey(raw)),
      type: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// Cross-tab login sync — another tab logged in, reload so guest middleware re-runs
const handleStorage = (e: StorageEvent) => {
  if (e.key === '_t' && e.newValue) {
    window.location.reload()
  }
}

onMounted(() => {
  flushPendingToast()
  window.addEventListener('storage', handleStorage)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorage)
})
</script>

<style scoped>
.turnstile-wrapper {
  width: 100%;
  max-width: 330px;
  overflow: hidden;
}

.turnstile-wrapper :deep(iframe) {
  max-width: 100%;
}
</style>