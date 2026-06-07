<!-- pages/firma/profil.vue -->
<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Profil organizácie</h1>
      <p class="text-gray-500">Informácie o vašej organizácii synchronizované so systémom NTI</p>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
      <div class="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
    </div>

    <template v-else>
      <div
        v-if="isPo"
        class="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" />
        Profil organizácie môže upravovať iba administrátor organizácie.
      </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-4">Základné informácie</h2>
          <div class="space-y-4">
            <UiInput
              v-model="form.organization_name"
              label="Názov organizácie"
              placeholder="TechFirma s.r.o."
              required
              :disabled="isPo"
              :error="errors.organization_name"
            />
            <UiInput
              v-model="form.ico"
              label="IČO"
              placeholder="12345678"
              :disabled="isPo"
              :error="errors.ico"
            />
            <UiInput
              v-model="form.phone"
              label="Telefón"
              type="tel"
              placeholder="+421 900 000 000"
              :disabled="isPo"
            />
            <UiInput
              v-model="form.website"
              label="Webová stránka"
              type="url"
              placeholder="https://vasafirma.sk"
              :disabled="isPo"
              :error="errors.website"
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Popis organizácie</label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Stručný popis vašej firmy, oblasti pôsobenia a hodnôt..."
                :disabled="isPo"
                class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-1">Sektory</h2>
          <p class="text-xs text-gray-400 mb-4">Vyberte oblasti, v ktorých vaša organizácia pôsobí</p>
          
          <div class="flex flex-wrap gap-2">
            <label
              v-for="s in allSectors"
              :key="s.id"
              :class="isPo ? 'cursor-not-allowed' : 'cursor-pointer'"
            >
              <input
                type="checkbox"
                :value="s.id"
                v-model="form.sectors"
                :disabled="isPo"
                class="sr-only"
              />
              <span
                class="inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 select-none"
                :class="form.sectors.includes(s.id)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'"
              >
                {{ s.name }}
              </span>
            </label>
          </div>
          <p v-if="errors.sectors" class="text-xs text-red-500 mt-2">{{ errors.sectors }}</p>
        </div>

        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy mb-4">Adresa</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiInput
              v-model="form.address.city"
              label="Mesto"
              placeholder="Nitra"
              :disabled="isPo"
            />
            <UiInput
              v-model="form.address.postalCode"
              label="PSČ"
              placeholder="949 01"
              :disabled="isPo"
            />
            <UiInput
              v-model="form.address.street"
              label="Ulica"
              placeholder="Štefánikova 12"
              class="md:col-span-2"
              :disabled="isPo"
            />
            <UiInput
              v-model="form.address.country"
              label="Krajina"
              placeholder="Slovensko"
              :disabled="isPo"
            />
          </div>
        </div>

        <div
          v-if="saveSuccess"
          class="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
        >
          <CheckCircle class="w-4 h-4 shrink-0" />
          Profil bol úspešne uložený.
        </div>

        <div
          v-if="saveError"
          class="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ saveError }}
        </div>

        <div v-if="!isPo" class="flex flex-col sm:flex-row justify-between gap-3">
          <UiButton
            variant="danger"
            :disabled="isDeletingAccount"
            @click="deleteAccount"
          >
            {{ isDeletingAccount ? 'Mažem účet...' : 'Vymazať účet' }}
          </UiButton>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="resetForm"
              class="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Zahodiť zmeny
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="isSaving"
                class="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                />
              </svg>
              {{ isSaving ? 'Ukladám...' : 'Uložiť profil' }}
            </button>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useOrgDashboard } from '~/composables/useOrgDashboard'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Profil organizácie | NTI Firma' })

const authStore = useAuthStore()
const api = useApi()
const { addToast } = useToast()
const { locale } = useI18n()
const orgDashboard = useOrgDashboard()
const isPo = orgDashboard.isPo

const isLoading = ref(true)
const isSaving = ref(false)
const isDeletingAccount = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)

const organizationId = computed(() => authStore.userOrganizationId)
const originalOrganization = ref<any | null>(null)
const allSectors = ref<{ id: number; name: string }[]>([])

