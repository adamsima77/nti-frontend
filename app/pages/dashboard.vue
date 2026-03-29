<template>
  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-bold text-navy mb-2">Vitajte, {{ userDisplayName }}! 👋</h1>
      <p class="text-gray-600">Tu je presne prehľad vášho konta</p>
    </div>

    <!-- Role-based sections -->
    <div v-if="authStore.hasRole('student')" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        to="/student/applications"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Moje prihlášky</h3>
          <FileText class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Stav mojich prihlášok a projektov</p>
      </NuxtLink>

      <NuxtLink
        to="/student/teams"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Moje tímy</h3>
          <Users class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Správa tímov a členov</p>
      </NuxtLink>

      <NuxtLink
        to="/student/profile"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Môj profil</h3>
          <User class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Upravenie mojich osobných údajov</p>
      </NuxtLink>
    </div>

    <div v-else-if="authStore.hasRole('organization')" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        to="/organization/profile"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Môj profil organizácie</h3>
          <Briefcase class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Informácie o mojej organizácii</p>
      </NuxtLink>

      <NuxtLink
        to="/organization/challenges"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Moje výzvy</h3>
          <Flag class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Správa výziev a projektov</p>
      </NuxtLink>

      <NuxtLink
        to="/organization/team-applications"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Prihlášky tímov</h3>
          <FileCheck class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Prezeranie a hodnotenie prihlášok</p>
      </NuxtLink>
    </div>

    <div v-else-if="authStore.hasRole('admin')" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        to="/admin/statistics"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Štatistika</h3>
          <BarChart3 class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Prehľad všetkých dát</p>
      </NuxtLink>

      <NuxtLink
        to="/admin/users"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">Správa používateľov</h3>
          <Users class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Správa rôl a oprávnení</p>
      </NuxtLink>

      <NuxtLink
        to="/admin/cms"
        class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-600"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-navy">CMS Editor</h3>
          <FileText class="w-8 h-8 text-blue-600" />
        </div>
        <p class="text-gray-600">Upravenie obsahu webu</p>
      </NuxtLink>
    </div>

    <!-- Quick stats -->
    <div class="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200">
      <h2 class="text-2xl font-bold text-navy mb-6">Rýchle štatistiky</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">--</div>
          <p class="text-sm text-gray-600 mt-2">Prihlášky</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-success-500">--</div>
          <p class="text-sm text-gray-600 mt-2">Schválené</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-warning-500">--</div>
          <p class="text-sm text-gray-600 mt-2">V procese</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-danger-500">--</div>
          <p class="text-sm text-gray-600 mt-2">Zamietnuté</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: 'Dashboard | NTI'
})

const authStore = useAuthStore()

const userDisplayName = computed(() => {
  const user = authStore.user
  if (!user) return 'Užívateľ'

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }

  if (user.organization_name) {
    return user.organization_name
  }

  return user.email || 'Užívateľ'
})
</script>
