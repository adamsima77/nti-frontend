<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-navy">Moje tímy</h1>
      <NuxtLink to="/timy/vytvorit">
        <UiButton>
          <Plus class="w-4 h-4" />
          Vytvoriť tím
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="teamsStore.isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 h-64 animate-pulse" />
    </div>

    <!-- Empty state -->
    <div v-else-if="teamsStore.teams.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-100">
      <UiEmptyState
        :icon="Users"
        title="Zatiaľ nemáte žiadne tímy"
        description="Vytvorte si svoj prvý tím a pozvite členov!"
      >
        <NuxtLink to="/timy/vytvorit">
          <UiButton>
            <Plus class="w-4 h-4" />
            Vytvoriť tím
          </UiButton>
        </NuxtLink>
      </UiEmptyState>
    </div>

    <!-- Team cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="team in teamsStore.teams"
        :key="team.id"
        class="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
      >
        <h3 class="font-semibold text-navy text-lg mb-3">{{ team.name }}</h3>

        <!-- Role badge -->
        <div class="mb-3">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
          >
            {{ team.myRole }}
          </span>
        </div>

        <!-- Member initials -->
        <div class="flex items-center gap-1 mb-3">
          <div
            v-for="member in team.members.slice(0, 4)"
            :key="member.name"
            class="w-8 h-8 rounded-full bg-navy text-white text-xs font-medium flex items-center justify-center"
            :title="member.name"
          >
            {{ getInitials(member.name) }}
          </div>
          <div
            v-if="team.members.length > 4"
            class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 text-xs font-medium flex items-center justify-center"
          >
            +{{ team.members.length - 4 }}
          </div>
          <span class="text-sm text-gray-500 ml-2">{{ team.members.length }} členov</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span class="flex items-center gap-1">
            <FileText class="w-4 h-4" />
            {{ team.applications.length }} prihlášok
          </span>
          <span class="text-xs text-gray-400">{{ team.createdAt }}</span>
        </div>

        <!-- Detail link -->
        <NuxtLink
          :to="`/timy/${team.id}`"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Zobraziť detail
          <ChevronRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, FileText, ChevronRight, Users } from 'lucide-vue-next'
import { onMounted } from 'vue'

definePageMeta({
  layout: 'portal',
  // middleware: 'auth', // TODO: re-enable when backend is available
})

useSeoMeta({
  title: 'Moje tímy | NTI',
  description: 'Spravujte svoje tímy, sledujte projektov a komunikujte so svojimi členaní.',
  ogTitle: 'Moje tímy — NTI',
  ogDescription: 'Správa tímov, sledovanie projektov a spolupráca s členmi tímu.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/timy',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Moje tímy — NTI',
  twitterDescription: 'Spravujte svoje tímy a projektov.',
})

const teamsStore = useTeamsStore()

// Load teams when page mounts
onMounted(async () => {
  await teamsStore.fetchTeams()
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
