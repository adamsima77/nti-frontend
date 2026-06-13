<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">{{ t('admin_commissions.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ t('admin_commissions.subtitle') }}</p>
      </div>
      <UiButton @click="openCreate">
        <Plus class="w-4 h-4 mr-1" />
        {{ t('admin_commissions.btn_new') }}
      </UiButton>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-400 py-8">
      <div class="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      {{ t('admin_commissions.loading') }}
    </div>

    <div v-else-if="!commissions.length" class="text-center py-16 bg-white rounded-xl border border-gray-100">
      <Users class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">{{ t('admin_commissions.empty_title') }}</p>
      <p class="text-sm text-gray-400 mt-1">{{ t('admin_commissions.empty_desc') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="commission in commissions"
        :key="commission.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 class="font-semibold text-navy text-sm">{{ commission.name }}</h2>
              <p class="text-xs text-gray-400">
                {{ commission.members.length }} {{ t('admin_commissions.members_count', commission.members.length) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="p-1.5 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition"
              :title="t('admin_commissions.title_edit_name')"
              @click="openEdit(commission)"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-danger-500 rounded-lg hover:bg-red-50 transition"
              :title="t('admin_commissions.title_delete_commission')"
              @click="confirmDelete(commission)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="px-5 py-3">
          <div v-if="!commission.members.length" class="text-sm text-gray-400 py-2 italic">
            {{ t('admin_commissions.no_members') }}
          </div>
          <div v-else class="space-y-1 mb-3">
            <div
              v-for="member in commission.members"
              :key="member.id ?? member.email"
              class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="member.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'"
                >
                  {{ member.status === 'pending' ? '?' : initials(member.name) }}
                </div>
                <div>
                  <div class="flex items-center gap-1.5">
                    <p class="text-sm font-medium text-gray-800">{{ member.name ?? member.email }}</p>
                    <span v-if="member.status === 'pending'" class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                      {{ t('admin_commissions.status_pending') }}
                    </span>
                  </div>
                  <p v-if="member.name" class="text-xs text-gray-400">{{ member.email }}</p>
                </div>
              </div>
              <button
                v-if="member.status !== 'pending'"
                class="p-1 text-gray-300 hover:text-danger-500 rounded transition"
                :title="t('admin_commissions.title_remove_member')"
                @click="removeMember(commission, member)"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-gray-50">
            <input
              v-model="inviteEmail[commission.id]"
              type="email"
              :placeholder="t('admin_commissions.input_placeholder')"
              class="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              @keydown.enter.prevent="addMember(commission)"
            />
            <UiButton
              size="sm"
              :disabled="!inviteEmail[commission.id]?.trim()"
              @click="addMember(commission)"
            >
              <UserPlus class="w-3.5 h-3.5 mr-1" />
              {{ t('admin_commissions.btn_invite') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 class="text-base font-semibold text-navy mb-4">
                {{ editingCommission ? t('admin_commissions.modal_title_edit') : t('admin_commissions.modal_title_create') }}
              </h3>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin_commissions.modal_label_name') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                :placeholder="t('admin_commissions.modal_input_placeholder')"
                @keydown.enter="saveCommission"
              />
              <p v-if="formError" class="text-xs text-red-500 mt-1.5">{{ formError }}</p>
              <div class="flex justify-end gap-3 mt-5">
                <UiButton variant="outline" @click="closeModal">{{ t('admin_commissions.btn_cancel') }}</UiButton>
                <UiButton :disabled="saving" @click="saveCommission">
                  <span v-if="saving" class="flex items-center gap-2">
                    <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {{ t('admin_commissions.btn_saving') }}
                  </span>
                  <span v-else>{{ editingCommission ? t('admin_commissions.btn_save') : t('admin_commissions.btn_create') }}</span>
                </UiButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteTarget = null" />
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 class="text-base font-semibold text-navy mb-2">{{ t('admin_commissions.modal_delete_title') }}</h3>
              <p class="text-sm text-gray-600 mb-6">
                {{ t('admin_commissions.modal_delete_desc', { name: deleteTarget.name }) }}
              </p>
              <div class="flex justify-end gap-3">
                <UiButton variant="outline" @click="deleteTarget = null">{{ t('admin_commissions.btn_cancel') }}</UiButton>
                <UiButton variant="danger" :disabled="saving" @click="doDelete">
                  {{ t('admin_commissions.btn_delete') }}
                </UiButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2, Users, UserPlus, X } from 'lucide-vue-next'

const { t } = useI18n()

definePageMeta({ layout: 'portal', middleware: ['auth'], roles: ['nti_admin', 'nti_superadmin'], })

useHead({ title: t('admin_commissions.meta_title') })

interface Member {
  id: number | null
  user_id: number | null
  name: string | null
  email: string
  status: 'active' | 'pending'
}

interface Commission {
  id: number
  name: string
  members: Member[]
}

const api       = useApi()
const { addToast } = useToast()

const loading     = ref(true)
const saving      = ref(false)
const commissions = ref<Commission[]>([])

// per-commission email input for invite
const inviteEmail = ref<Record<number, string>>({})

// ── Modal state ───────────────────────────────────────────────────────────────

const modalOpen         = ref(false)
const editingCommission = ref<Commission | null>(null)
const deleteTarget      = ref<Commission | null>(null)
const form              = ref({ name: '' })
const formError         = ref<string | null>(null)

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchData() {
  loading.value = true
  try {
    const res: any = await api.get('/v1/admin/commissions')
    commissions.value = res?.data ?? []
  } catch {
    addToast({ message: t('admin_commissions.toast_error_load'), type: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

// ── Create / Edit ─────────────────────────────────────────────────────────────

function openCreate() {
  editingCommission.value = null
  form.value.name = ''
  formError.value = null
  modalOpen.value = true
}

function openEdit(commission: Commission) {
  editingCommission.value = commission
  form.value.name = commission.name
  formError.value = null
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}

async function saveCommission() {
  if (!form.value.name.trim()) {
    formError.value = t('admin_commissions.validation_required')
    return
  }
  saving.value = true
  formError.value = null
  try {
    let res: any
    if (editingCommission.value) {
      res = await api.put(`/v1/admin/commissions/${editingCommission.value.id}`, { name: form.value.name })
      const idx = commissions.value.findIndex(c => c.id === editingCommission.value!.id)
      if (idx !== -1) commissions.value[idx] = res.data
    } else {
      res = await api.post('/v1/admin/commissions', { name: form.value.name })
      commissions.value.push(res.data)
    }
    addToast({ 
      message: editingCommission.value ? t('admin_commissions.toast_success_edit') : t('admin_commissions.toast_success_create'), 
      type: 'success' 
    })
    modalOpen.value = false
  } catch (e: any) {
    formError.value = e?.data?.errors?.name?.[0] ?? e?.data?.message ?? t('admin_commissions.toast_error_fallback')
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

function confirmDelete(commission: Commission) {
  deleteTarget.value = commission
}

async function doDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await api.delete(`/v1/admin/commissions/${deleteTarget.value.id}`)
    commissions.value = commissions.value.filter(c => c.id !== deleteTarget.value!.id)
    addToast({ message: t('admin_commissions.toast_success_delete'), type: 'success' })
    deleteTarget.value = null
  } catch (e: any) {
    addToast({ message: e?.data?.message ?? t('admin_commissions.toast_error_delete'), type: 'error' })
  } finally {
    saving.value = false
  }
}

// ── Members ───────────────────────────────────────────────────────────────────

async function addMember(commission: Commission) {
  const email = inviteEmail.value[commission.id]?.trim()
  if (!email) return
  try {
    const res: any = await api.post(`/v1/admin/commissions/${commission.id}/members`, { email })
    const idx = commissions.value.findIndex(c => c.id === commission.id)
    if (idx !== -1) commissions.value[idx] = res.data
    inviteEmail.value[commission.id] = ''
    addToast({
      message: res.invited
        ? t('admin_commissions.toast_success_invite', { email })
        : t('admin_commissions.toast_success_add'),
      type: 'success',
    })
  } catch (e: any) {
    addToast({ message: e?.data?.message ?? t('admin_commissions.toast_error_add'), type: 'error' })
  }
}

async function removeMember(commission: Commission, member: Member) {
  try {
    const res: any = await api.delete(`/v1/admin/commissions/${commission.id}/members/${member.id}`)
    const idx = commissions.value.findIndex(c => c.id === commission.id)
    if (idx !== -1) commissions.value[idx] = res.data
    addToast({ message: t('admin_commissions.toast_success_remove'), type: 'success' })
  } catch (e: any) {
    addToast({ message: e?.data?.message ?? t('admin_commissions.toast_error_remove'), type: 'error' })
  }
}
</script>