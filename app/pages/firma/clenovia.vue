<!-- pages/firma/clenovia.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">{{ $t('firma.clenovia.title') }}</h1>
        <p class="text-gray-500 text-sm">{{ $t('firma.clenovia.subtitle') }}</p>
      </div>
    </div>

    <!-- Info box -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 flex gap-2 text-sm text-blue-700">
      <Info class="w-4 h-4 mt-0.5 shrink-0" />
      {{ $t('firma.clenovia.info') }}
    </div>

    <div class="flex items-center justify-end mb-4">
      <button
        v-if="canManageContacts"
        @click="showInviteModal = true"
        class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
      >
        {{ $t('firma.clenovia.invite_btn') }}
      </button>
    </div>

    <!-- Members table -->
    <div class="bg-white rounded-lg border border-gray-100 overflow-hidden mb-6">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('firma.clenovia.table.col_member') }}</th>
              <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('firma.clenovia.table.col_role') }}</th>
              <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('firma.clenovia.table.col_status') }}</th>
              <th class="text-left px-5 py-3 font-medium text-gray-500">{{ $t('firma.clenovia.table.col_added') }}</th>
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
                        >{{ $t('firma.clenovia.table.you') }}</span
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
                  <option value="member">{{ $t('firma.clenovia.roles.member') }}</option>
                  <option value="po">{{ $t('firma.clenovia.roles.po') }}</option>
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
                  {{ member.status === 'active' ? $t('firma.clenovia.table.status_active') : $t('firma.clenovia.table.status_pending') }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-500 text-xs">{{ member.addedAt }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="member.id !== currentUserId && canManageContacts"
                    @click="confirmRemove(member)"
                    class="p-1.5 text-gray-400 hover:text-danger-500 transition-colors rounded"
                    :title="$t('firma.clenovia.table.remove_title')"
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
        {{ $t('firma.clenovia.pending_invites', { count: pendingInvites.length }) }}
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
        <h3 class="text-xl font-semibold mb-3">{{ $t('firma.clenovia.invite_modal.title') }}</h3>
        <p class="text-sm text-gray-500 mb-5">{{ $t('firma.clenovia.invite_modal.subtitle') }}</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('firma.clenovia.invite_modal.email_label') }}</label>
            <input
              v-model="inviteEmail"
              type="email"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
              :placeholder="$t('firma.clenovia.invite_modal.email_placeholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('firma.clenovia.invite_modal.role_label') }}</label>
            <select
              v-model="inviteRole"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="member">{{ $t('firma.clenovia.roles.member') }}</option>
              <option value="po">{{ $t('firma.clenovia.roles.po') }}</option>
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
            {{ $t('firma.clenovia.invite_modal.cancel') }}
          </button>
          <button
            @click="inviteMember"
            class="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {{ $t('firma.clenovia.invite_modal.send') }}
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
        <h3 class="font-semibold text-navy mb-2">{{ $t('firma.clenovia.remove_modal.title') }}</h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ $t('firma.clenovia.remove_modal.body', { name: memberToRemove.name }) }}
        </p>
        <div class="flex gap-3">
          <button
            @click="memberToRemove = null"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {{ $t('firma.clenovia.remove_modal.cancel') }}
          </button>
          <button
            @click="executeRemove"
            class="flex-1 px-4 py-2.5 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600"
          >
            {{ $t('firma.clenovia.remove_modal.confirm') }}
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
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Správa členov | NTI Firma' })

const orgDashboard = useOrgDashboard()
await orgDashboard.load()
if (orgDashboard.myRole.value !== 'organization_admin') {
  await navigateTo(useLocalePath()('/firma'))
}

const authStore = useAuthStore()
const { get, post, patch, delete: apiDelete } = useApi()
const { addToast } = useToast()
const { t } = useI18n()

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
    addToast({ message: 'Pozvánka bola úspešne odoslaná.', type: 'success' })
  } catch (error: any) {
    inviteError.value = error?.data?.message ?? error?.response?.data?.message ?? t('firma.clenovia.invite_modal.error')
    addToast({ message: inviteError.value!, type: 'error' })
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
    addToast({ message: 'Rola člena bola zmenená.', type: 'success' })
  } catch {
    addToast({ message: 'Zmena roly sa nepodarila.', type: 'error' })
    await loadMembers()
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
    addToast({ message: 'Člen bol odstránený.', type: 'success' })
  } catch {
    addToast({ message: 'Odstránenie člena sa nepodarilo.', type: 'error' })
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

const roleLabel = (role: string) => ({
  admin: t('firma.clenovia.roles.admin'),
  member: t('firma.clenovia.roles.member'),
  po: t('firma.clenovia.roles.po'),
})[role] || role

const roleClass = (role: string) =>
  ({
    admin: 'bg-blue-50 text-blue-700',
    po: 'bg-purple-50 text-purple-700',
    member: 'bg-gray-100 text-gray-600',
  })[role] || 'bg-gray-100 text-gray-600'
</script>
