<!-- pages/firma/profil.vue -->
<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Profil organizácie</h1>
      <p class="text-gray-500">Informácie o vašej firme viditeľné pre tímy a NTI</p>
    </div>

    <form
      @submit.prevent="handleSave"
      class="space-y-6"
    >
      <!-- Basic info -->
      <div class="bg-white rounded-lg border border-gray-100 p-6">
        <h2 class="text-base font-semibold text-navy mb-4">Základné informácie</h2>
        <div class="space-y-4">
          <UiInput
            v-model="form.organization_name"
            label="Názov organizácie"
            placeholder="TechFirma s.r.o."
            required
            :error="errors.organization_name"
          />
          <UiInput
            v-model="form.ico"
            label="IČO"
            placeholder="12345678"
            :error="errors.ico"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5"> Popis organizácie </label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Stručný popis vašej firmy, oblasti pôsobenia a hodnôt..."
              class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>
          <UiInput
            v-model="form.website"
            type="url"
            label="Webová stránka"
            placeholder="https://vasafirma.sk"
            :error="errors.website"
          />
        </div>
      </div>

      <!-- Contact -->
      <div class="bg-white rounded-lg border border-gray-100 p-6">
        <h2 class="text-base font-semibold text-navy mb-4">Kontaktné údaje</h2>
        <div class="space-y-4">
          <UiInput
            v-model="form.contact_name"
            label="Kontaktná osoba"
            placeholder="Meno a priezvisko"
            :error="errors.contact_name"
          />
          <UiInput
            v-model="form.contact_email"
            type="email"
            label="Kontaktný e-mail"
            placeholder="kontakt@vasafirma.sk"
            :error="errors.contact_email"
          />
          <UiInput
            v-model="form.contact_phone"
            type="tel"
            label="Telefón"
            placeholder="+421 900 000 000"
          />
          <UiInput
            v-model="form.address"
            label="Adresa sídla"
            placeholder="Ulica 1, 949 01 Nitra"
          />
        </div>
      </div>

      <!-- Industry & size -->
      <div class="bg-white rounded-lg border border-gray-100 p-6">
        <h2 class="text-base font-semibold text-navy mb-4">O firme</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Odvetvie</label>
            <select
              v-model="form.industry"
              class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Vyberte odvetvie</option>
              <option
                v-for="ind in industries"
                :key="ind"
                :value="ind"
              >
                {{ ind }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Veľkosť firmy</label>
            <select
              v-model="form.size"
              class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Vyberte veľkosť</option>
              <option value="1-10">1 – 10 zamestnancov</option>
              <option value="11-50">11 – 50 zamestnancov</option>
              <option value="51-200">51 – 200 zamestnancov</option>
              <option value="200+">200+ zamestnancov</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Success / error messages -->
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

      <!-- Actions -->
      <div class="flex justify-end gap-3">
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
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({
  title: 'Profil organizácie | NTI Firma',
})

const authStore = useAuthStore()

// TODO: remove when backend is available
if (!authStore.user) {
  authStore.user = {
    id: 2,
    email: 'info@techfirma.sk',
    organization_name: 'TechFirma s.r.o.',
    role: 'company',
  }
  authStore.token = 'mock-token'
}

const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)

const industries = [
  'Informačné technológie',
  'Výroba a priemysel',
  'Obchod a retail',
  'Finančné služby',
  'Zdravotníctvo',
  'Vzdelávanie',
  'Logistika a doprava',
  'Energetika',
  'Stavebníctvo',
  'Iné',
]

// TODO: load from API / authStore
const initialForm = {
  organization_name: 'TechFirma s.r.o.',
  ico: '12345678',
  description:
    'Sme inovatívna technologická firma z Nitry špecializujúca sa na vývoj softvérových riešení pre malé a stredné podniky.',
  website: 'https://techfirma.sk',
  contact_name: 'Peter Kováč',
  contact_email: 'peter.kovac@techfirma.sk',
  contact_phone: '+421 905 123 456',
  address: 'Štefánikova 12, 949 01 Nitra',
  industry: 'Informačné technológie',
  size: '11-50',
}

const form = reactive({ ...initialForm })
const errors = reactive<Record<string, string | undefined>>({})

const resetForm = () => {
  Object.assign(form, initialForm)
  saveSuccess.value = false
  saveError.value = null
}

const validate = () => {
  errors.organization_name = form.organization_name ? undefined : 'Názov organizácie je povinný'
  errors.contact_email =
    form.contact_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email) ? undefined : 'Zadajte platný e-mail'
  return !Object.values(errors).some(Boolean)
}

const handleSave = async () => {
  saveSuccess.value = false
  saveError.value = null

  if (!validate()) return

  isSaving.value = true

  try {
    // TODO: await api.put('/firma/profil', form)
    await new Promise((r) => setTimeout(r, 800))
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 4000)
  } catch (err) {
    saveError.value = 'Nastala chyba pri ukladaní. Skúste znova.'
  } finally {
    isSaving.value = false
  }
}
</script>
