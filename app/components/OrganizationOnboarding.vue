<template>
  <div class="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden w-full max-w-md mx-auto">

    <!-- Top accent bar -->
    <div class="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

    <div class="p-8">
      <!-- Header -->
      <div class="text-center mb-7">
        <span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full tracking-wide mb-3">
          Step {{ step }} of 3
        </span>
        <h1 class="text-xl font-bold text-slate-900 mb-1">Company Onboarding</h1>
        <p class="text-sm text-slate-400">Let's set your organisation up for success</p>
      </div>

      <!-- Progress -->
      <div class="relative mb-8">
        <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            :style="{ width: progress + '%' }"
          />
        </div>
        <div class="absolute inset-0 flex items-center justify-between px-0.5 pointer-events-none">
          <div
            v-for="s in 3" :key="s"
            class="w-3.5 h-3.5 rounded-full border-2 border-white transition-all duration-300"
            :class="{
              'bg-blue-500': s < step,
              'bg-white ring-2 ring-blue-500': s === step,
              'bg-slate-200': s > step,
            }"
          />
        </div>
      </div>

      <!-- Steps -->
      <transition name="slide" mode="out-in">

        <!-- STEP 1 — Company info -->
        <div v-if="step === 1" key="s1">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">🏢</div>
            <div>
              <h2 class="text-base font-bold text-slate-800">Company Info</h2>
              <p class="text-xs text-slate-400">Basic company details</p>
            </div>
          </div>

          <div class="space-y-4">
            <UiFormField
              v-model="form.name"
              label="Company name"
              placeholder="e.g. Acme s.r.o."
              field="name"
              :touched="touched"
              :is-valid="isValid"
              error="Minimum 2 characters"
              @touch="touch"
            />
            <UiFormField
              v-model="form.phone"
              label="Phone"
              placeholder="+421 900 000 000"
              type="tel"
              field="phone"
              :touched="touched"
              :is-valid="isValid"
              error="Minimum 6 characters"
              @touch="touch"
            />
            <div class="grid grid-cols-2 gap-3">
              <UiFormField
                v-model="form.ico"
                label="IČO"
                hint="8 digits"
                placeholder="12345678"
                field="ico"
                maxlength="8"
                mono
                :touched="touched"
                :is-valid="isValid"
                error="Exactly 8 digits"
                @touch="touch"
              />
              <UiFormField
                v-model="form.web_url"
                label="Website"
                hint="optional"
                placeholder="https://acme.sk"
                type="url"
                field="web_url"
                :touched="touched"
                :is-valid="isValid"
                error="Must start with https://"
                @touch="touch"
              />
            </div>
          </div>
        </div>

        <!-- STEP 2 — Address -->
        <div v-else-if="step === 2" key="s2">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">📍</div>
            <div>
              <h2 class="text-base font-bold text-slate-800">Address</h2>
              <p class="text-xs text-slate-400">Your company location</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <UiFormField
                v-model="form.city"
                label="City"
                placeholder="Bratislava"
                field="city"
                :touched="touched"
                :is-valid="isValid"
                @touch="touch"
              />
              <UiFormField
                v-model="form.postal_code"
                label="Postal code"
                hint="5 digits"
                placeholder="81101"
                field="postal_code"
                maxlength="5"
                mono
                :touched="touched"
                :is-valid="isValid"
                error="Exactly 5 digits"
                @touch="touch"
              />
            </div>
            <UiFormField
              v-model="form.street"
              label="Street"
              placeholder="Hlavná 1"
              field="street"
              :touched="touched"
              :is-valid="isValid"
              @touch="touch"
            />
            <UiFormField
              v-model="form.country"
              label="Country"
              placeholder="Slovakia"
              field="country"
              :touched="touched"
              :is-valid="isValid"
              @touch="touch"
            />
          </div>
        </div>

        <!-- STEP 3 — Sectors -->
        <div v-else key="s3">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl">⚙️</div>
            <div>
              <h2 class="text-base font-bold text-slate-800">Sector</h2>
              <p class="text-xs text-slate-400">Pick all industries that apply</p>
            </div>
          </div>

          <!-- Search filter -->
          <div class="relative mb-3">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="sectorSearch"
              type="text"
              placeholder="Filter sectors…"
              class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:bg-white focus:border-blue-400 focus:outline-none transition-all duration-200"
            />
          </div>

          <!-- Chips -->
          <div
            class="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1 pb-1 rounded-xl"
            :class="{
              'ring-2 ring-red-200': touched.sector && !form.sector.length,
              'ring-2 ring-green-200': touched.sector && form.sector.length,
            }"
          >
            <label
              v-for="s in filteredSectors"
              :key="s.id"
              class="cursor-pointer"
            >
              <input
                type="checkbox"
                :value="s.id"
                v-model="form.sector"
                class="sr-only"
                @change="touch('sector')"
              />
              <span
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-1.5 border text-xs font-medium transition-all duration-150 select-none"
                :class="form.sector.includes(s.id)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'"
              >
                <svg v-if="form.sector.includes(s.id)" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
                {{ s.name }}
              </span>
            </label>

            <p v-if="filteredSectors.length === 0" class="text-xs text-slate-400 p-2">No sectors match your search</p>
          </div>

          <p v-if="touched.sector && !form.sector.length" class="text-xs text-red-500 mt-2">
            Select at least one sector
          </p>

          <!-- Selected summary tags -->
          <div v-if="form.sector.length" class="mt-3">
            <p class="text-xs font-semibold text-slate-400 mb-1.5">Selected ({{ form.sector.length }})</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="id in form.sector"
                :key="id"
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
              >
                {{ sectors.find(s => s.id === id)?.name }}
                <button
                  type="button"
                  class="hover:text-red-500 transition-colors leading-none"
                  @click="form.sector = form.sector.filter(x => x !== id)"
                >×</button>
              </span>
            </div>
          </div>
        </div>

      </transition>

      <!-- Actions -->
      <div class="flex items-center justify-between mt-7 gap-3">
        <button
          v-if="step > 1"
          type="button"
          class="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors duration-200"
          @click="step--"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div v-else />

        <button
          v-if="step < 3"
          type="button"
          :disabled="!isStepValid"
          class="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          :class="isStepValid
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-200'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
          @click="nextStep"
        >
          Continue
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <button
          v-else
          type="button"
          :disabled="loading || !isStepValid"
          class="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          :class="isStepValid && !loading
            ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-sm shadow-emerald-200'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
          @click="submit"
        >
          <template v-if="!loading">
            Finish
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </template>
          <template v-else>
            Saving<span class="animate-pulse">...</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['success'])
