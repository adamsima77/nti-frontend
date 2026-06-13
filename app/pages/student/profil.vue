<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold text-navy mb-8">{{ t('student_dashboard.profile.title') }}</h1>

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <div class="h-32 bg-white rounded-lg border border-gray-100 animate-pulse" />
      <div class="h-64 bg-white rounded-lg border border-gray-100 animate-pulse" />
    </div>

    <template v-else>
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-6">
          <div class="flex flex-col items-center gap-2 flex-shrink-0">
            <div class="relative w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
              <img
                v-if="avatarDisplayUrl"
                :src="avatarDisplayUrl"
                alt=""
                class="w-full h-full object-cover"
              >
              <div
                v-else
                class="w-full h-full bg-navy text-white text-xl font-bold flex items-center justify-center"
              >
                {{ userInitials }}
              </div>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              class="sr-only"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              @change="onAvatarFile"
            >
            <UiButton
              type="button"
              variant="ghost"
              size="sm"
              :disabled="avatarUploading"
              @click="avatarInputRef?.click()"
            >
              {{ avatarUploading ? t('student_dashboard.profile.photo_uploading') : (avatarDisplayUrl ? t('student_dashboard.profile.change_photo') : t('student_dashboard.profile.upload_photo')) }}
            </UiButton>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-navy text-lg">{{ form.firstName }} {{ form.lastName }}</h2>
            <p class="text-sm text-gray-500">{{ form.email }}</p>
          </div>
          <div class="flex items-center gap-4 flex-shrink-0">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
            >
              {{ t('student_dashboard.profile.badge_student') }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold text-navy mb-5">{{ t('student_dashboard.profile.personal_data') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <UiInput
            v-model="form.firstName"
            :label="t('student_dashboard.profile.first_name')"
            required
          />
          <UiInput
            v-model="form.lastName"
            :label="t('student_dashboard.profile.last_name')"
            required
          />
          <UiInput
            v-model="form.email"
            :label="t('student_dashboard.common.email')"
            type="email"
            disabled
          />
        </div>
        <div class="mt-6">
          <UiButton
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? t('student_dashboard.common.saving') : t('student_dashboard.common.save_changes') }}
          </UiButton>
        </div>
      </div>

      <div
        v-if="studentRecord"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
      >
        <h2 class="text-lg font-bold text-navy mb-5">{{ t('student_dashboard.profile.student_profile') }}</h2>
        <div class="grid grid-cols-1 gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-500">{{ t('student_dashboard.profile.university') }}</label>
              <select
                v-model="studentDetails.university_id"
                class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                <option :value="null">{{ t('student_dashboard.profile.select_university') }}</option>
                <option v-for="university in universities" :key="university.id" :value="university.id">{{ university.name }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-500">{{ t('student_dashboard.profile.study_program') }}</label>
              <select
                v-model="studentDetails.study_program_id"
                class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                <option :value="null">{{ t('student_dashboard.profile.select_program') }}</option>
                <option v-for="program in studyPrograms" :key="program.id" :value="program.id">{{ program.study_program_translations?.[0]?.name ?? program.name }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-500">{{ t('student_dashboard.profile.study_field') }}</label>
              <select
                v-model="studentDetails.study_field_id"
                class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                <option :value="null">{{ t('student_dashboard.profile.select_field') }}</option>
                <option v-for="field in studyFields" :key="field.id" :value="field.id">{{ field.study_field_translations?.[0]?.name ?? field.name }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-gray-500">{{ t('student_dashboard.profile.study_year') }}</label>
              <select
                v-model="studentDetails.study_year_id"
                class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                <option :value="null">{{ t('student_dashboard.profile.select_year') }}</option>
                <option v-for="year in studyYears" :key="year.id" :value="year.id">{{ year.study_year_translations?.[0]?.name ?? year.name }}</option>
              </select>
            </div>
          </div>

          <div v-if="studentRecord.portfolio_url" class="text-sm text-gray-700">
            <p class="font-medium text-gray-900">{{ t('student_dashboard.profile.portfolio') }}</p>
            <a
              :href="studentRecord.portfolio_url"
              class="text-blue-600 hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >{{ studentRecord.portfolio_url }}</a>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <UiButton :disabled="studentSaving" @click="saveStudentRecord">
              {{ studentSaving ? t('student_dashboard.common.saving') : t('student_dashboard.profile.save_student_record') }}
            </UiButton>
            <span v-if="studentSaving" class="text-sm text-gray-500">{{ t('student_dashboard.profile.saving_record') }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 mt-10">
        <h2 class="text-lg font-bold text-navy mb-5">{{ t('student_dashboard.academic_record.title') }}</h2>
        <div class="space-y-5">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              v-model="academicForm.honor_declaration"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700 leading-relaxed">
              {{ t('student_dashboard.academic_record.honor_declaration_text') }}
            </span>
          </label>

          <p v-if="academicRecord?.honor_declaration_signed_at" class="text-sm text-gray-500 pl-7">
            {{ t('student_dashboard.academic_record.signed_at') }} {{ formatDate(academicRecord.honor_declaration_signed_at) }}
          </p>

          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-500">{{ t('student_dashboard.academic_record.transcript_label') }}</p>
            <div v-if="academicRecord?.transcript_file || academicForm.transcript" class="border border-gray-200 rounded-xl bg-slate-50 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-slate-900 truncate">{{ transcriptFileName }}</p>
                  <p class="text-xs text-gray-500">{{ academicForm.transcript ? t('student_dashboard.academic_record.new_transcript') : t('student_dashboard.academic_record.current_transcript') }}</p>
                </div>
                <div class="flex flex-wrap gap-2 shrink-0">
                  <UiButton
                    @click="downloadTranscript"
                    type="button"
                    variant="outline"
                    size="sm"
                    class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50"
                  >
                    {{ t('student_dashboard.academic_record.download') }}
                  </UiButton>
                  <UiButton type="button" size="sm" variant="secondary" @click="transcriptInputRef?.click()">
                    {{ academicRecord?.transcript_file ? t('student_dashboard.academic_record.replace') : t('student_dashboard.academic_record.upload_transcript') }}
                  </UiButton>
                </div>
              </div>
            </div>
            <div v-else>
              <UiFileUpload
                v-model="academicForm.transcript"
                :label="t('student_dashboard.academic_record.upload_transcript')"
                accept=".pdf"
                @error="transcriptError = $event"
              />
            </div>
            <p v-if="transcriptError" class="text-xs text-red-500">{{ transcriptError }}</p>
            <input ref="transcriptInputRef" type="file" class="sr-only" accept=".pdf" @change="onTranscriptFile" />
          </div>

          <div class="flex items-center gap-3">
            <UiButton :disabled="academicSaving" @click="saveAcademicRecord">
              {{ academicSaving ? t('student_dashboard.common.saving') : t('student_dashboard.academic_record.save_button') }}
            </UiButton>
            <span v-if="academicSaving" class="text-sm text-gray-500">{{ t('student_dashboard.academic_record.saving') }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="studentLoaded && !studentRecord"
        class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 mb-6"
      >
        {{ t('student_dashboard.profile.no_student_record') }}
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-red-100 p-6">
        <h2 class="text-lg font-bold text-red-700 mb-2">{{ $t('common.delete_account') }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ $t('common.del_subtitle') }}</p>
        <UiButton
          variant="danger"
          :disabled="deletingAccount"
          @click="deleteAccount"
        >
          {{ deletingAccount ? $t('common.del_acc') : $t('common.d_a') }}
        </UiButton>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'

const api = useApi()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const { addToast } = useToast()
const { t } = useI18n()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['student'],
})

useHead({ title: t('student_dashboard.profile.seo_title') })

const pageLoading = ref(true)
const saving = ref(false)
const avatarUploading = ref(false)
const deletingAccount = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)
const studentLoaded = ref(false)
const studentRecord = ref<any | null>(null)
const academicRecord = ref<any | null>(null)
const academicSaving = ref(false)
const academicLoading = ref(false)
const transcriptError = ref('')
const transcriptInputRef = ref<HTMLInputElement | null>(null)
const studentSaving = ref(false)
const universities = ref<any[]>([])
const studyPrograms = ref<any[]>([])
const studyFields = ref<any[]>([])
const studyYears = ref<any[]>([])

const studentDetails = reactive({
  university_id: null as number | null,
  study_program_id: null as number | null,
  study_field_id: null as number | null,
  study_year_id: null as number | null,
})
const academicForm = reactive({
  honor_declaration: false,
  transcript: null as File | null,
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
})

function syncFormFromUser() {
  const u = authStore.user
  if (!u) return
  form.firstName = u.name ?? ''
  form.lastName = u.surname ?? ''
  form.email = u.email ?? ''
}

watch(
  () => authStore.user,
  () => syncFormFromUser(),
  { deep: true },
)

const userInitials = computed(() => {
  const a = form.firstName?.trim()?.[0] ?? ''
  const b = form.lastName?.trim()?.[0] ?? ''
  return `${a}${b}`.toUpperCase() || '?'
})

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const apiBase = String(config.public.apiBase ?? '').replace(/\/?api\/?$/i, '')
  return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`
}

const avatarDisplayUrl = computed(() => {
  const u = authStore.user
  if (!u) return null
  let pathOrUrl = u.avatar_url
  if (!pathOrUrl && u.avatar) {
    const av = u.avatar.replace(/^\/+/, '')
    pathOrUrl = av.startsWith('storage/') ? `/${av}` : `/storage/${av}`
  }
  return resolveMediaUrl(pathOrUrl)
})

onMounted(async () => {
  pageLoading.value = true
  try {
    await authStore.getCurrentUser()
    syncFormFromUser()
    await Promise.all([
      loadStudyOptions(),
      loadStudentMe(),
      loadAcademicRecord()
    ])
  } finally {
    pageLoading.value = false
  }
})

async function downloadTranscript() {
  if (!academicRecord.value?.transcript_file) return

  try {
    const res = await api.get(`/get-academic-record/${academicRecord.value.transcript_file}`, {
      responseType: 'blob'
    }) as any

    const fileName = `transcript_${academicRecord.value.transcript_file}.pdf`
    const blobUrl = window.URL.createObjectURL(new Blob([res]))
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)

    addToast({ message: t('student_dashboard.academic_record.download_success') ?? 'Súbor bol stiahnutý.', type: 'success' })
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? t('student_dashboard.academic_record.download_error')
    addToast({ message: msg, type: 'error' })
  }
}

async function loadStudentMe() {
  try {
    const res = await api.get('/students/me') as { student?: any }
    studentRecord.value = res.student ?? null
    studentDetails.university_id = studentRecord.value?.university_id ?? null
    studentDetails.study_program_id = studentRecord.value?.study_program_id ?? null
    studentDetails.study_field_id = studentRecord.value?.study_field_id ?? null
    studentDetails.study_year_id = studentRecord.value?.study_year_id ?? null
  } catch {
    studentRecord.value = null
    studentDetails.university_id = null
    studentDetails.study_program_id = null
    studentDetails.study_field_id = null
    studentDetails.study_year_id = null
  } finally {
    studentLoaded.value = true
  }
}

async function loadStudyOptions() {
  try {
    const [universityRes, studyProgramRes, studyFieldRes, studyYearRes] = await Promise.all<any>([
      api.get('/university'),
      api.get('/study-program'),
      api.get('/study-field'),
      api.get('/study-year'),
    ])

    universities.value = universityRes ?? []
    studyPrograms.value = studyProgramRes ?? []
    studyFields.value = studyFieldRes ?? []
    studyYears.value = studyYearRes ?? []
  } catch {
    universities.value = []
    studyPrograms.value = []
    studyFields.value = []
    studyYears.value = []
  }
}

async function loadAcademicRecord() {
  academicLoading.value = true
  try {
    const res = await api.get('/student/academic-record') as any
    const record = res?.academic_record ?? res
    academicRecord.value = record ?? null
    academicForm.honor_declaration = Boolean(record?.honor_declaration)
    academicForm.transcript = null
  } catch {
    academicRecord.value = null
    academicForm.honor_declaration = false
    academicForm.transcript = null
  } finally {
    academicLoading.value = false
  }
}

const transcriptFileName = computed(() => {
  if (academicForm.transcript) return academicForm.transcript.name
  
  const fileProp = academicRecord.value?.transcript_file
  if (typeof fileProp === 'number') {
    return `Uložený dokument v systéme (ID: ${fileProp})` 
  }
  if (typeof fileProp === 'string') {
    return fileProp.split('/').pop() ?? ''
  }
  return ''
})

function onTranscriptFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  transcriptError.value = ''
  if (!file) return

  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
    transcriptError.value = t('student_dashboard.academic_record.transcript_type_error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    transcriptError.value = t('student_dashboard.academic_record.transcript_size_error')
    return
  }

  academicForm.transcript = file
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function saveAcademicRecord() {
  academicSaving.value = true
  transcriptError.value = ''

  try {
    const formData = new FormData()
    formData.append('honor_declaration', academicForm.honor_declaration ? '1' : '0')
    if (academicForm.transcript instanceof File) {
      formData.append('transcript_file', academicForm.transcript)
    }

    await api.post('/student/academic-record', formData)
    await loadAcademicRecord()
    addToast({ message: t('student_dashboard.academic_record.save_success'), type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.academic_record.save_error')
    addToast({ message: msg, type: 'error' })
  } finally {
    academicSaving.value = false
  }
}

async function saveStudentRecord() {
  if (!studentRecord.value) return

  studentSaving.value = true
  try {
    await api.put(`/students/${studentRecord.value.id}`, {
      university_id: studentDetails.university_id,
      study_program_id: studentDetails.study_program_id,
      study_field_id: studentDetails.study_field_id,
      study_year_id: studentDetails.study_year_id,
    })
    await loadStudentMe()
    addToast({ message: t('student_dashboard.profile.toasts.saved'), type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.profile.toasts.save_failed')
    addToast({ message: msg, type: 'error' })
  } finally {
    studentSaving.value = false
  }
}

async function onAvatarFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const mimeOk = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const extOk = /\.(jpe?g|png)$/i.test(file.name)
  if (!mimeOk && !extOk) {
    addToast({ message: t('student_dashboard.profile.toasts.invalid_photo_type'), type: 'error' })
    return
  }
  if (file.size > 4 * 1024 * 1024) {
    addToast({ message: t('student_dashboard.profile.toasts.photo_too_large'), type: 'error' })
    return
  }

  const u = authStore.user
  if (!u) return

  const fd = new FormData()
  fd.append('avatar', file)

  avatarUploading.value = true
  try {
    const res = await api.post(`/users/${u.id}/avatar`, fd) as {
      avatar_url?: string | null
      avatar?: string | null
    }
    authStore.patchUser({
      ...(res.avatar_url !== undefined ? { avatar_url: res.avatar_url } : {}),
      ...(res.avatar !== undefined ? { avatar: res.avatar } : {}),
    })
    syncFormFromUser()
    addToast({ message: t('student_dashboard.profile.toasts.photo_saved'), type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? t('student_dashboard.profile.toasts.photo_error')
    addToast({ message: msg, type: 'error' })
  } finally {
    avatarUploading.value = false
  }
}

async function saveProfile() {
  const u = authStore.user
  if (!u) return

  const roleIds = u.roles?.map((r) => r.id) ?? []
  if (!roleIds.length) {
    addToast({ message: t('student_dashboard.profile.toasts.role_detect_error'), type: 'error' })
    return
  }

  saving.value = true
  try {
    await api.put(`/users/${u.id}`, {
      name: form.firstName,
      surname: form.lastName,
      email: form.email,
      roles: roleIds,
    })
    await authStore.getCurrentUser({ force: true })
    syncFormFromUser()
    addToast({ message: t('student_dashboard.profile.toasts.saved'), type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Uloženie zlyhalo'
    addToast({ message: msg, type: 'error' })
  } finally {
    saving.value = false
  }
}

async function deleteAccount() {
  const u = authStore.user
  if (!u) return

  const confirmed = window.confirm('Naozaj chcete anonymizovať a vymazať účet? Túto akciu nie je možné vrátiť.')
  if (!confirmed) return

  deletingAccount.value = true
  try {
    await api.post(`/users/anonymize-user/${u.id}`)
    authStore.$reset()
    addToast({ message: 'Účet bol anonymizovaný.', type: 'success' })
    await navigateTo('/auth/login')
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Anonymizácia účtu zlyhala.'
    addToast({ message: msg, type: 'error' })
  } finally {
    deletingAccount.value = false
  }
}
</script>