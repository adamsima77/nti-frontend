<template>
  <div class="bg-white rounded-2xl p-10 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.06),0_24px_48px_-8px_rgb(0,0,0,0.10)] font-sans">

    <!-- HEADER -->
    <div class="text-center mb-7">
      <div class="inline-block px-3 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs font-semibold tracking-wide mb-2.5">
        {{ $t('auth.student-onboarding.step') }} {{ step }} {{ $t('auth.student-onboarding.of') }} 3
      </div>
      <h1 class="text-[22px] font-bold text-slate-900 mb-1">{{ $t('auth.student-onboarding.complete_profile') }}</h1>
      <p class="text-sm text-slate-400">{{ $t('auth.student-onboarding.setup_message') }}</p>
    </div>

    <!-- PROGRESS -->
    <div class="relative h-1.5 bg-slate-100 rounded-full mb-8 overflow-visible">
      <div
        class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-[width] duration-400 ease-[cubic-bezier(.4,0,.2,1)]"
        :style="{ width: progress + '%' }"
      />
      <div class="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-0.5">
        <div
          v-for="s in 3"
          :key="s"
          class="w-3 h-3 rounded-full border-2 border-white transition-all duration-300"
          :class="{
            'bg-blue-500': s <= step && s !== step,
            'bg-white border-blue-500 shadow-[0_0_0_3px_#bfdbfe]': s === step,
            'bg-slate-200': s > step,
          }"
        />
      </div>
    </div>

    <!-- STEPS -->
    <transition name="slide" mode="out-in">

      <!-- STEP 1 — Personal info -->
      <div v-if="step === 1" key="s1" class="py-1">
        <div class="flex items-center gap-3 mb-6">
          <div>
            <h2 class="text-[17px] font-bold text-slate-900 mb-0.5">{{ $t('auth.student-onboarding.personal_info') }}</h2>
            <p class="text-[13px] text-slate-400">{{ $t('auth.student-onboarding.personal_desc') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-600">{{ $t('auth.student-onboarding.first_name') }}</label>
            <div class="relative flex items-center border-[1.5px] rounded-xl bg-white transition-all duration-200"
              :class="inputWrapClass('name')">
              <input
                v-model="form.name"
                @input="touch('name')"
                :placeholder="$t('auth.student-onboarding.eg_f')"
                class="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none rounded-xl"
              />
              <span class="pr-3 text-sm font-bold shrink-0" :class="iconClass('name')">
                {{ touched.name ? (isValid('name') ? '✓' : '✗') : '' }}
              </span>
            </div>
            <p v-if="touched.name && !isValid('name')" class="text-xs text-red-500">{{ $t('auth.student-onboarding.min_f') }}</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-600">{{ $t('auth.student-onboarding.surname') }}</label>
            <div class="relative flex items-center border-[1.5px] rounded-xl bg-white transition-all duration-200"
              :class="inputWrapClass('surname')">
              <input
                v-model="form.surname"
                @input="touch('surname')"
                :placeholder="$t('auth.student-onboarding.eg_s')"
                class="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none rounded-xl"
              />
              <span class="pr-3 text-sm font-bold shrink-0" :class="iconClass('surname')">
                {{ touched.surname ? (isValid('surname') ? '✓' : '✗') : '' }}
              </span>
            </div>
            <p v-if="touched.surname && !isValid('surname')" class="text-xs text-red-500">{{ $t('auth.student-onboarding.min_s') }}</p>
          </div>
        </div>
      </div>

      <!-- STEP 2 — Study details -->
      <div v-else-if="step === 2" key="s2" class="py-1">
        <div class="flex items-center gap-3 mb-6">
          <div>
            <h2 class="text-[17px] font-bold text-slate-900 mb-0.5">{{ $t('auth.student-onboarding.study-detail') }}</h2>
            <p class="text-[13px] text-slate-400">{{ $t('auth.student-onboarding.academic-background') }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-600">{{ $t('auth.student-onboarding.university') }}</label>
            <div class="relative flex items-center border-[1.5px] rounded-xl bg-white transition-all duration-200"
              :class="inputWrapClass('university')">
              <select v-model="form.university" @change="touch('university')"
                class="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none rounded-xl appearance-none cursor-pointer">
                <option value="">{{ $t('auth.student-onboarding.select_u') }}</option>
                <option v-for="u in universities" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-600">{{ $t('auth.student-onboarding.study_pr') }}</label>
            <div class="relative flex items-center border-[1.5px] rounded-xl bg-white transition-all duration-200"
              :class="inputWrapClass('study_program')">
              <select v-model="form.study_program" @change="touch('study_program')"
                class="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none rounded-xl appearance-none cursor-pointer">
                <option value="">{{ $t('auth.student-onboarding.select_program') }}</option>
                <option v-for="p in studyPrograms" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-600">{{ $t('auth.student-onboarding.study_field') }}</label>
            <div class="relative flex items-center border-[1.5px] rounded-xl bg-white transition-all duration-200"
              :class="inputWrapClass('study_field')">
              <select v-model="form.study_field" @change="touch('study_field')"
                class="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none rounded-xl appearance-none cursor-pointer">
                <option value="">{{ $t('auth.student-onboarding.select_field') }}</option>
                <option v-for="f in studyFields" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-600">{{ $t('auth.student-onboarding.study_year') }}</label>
            <div class="relative flex items-center border-[1.5px] rounded-xl bg-white transition-all duration-200"
              :class="inputWrapClass('year_of_study')">
              <select v-model="form.year_of_study" @change="touch('year_of_study')"
                class="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-transparent border-none outline-none rounded-xl appearance-none cursor-pointer">
                <option value="">{{ $t('auth.student-onboarding.select_year') }}</option>
                <option v-for="y in studyYears" :key="y.id" :value="y.id">{{ y.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 3 — CV upload -->
      <div v-else key="s3" class="py-1">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-[28px] leading-none">📄</span>
          <div>
            <h2 class="text-[17px] font-bold text-slate-900 mb-0.5">{{ $t('auth.student-onboarding.upload_cv') }}</h2>
            <p class="text-[13px] text-slate-400">{{ $t('auth.student-onboarding.cv_req') }}</p>
          </div>
        </div>

        <UiFileUpload
          v-model="form.cv"
          :label="$t('auth.student-onboarding.cv') "
          accept=".pdf,.docx"
          @error="fileError = $event"
        />

        <p v-if="fileError" class="text-xs text-red-500 mt-2">{{ fileError }}</p>
        <p v-if="touched.cv && !isValid('cv')" class="text-xs text-red-500 mt-2">{{ $t('auth.student-onboarding.cv_err') }}</p>
      </div>

    </transition>

    <!-- ACTIONS -->
    <div class="flex justify-between items-center mt-8 gap-2.5">
      <button
        v-if="step > 1"
        @click="step--"
        class="text-sm font-medium text-slate-400 bg-transparent border-none cursor-pointer p-0 hover:text-slate-700 transition-colors duration-200"
      >
        ← {{ $t('auth.student-onboarding.back') }}
      </button>

      <button
        v-if="step < 3"
        @click="nextStep"
        :disabled="!isStepValid"
        class="ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200"
        :class="isStepValid
          ? 'bg-blue-500 text-white hover:-translate-y-px hover:bg-blue-600 hover:shadow-[0_4px_12px_#3b82f640]'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
      >
        {{ $t('auth.student-onboarding.continue') }} →
      </button>

      <button
        v-else
        @click="submit"
        :disabled="loading || !isStepValid"
        class="ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200 bg-green-500 text-white disabled:opacity-70 disabled:cursor-not-allowed hover:enabled:bg-green-600 hover:enabled:-translate-y-px hover:enabled:shadow-[0_4px_12px_#22c55e40]"
      >
        <span v-if="!loading">{{ $t('auth.student-onboarding.finish') }} ✓</span>
        <span v-else class="loading-dots">{{ $t('auth.student-onboarding.uploading') }}<span>.</span><span>.</span><span>.</span></span>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
const api = useApi()
const authStore = useAuthStore()
const emit = defineEmits<{
  completed: []
}>()
const step = ref(1)
const loading = ref(false)
const fileError = ref('')
const { t } = useI18n()
const progress = computed(() => ((step.value - 1) / 2) * 100)

const form = reactive({
  name: '',
  surname: '',
  university: null as number | null,
  study_program: null as number | null,
  study_field: null as number | null,
  year_of_study: null as number | null,
  portfolio_url: '',
  cv: null as File | null,
})

const touched = reactive<Record<string, boolean>>({})
const touch = (field: string) => {
  touched[field] = true
}

const universities = ref<any[]>([])
const studyPrograms = ref<any[]>([])
const studyFields = ref<any[]>([])
const studyYears = ref<any[]>([])

onMounted(async () => {
  ;[universities.value, studyPrograms.value, studyFields.value, studyYears.value] =
    await Promise.all([
      api.get('/university'),
      api.get('/study-program'),
      api.get('/study-field'),
      api.get('/study-years'),
    ])
})

const rules: Record<string, (v: any) => boolean> = {
  name: v => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 255,
  surname: v => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 255,
  university: v => Number.isInteger(v) && v > 0,
  study_program: v => Number.isInteger(v) && v > 0,
  study_field: v => Number.isInteger(v) && v > 0,
  year_of_study: v => Number.isInteger(v) && v > 0,
  portfolio_url: v => {
    if (!v) return true
    try {
      const url = new URL(v)
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')
    } catch { return false }
  },
  cv: v =>
    v instanceof File &&
    (v.type === 'application/pdf' ||
      v.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
}

const isValid = (field: string) => {
  const rule = rules[field]
  return rule ? rule((form as any)[field]) : true
}

// Returns border/bg/shadow classes for the input wrapper
const inputWrapClass = (field: string) => {
  if (!touched[field]) return 'border-slate-200'
  return isValid(field)
    ? 'border-green-500 bg-green-50 shadow-[0_0_0_3px_#bbf7d0]'
    : 'border-red-500 bg-red-50 shadow-[0_0_0_3px_#fecaca]'
}

// Returns text color class for the ✓/✗ icon
const iconClass = (field: string) => {
  if (!touched[field]) return ''
  return isValid(field) ? 'text-green-600' : 'text-red-600'
}

const fieldState = (field: string) => {
  if (!touched[field]) return 'state-neutral'
  return isValid(field) ? 'state-valid' : 'state-invalid'
}

const isStepValid = computed(() => {
  if (step.value === 1) return isValid('name') && isValid('surname')
  if (step.value === 2) {
    return (
      isValid('university') &&
      isValid('study_program') &&
      isValid('study_field') &&
      isValid('year_of_study')
    )
  }
  return isValid('cv')
})

function nextStep() {
  if (!isStepValid.value) return
  step.value++
}

async function submit() {
  touch('cv')
  if (!isStepValid.value) return
  loading.value = true
  fileError.value = ''
  try {
    const data = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== '' && v !== undefined) data.append(k, v as any)
    })
    await api.post('/auth/student-onboarding', data)
    emit('completed')
  } catch (e: any) {
    if (e?.response?.status === 422) {
      fileError.value = t('auth.student-onboarding.validation_err')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.loading-dots span { animation: blink 1.2s infinite; }
.loading-dots span:nth-child(2) { animation-delay: .2s; }
.loading-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0 } 40% { opacity: 1 } }

.slide-enter-active, .slide-leave-active { transition: all .22s ease; }
.slide-enter-from { opacity: 0; transform: translateX(16px); }
.slide-leave-to { opacity: 0; transform: translateX(-16px); }
</style>