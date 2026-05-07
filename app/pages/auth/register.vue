<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">

      <!-- Type selection -->
      <div v-if="step === 'type-selection'">
        <div class="mb-8 text-center">
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {{ $t('auth.register.title') }}
          </h1>
          <p class="text-gray-500 text-sm">
            {{ $t('auth.register.subtitle') }}
          </p>
        </div>

        <div class="space-y-3">
          <button
            class="w-full p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 transition-all duration-200 text-left group"
            @click="selectAccountType('student')"
          >
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <GraduationCap class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-slate-900 text-sm">
                    {{ $t('auth.register.type_selection.student.title') }}
                  </h3>
                  <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ $t('auth.register.type_selection.student.description') }}
                </p>
              </div>
            </div>
          </button>

          <button
            class="w-full p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 transition-all duration-200 text-left group"
            @click="selectAccountType('partner')"
          >
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0 w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Briefcase class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-slate-900 text-sm">
                    {{ $t('auth.register.type_selection.organization.title') }}
                  </h3>
                  <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ $t('auth.register.type_selection.organization.description') }}
                </p>
              </div>
            </div>
          </button>
        </div>

        <p class="text-center text-gray-500 text-sm mt-6">
          {{ $t('auth.register.login.text') }}
          <NuxtLink :to="localePath('/auth/login')" class="text-blue-600 hover:underline font-medium">
            {{ $t('auth.register.login.link') }}
          </NuxtLink>
        </p>
      </div>

      <!-- Registration form -->
      <div v-else-if="step === 'register'">
        <div class="mb-8">
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-slate-900 transition-colors mb-6"
            @click="step = 'type-selection'"
          >
            <ChevronLeft class="w-4 h-4" />
            {{ $t('auth.register.buttons.back') }}
          </button>

          <div class="flex items-center gap-2 mb-4">
            <div class="flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <GraduationCap v-if="accountType === 'student'" class="w-3.5 h-3.5" />
              <Briefcase v-else class="w-3.5 h-3.5" />
              <span>
                {{ accountType === 'student'
                  ? $t('auth.register.type_selection.student.title')
                  : $t('auth.register.type_selection.organization.title') }}
              </span>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 mb-1">
            {{ $t('auth.register.title') }}
          </h1>
          <p class="text-sm text-gray-500">
            {{ $t('auth.register.subtitle') }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="submitRegistration">
          <UiInput
            v-model="formData.email"
            type="email"
            :label="$t('auth.register.fields.email')"
            :placeholder="$t('auth.register.placeholders.email')"
            required
            :error="errors.email"
          />

          <div class="space-y-2">
            <UiInput
              v-model="formData.password"
              type="password"
              :label="$t('auth.register.fields.password')"
              :placeholder="$t('auth.register.placeholders.password')"
              required
              :error="errors.password"
            />
            <div v-if="formData.password">
              <div class="flex gap-1 mb-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-all duration-300"
                  :class="passwordStrength >= i ? strengthColor : 'bg-gray-200'"
                />
              </div>
              <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
            </div>
          </div>

          <UiInput
            v-model="formData.password_confirmation"
            type="password"
            :label="$t('auth.register.fields.password_confirmation')"
            :placeholder="$t('auth.register.placeholders.password')"
            required
            :error="errors.password_confirmation"
          />

          <label class="flex items-start gap-3 cursor-pointer group">
            <div class="relative mt-0.5 flex-shrink-0">
              <input v-model="formData.termsAccepted" type="checkbox" class="sr-only peer" />
              <div class="w-4 h-4 rounded border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-blue-400 transition-colors flex items-center justify-center">
                <svg v-if="formData.termsAccepted" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <span class="text-sm text-gray-600 leading-snug">
              {{ $t('auth.register.terms.text') }}
              <NuxtLink to="#" class="text-blue-600 hover:underline">{{ $t('auth.register.terms.terms') }}</NuxtLink>
              {{ ' a ' }}
              <NuxtLink to="#" class="text-blue-600 hover:underline">{{ $t('auth.register.terms.privacy') }}</NuxtLink>
            </span>
          </label>
          <p v-if="errors.terms" class="text-xs text-red-600">{{ errors.terms }}</p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            {{ isSubmitting ? $t('auth.register.buttons.registering') : $t('auth.register.buttons.register') }}
          </button>

          <p class="text-center text-gray-500 text-sm">
            {{ $t('auth.register.login.text') }}
            <NuxtLink :to="localePath('/auth/login')" class="text-blue-600 hover:underline font-medium">
              {{ $t('auth.register.login.link') }}
            </NuxtLink>
          </p>
        </form>
      </div>

      <!-- Success -->
      <div
        v-else-if="step === 'success'"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5"
      >
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Skontrolujte si e-mail</h1>
          <p class="text-sm text-gray-500 leading-relaxed">
            Poslali sme overovací odkaz na
            <span class="font-medium text-slate-700">{{ formData.email }}</span>.
            Kliknite na odkaz v e-maile pre dokončenie registrácie.
          </p>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 text-left">
          E-mail môže trvať niekoľko minút. Skontrolujte aj priečinok spam.
        </div>
        <button
          @click="resendEmail(formData.email)"
          :disabled="isResending || resendSuccess"
          class="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium text-sm
                 hover:bg-slate-800 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2"
        >
          <svg v-if="isResending" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
          {{ isResending ? 'Odosielam...' : resendSuccess ? 'E-mail odoslaný ✓' : 'Poslať znova' }}
        </button>
        <NuxtLink :to="localePath('/auth/login')" class="block text-sm text-gray-500 hover:text-slate-900 transition-colors">
          ← Späť na prihlásenie
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { GraduationCap, Briefcase, ChevronLeft, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

useHead({
  title: 'Registrácia | NTI',
  meta: [{ name: 'description', content: 'Zaregistrujte sa v NTI a začnite s nami vašu cestu!' }],
})

const authStore    = useAuthStore()
const api          = useApi()
const localePath   = useLocalePath()
const { addToast } = useToast()

const step          = ref<'type-selection' | 'register' | 'success'>('type-selection')
const accountType   = ref<'student' | 'partner' | null>(null)
const isSubmitting  = ref(false)
const isResending   = ref(false)
const resendSuccess = ref(false)

const formData = reactive({
  email:                 '',
  password:              '',
  password_confirmation: '',
  termsAccepted:         false,
})

const errors = reactive({
  email:                 '',
  password:              '',
  password_confirmation: '',
  terms:                 '',
})

const handleStorageChange = async (e: StorageEvent) => {
  if (e.key === '_t' && e.newValue) {
    await authStore.getCurrentUser()
    await navigateTo(authStore.redirectUser())
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

const selectAccountType = (type: 'student' | 'partner') => {
  accountType.value = type
  step.value = 'register'
}

const passwordStrength = computed(() => {
  const p = formData.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8)           score++
  if (/[A-Z]/.test(p))         score++
  if (/[0-9]/.test(p))         score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1)  return 'bg-red-400'
  if (passwordStrength.value === 2) return 'bg-amber-400'
  if (passwordStrength.value === 3) return 'bg-blue-400'
  return 'bg-green-500'
})

const strengthTextColor = computed(() => {
  if (passwordStrength.value <= 1)  return 'text-red-500'
  if (passwordStrength.value === 2) return 'text-amber-500'
  if (passwordStrength.value === 3) return 'text-blue-500'
  return 'text-green-600'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value <= 1)  return 'Slabé heslo'
  if (passwordStrength.value === 2) return 'Primerané heslo'
  if (passwordStrength.value === 3) return 'Dobré heslo'
  return 'Silné heslo'
})

const validatePassword = (password: string) => {
  if (password.length < 8)             return 'Heslo musí mať aspoň 8 znakov'
  if (!/[A-Z]/.test(password))         return 'Heslo musí obsahovať veľké písmeno'
  if (!/[0-9]/.test(password))         return 'Heslo musí obsahovať číslicu'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Heslo musí obsahovať špeciálny znak'
  return null
}

const validateForm = (): boolean => {
  errors.email                 = ''
  errors.password              = ''
  errors.password_confirmation = ''
  errors.terms                 = ''
  let valid = true

  if (!formData.email) {
    errors.email = 'Email je povinný'
    valid = false
  }

  if (!formData.password) {
    errors.password = 'Heslo je povinné'
    valid = false
  } else {
    const pwError = validatePassword(formData.password)
    if (pwError) { errors.password = pwError; valid = false }
  }

  if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Heslá sa nezhodujú'
    valid = false
  }

  if (!formData.termsAccepted) {
    errors.terms = 'Musíte súhlasiť s podmienkami'
    valid = false
  }

  return valid
}

const submitRegistration = async () => {
  if (!validateForm()) return
  isSubmitting.value = true

  try {
    await api.post('/auth/register', {
      email:                 formData.email,
      password:              formData.password,
      password_confirmation: formData.password_confirmation,
      role:                  accountType.value,
    })

    step.value = 'success'
  } catch (err: any) {
    const message = err?.data?.message ?? err?.message ?? 'Chyba pri registrácii.'
    addToast({ message, type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const resendEmail = async (email: string) => {
  isResending.value = true

  try {
    await api.post('/auth/resend-verification', { email })
    resendSuccess.value = true
  } finally {
    isResending.value = false
  }
}
</script>