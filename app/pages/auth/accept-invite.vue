<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">

      <!-- Loading -->
      <div v-if="isValidating" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div class="flex justify-center mb-4">
          <svg class="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">Overujem pozvánku...</p>
      </div>

      <!-- Invalid / expired -->
      <div v-else-if="!invite" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>
        <div>
          <p class="font-semibold text-navy mb-1">Neplatná pozvánka</p>
          <p class="text-sm text-gray-500">Tento odkaz je neplatný alebo jeho platnosť vypršala. Kontaktujte administrátora organizácie.</p>
        </div>
      </div>

      <!-- Success -->
      <div v-else-if="success" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-5">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div>
          <p class="font-semibold text-navy mb-1">Pozvánka prijatá!</p>
          <p class="text-sm text-gray-500">
            Váš účet bol vytvorený a čaká na schválenie NTI administrátorom.
            Po schválení budete môcť sa prihlásiť.
          </p>
        </div>
        <NuxtLink
          :to="localePath('/auth/login')"
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm"
        >
          Prejsť na prihlásenie
        </NuxtLink>
      </div>

      <!-- Form -->
      <template v-else>
        <form @submit.prevent="handleAccept" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">

          <!-- Header -->
          <div class="text-center mb-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-navy mb-1">Prijať pozvánku</h1>
            <p class="text-sm text-gray-500">
              Organizácia <strong class="text-navy">{{ invite.organization_name }}</strong> vás pozýva ako
              <strong class="text-navy">{{ roleLabelSk(invite.role) }}</strong>
            </p>
          </div>

          <!-- Email (read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input
              type="email"
              :value="invite.email"
              disabled
              class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
            />
          </div>

          <!-- Meno a priezvisko -->
          <div class="grid grid-cols-2 gap-3">
            <UiInput
              v-model="form.name"
              type="text"
              label="Meno"
              placeholder="Ján"
              required
              :error="errors.name"
            />
            <UiInput
              v-model="form.surname"
              type="text"
              label="Priezvisko"
              placeholder="Novák"
              required
              :error="errors.surname"
            />
          </div>

          <!-- Password -->
          <UiInput
            v-model="form.password"
            type="password"
            label="Nové heslo"
            placeholder="••••••••••"
            required
            :error="errors.password"
          />

          <!-- Strength bar -->
          <div v-if="form.password" class="space-y-1.5">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all duration-300" :class="strengthBarColor(i)" />
            </div>
            <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <!-- Confirm password -->
          <UiInput
            v-model="form.password_confirmation"
            type="password"
            label="Potvrdiť heslo"
            placeholder="••••••••••"
            required
            :error="errors.password_confirmation"
          />

          <!-- Requirements -->
          <ul class="space-y-1">
            <li v-for="req in passwordRequirements" :key="req.label"
              class="flex items-center gap-2 text-xs transition-colors"
              :class="req.met ? 'text-green-500' : 'text-gray-400'"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline v-if="req.met" points="20 6 9 17 4 12" />
                <circle v-else cx="12" cy="12" r="9" />
              </svg>
              {{ req.label }}
            </li>
          </ul>

          <!-- Server error -->
          <div v-if="serverError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {{ serverError }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            {{ isLoading ? 'Aktivujem...' : 'Aktivovať účet' }}
          </button>

        </form>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'Prijať pozvánku | NTI' })

const route = useRoute()
const localePath = useLocalePath()
const api = useApi()

const token = computed(() => route.query.token as string)

const isValidating = ref(true)
const invite = ref<any>(null)
const success = ref(false)
const isLoading = ref(false)
const serverError = ref<string | null>(null)

const form = reactive({ name: '', surname: '', password: '', password_confirmation: '' })
const errors = reactive({ name: null as string | null, surname: null as string | null, password: null as string | null, password_confirmation: null as string | null })

const roleLabelSk = (role: string) => ({
  org_admin: 'Správca organizácie',
  org_member: 'Člen',
  org_product_owner: 'Product Owner',
})[role] ?? role

// Validate token on mount
onMounted(async () => {
  if (!token.value) { isValidating.value = false; return }
  try {
    const res = await api.get(`/auth/invite?token=${encodeURIComponent(token.value)}`) as any
    invite.value = res.valid ? res : null
  } catch {
    invite.value = null
  } finally {
    isValidating.value = false
  }
})

// Password requirements
const passwordRequirements = computed(() => [
  { label: 'Aspoň 8 znakov', met: form.password.length >= 8 },
  { label: 'Veľké písmeno', met: /[A-Z]/.test(form.password) },
  { label: 'Číslo', met: /[0-9]/.test(form.password) },
  { label: 'Špeciálny znak', met: /[^A-Za-z0-9]/.test(form.password) },
])

const strengthScore = computed(() => passwordRequirements.value.filter(r => r.met).length)

const strengthBarColor = (i: number) => {
  if (!form.password) return 'bg-gray-200'
  const s = strengthScore.value
  if (i <= s) {
    if (s <= 1) return 'bg-red-500'
    if (s === 2) return 'bg-yellow-500'
    if (s === 3) return 'bg-blue-500'
    return 'bg-green-500'
  }
  return 'bg-gray-200'
}

const strengthLabel = computed(() => {
  const s = strengthScore.value
  if (s <= 1) return 'Slabé'
  if (s === 2) return 'Primerané'
  if (s === 3) return 'Dobré'
  return 'Silné'
})

const strengthTextColor = computed(() => {
  const s = strengthScore.value
  if (s <= 1) return 'text-red-500'
  if (s === 2) return 'text-yellow-500'
  if (s === 3) return 'text-blue-600'
  return 'text-green-500'
})

const validate = () => {
  errors.name = null
  errors.surname = null
  errors.password = null
  errors.password_confirmation = null
  let valid = true
  if (!form.name.trim()) { errors.name = 'Meno je povinné'; valid = false }
  if (!form.surname.trim()) { errors.surname = 'Priezvisko je povinné'; valid = false }
  if (!form.password || form.password.length < 8) {
    errors.password = 'Heslo musí mať aspoň 8 znakov'
    valid = false
  }
  if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Heslá sa nezhodujú'
    valid = false
  }
  return valid
}

const handleAccept = async () => {
  if (!validate()) return
  isLoading.value = true
  serverError.value = null
  try {
    await api.post('/auth/accept-invite', {
      token: token.value,
      name: form.name,
      surname: form.surname,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })
    success.value = true
  } catch (err: any) {
    serverError.value = err?.message ?? 'Niečo sa pokazilo. Skúste znova.'
  } finally {
    isLoading.value = false
  }
}
</script>
