<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">

      <!-- Request reset -->
      <template v-if="!emailSent">
        <form
          @submit.prevent="handleRequestReset"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
        
          <!-- Header -->
          <div class="mb-8 text-center">
            <template v-if="!emailSent">
              <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">Zabudnuté heslo</h1>
              <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                Zadajte svoju e-mailovú adresu a pošleme vám odkaz na obnovenie hesla.
              </p>
            </template>
            <template v-else>
              <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">Skontrolujte email</h1>
              <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                Ak účet s touto adresou existuje, odoslali sme vám inštrukcie na obnovenie hesla.
              </p>
            </template>
          </div>

          <UiInput
            v-model="email"
            type="email"
            label="E-mailová adresa"
            placeholder="vas@email.com"
            required
            :error="emailError"
          />

          <!-- Server error -->
          <div
            v-if="serverError"
            class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          >
            <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ serverError }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            <span>{{ isLoading ? 'Odosielam...' : 'Odoslať odkaz na obnovenie' }}</span>
          </button>

          <p class="text-center text-gray-500 text-sm">
            Spomínate si na heslo?
            <NuxtLink to="/auth/login" class="text-blue-600 hover:underline font-medium">
              Prihláste sa
            </NuxtLink>
          </p>
        </form>
      </template>

      <!-- Email sent confirmation -->
      <template v-else>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          <!-- Success icon -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-600 leading-relaxed">
              Odkaz bol odoslaný na
              <span class="font-semibold text-navy">{{ email }}</span>.
              Platnosť odkazu je <span class="font-medium">60 minút</span>.
            </p>
          </div>

          <!-- Info box -->
          <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 text-left flex gap-2">
            <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Ak email nenájdete v doručenej pošte, skontrolujte priečinok so spamom alebo hromadnou poštou.
          </div>

          <button
            @click="handleResend"
            :disabled="resendCooldown > 0 || isLoading"
            class="w-full border border-gray-200 text-gray-600 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span v-if="resendCooldown > 0">Znova odoslať za {{ resendCooldown }}s</span>
            <span v-else>Odoslať znova</span>
          </button>

          <NuxtLink
            to="/auth/login"
            class="block text-center text-sm text-gray-500 hover:text-navy transition-colors"
          >
            ← Späť na prihlásenie
          </NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

useHead({
  title: 'Zabudnuté heslo | NTI',
  meta: [
    {
      name: 'description',
      content: 'Obnovte prístup do svojho NTI účtu pomocou e-mailu'
    }
  ]
})

const authStore = useAuthStore()

const email = ref('')
const emailError = ref(null)
const serverError = ref(null)
const isLoading = ref(false)
const emailSent = ref(false)
const resendCooldown = ref(0)

let cooldownInterval = null

const validate = () => {
  emailError.value = null
  if (!email.value) {
    emailError.value = 'E-mailová adresa je povinná'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Zadajte platnú e-mailovú adresu'
    return false
  }
  return true
}

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
    }
  }, 1000)
}

const handleRequestReset = async () => {
  if (!validate()) return

  isLoading.value = true
  serverError.value = null

  try {
    await authStore.requestPasswordReset(email.value)
    emailSent.value = true
    startCooldown()
  } catch (err) {
    // Deliberately vague to prevent user enumeration
    emailSent.value = true
    startCooldown()
  } finally {
    isLoading.value = false
  }
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return
  isLoading.value = true
  try {
    await authStore.requestPasswordReset(email.value)
  } catch {
    // silent
  } finally {
    isLoading.value = false
    startCooldown()
  }
}

onUnmounted(() => {
  clearInterval(cooldownInterval)
})
</script>