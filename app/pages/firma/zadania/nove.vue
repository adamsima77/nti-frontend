<!-- pages/firma/zadania/nove.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <NuxtLink
      :to="localePath('/firma/zadania')"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" />
      {{ $t('firma.zadanie_detail.back') }}
    </NuxtLink>

    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy mb-1">{{ $t('firma.zadanie_detail.new_title') }}</h1>
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
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Nové zadanie | NTI Firma' })

const orgDashboard = useOrgDashboard()
await orgDashboard.load()
if (orgDashboard.myRole.value !== 'organization_admin') {
  await navigateTo(useLocalePath()('/firma'))
}

const router = useRouter()
const localePath = useLocalePath()

const handleSaved = () => {
  router.push(localePath('/firma/zadania'))
}
</script>