const api = useApi()

const step = ref(1)
const loading = ref(false)
const sectorSearch = ref('')

const form = reactive({
  name: '',
  phone: '',
  ico: '',
  web_url: '',
  city: '',
  street: '',
  postal_code: '',
  country: '',
  sector: [] as number[],
})

const sectors = ref<{ id: number; name: string }[]>([])

onMounted(async () => {
  sectors.value = await api.get('/sectors')
})

/**
 * Track touched fields
 */
const touched = reactive<Record<string, boolean>>({})
const touch = (field: string) => {
  touched[field] = true
}

/**
 * Progress bar
 */
const progress = computed(() => (step.value / 3) * 100)

/**
 * Filter sectors
 */
const filteredSectors = computed(() =>
  sectors.value.filter(s =>
    s.name.toLowerCase().includes(sectorSearch.value.toLowerCase())
  )
)

/**
 * STRICT validation rules (aligned with Laravel backend)
 */
const rules: Record<string, (v: any) => boolean> = {
  name: v =>
    typeof v === 'string' &&
    v.trim().length >= 2 &&
    v.trim().length <= 255,

  phone: v => {
    if (typeof v !== 'string') return false

    // Closest frontend equivalent to propaganistas/laravel-phone strict mode
    // Accepts: +421..., +420..., etc.
    return /^\+?[1-9]\d{7,14}$/.test(v.trim())
  },

  ico: v =>
    typeof v === 'string' && /^\d{8}$/.test(v),

  web_url: v => {
    if (!v) return true

    try {
      const url = new URL(v)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  },

  city: v =>
    typeof v === 'string' &&
    v.trim().length > 0 &&
    v.trim().length <= 255,

  street: v =>
    typeof v === 'string' &&
    v.trim().length > 0 &&
    v.trim().length <= 255,

  postal_code: v =>
    typeof v === 'string' && /^\d{5}$/.test(v),

  country: v =>
    typeof v === 'string' &&
    v.trim().length > 0 &&
    v.trim().length <= 255,
}

/**
 * Validate single field
 */
const isValid = (field: string) => {
  const rule = rules[field]
  return rule ? rule((form as any)[field]) : true
}

/**
 * Strict sector validation (backend aligned)
 */
const isSectorValid = computed(() => {
  return (
    Array.isArray(form.sector) &&
    form.sector.length > 0 &&
    form.sector.every(id => Number.isInteger(id) && id > 0)
  )
})

/**
 * Step validation
 */
const isStepValid = computed(() => {
  if (step.value === 1) {
    return ['name', 'phone', 'ico', 'web_url'].every(isValid)
  }

  if (step.value === 2) {
    return ['city', 'street', 'postal_code', 'country'].every(isValid)
  }

  return isSectorValid.value
})

/**
 * Next step handler
 */
function nextStep() {
  if (!isStepValid.value) return
  step.value++
}

/**
 * Submit onboarding
 */
async function submit() {
  touch('sector')

  if (!isStepValid.value) return

  loading.value = true

  try {
    await api.post('/auth/organization-onboarding', form)
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all .22s ease; }
.slide-enter-from { opacity: 0; transform: translateX(18px); }
.slide-leave-to   { opacity: 0; transform: translateX(-18px); }
</style>