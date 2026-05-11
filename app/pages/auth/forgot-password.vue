<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">
      <!-- REQUEST RESET -->
      <template v-if="!emailSent">
        <form
          @submit.prevent="handleRequestReset"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
          <div class="mb-8 text-center">
            <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">
              {{ $t('auth.forgot.title') }}
            </h1>
            <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              {{ $t('auth.forgot.subtitle') }}
            </p>
          </div>

          <UiInput
            v-model="email"
            type="email"
            :label="$t('auth.forgot.email_label')"
            :placeholder="$t('auth.forgot.email_placeholder')"
            required
            :error="emailError"
          />

          <div v-if="serverError" class="text-red-500 text-sm">
            {{ serverError }}
          </div>

          <!-- Turnstile -->
           <div class="turnstile-wrapper">
  <NuxtTurnstile
    ref="turnstile"
    v-model="token"
    :options="{ theme: 'light' }"
    @error="resetTurnstile"
    @expired="resetTurnstile"
  />
</div>

          <button
            type="submit"
            :disabled="isLoading || !token"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <span v-if="!isLoading">{{ $t('auth.forgot.button_send') }}</span>
            <span v-else>{{ $t('auth.forgot.button_sending') }}</span>
          </button>

          <p class="text-center text-gray-500 text-sm">
            {{ $t('auth.forgot.remember_password') }}
            <NuxtLink :to="localePath('/auth/login')" class="text-blue-600 hover:underline font-medium">
              {{ $t('auth.forgot.login') }}
            </NuxtLink>
          </p>
        </form>
      </template>

      <!-- EMAIL SENT -->
      <template v-else>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          <h1 class="text-2xl font-bold text-navy">{{ $t('auth.forgot.sent_title') }}</h1>
          <p class="text-gray-600 text-sm">
            {{ $t('auth.forgot.success_text') }}
            <span class="font-semibold">{{ email }}</span>.
          </p>
          <p class="text-gray-500 text-sm">{{ $t('auth.forgot.expires') }}</p>
          <p class="text-blue-600 text-sm">{{ $t('auth.forgot.info') }}</p>

          <button
            @click="handleResend"
            :disabled="resendCooldown > 0 || isLoading"
            class="w-full border py-2.5 rounded-lg text-sm"
          >
            <span v-if="resendCooldown > 0">{{ $t('auth.forgot.resend_wait') }} {{ resendCooldown }}s</span>
            <span v-else>{{ $t('auth.forgot.resend') }}</span>
          </button>

          <NuxtLink :to="localePath('/auth/login')" class="block text-sm text-gray-500">
            ← {{ $t('auth.forgot.login') }}
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const localePath = useLocalePath()
const route = useRoute()

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const { t, locale } = useI18n()

useHead({
  title: computed(() => t('auth.forgot.title_seo')),
})

const authStore = useAuthStore()

const email       = ref('')
const emailError  = ref(null)
const serverError = ref(null)
const isLoading   = ref(false)
const emailSent   = ref(false)
const resendCooldown = ref(0)
const token       = ref('')
const turnstile   = ref(null) // ref to widget

let cooldownInterval = null

const resetTurnstile = () => {
  token.value = ''
  nextTick(() => {
    turnstile.value?.reset?.()
  })
}

const validate = () => {
  emailError.value = null
  if (!email.value) {
    emailError.value = t('auth.forgot.email_warning')
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = t('auth.forgot.email_warning_1')
    return false
  }
  return true
}

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownInterval)
  }, 1000)
}

const handleRequestReset = async () => {
  if (!validate()) return
  if (!token.value) return

  isLoading.value = true
  serverError.value = null

  try {
    await authStore.requestPasswordReset(email.value, locale.value, token.value)
    emailSent.value = true
    startCooldown()
  } catch (err) {
    // Deliberately vague to prevent user enumeration
    emailSent.value = true
    startCooldown()
  } finally {
    isLoading.value = false
    resetTurnstile() // proper reset instead of just clearing token
  }
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return
  isLoading.value = true
  try {
    await authStore.requestPasswordReset(email.value, locale.value)
  } catch {
    // silent
  } finally {
    isLoading.value = false
    startCooldown()
  }
}

const checkTokenAndRedirect = async () => {
  if (import.meta.server) return
  const token = localStorage.getItem('_t')
  if (!token) return
  if (route.path !== '/auth/forgot-password') return
  await authStore.getCurrentUser()
  await navigateTo(authStore.redirectUser(authStore.user))
}

const handleStorage = (e: StorageEvent) => {
  if (e.key === '_t' && e.newValue) checkTokenAndRedirect()
}

onMounted(() => {
  checkTokenAndRedirect()
  window.addEventListener('storage', handleStorage)
})

onUnmounted(() => {
  clearInterval(cooldownInterval)
  window.removeEventListener('storage', handleStorage)
})
</script>

<style scoped>
    .turnstile-wrapper {
  width: 100%;
  max-width: 330px; /* adjust as needed */
  overflow: hidden;
}

/* Optional: center it */
.turnstile-wrapper iframe {
  max-width: 100%;
}
</style>