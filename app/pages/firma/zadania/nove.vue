<!-- pages/firma/zadania/nove.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <NuxtLink
      to="/firma/zadania"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" />
      Späť na zadania
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy mb-1">Nové zadanie</h1>
      <p class="text-gray-500 text-sm">Program B — živá prax</p>
    </div>

    <ZadanieForm
      :is-new="true"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import ZadanieForm from '~/components/ui/ZadanieForm.vue'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth',
  roles: ['company'],
})

useHead({ title: 'Nové zadanie | NTI Firma' })

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

const router = useRouter()

const handleSaved = () => {
  router.push('/firma/zadania')
}
</script>
