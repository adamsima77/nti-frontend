<template>
  <UiModal v-model="open" :title="modalTitle">
    <div v-if="isLoading" class="py-12 flex flex-col items-center gap-3 text-gray-400">
      <div class="w-7 h-7 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
      <span class="text-sm">Načítavam...</span>
    </div>

    <template v-else>
      <!-- ── Tab bar ── -->
      <div class="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button :class="tabClass('basic')" @click="activeTab = 'basic'">
          <UserIcon class="w-3.5 h-3.5" />
          Základné údaje
        </button>
        <button v-if="isStudent" :class="tabClass('student')" @click="activeTab = 'student'">
          <GraduationCap class="w-3.5 h-3.5" />
          Profil študenta
        </button>
        <button v-if="isPartner" :class="tabClass('organization')" @click="activeTab = 'organization'">
          <Building2 class="w-3.5 h-3.5" />
          Organizácia
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════
           TAB: Basic info
           ══════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'basic'" class="space-y-5">

        <!-- Avatar -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div class="relative shrink-0">
            <img
              v-if="avatarPreview || props.user?.avatar_url"
              :src="avatarPreview ?? props.user.avatar_url"
              alt="Profilová fotka"
              class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div
              v-else
              class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow-sm"
            >
              <span class="text-blue-600 font-semibold text-lg">{{ initials }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 mb-1">Profilová fotka</p>
            <UiFileUpload
              v-model="avatarFile"
              accept=".jpg,.jpeg,.png"
              :max-size="4"
              :multiple="false"
              @error="(msg) => addToast({ message: msg, type: 'error' })"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Meno</label>
            <UiInput v-model="form.name" placeholder="Meno" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Priezvisko</label>
            <UiInput v-model="form.surname" placeholder="Priezvisko" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <UiInput v-model="form.email" type="email" placeholder="email@example.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Pracovná pozícia</label>
          <UiInput v-model="form.job_position" placeholder="Pracovná pozícia" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Stav</label>
            <UiSelect v-model="form.status_id" :options="statusSelectOptions" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Rola</label>
            <div class="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[42px] items-center">
              <label
                v-for="role in assignableRoles"
                :key="role.id"
                class="flex items-center gap-1.5 cursor-pointer text-sm select-none"
              >
                <input
                  type="radio"
                  name="user-role"
                  :value="role.id"
                  v-model="form.role"
                  class="border-gray-300 text-blue-600"
                />
                {{ role.display_name ?? role.name }}
              </label>
            </div>
            <p v-if="isCreateMode" class="mt-1.5 text-xs text-gray-400">
              Študent a Partner sprístupnia ďalšie záložky.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ isCreateMode ? 'Heslo' : 'Nové heslo' }}
              <span v-if="!isCreateMode" class="text-gray-400 font-normal text-xs">(nechajte prázdne)</span>
            </label>
            <UiInput v-model="form.password" type="password" placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Potvrdenie hesla</label>
            <UiInput v-model="form.password_confirmation" type="password" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════
           TAB: Student profile
           ══════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'student'" class="space-y-5">
        <div v-if="loadingLookups" class="py-8 flex flex-col items-center gap-3 text-gray-400">
          <div class="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
          <span class="text-sm">Načítavam číselníky...</span>
        </div>

        <template v-else>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Študijný program</label>
              <UiSelect v-model="studentForm.study_program_id" :options="studyProgramOptions" placeholder="Vyberte program" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Študijný odbor</label>
              <UiSelect v-model="studentForm.study_field_id" :options="studyFieldOptions" placeholder="Vyberte odbor" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Ročník</label>
              <UiSelect v-model="studentForm.study_year_id" :options="studyYearOptions" placeholder="Vyberte ročník" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Univerzita</label>
              <UiSelect v-model="studentForm.university_id" :options="universityOptions" placeholder="Vyberte univerzitu" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Portfolio URL</label>
            <UiInput v-model="studentForm.portfolio_url" placeholder="https://..." />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Akademické príznaky</label>
            <div
              v-if="academicFlagOptions.length"
              class="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <label
                v-for="flag in academicFlagOptions"
                :key="flag.id"
                class="flex items-center gap-1.5 cursor-pointer text-sm select-none"
              >
                <input
                  type="checkbox"
                  :value="flag.id"
                  v-model="studentForm.academic_flags"
                  class="rounded border-gray-300 text-blue-600"
                />
                {{ flag.name }}
              </label>
            </div>
            <p v-else class="text-sm text-gray-400 italic">Žiadne príznaky k dispozícii.</p>
          </div>

          <!-- CV -->
          <div class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                <FileText class="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">CV dokument</p>
                <p v-if="studentForm.cv_document_id" class="text-xs text-green-600 mt-0.5">Nahrané</p>
                <p v-else class="text-xs text-gray-400 mt-0.5">Žiadne CV</p>
              </div>
            </div>
            <button
              v-if="studentForm.cv_document_id"
              type="button"
              class="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              @click="studentForm.cv_document_id = null"
            >
              Odstrániť
            </button>
          </div>
        </template>
      </div>

      <!-- ══════════════════════════════════════════════════
           TAB: Organization
           ══════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'organization'" class="space-y-5">

        <!-- Edit existing orgs -->
        <template v-if="orgForms.length">
          <div
            v-for="(orgForm, idx) in orgForms"
            :key="orgForm.id"
            class="border border-gray-200 rounded-xl overflow-hidden"
          >
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                <Building2 class="w-4 h-4 text-gray-500" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-800 text-sm truncate">{{ orgForm.name || '—' }}</h3>
                <span class="text-xs text-gray-400">
                  {{ props.user?.organizations?.[idx]?.pivot?.organization_role ?? 'člen' }}
                </span>
              </div>
            </div>

            <div class="p-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Názov</label>
                  <UiInput v-model="orgForm.name" placeholder="Názov organizácie" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">IČO</label>
                  <UiInput v-model="orgForm.ico" placeholder="12345678" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Telefón</label>
                  <UiInput v-model="orgForm.phone" placeholder="+421..." />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Web</label>
                  <UiInput v-model="orgForm.web_url" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Popis</label>
                <UiInput v-model="orgForm.description" placeholder="Krátky popis" />
              </div>

              <div>
                <p class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Adresa</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Ulica</label>
                    <UiInput v-model="orgForm.address.street" placeholder="Ulica 1" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Mesto</label>
                    <UiInput v-model="orgForm.address.city" placeholder="Bratislava" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">PSČ</label>
                    <UiInput v-model="orgForm.address.postal_code" placeholder="811 01" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Krajina</label>
                    <UiInput v-model="orgForm.address.country" placeholder="Slovensko" />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Sektory</label>
                <div
                  v-if="sectorOptions.length"
                  class="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <label
                    v-for="sector in sectorOptions"
                    :key="sector.value"
                    class="flex items-center gap-1.5 cursor-pointer text-sm select-none"
                  >
                    <input
                      type="checkbox"
                      :value="sector.value"
                      v-model="orgForm.sectors"
                      class="rounded border-gray-300 text-blue-600"
                    />
                    {{ sector.label }}
                  </label>
                </div>
                <p v-else class="text-sm text-gray-400 italic">Načítavam sektory...</p>
              </div>
            </div>
          </div>
        </template>

        <!-- No existing org — create form -->
        <template v-else>
          <div class="flex items-center gap-2 mb-1">
            <div class="h-px flex-1 bg-gray-100" />
            <span class="text-xs text-gray-400 uppercase font-medium tracking-wider">Nová organizácia</span>
            <div class="h-px flex-1 bg-gray-100" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Názov</label>
              <UiInput v-model="newOrgForm.name" placeholder="Názov organizácie" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">IČO</label>
              <UiInput v-model="newOrgForm.ico" placeholder="12345678" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Telefón</label>
              <UiInput v-model="newOrgForm.phone" placeholder="+421..." />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Web</label>
              <UiInput v-model="newOrgForm.web_url" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Popis</label>
            <UiInput v-model="newOrgForm.description" placeholder="Krátky popis" />
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Adresa</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Ulica</label>
                <UiInput v-model="newOrgForm.address.street" placeholder="Ulica 1" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Mesto</label>
                <UiInput v-model="newOrgForm.address.city" placeholder="Bratislava" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">PSČ</label>
                <UiInput v-model="newOrgForm.address.postal_code" placeholder="811 01" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Krajina</label>
                <UiInput v-model="newOrgForm.address.country" placeholder="Slovensko" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Sektory</label>
            <div
              v-if="sectorOptions.length"
              class="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <label
                v-for="sector in sectorOptions"
                :key="sector.value"
                class="flex items-center gap-1.5 cursor-pointer text-sm select-none"
              >
                <input
                  type="checkbox"
                  :value="sector.value"
                  v-model="newOrgForm.sectors"
                  class="rounded border-gray-300 text-blue-600"
                />
                {{ sector.label }}
              </label>
            </div>
            <p v-else class="text-sm text-gray-400 italic">Načítavam sektory...</p>
          </div>
        </template>
      </div>
    </template>

    <template #actions>
      <UiButton variant="ghost" @click="open = false">Zatvoriť</UiButton>
      <UiButton :loading="isSaving" @click="handleSave">
        {{ isCreateMode ? 'Vytvoriť používateľa' : 'Uložiť zmeny' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { UserIcon, GraduationCap, Building2, FileText } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  user:       any | null
  roles:      any[]
  statuses:   any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const api = useApi()
const { addToast } = useToast()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const activeTab = ref('basic')
const isSaving  = ref(false)
const isLoading = ref(false)

// ── Create vs edit ─────────────────────────────────────────

const isCreateMode = computed(() => !props.user)

const modalTitle = computed(() =>
  isCreateMode.value
    ? 'Vytvoriť používateľa'
    : `Upraviť: ${props.user?.name ?? ''} ${props.user?.surname ?? ''}`.trim()
)

// ── Avatar preview ─────────────────────────────────────────

const avatarFile = ref<File | null>(null)

const avatarPreview = computed(() => {
  if (!avatarFile.value) return null
  return URL.createObjectURL(avatarFile.value)
})

const initials = computed(() => {
  const n = (form.value.name?.[0] ?? '').toUpperCase()
  const s = (form.value.surname?.[0] ?? '').toUpperCase()
  return n + s || '?'
})

// ── Role / status helpers ──────────────────────────────────

const assignableRoles = computed(() =>
  props.roles.filter(r => r.name !== 'nti_superadmin' && r.name !== 'guest')
)

const statusSelectOptions = computed(() =>
  props.statuses
    .filter(s => s.name !== 'anonymized')
    .map(s => ({ value: String(s.id), label: s.name }))
)

// ── Tab class ──────────────────────────────────────────────

function tabClass(tab: string) {
  return [
    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
    activeTab.value === tab
      ? 'bg-white text-navy shadow-sm'
      : 'text-gray-500 hover:text-gray-700',
  ]
}

// ── Role detection ─────────────────────────────────────────

const isStudent = computed(() => {
  if (props.user?.roles?.some((r: any) => r.name === 'student')) return true
  return props.roles.find(r => r.id === form.value.role)?.name === 'student'
})

const isPartner = computed(() => {
  if (props.user?.roles?.some((r: any) => r.name === 'partner')) return true
  return props.roles.find(r => r.id === form.value.role)?.name === 'partner'
})

watch([isStudent, isPartner], () => {
  if (activeTab.value === 'student'      && !isStudent.value) activeTab.value = 'basic'
  if (activeTab.value === 'organization' && !isPartner.value) activeTab.value = 'basic'
})

// ── Translation helper ─────────────────────────────────────

const { locale } = useI18n()
const LANG_ID: Record<string, number> = { sk: 1, en: 2 }

function trans(item: any, translationsKey: string, fallbackKey = 'name'): string {
  const langId = LANG_ID[locale.value] ?? 1
  const translations: any[] = item?.[translationsKey] ?? []
  const match = translations.find(t => t.language_id === langId) ?? translations[0]
  return match?.name ?? item?.[fallbackKey] ?? String(item?.id ?? '—')
}

// ── Student lookup data ────────────────────────────────────

const loadingLookups      = ref(false)
const studyPrograms       = ref<any[]>([])
const studyFields         = ref<any[]>([])
const studyYears          = ref<any[]>([])
const universities        = ref<any[]>([])
const academicFlagOptions = ref<any[]>([])

const studyProgramOptions = computed(() =>
  studyPrograms.value.map(p => ({ value: String(p.id), label: trans(p, 'study_program_translations') }))
)
const studyFieldOptions = computed(() =>
  studyFields.value.map(f => ({ value: String(f.id), label: trans(f, 'study_field_translations') }))
)
const studyYearOptions = computed(() =>
  studyYears.value.map(y => ({ value: String(y.id), label: trans(y, 'study_year_translations') }))
)
const universityOptions = computed(() =>
  universities.value.map(u => ({ value: String(u.id), label: u.name ?? String(u.id) }))
)

async function fetchStudentLookups() {
  if (studyPrograms.value.length) return
  loadingLookups.value = true
  const lang = locale.value ?? 'sk'
  try {
    const [programs, fields, years, unis, flags] = await Promise.all([
      api.get(`/study-programs-public/lang/${lang}`) as Promise<any>,
      api.get(`/study-fields-public/lang/${lang}`)   as Promise<any>,
      api.get(`/study-years-public/lang/${lang}`)    as Promise<any>,
      api.get('/university')                         as Promise<any>,
      api.get('/academic-flag')                      as Promise<any>,
    ])
    studyPrograms.value       = Array.isArray(programs) ? programs : (programs?.study_programs ?? programs?.data ?? [])
    studyFields.value         = Array.isArray(fields)   ? fields   : (fields?.study_fields    ?? fields?.data   ?? [])
    studyYears.value          = Array.isArray(years)    ? years    : (years?.study_years      ?? years?.data    ?? [])
    universities.value        = Array.isArray(unis)     ? unis     : (unis?.universities      ?? unis?.university ?? unis?.data ?? [])
    academicFlagOptions.value = Array.isArray(flags)    ? flags    : (flags?.academic_flags   ?? flags?.data    ?? [])
  } catch {
    addToast({ message: 'Nepodarilo sa načítať číselníky pre študenta', type: 'error' })
  } finally {
    loadingLookups.value = false
  }
}

watch(isStudent, (val) => { if (val) fetchStudentLookups() }, { immediate: true })

// ── Sector lookup ──────────────────────────────────────────

const sectors = ref<any[]>([])

// Values are numbers so checkbox v-model comparison works correctly
const sectorOptions = computed(() =>
  sectors.value.map(s => ({
    value: Number(s.id),
    label: trans(s, 'sector_translations'),
  }))
)

async function fetchSectors() {
  if (sectors.value.length) return
  try {
    const res = await api.get('/sectors') as any
    sectors.value = Array.isArray(res) ? res : (res?.sectors ?? res?.data ?? [])
  } catch {
    // non-critical
  }
}

watch(isPartner, (val) => { if (val) fetchSectors() }, { immediate: true })

// ── URL normalizer ─────────────────────────────────────────

function normalizeUrl(val: string | null | undefined): string | null {
  if (!val || !val.trim()) return null
  const v = val.trim()
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

// ── Basic form ─────────────────────────────────────────────

const form = ref({
  name:                  '',
  surname:               '',
  email:                 '',
  job_position:          '',
  status_id:             '',
  role:                  null as number | null,
  password:              '',
  password_confirmation: '',
})

// ── Student form ───────────────────────────────────────────

const studentForm = ref({
  study_program_id: '' as string | number,
  study_field_id:   '' as string | number,
  study_year_id:    '' as string | number,
  university_id:    '' as string | number,
  portfolio_url:    '',
  academic_flags:   [] as number[],
  cv_document_id:   null as number | null,
})

// ── Organization forms ─────────────────────────────────────

type AddressForm = { street: string; city: string; postal_code: string; country: string }
type OrgForm     = { id: number; name: string; phone: string; ico: string; web_url: string; description: string; address: AddressForm; sectors: number[] }

const orgForms   = ref<OrgForm[]>([])

const newOrgForm = ref({
  name: '', phone: '', ico: '', web_url: '', description: '',
  address: { street: '', city: '', postal_code: '', country: '' },
  sectors: [] as number[],
})

function buildOrgForm(org: any): OrgForm {
  return {
    id:          org.id,
    name:        org.name        ?? '',
    phone:       org.phone       ?? '',
    ico:         org.ico         ?? '',
    web_url:     org.web_url     ?? '',
    description: org.description ?? '',
    address: {
      street:      org.address?.street      ?? '',
      city:        org.address?.city        ?? '',
      postal_code: org.address?.postal_code ?? '',
      country:     org.address?.country     ?? '',
    },
    // Sector IDs as numbers so checkbox v-model matches sectorOptions values
    sectors: org.sectors?.map((s: any) => Number(s.id)) ?? [],
  }
}

// ── Reset ──────────────────────────────────────────────────

function resetForm() {
  form.value = {
    name: '', surname: '', email: '', job_position: '',
    status_id: '', role: null, password: '', password_confirmation: '',
  }
  studentForm.value = {
    study_program_id: '', study_field_id: '', study_year_id: '',
    university_id: '', portfolio_url: '', academic_flags: [], cv_document_id: null,
  }
  orgForms.value   = []
  newOrgForm.value = {
    name: '', phone: '', ico: '', web_url: '', description: '',
    address: { street: '', city: '', postal_code: '', country: '' },
    sectors: [],
  }
  avatarFile.value = null
}

// ── Populate forms when user prop changes ──────────────────

watch(
  () => props.user,
  (u) => {
    activeTab.value = 'basic'
    if (!u) { resetForm(); return }

    form.value = {
      name:                  u.name         ?? '',
      surname:               u.surname      ?? '',
      email:                 u.email        ?? '',
      job_position:          u.job_position ?? '',
      status_id:             String(u.status_id ?? ''),
      role:                  u.roles?.find((r: any) => r.name !== 'nti_superadmin')?.id ?? null,
      password:              '',
      password_confirmation: '',
    }

    avatarFile.value = null

    studentForm.value = u.student ? {
      study_program_id: String(u.student.study_program_id ?? ''),
      study_field_id:   String(u.student.study_field_id   ?? ''),
      study_year_id:    String(u.student.study_year_id    ?? ''),
      university_id:    String(u.student.university_id    ?? ''),
      portfolio_url:    u.student.portfolio_url            ?? '',
      academic_flags:   u.student.academic_flags?.map((f: any) => Number(f.id)) ?? [],
      cv_document_id:   u.student.cv_document_id           ?? null,
    } : {
      study_program_id: '', study_field_id: '', study_year_id: '',
      university_id: '', portfolio_url: '', academic_flags: [], cv_document_id: null,
    }

    orgForms.value = u.organizations?.length
      ? u.organizations.map(buildOrgForm)
      : []
  },
  { immediate: true }
)

// ── Save ───────────────────────────────────────────────────

async function handleSave() {
  isSaving.value = true
  try {
    if (isCreateMode.value) {
      await runCreate()
    } else {
      await runUpdate()
    }
    addToast({
      message: isCreateMode.value
        ? 'Používateľ bol úspešne vytvorený'
        : 'Používateľ bol úspešne aktualizovaný',
      type: 'success',
    })
    emit('saved')
    open.value = false
  } catch (e: any) {
    // Laravel returns validation errors under e.data.errors as { field: [msg, ...] }
    // and a human message under e.data.message for other errors
    const laravelErrors = e?.data?.errors ?? e?.response?.data?.errors
    if (laravelErrors) {
      const first = Object.values(laravelErrors).flat()[0] as string
      addToast({ message: first ?? 'Neplatné údaje', type: 'error' })
    } else {
      const msg = e?.data?.message ?? e?.response?.data?.message
      addToast({
        message: msg ?? (isCreateMode.value
          ? 'Nepodarilo sa vytvoriť používateľa'
          : 'Nepodarilo sa uložiť zmeny'),
        type: 'error',
      })
    }
  } finally {
    isSaving.value = false
  }
}

// ── Create ─────────────────────────────────────────────────
// All data — user, student profile, organization — is sent in one request.
// UserController creates everything via Eloquent relations on the new user.
// No user_id is ever passed from the frontend.

async function runCreate() {
  const fd = new FormData()
  fd.append('name',                  form.value.name)
  fd.append('surname',               form.value.surname)
  fd.append('email',                 form.value.email)
  fd.append('password',              form.value.password)
  fd.append('password_confirmation', form.value.password_confirmation)
  if (form.value.job_position) fd.append('job_position', form.value.job_position)
  if (form.value.status_id)    fd.append('status_id',    form.value.status_id)
  if (form.value.role)         fd.append('roles[]',      String(form.value.role))
  if (avatarFile.value)        fd.append('avatar',       avatarFile.value)

  // Student profile nested under student[...]
  if (isStudent.value && studentForm.value.study_program_id) {
    fd.append('student[study_program_id]', String(studentForm.value.study_program_id))
    if (studentForm.value.study_field_id) fd.append('student[study_field_id]', String(studentForm.value.study_field_id))
    if (studentForm.value.university_id)  fd.append('student[university_id]',  String(studentForm.value.university_id))
    if (studentForm.value.study_year_id)  fd.append('student[study_year_id]',  String(studentForm.value.study_year_id))
    if (studentForm.value.portfolio_url)  fd.append('student[portfolio_url]',  studentForm.value.portfolio_url)
    studentForm.value.academic_flags.forEach(id => fd.append('student[academic_flags][]', String(id)))
  }

  // Organization nested under organization[...]
  if (isPartner.value && newOrgForm.value.name) {
    const org = newOrgForm.value
    fd.append('organization[name]', org.name)
    if (org.phone)       fd.append('organization[phone]',       org.phone)
    if (org.ico)         fd.append('organization[ico]',         org.ico)
    if (org.web_url)     fd.append('organization[web_url]',     normalizeUrl(org.web_url) ?? '')
    if (org.description) fd.append('organization[description]', org.description)
    fd.append('organization[address][street]',      org.address.street)
    fd.append('organization[address][city]',        org.address.city)
    fd.append('organization[address][postal_code]', org.address.postal_code)
    fd.append('organization[address][country]',     org.address.country)
    org.sectors.forEach(id => fd.append('organization[sectors][]', String(id)))
  }

  await api.post('/users', fd)
}

// ── Update ─────────────────────────────────────────────────

async function runUpdate() {
  const user = props.user!

  // 1. Update basic user fields
  const payload: Record<string, any> = {
    ...form.value,
    roles: form.value.role ? [form.value.role] : [],
  }
  delete payload.role
  if (!payload.password) {
    delete payload.password
    delete payload.password_confirmation
  }
  await api.put(`/users/${user.id}`, payload)

  // 2. Upload new avatar if a file was picked
  if (avatarFile.value) {
    const fd = new FormData()
    fd.append('avatar', avatarFile.value)
    await api.post(`/users/${user.id}/avatar`, fd)
  }

  // 3. Student profile — update existing or create new via POST /students
  //    POST /students uses $request->user() which is the admin, so for edit mode
  //    we always use PUT on the existing student record.
  //    If the role was just switched to student and no profile exists yet,
  //    create it via the dedicated endpoint — StudentsController@store will
  //    create for the authenticated user (admin), which is wrong, so instead
  //    we call the update endpoint after a create via UserController.
  //    For simplicity: if student profile doesn't exist yet on an existing user,
  //    use a dedicated admin endpoint or handle it here as a PUT to avoid issues.
  if (isStudent.value) {
    const studentPayload = {
      study_program_id: studentForm.value.study_program_id || undefined,
      study_field_id:   studentForm.value.study_field_id   || undefined,
      study_year_id:    studentForm.value.study_year_id    || undefined,
      university_id:    studentForm.value.university_id    || undefined,
      portfolio_url:    studentForm.value.portfolio_url    || null,
      academic_flags:   studentForm.value.academic_flags,
      cv_document_id:   studentForm.value.cv_document_id,
    }

    if (user.student) {
      // Profile exists — update it directly
      await api.put(`/students/${user.student.id}`, studentPayload)
    } else {
      // No profile yet — send via /users/:id/student so the backend can use
      // $user->student()->create(...) without touching $request->user()
      await api.post(`/users/${user.id}/student`, studentPayload)
    }
  }

  // 4. Organizations — update each existing one
  if (isPartner.value) {
    for (const orgForm of orgForms.value) {
      const { id, address, sectors, ...fields } = orgForm
      await api.put(`/organizations/${id}`, {
        ...fields,
        web_url: normalizeUrl(fields.web_url),
        address,
        sectors,
      })
    }

    // Partner has no org yet and the form is filled — create via user sub-route
    if (!user.organizations?.length && newOrgForm.value.name) {
      await api.post(`/users/${user.id}/organization`, {
        ...newOrgForm.value,
        web_url: normalizeUrl(newOrgForm.value.web_url),
      })
    }
  }
}
</script>