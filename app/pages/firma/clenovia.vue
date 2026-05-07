<!-- pages/firma/clenovia.vue -->
<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">Správa členov</h1>
        <p class="text-gray-500 text-sm">Členovia organizácie s prístupom do portálu NTI</p>
      </div>
      <button
        @click="showInviteModal = true"
        class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
      >
        <UserPlus class="w-4 h-4" />
        Pozvať člena
      </button>
    </div>

    <!-- Info box -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 flex gap-2 text-sm text-blue-700">
      <Info class="w-4 h-4 mt-0.5 shrink-0" />
      Každý člen dostane prístup do firemného portálu podľa svojej roly. Administrátor môže spravovať zadania a profil,
      člen má iba prístup na čítanie.
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
                  v-if="member.id !== currentUserId && canEdit"
                  v-model="member.role"
                  @change="handleRoleChange(member)"
                  class="px-2 py-1 rounded border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrátor</option>
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
                    v-if="member.status === 'pending'"
                    @click="resendInvite(member)"
                    class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
                    title="Znova odoslať pozvánku"
                  >
                    <RefreshCw class="w-4 h-4" />
                  </button>
                  <button
                    v-if="member.id !== currentUserId && canEdit"
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
          <div class="flex gap-2">
            <button
              @click="resendInvite(invite)"
              class="text-xs text-warning-700 hover:underline"
            >
              Znova odoslať
            </button>
            <button
              @click="cancelInvite(invite)"
              class="text-xs text-danger-600 hover:underline"
            >
              Zrušiť
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Invite modal ── -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        class="absolute inset-0 bg-black/40"
        @click="showInviteModal = false"
      />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-navy text-lg">Pozvať nového člena</h3>
          <button
            @click="showInviteModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <UiInput
            v-model="inviteForm.email"
            type="email"
            label="E-mailová adresa"
            placeholder="kolega@firma.sk"
            required
            :error="inviteErrors.email || undefined"
          />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Rola v organizácii</label>
            <select
              v-model="inviteForm.role"
              class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="admin">Administrátor — plný prístup, správa zadaní a profilu</option>
              <option value="member">Člen — prístup na čítanie</option>
              <option value="po">Product Owner — správa zadaní, komunikácia s tímami</option>
            </select>
          </div>

          <!-- Role description -->
          <div class="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
            <template v-if="inviteForm.role === 'admin'">
              <strong class="text-gray-700">Administrátor</strong> — môže upravovať firemný profil, vytvárať a spravovať
              zadania, pozývať členov a vidieť všetky prihlášky.
            </template>
            <template v-else-if="inviteForm.role === 'po'">
              <strong class="text-gray-700">Product Owner</strong> — môže komunikovať s realizačným tímom, schvaľovať
              míľniky a odovzdania. Nemôže meniť profil ani rozpočty.
            </template>
            <template v-else>
              <strong class="text-gray-700">Člen</strong> — môže vidieť zadania a prihlášky tímov. Nemôže nič meniť.
            </template>
          </div>

          <div
            v-if="inviteSuccess"
            class="bg-success-50 border border-success-200 text-success-700 px-3 py-2 rounded text-sm flex items-center gap-2"
          >
            <CheckCircle class="w-4 h-4 shrink-0" />
            Pozvánka bola odoslaná na {{ inviteForm.email }}.
          </div>
          <div
            v-if="inviteError"
            class="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded text-sm"
          >
            {{ inviteError }}
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showInviteModal = false"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Zrušiť
          </button>
          <button
            @click="handleInvite"
            :disabled="isInviting"
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
              v-if="isInviting"
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
            {{ isInviting ? 'Odosielam...' : 'Odoslať pozvánku' }}
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
import { ref, reactive, computed } from 'vue'
import { UserPlus, Info, Trash2, RefreshCw, Clock, X, CheckCircle, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Správa členov | NTI Firma' })

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

const currentUserId = 2
const canEdit = true // TODO: check if current user is admin

interface Member {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'pending'
  addedAt: string
}

const members = ref<Member[]>([
  {
    id: 2,
    name: 'Peter Kováč',
    email: 'peter.kovac@techfirma.sk',
    role: 'admin',
    status: 'active',
    addedAt: '10.01.2026',
  },
  {
    id: 3,
    name: 'Jana Horáková',
    email: 'jana.horakova@techfirma.sk',
    role: 'po',
    status: 'active',
    addedAt: '15.01.2026',
  },
  {
    id: 4,
    name: 'Marek Sloboda',
    email: 'marek.sloboda@techfirma.sk',
    role: 'member',
    status: 'active',
    addedAt: '20.02.2026',
  },
  {
    id: 5,
    name: 'Eva Nováková',
    email: 'eva.novakova@techfirma.sk',
    role: 'member',
    status: 'pending',
    addedAt: '28.03.2026',
  },
])

const pendingInvites = computed(() => members.value.filter((m) => m.status === 'pending'))

// ── Invite ───────────────────────────────────────────────────
const showInviteModal = ref(false)
const isInviting = ref(false)
const inviteSuccess = ref(false)
const inviteError = ref<string | null>(null)

const inviteForm = reactive({ email: '', role: 'member' })
const inviteErrors = reactive<Record<string, string | null>>({ email: null })

const handleInvite = async () => {
  inviteErrors.email = null
  inviteSuccess.value = false
  if (!inviteForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
    inviteErrors.email = 'Zadajte platný e-mail'
    return
  }
  isInviting.value = true
  try {
    // TODO: await api.post('/firma/clenovia/invite', inviteForm)
    await new Promise((r) => setTimeout(r, 800))
    members.value.push({
      id: Date.now(),
      name: inviteForm.email.split('@')[0] ?? inviteForm.email,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'pending',
      addedAt: new Date().toLocaleDateString('sk-SK'),
    })
    inviteSuccess.value = true
    inviteForm.email = ''
    inviteForm.role = 'member'
    setTimeout(() => {
      showInviteModal.value = false
      inviteSuccess.value = false
    }, 2000)
  } catch {
    inviteError.value = 'Nastala chyba. Skúste znova.'
  } finally {
    isInviting.value = false
  }
}

// ── Role change ──────────────────────────────────────────────
const handleRoleChange = async (member: Member) => {
  // TODO: await api.patch(`/firma/clenovia/${member.id}`, { role: member.role })
  await new Promise((r) => setTimeout(r, 300))
}

// ── Remove ───────────────────────────────────────────────────
const memberToRemove = ref<Member | null>(null)
const confirmRemove = (m: Member) => {
  memberToRemove.value = m
}
const executeRemove = async () => {
  if (!memberToRemove.value) return
  // TODO: await api.delete(`/firma/clenovia/${memberToRemove.value.id}`)
  members.value = members.value.filter((m) => m.id !== memberToRemove.value!.id)
  memberToRemove.value = null
}

// ── Invite actions ───────────────────────────────────────────
const resendInvite = async (member: any) => {
  // TODO: await api.post('/firma/clenovia/resend', { email: member.email })
  await new Promise((r) => setTimeout(r, 400))
}
const cancelInvite = (member: any) => {
  members.value = members.value.filter((m) => m.email !== member.email)
}

// ── Helpers ──────────────────────────────────────────────────
const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const roleLabel = (role: string) => ({ admin: 'Administrátor', member: 'Člen', po: 'Product Owner' })[role] || role

const roleClass = (role: string) =>
  ({
    admin: 'bg-blue-50 text-blue-700',
    po: 'bg-purple-50 text-purple-700',
    member: 'bg-gray-100 text-gray-600',
  })[role] || 'bg-gray-100 text-gray-600'
</script>
