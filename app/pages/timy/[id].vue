<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <!-- Loading state -->
    <div v-if="teamsStore.isLoading" class="space-y-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-96 animate-pulse" />
    </div>

    <!-- Not found -->
    <div
      v-else-if="!teamsStore.currentTeam"
      class="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <UiEmptyState
        :icon="Users"
        title="Tím nenájdený"
      >
        <NuxtLink
          to="/timy"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
        >
          <ArrowLeft class="w-4 h-4" />
          Späť na tímy
        </NuxtLink>
      </UiEmptyState>
    </div>

    <template v-else>
      <!-- Breadcrumbs -->
      <div class="mb-8">
        <UiBreadcrumbs :items="[{ label: 'Tímy', to: '/timy' }, { label: teamsStore.currentTeam.name }]" />
      </div>

      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-navy mb-1">{{ teamsStore.currentTeam.name }}</h1>
          <p class="text-sm text-gray-500">
            Vytvorený {{ teamsStore.currentTeam.createdAt }} · {{ teamsStore.currentTeam.members.length }} členov · {{ teamsStore.currentTeam.applications.length }} prihlášok
          </p>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
          {{ teamsStore.currentTeam.myRole }}
        </span>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Members -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-navy">Členovia tímu</h2>
              <button
                @click="showInviteModal = true"
                class="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                + Pozvať
              </button>
            </div>
            <UiDataTable
              :columns="memberColumns"
              :rows="teamsStore.currentTeam.members"
              row-key="email"
              empty-title="Žiadni členovia"
            >
              <template #cell-name="{ row }">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-navy text-white text-xs font-medium flex items-center justify-center flex-shrink-0"
                  >
                    {{ getInitials(row.name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-navy">{{ row.name }}</p>
                    <p class="text-xs text-gray-400">{{ row.email }}</p>
                  </div>
                </div>
              </template>
              <template #cell-role="{ value }">
                <span
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    value === 'Team Lead' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ value }}
                </span>
              </template>
              <template #cell-actions="{ row }">
                <button
                  v-if="teamsStore.currentTeam.myRole === 'Team Lead' && row.role !== 'Team Lead'"
                  @click="removeMemberAction(row.id)"
                  class="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Odstrániť
                </button>
              </template>
            </UiDataTable>
          </div>

          <!-- Applications -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-navy mb-6">Prihlášky tímu</h2>
            <UiDataTable
              :columns="appColumns"
              :rows="teamsStore.currentTeam.applications"
              empty-title="Tím zatiaľ nemá žiadne prihlášky"
              @row-click="(row: any) => navigateTo(`/prihlasky/${row.id}`)"
            >
              <template #cell-title="{ row }">
                <div>
                  <p class="text-sm font-medium text-navy">{{ row.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ row.program }} · {{ row.submittedAt || 'Rozpracovaná' }}
                  </p>
                </div>
              </template>
              <template #cell-status="{ value }">
                <UiStatusBadge :status="value" />
              </template>
            </UiDataTable>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <!-- Info card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-navy mb-5">Informácie</h2>
            <dl class="space-y-4">
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Vytvorený</dt>
                <dd class="text-sm font-medium text-navy">{{ teamsStore.currentTeam.createdAt }}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Členov</dt>
                <dd class="text-sm font-medium text-navy">{{ teamsStore.currentTeam.members.length }}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Prihlášok</dt>
                <dd class="text-sm font-medium text-navy">{{ teamsStore.currentTeam.applications.length }}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-sm text-gray-500">Vaša rola</dt>
                <dd class="text-sm font-medium text-navy">{{ teamsStore.currentTeam.myRole }}</dd>
              </div>
            </dl>
          </div>

          <!-- Quick actions -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-navy mb-5">Akcie</h2>
            <div class="space-y-3">
              <button
                @click="showInviteModal = true"
                class="w-full px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <UserPlus class="w-4 h-4" />
                Pozvať člena
              </button>
              <NuxtLink
                to="/prihlasky/nova"
                class="block"
              >
                <UiButton
                  variant="outline"
                  class="w-full"
                >
                  <FileText class="w-4 h-4" />
                  Nová prihláška
                </UiButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Invite Modal -->
      <TeamInviteModal
        v-model="showInviteModal"
        :team-id="Number(teamId)"
        @invited="handleMemberInvited"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Users, UserPlus, FileText } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  // middleware: 'auth', // TODO: re-enable when backend is available
})

const route = useRoute()
useHead({ title: 'Detail tímu | NTI' })

const teamsStore = useTeamsStore()
const { addToast } = useToast()

const teamId = route.params.id as string
const showInviteModal = ref(false)

const memberColumns = [
  { key: 'name', label: 'Člen' },
  { key: 'role', label: 'Rola' },
  { key: 'actions', label: '' },
]

const appColumns = [
  { key: 'title', label: 'Prihláška' },
  { key: 'status', label: 'Stav' },
]

// Load team data on mount
onMounted(async () => {
  try {
    await teamsStore.fetchTeamById(teamId)
  } catch (err) {
    console.error('Failed to load team:', err)
    addToast({
      message: 'Chyba pri načítavaní tímu',
      type: 'error',
    })
  }
})

const removeMemberAction = async (memberId: number) => {
  if (!confirm('Naozaj chcete odstrániť tohto člena z tímu?')) return

  try {
    await teamsStore.removeMember(teamId, memberId)
    addToast({
      message: 'Člen bol odstránený z tímu',
      type: 'success',
    })
  } catch (err) {
    addToast({
      message: 'Chyba pri odstraňovaní člena',
      type: 'error',
    })
  }
}

const handleMemberInvited = () => {
  showInviteModal.value = false
  addToast({
    message: 'Člen bol pozvnaný',
    type: 'success',
  })
  // Reload team data
  teamsStore.fetchTeamById(teamId)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>
