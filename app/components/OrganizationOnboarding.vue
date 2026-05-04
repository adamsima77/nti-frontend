<template>
  <div class="onboarding-card">

    <!-- HEADER -->
    <div class="card-header">
      <div class="step-badge">Step {{ step }} of 3</div>
      <h1 class="card-title">Company onboarding</h1>
      <p class="card-subtitle">Let's set your organization up</p>
    </div>

    <!-- PROGRESS -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progress + '%' }" />
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

      <!-- STEP 1 — Company info -->
      <div v-if="step === 1" key="s1" class="step-body">
        <div class="step-icon-row">
          <span class="step-icon">🏢</span>
          <div>
            <h2 class="step-title">Company info</h2>
            <p class="step-desc">Basic company details</p>
          </div>
        </div>
        <div class="field-group">
          <div class="field">
            <label class="field-label">Company name</label>
            <div class="input-wrap" :class="fieldState('name')">
              <input v-model="form.name" @input="touch('name')" placeholder="e.g. Acme s.r.o." class="field-input" />
              <span class="field-icon">{{ touched.name ? (isValid('name') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.name && !isValid('name')" class="field-error">Minimum 2 characters</p>
          </div>

          <div class="field">
            <label class="field-label">Phone</label>
            <div class="input-wrap" :class="fieldState('phone')">
              <input v-model="form.phone" @input="touch('phone')" placeholder="+421 900 000 000" class="field-input" />
              <span class="field-icon">{{ touched.phone ? (isValid('phone') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.phone && !isValid('phone')" class="field-error">Minimum 6 characters</p>
          </div>

          <div class="field">
            <label class="field-label">IČO <span class="field-hint">(8 digits)</span></label>
            <div class="input-wrap" :class="fieldState('ico')">
              <input v-model="form.ico" @input="touch('ico')" placeholder="12345678" maxlength="8" class="field-input" />
              <span class="field-icon">{{ touched.ico ? (isValid('ico') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.ico && !isValid('ico')" class="field-error">Must be exactly 8 digits</p>
          </div>

          <div class="field">
            <label class="field-label">Website <span class="field-hint">(optional)</span></label>
            <div class="input-wrap" :class="fieldState('web_url')">
              <input v-model="form.web_url" @input="touch('web_url')" placeholder="https://acme.sk" class="field-input" />
              <span class="field-icon">{{ touched.web_url && form.web_url ? (isValid('web_url') ? '✓' : '✗') : '' }}</span>
            </div>
            <p v-if="touched.web_url && form.web_url && !isValid('web_url')" class="field-error">Must start with https://</p>
          </div>
        </div>
      </div>

      <!-- STEP 2 — Address -->
      <div v-else-if="step === 2" key="s2" class="step-body">
        <div class="step-icon-row">
          <span class="step-icon">📍</span>
          <div>
            <h2 class="step-title">Address</h2>
            <p class="step-desc">Company location</p>
          </div>
        </div>
        <div class="field-group">
          <div class="two-col">
            <div class="field">
              <label class="field-label">City</label>
              <div class="input-wrap" :class="fieldState('city')">
                <input v-model="form.city" @input="touch('city')" placeholder="Bratislava" class="field-input" />
                <span class="field-icon">{{ touched.city ? (isValid('city') ? '✓' : '✗') : '' }}</span>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Postal code</label>
              <div class="input-wrap" :class="fieldState('postal_code')">
                <input v-model="form.postal_code" @input="touch('postal_code')" placeholder="811 01" class="field-input" />
                <span class="field-icon">{{ touched.postal_code ? (isValid('postal_code') ? '✓' : '✗') : '' }}</span>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Street</label>
            <div class="input-wrap" :class="fieldState('street')">
              <input v-model="form.street" @input="touch('street')" placeholder="Hlavná 1" class="field-input" />
              <span class="field-icon">{{ touched.street ? (isValid('street') ? '✓' : '✗') : '' }}</span>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Country</label>
            <div class="input-wrap" :class="fieldState('country')">
              <input v-model="form.country" @input="touch('country')" placeholder="Slovakia" class="field-input" />
              <span class="field-icon">{{ touched.country ? (isValid('country') ? '✓' : '✗') : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 3 — Sectors -->
      <div v-else key="s3" class="step-body">
  <div class="step-icon-row">
    <span class="step-icon">⚙️</span>
    <div>
      <h2 class="step-title">Sector</h2>
      <p class="step-desc">What industry does your company operate in?</p>
    </div>
  </div>

 <div class="field-group">
  <div class="field">
    <label class="field-label">
      Sectors <span class="field-hint">(select one or more)</span>
    </label>

    <div class="input-wrap" :class="fieldState('sector')">
      
      <!-- CHECKBOX LIST (replaces select) -->
      <div class="checkbox-list">
        <label
          v-for="s in sectors"
          :key="s.id"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :value="s.id"
            v-model="form.sector"
            @change="touch('sector')"
          />
          <span>{{ s.name }}</span>
        </label>
      </div>

      <span class="field-icon">
        {{ touched.sector ? (form.sector.length ? '✓' : '✗') : '' }}
      </span>

    </div>

    <p v-if="touched.sector && !form.sector.length" class="field-error">
      Select at least one sector
    </p>
  </div>
</div></div>
    </transition>

    <!-- ACTIONS -->
    <div class="actions">
      <button v-if="step > 1" @click="step--" class="btn-back">← Back</button>

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
        <span v-else class="loading-dots">Saving<span>.</span><span>.</span><span>.</span></span>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['success'])
const api = useApi()
const step = ref(1)
const loading = ref(false)
const sectorInput = ref('')

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

const sectors = ref([])

onMounted(async () => {
  sectors.value = await api.get('/sectors')
})

const touched = reactive<Record<string, boolean>>({})

const progress = computed(() => (step.value / 3) * 100)

const rules: Record<string, (v: any) => boolean> = {
  name: v => v?.length >= 2,
  phone: v => v?.length >= 6,
  ico: v => /^\d{8}$/.test(v),
  web_url: v => !v || v.startsWith('https://') || v.startsWith('http://'),
  city: v => !!v,
  street: v => !!v,
  postal_code: v => !!v,
  country: v => !!v,
}

const touch = (field: string) => { touched[field] = true }

const isValid = (field: string) => {
  const rule = rules[field]
  return rule ? rule((form as any)[field]) : true
}

const isSectorValid = computed(() => sectorInput.value.trim().length > 0)

const fieldState = (field: string) => {
  if (field === 'sector') {
    if (!touched.sector) return 'state-neutral'
    return isSectorValid.value ? 'state-valid' : 'state-invalid'
  }
  if (!touched[field]) return 'state-neutral'
  return isValid(field) ? 'state-valid' : 'state-invalid'
}

const isStepValid = computed(() => {
  if (step.value === 1) return isValid('name') && isValid('phone') && isValid('ico')
  if (step.value === 2) return ['city', 'street', 'postal_code', 'country'].every(isValid)
  return isSectorValid.value
})

function nextStep() {
  if (!isStepValid.value) return
  step.value++
}

async function submit() {
  loading.value = true

  form.sector = sectorInput.value
    .split(',')
    .map(v => Number(v.trim()))
    .filter(v => !Number.isNaN(v) && v > 0)

  try {
    await $fetch('/api/organization/onboarding', {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.client ? localStorage.getItem('_t') ?? '' : ''}`,
      },
    })
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.onboarding-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 40px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / .06), 0 24px 48px -8px rgb(0 0 0 / .10);
  font-family: 'DM Sans', system-ui, sans-serif;
}
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #0f172a;
  cursor: pointer;
}

.checkbox-item input {
  accent-color: #3b82f6;
  width: 14px;
  height: 14px;
}
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

.step-body { padding: 4px 0; }
.step-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.step-icon { font-size: 28px; line-height: 1; }
.step-title { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.step-desc { font-size: 13px; color: #94a3b8; margin: 0; }

.field-group { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field-label { font-size: 13px; font-weight: 600; color: #475569; }
.field-hint { font-weight: 400; color: #94a3b8; }

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

.field-icon {
  padding-right: 12px;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.state-valid .field-icon { color: #16a34a; }
.state-invalid .field-icon { color: #dc2626; }

.field-error { font-size: 12px; color: #ef4444; margin: 0; }

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  gap: 10px;
}

.btn-back {
  font-size: 14px; font-weight: 500; color: #94a3b8;
  background: none; border: none; cursor: pointer; padding: 0;
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
.btn-next { background: #3b82f6; color: #fff; }
.btn-next:hover:not(.disabled) { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 12px #3b82f640; }
.btn-next.disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

.btn-submit { background: #22c55e; color: #fff; }
.btn-submit:hover:not(.loading):not(:disabled) { background: #16a34a; transform: translateY(-1px); box-shadow: 0 4px 12px #22c55e40; }
.btn-submit:disabled { opacity: .7; cursor: not-allowed; }

.loading-dots span { animation: blink 1.2s infinite; }
.loading-dots span:nth-child(2) { animation-delay: .2s; }
.loading-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0 } 40% { opacity: 1 } }

.slide-enter-active, .slide-leave-active { transition: all .22s ease; }
.slide-enter-from { opacity: 0; transform: translateX(16px); }
.slide-leave-to { opacity: 0; transform: translateX(-16px); }
</style>