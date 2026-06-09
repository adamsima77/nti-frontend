<!-- pages/firma/clenovia.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">Správa členov</h1>
        <p class="text-gray-500 text-sm">Členovia organizácie s prístupom do portálu NTI</p>
      </div>
    </div>

    <!-- Info box -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 flex gap-2 text-sm text-blue-700">
      <Info class="w-4 h-4 mt-0.5 shrink-0" />
      Každý člen dostane prístup do firemného portálu podľa svojej roly.
    </div>

    <div class="flex items-center justify-end mb-4">
      <button
        v-if="canManageContacts"
        @click="showInviteModal = true"
        class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
      >
        Pozvať člena
      </button>
    </div>

    <!-- Members table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden mb-6">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left px-5 py-3 font-medium text-gray-500">Člen</th>
              <th class="text-left px-5 py-3 font-medium text-gray-500">Rola</th>
              <th class="text-left px-5 py-3 font-medium text-gray-500">Stav</th>
              <th class="text-left px-5 py-3 font-medium text-gray-500">Pridaný</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="member in members"
              :key="member.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <!-- Avatar initials -->
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    :class="member.id === currentUserId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ initials(member.name) }}
                  </div>
                  <div>
                    <p class="font-medium text-navy">
                      {{ member.name }}
                      <span
                        v-if="member.id === currentUserId"
                        class="ml-1.5 text-xs font-normal text-gray-400"
                        >(vy)</span
                      >
                    </p>
                    <p class="text-xs text-gray-400">{{ member.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <select
                  v-if="member.id !== currentUserId && canManageContacts"
                  v-model="member.role"
                  @change="handleRoleChange(member)"
                  class="px-2 py-1 rounded border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Člen</option>
                  <option value="po">Product Owner</option>
                </select>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="roleClass(member.role)"
                >
                  {{ roleLabel(member.role) }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="
                    member.status === 'active' ? 'bg-success-50 text-success-500' : 'bg-warning-50 text-warning-500'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="member.status === 'active' ? 'bg-success-500' : 'bg-warning-500'"
                  />
                  {{ member.status === 'active' ? 'Aktívny' : 'Čaká na prijatie' }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-500 text-xs">{{ member.addedAt }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="member.id !== currentUserId && canManageContacts"
                    @click="confirmRemove(member)"
                    class="p-1.5 text-gray-400 hover:text-danger-500 transition-colors rounded"
                    title="Odstrániť člena"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pending invites section -->
    <div
      v-if="pendingInvites.length"
      class="bg-warning-50 border border-warning-200 rounded-lg p-5"
    >
      <h3 class="text-sm font-semibold text-warning-800 mb-3 flex items-center gap-2">
        <Clock class="w-4 h-4" />
        Čakajúce pozvánky ({{ pendingInvites.length }})
      </h3>
      <div class="space-y-2">
        <div
          v-for="invite in pendingInvites"
          :key="invite.email"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-warning-700"
            >{{ invite.email }} — <span class="font-medium">{{ roleLabel(invite.role) }}</span></span
          >
        </div>
      </div>
    </div>


    <!-- Invite member modal -->
    <div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="showInviteModal = false" />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
        <h3 class="text-xl font-semibold mb-3">Pozvať nového člena</h3>
        <p class="text-sm text-gray-500 mb-5">Zadajte e-mail adresu a priradenú rolu člena organizácie.</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              v-model="inviteEmail"
              type="email"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="email@firma.sk"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rola</label>
            <select
              v-model="inviteRole"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="member">Člen</option>
              <option value="po">Product Owner</option>
            </select>
          </div>

          <div v-if="inviteError" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {{ inviteError }}
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showInviteModal = false"
            class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Zrušiť
          </button>
          <button
            @click="inviteMember"
            class="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Poslať pozvánku
          </button>
        </div>
      </div>
    </div>

    <!-- Remove confirm modal -->
    <div
      v-if="memberToRemove"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-black/40"
        @click="memberToRemove = null"
      />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
        <h3 class="font-semibold text-navy mb-2">Odstrániť člena?</h3>
        <p class="text-sm text-gray-500 mb-6">
          <strong>{{ memberToRemove.name }}</strong> stratí prístup do firemného portálu NTI.
        </p>
        <div class="flex gap-3">
          <button
            @click="memberToRemove = null"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Zrušiť
          </button>
          <button
            @click="executeRemove"
            class="flex-1 px-4 py-2.5 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600"
          >
            Odstrániť
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Info, Trash2, Clock } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Správa členov | NTI Firma' })

const authStore = useAuthStore()
const { get, post, patch, delete: apiDelete } = useApi()

const organizationId = computed(() => authStore.userOrganizationId)
const currentUserId = computed(() => authStore.user?.id ?? null)
const canManageContacts = computed(() => authStore.hasPermission('organizations.manage_contacts'))

interface Member {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'pending'
  addedAt: string
}

const members = ref<Member[]>([])
const pendingInvites = computed(() => members.value.filter((m) => m.status === 'pending'))
const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'member' | 'po'>('member')
const inviteError = ref<string | null>(null)

const inviteMember = async () => {
  if (!organizationId.value || !inviteEmail.value.trim()) return

  inviteError.value = null

  try {
    const response = await post(`/organizations/${organizationId.value}/members`, {
      email: inviteEmail.value.trim(),
      role: inviteRole.value,
    }) as any

    if (response?.member) {
      members.value.push(response.member)
    }

    inviteEmail.value = ''
    inviteRole.value = 'member'
    showInviteModal.value = false
  } catch (error: any) {
    inviteError.value = error?.data?.message ?? error?.response?.data?.message ?? 'Nepodarilo sa odoslať pozvánku.'
  }
}

const loadMembers = async () => {
  await authStore.getCurrentUser()
  if (!organizationId.value) return

  try {
    const response = await get(`/organizations/${organizationId.value}`) as any
    members.value = (response?.members ?? []).map((member: any) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
      addedAt: member.addedAt ?? '',
    }))
  } catch {
    members.value = []
  }
}

// ── Role change ──────────────────────────────────────────────
const handleRoleChange = async (member: Member) => {
  if (!organizationId.value) return

  try {
    await patch(`/organizations/${organizationId.value}/members/${member.id}`, {
      role: member.role,
    })
  } catch {
    member.role = member.role // keep current role if update fails
  }
}

// ── Remove ───────────────────────────────────────────────────
const memberToRemove = ref<Member | null>(null)
const confirmRemove = (m: Member) => {
  memberToRemove.value = m
}
const executeRemove = async () => {
  if (!memberToRemove.value || !organizationId.value) return

  try {
    await apiDelete(`/organizations/${organizationId.value}/members/${memberToRemove.value.id}`)
    members.value = members.value.filter((m) => m.id !== memberToRemove.value!.id)
  } catch {
    // ignore failed delete for now
  } finally {
    memberToRemove.value = null
  }
}

// ── Helpers ──────────────────────────────────────────────────
const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

onMounted(loadMembers)

const roleLabel = (role: string) => ({ admin: 'Administrátor', member: 'Člen', po: 'Product Owner' })[role] || role

const roleClass = (role: string) =>
  ({
    admin: 'bg-blue-50 text-blue-700',
    po: 'bg-purple-50 text-purple-700',
    member: 'bg-gray-100 text-gray-600',
  })[role] || 'bg-gray-100 text-gray-600'
</script>
