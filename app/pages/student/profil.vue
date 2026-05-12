<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold text-navy mb-8">Môj profil</h1>

    <div
      v-if="pageLoading"
      class="space-y-4"
    >
      <div class="h-32 bg-white rounded-lg border border-gray-100 animate-pulse" />
      <div class="h-64 bg-white rounded-lg border border-gray-100 animate-pulse" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center gap-6">
          <div
            class="w-16 h-16 rounded-full bg-navy text-white text-xl font-bold flex items-center justify-center flex-shrink-0"
          >
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-navy text-lg">{{ form.firstName }} {{ form.lastName }}</h2>
            <p class="text-sm text-gray-500">{{ form.email }}</p>
          </div>
          <div class="flex items-center gap-4 flex-shrink-0">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
            >
              Študent
            </span>
            <div class="text-right text-sm text-gray-500">
              {{ teamsCount }} tímov · {{ applicationsCount }} prihlášok
            </div>
          </div>
        </div>
      </div>

      <!-- Osobné údaje (uloženie cez API users) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold text-navy mb-5">Osobné údaje</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <UiInput
            v-model="form.firstName"
            label="Meno"
            required
          />
          <UiInput
            v-model="form.lastName"
            label="Priezvisko"
            required
          />
          <UiInput
            v-model="form.email"
            label="Email"
            type="email"
            disabled
          />
        </div>
        <div class="mt-6">
          <UiButton
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? 'Ukladám…' : 'Uložiť zmeny' }}
          </UiButton>
        </div>
      </div>

      <!-- Študentský záznam (GET /students/me) -->
      <div
        v-if="studentRecord"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
      >
        <h2 class="text-lg font-bold text-navy mb-5">Študentský profil</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-gray-500">Univerzita</dt>
            <dd class="font-medium text-navy">{{ studentRecord.university?.name ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Študijný program</dt>
            <dd class="font-medium text-navy">{{ studentRecord.study_program?.name ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Študijný odbor</dt>
            <dd class="font-medium text-navy">{{ studentRecord.study_field?.name ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Ročník</dt>
            <dd class="font-medium text-navy">{{ studentRecord.study_year?.name ?? '—' }}</dd>
          </div>
          <div
            v-if="studentRecord.portfolio_url"
            class="md:col-span-2"
          >
            <dt class="text-gray-500">Portfólio</dt>
            <dd>
              <a
                :href="studentRecord.portfolio_url"
                class="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >{{ studentRecord.portfolio_url }}</a>
            </dd>
          </div>
        </dl>
      </div>

      <div
        v-else-if="studentLoaded"
        class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600"
      >
        Študentský záznam v databáze zatiaľ nemáte (napr. po onboardingu sa vytvorí cez API študenta).
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useApplications } from '~/composables/modules/student/useApplications'

const api = useApi()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()
const { applications, refresh: refreshApplications } = useApplications()
const { addToast } = useToast()

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
})

useHead({ title: 'Môj profil | NTI' })

const pageLoading = ref(true)
const saving = ref(false)
const studentLoaded = ref(false)
const studentRecord = ref<any | null>(null)

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

const teamsCount = computed(() => teamsStore.teams.length)
const applicationsCount = computed(() => applications.value.length)

onMounted(async () => {
  pageLoading.value = true
  try {
    await authStore.getCurrentUser()
    syncFormFromUser()
    await Promise.all([teamsStore.fetchTeams(), refreshApplications(), loadStudentMe()])
  } finally {
    pageLoading.value = false
  }
})

async function loadStudentMe() {
  try {
    const res = await api.get('/students/me') as { student?: any }
    studentRecord.value = res.student ?? null
  } catch {
    studentRecord.value = null
  } finally {
    studentLoaded.value = true
  }
}

async function saveProfile() {
  const u = authStore.user
  if (!u) return

  const roleIds = u.roles?.map((r) => r.id) ?? []
  if (!roleIds.length) {
    addToast({ message: 'Nepodarilo sa určiť roly používateľa.', type: 'error' })
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
    await authStore.getCurrentUser()
    syncFormFromUser()
    addToast({ message: 'Profil bol úspešne uložený', type: 'success' })
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Uloženie zlyhalo'
    addToast({ message: msg, type: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
