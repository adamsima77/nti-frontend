<!-- pages/auth/reset-password.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">

      <!-- Invalid / expired token -->
      <div
        v-if="tokenInvalid"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5"
      >
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
        </div>
        <div>
          <p class="font-semibold text-navy mb-1">Odkaz je neplatný alebo vypršal</p>
          <p class="text-sm text-gray-500">Platnosť odkazu na obnovenie hesla je 60 minút. Požiadajte o nový.</p>
        </div>
        <NuxtLink
          to="/auth/forgot-password"
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm"
        >
          Požiadať o nový odkaz
        </NuxtLink>
      </div>

      <!-- Reset form -->
      <template v-else-if="!resetSuccess">
        <form
          @submit.prevent="handleResetPassword"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5"
        >

          <!-- Header -->
          <div class="mb-8 text-center">
            <template v-if="!resetSuccess">
              <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">Nové heslo</h1>
              <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                Zadajte nové heslo pre váš účet.
              </p>
            </template>
            <template v-else>
              <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">Heslo zmenené</h1>
              <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                Vaše heslo bolo úspešne nastavené.
              </p>
            </template>
          </div>

          <UiInput
            v-model="formData.password"
            type="password"
            label="Nové heslo"
            placeholder="••••••••••"
            required
            :error="errors.password"
          />

          <!-- Password strength indicator -->
          <div v-if="formData.password" class="space-y-1.5">
            <div class="flex gap-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="strengthBarColor(i)"
              />
            </div>
            <p class="text-xs" :class="strengthTextColor">
              {{ strengthLabel }}
            </p>
          </div>

          <UiInput
            v-model="formData.password_confirmation"
            type="password"
            label="Potvrdiť nové heslo"
            placeholder="••••••••••"
            required
            :error="errors.password_confirmation"
          />

          <!-- Password requirements -->
          <ul class="space-y-1">
            <li
              v-for="req in passwordRequirements"
              :key="req.label"
              class="flex items-center gap-2 text-xs transition-colors"
              :class="req.met ? 'text-success-500' : 'text-gray-400'"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline v-if="req.met" points="20 6 9 17 4 12"/>
                <circle v-else cx="12" cy="12" r="9"/>
              </svg>
              {{ req.label }}
            </li>
          </ul>

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
            <span>{{ isLoading ? 'Ukladám...' : 'Nastaviť nové heslo' }}</span>
          </button>
        </form>
      </template>

      <!-- Success state -->
      <template v-else>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center">
              <svg class="w-8 h-8 text-success-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>

          <p class="text-sm text-gray-600 leading-relaxed">
            Vaše heslo bolo úspešne zmenené. Môžete sa teraz prihlásiť.
          </p>

          <NuxtLink
            to="/auth/login"
            class="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm"
          >
            Prejsť na prihlásenie
          </NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

useHead({
  title: 'Obnovenie hesla | NTI',
  meta: [
    {
      name: 'description',
      content: 'Nastavte nové heslo pre váš NTI účet'
    }
  ]
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const serverError = ref(null)
const tokenInvalid = ref(false)
const resetSuccess = ref(false)

const formData = reactive({
  password: '',
  password_confirmation: ''
})

const errors = reactive({
  password: null,
  password_confirmation: null
})

// Token from query param (?token=xxx)
const resetToken = computed(() => route.query.token || '')

onMounted(() => {
  if (!resetToken.value) {
    tokenInvalid.value = true
  }
})

// ── Password strength ──
const passwordRequirements = computed(() => [
  { label: 'Minimálne 8 znakov', met: formData.password.length >= 8 },
  { label: 'Aspoň jedno veľké písmeno', met: /[A-Z]/.test(formData.password) },
  { label: 'Aspoň jedna číslica', met: /[0-9]/.test(formData.password) },
  { label: 'Aspoň jeden špeciálny znak', met: /[^A-Za-z0-9]/.test(formData.password) },
])

const strengthScore = computed(() => passwordRequirements.value.filter(r => r.met).length)

const strengthBarColor = (i) => {
  if (formData.password.length === 0) return 'bg-gray-200'
  const s = strengthScore.value
  if (i <= s) {
    if (s <= 1) return 'bg-danger-500'
    if (s === 2) return 'bg-warning-500'
    if (s === 3) return 'bg-blue-500'
    return 'bg-success-500'
  }
  return 'bg-gray-200'
}

const strengthLabel = computed(() => {
  const s = strengthScore.value
  if (s <= 1) return 'Slabé heslo'
  if (s === 2) return 'Primerané heslo'
  if (s === 3) return 'Dobré heslo'
  return 'Silné heslo'
})

const strengthTextColor = computed(() => {
  const s = strengthScore.value
  if (s <= 1) return 'text-danger-500'
  if (s === 2) return 'text-warning-500'
  if (s === 3) return 'text-blue-600'
  return 'text-success-500'
})

// ── Validation ──
const validate = () => {
  errors.password = null
  errors.password_confirmation = null
  let valid = true

  if (!formData.password) {
    errors.password = 'Heslo je povinné'
    valid = false
  } else if (formData.password.length < 8) {
    errors.password = 'Heslo musí mať aspoň 8 znakov'
    valid = false
  }

  if (!formData.password_confirmation) {
    errors.password_confirmation = 'Potvrďte nové heslo'
    valid = false
  } else if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Heslá sa nezhodujú'
    valid = false
  }

  return valid
}

// ── Submit ──
const handleResetPassword = async () => {
  if (!validate()) return

  isLoading.value = true
  serverError.value = null

  try {
    await authStore.resetPassword(
      resetToken.value,
      formData.password,
      formData.password_confirmation
    )
    resetSuccess.value = true
  } catch (err) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
      tokenInvalid.value = true
    } else {
      serverError.value = msg || 'Nastala chyba. Skúste znova alebo požiadajte o nový odkaz.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>