const form = reactive({
  organization_name: '',
  ico: '',
  description: '',
  website: '',
  phone: '',
  sectors: [] as number[],
  address: {
    city: '',
    street: '',
    postalCode: '',
    country: '',
  },
})

const errors = reactive<Record<string, string | undefined>>({})

const loadSectors = async () => {
  try {
    const response = await api.get(`/sectors/lang/${locale.value}`) as any[]
    allSectors.value = response.map((s: any) => ({
      id: s.id,
      name: s.sector_translations?.[0]?.name ?? s.name ?? ''
    }))
  } catch (e) {
    console.error('Chyba pri načítaní sektorov', e)
  }
}

const setFormFromOrganization = (data: any) => {
  const org = data.organization || data
  const addr = data.address || org.address
  const sectors = data.sectors || org.sectors

  form.organization_name = org?.name ?? ''
  form.ico = org?.ico ?? ''
  form.description = org?.description ?? ''
  form.website = org?.web_url ?? ''
  form.phone = org?.phone ?? ''
  
  form.sectors = sectors?.map((s: any) => s.id) ?? []

  form.address.city = addr?.city ?? ''
  form.address.street = addr?.street ?? ''
  form.address.postalCode = addr?.postal_code ?? ''
  form.address.country = addr?.country ?? ''
}

const loadOrganization = async () => {
  if (!organizationId.value) return

  const response = await api.get(`/organizations/${organizationId.value}`) as any
  
  if (!response?.organization) {
    throw new Error('Organizácia sa nenašla.')
  }

  originalOrganization.value = response
  setFormFromOrganization(response)
  
  authStore.patchUser({ organization_name: response.organization.name })
}

const resetForm = () => {
  if (originalOrganization.value) {
    setFormFromOrganization(originalOrganization.value)
  }
  saveSuccess.value = false
  saveError.value = null
}

const validate = () => {
  errors.organization_name = form.organization_name ? undefined : 'Názov organizácie je povinný'
  errors.website = (!form.website || /^https?:\/\//.test(form.website)) ? undefined : 'Zadajte platnú URL adresu'
  return !Object.values(errors).some(Boolean)
}

const handleSave = async () => {
  saveSuccess.value = false
  saveError.value = null

  if (!validate()) return
  if (!organizationId.value) {
    saveError.value = 'Nepodarilo sa určiť organizáciu.'
    return
  }

  isSaving.value = true
  try {
    const payload = {
      name: form.organization_name,
      ico: form.ico || null,
      description: form.description || null,
      web_url: form.website || null,
      phone: form.phone || null,
      sectors: form.sectors,
      address: {
        city: form.address.city || null,
        street: form.address.street || null,
        postal_code: form.address.postalCode || null,
        country: form.address.country || null,
      },
    }

    const response = await api.put(`/organizations/${organizationId.value}`, payload) as any
    originalOrganization.value = response
    setFormFromOrganization(response)
    const orgName = response.organization?.name || response.name
    if (orgName) {
      authStore.patchUser({ organization_name: orgName })
    }

    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  } catch (err: any) {
    saveError.value = err?.data?.message ?? err?.response?.data?.message ?? 'Nastala chyba pri ukladaní. Skúste znova.'
  } finally {
    isSaving.value = false
  }
}

const deleteAccount = async () => {
  const userId = authStore.user?.id
  if (!userId) return

  const confirmed = window.confirm('Naozaj chcete anonymizovať a vymazať účet? Túto akciu nie je možné vrátiť späť.')
  if (!confirmed) return

  isDeletingAccount.value = true
  try {
    await api.post(`/users/anonymize-user/${userId}`)
    authStore.$reset()
    addToast({ message: 'Účet bol anonymizovaný.', type: 'success' })
    await navigateTo('/auth/login')
  } catch (err: any) {
    addToast({ message: err?.data?.message ?? err?.message ?? 'Anonymizácia účtu zlyhala.', type: 'error' })
  } finally {
    isDeletingAccount.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await authStore.getCurrentUser()
    await orgDashboard.load()
    await loadSectors()
    await loadOrganization()
  } catch (err: any) {
    saveError.value = err?.message ?? 'Nastala chyba pri načítaní profilu.'
  } finally {
    isLoading.value = false
  }
})
</script>
