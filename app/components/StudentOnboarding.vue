<template>
  <div class="onboarding-card">

    <!-- HEADER -->
    <div class="card-header">
      <div class="step-badge">Step {{ step }} of 3</div>
      <h1 class="card-title">Complete your profile</h1>
      <p class="card-subtitle">Let's get you set up in under a minute</p>
    </div>

    <!-- PROGRESS -->
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: progress + '%' }"
      />
      <div class="progress-dots">
        <div
          v-for="s in 3"
          :key="s"
          class="progress-dot"
          :class="{ active: s <= step, current: s === step }"
        />
      </div>
    </div>

    <!-- STEPS -->
    <transition name="slide" mode="out-in">

      <!-- STEP 1 — Personal info -->
      <div v-if="step === 1" key="s1" class="step-body">
        <div class="step-icon-row">
          <span class="step-icon">👤</span>
          <div>
            <h2 class="step-title">Personal info</h2>
            <p class="step-desc">Basic identity details</p>
          </div>
        </div>

        <div class="field-group">
          <div class="field">
            <label class="field-label">First name</label>
            <div class="input-wrap" :class="fieldState('name')">
              <input
                v-model="form.name"
                @input="touch('name')"
                placeholder="e.g. Marek"
                class="field-input"
              />
              <span class="field-icon">{{ touched.name ? (isValid('name') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.name && !isValid('name')" class="field-error">Minimum 2 characters</p>
          </div>

          <div class="field">
            <label class="field-label">Surname</label>
            <div class="input-wrap" :class="fieldState('surname')">
              <input
                v-model="form.surname"
                @input="touch('surname')"
                placeholder="e.g. Novák"
                class="field-input"
              />
              <span class="field-icon">{{ touched.surname ? (isValid('surname') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.surname && !isValid('surname')" class="field-error">Minimum 2 characters</p>
          </div>
        </div>
      </div>

      <!-- STEP 2 — Study details -->
      <div v-else-if="step === 2" key="s2" class="step-body">
        <div class="step-icon-row">
          <span class="step-icon">🎓</span>
          <div>
            <h2 class="step-title">Study details</h2>
            <p class="step-desc">Your academic background</p>
          </div>
        </div>

        <div class="field-group">
          <div class="field">
            <label class="field-label">University</label>
            <div class="input-wrap" :class="fieldState('university')">
              <select
                v-model="form.university"
                @change="touch('university')"
                class="field-input field-select"
              >
                <option value="">Select university</option>
                <option v-for="u in universities" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Study program</label>
            <div class="input-wrap" :class="fieldState('study_program')">
              <select
                v-model="form.study_program"
                @change="touch('study_program')"
                class="field-input field-select"
              >
                <option value="">Select program</option>
                <option v-for="p in studyPrograms" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Study field</label>
            <div class="input-wrap" :class="fieldState('study_field')">
              <select
                v-model="form.study_field"
                @change="touch('study_field')"
                class="field-input field-select"
              >
                <option value="">Select field</option>
                <option v-for="f in studyFields" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Year of study</label>
            <div class="input-wrap" :class="fieldState('year_of_study')">
              <input
                v-model="form.year_of_study"
                @input="touch('year_of_study')"
                placeholder="1 – 6"
                type="number"
                min="1"
                max="6"
                class="field-input"
              />
              <span class="field-icon">{{ touched.year_of_study ? (isValid('year_of_study') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.year_of_study && !isValid('year_of_study')" class="field-error">Enter a value between 1 and 6</p>
          </div>
        </div>
      </div>

      <!-- STEP 3 — CV upload -->
      <div v-else key="s3" class="step-body">
        <div class="step-icon-row">
          <span class="step-icon">📄</span>
          <div>
            <h2 class="step-title">Upload your CV</h2>
            <p class="step-desc">PDF or DOCX, max 10 MB</p>
          </div>
        </div>

        <UiFileUpload
          v-model="form.cv"
          label="CV document"
          accept=".pdf,.docx"
          @error="fileError = $event"
        />

        <p v-if="fileError" class="field-error mt-2">{{ fileError }}</p>
        <p v-if="touched.cv && !isValid('cv')" class="field-error mt-2">Please upload your CV to continue</p>
      </div>

    </transition>

    <!-- ACTIONS -->
    <div class="actions">
      <button
        v-if="step > 1"
        @click="step--"
        class="btn-back"
      >
        ← Back
      </button>

      <button
        v-if="step < 3"
        @click="nextStep"
        :disabled="!isStepValid"
        class="btn-next"
        :class="{ disabled: !isStepValid }"
      >
        Continue →
      </button>

      <button
        v-else
        @click="submit"
        :disabled="loading || !isStepValid"
        class="btn-submit"
        :class="{ loading }"
      >
        <span v-if="!loading">Finish ✓</span>
        <span v-else class="loading-dots">Uploading<span>.</span><span>.</span><span>.</span></span>
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

onMounted(async () => {
  ;[universities.value, studyPrograms.value, studyFields.value] =
    await Promise.all([
      api.get('/university'),
      api.get('/study-program'),
      api.get('/study-field'),
    ])
})

const rules: Record<string, (v: any) => boolean> = {
  name: v =>
    typeof v === 'string' &&
    v.trim().length >= 2 &&
    v.trim().length <= 255,

  surname: v =>
    typeof v === 'string' &&
    v.trim().length >= 2 &&
    v.trim().length <= 255,

  university: v =>
    Number.isInteger(v) && v > 0,

  study_program: v =>
    Number.isInteger(v) && v > 0,

  study_field: v =>
    Number.isInteger(v) && v > 0,

  year_of_study: v =>
    Number.isInteger(v) &&
    v >= 1 &&
    v <= 6,

  portfolio_url: v => {
    if (!v) return true
    try {
      const url = new URL(v)
      return (
        (url.protocol === 'http:' || url.protocol === 'https:') &&
        url.hostname.length > 0 &&
        url.hostname.includes('.')
      )
    } catch {
      return false
    }
  },

  cv: v =>
    v instanceof File &&
    (
      v.type === 'application/pdf' ||
      v.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ),
}

const isValid = (field: string) => {
  const rule = rules[field]
  return rule ? rule((form as any)[field]) : true
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
      if (v !== null && v !== '' && v !== undefined) {
        data.append(k, v as any)
      }
    })

    await api.post('/auth/student-onboarding', data)

    emit('completed')
  } catch (e: any) {
    if (e?.response?.status === 422) {
      fileError.value = 'Validation failed. Please check your inputs.'
    }
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
/* ── Card shell ── */
.onboarding-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 40px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / .06), 0 24px 48px -8px rgb(0 0 0 / .10);
  font-family: 'DM Sans', system-ui, sans-serif;
}

/* ── Header ── */
.card-header { text-align: center; margin-bottom: 28px; }
.step-badge {
  display: inline-block;
  padding: 3px 12px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .04em;
  margin-bottom: 10px;
}
.card-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
.card-subtitle { font-size: 14px; color: #94a3b8; margin: 0; }

/* ── Progress ── */
.progress-track {
  position: relative;
  height: 6px;
  background: #f1f5f9;
  border-radius: 99px;
  margin-bottom: 32px;
  overflow: visible;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(.4,0,.2,1);
}
.progress-dots {
  position: absolute;
  top: 50%;
  left: 0; right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}
.progress-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 2px solid #fff;
  transition: all .3s;
}
.progress-dot.active { background: #3b82f6; }
.progress-dot.current {
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px #bfdbfe;
}

/* ── Step body ── */
.step-body { padding: 4px 0; }
.step-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.step-icon { font-size: 28px; line-height: 1; }
.step-title { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.step-desc { font-size: 13px; color: #94a3b8; margin: 0; }

/* ── Fields ── */
.field-group { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 600; color: #475569; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  transition: border-color .2s, background .2s, box-shadow .2s;
}
.input-wrap.state-valid {
  border-color: #22c55e;
  background: #f0fdf4;
  box-shadow: 0 0 0 3px #bbf7d0;
}
.input-wrap.state-invalid {
  border-color: #ef4444;
  background: #fef2f2;
  box-shadow: 0 0 0 3px #fecaca;
}

.field-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  color: #0f172a;
  background: transparent;
  border: none;
  outline: none;
  border-radius: 10px;
}
.field-select { appearance: none; cursor: pointer; }

.field-icon {
  padding-right: 12px;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.state-valid .field-icon { color: #16a34a; }
.state-invalid .field-icon { color: #dc2626; }

.field-error { font-size: 12px; color: #ef4444; margin: 0; }

/* ── Actions ── */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  gap: 10px;
}

.btn-back {
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color .2s;
}
.btn-back:hover { color: #334155; }

.btn-next, .btn-submit {
  margin-left: auto;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all .2s;
}

.btn-next {
  background: #3b82f6;
  color: #fff;
}
.btn-next:hover:not(.disabled) { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 12px #3b82f640; }
.btn-next.disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

.btn-submit {
  background: #22c55e;
  color: #fff;
}
.btn-submit:hover:not(.loading):not(:disabled) { background: #16a34a; transform: translateY(-1px); box-shadow: 0 4px 12px #22c55e40; }
.btn-submit:disabled { opacity: .7; cursor: not-allowed; }

/* ── Loading dots ── */
.loading-dots span { animation: blink 1.2s infinite; }
.loading-dots span:nth-child(2) { animation-delay: .2s; }
.loading-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0 } 40% { opacity: 1 } }

/* ── Transitions ── */
.slide-enter-active, .slide-leave-active { transition: all .22s ease; }
.slide-enter-from { opacity: 0; transform: translateX(16px); }
.slide-leave-to { opacity: 0; transform: translateX(-16px); }
</style>