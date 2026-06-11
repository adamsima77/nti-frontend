<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue && call" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h2 class="text-base font-semibold text-navy">Nastaviť komisiu</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ call.name }}</p>
            </div>
            <button class="p-1.5 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition" @click="close">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 overflow-y-auto space-y-5">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-400 py-4">
              <div class="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              Načítavam…
            </div>

            <!-- Already configured -->
            <div v-else-if="commissionSetup" class="space-y-4">
              <div class="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <span class="text-green-500 mt-0.5">✓</span>
                <div>
                  <p class="text-sm font-medium text-green-800">Komisia je už nastavená</p>
                  <p class="text-xs text-green-600 mt-0.5">Pre túto výzvu nie je možné komisiu priradiť znovu.</p>
                </div>
              </div>

              <div class="rounded-xl border border-gray-200 divide-y divide-gray-100 text-sm">
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-gray-500">Komisia</span>
                  <span class="font-medium text-navy">{{ commissionSetup.commission?.name ?? '—' }}</span>
                </div>
                <div v-if="call?.isB" class="flex items-center justify-between px-4 py-3">
                  <span class="text-gray-500">Zástupca firmy</span>
                  <div class="text-right">
                    <p class="font-medium text-navy">{{ commissionSetup.company_rep?.name ?? '—' }}</p>
                    <p class="text-xs text-gray-400">{{ commissionSetup.company_rep?.email }}</p>
                  </div>
                </div>
              </div>
            </div>

            <template v-else>
              <!-- Commission selector -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Hodnotiaca komisia <span class="text-red-400">*</span>
                </label>
                <select
                  v-model="form.commission_id"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option :value="null">— Vybrať komisiu —</option>
                  <option v-for="c in commissions" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.members.length }} hodnotiteľ{{ c.members.length === 1 ? '' : 'ia' }})
                  </option>
                </select>

                <!-- Commission members preview -->
                <div v-if="selectedCommission" class="mt-2 rounded-lg bg-gray-50 px-3 py-2 space-y-1">
                  <p v-if="!selectedCommission.members.length" class="text-xs text-gray-400 italic">Komisia nemá žiadnych hodnotiteľov.</p>
                  <div
                    v-for="m in selectedCommission.members"
                    :key="m.id"
                    class="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <div class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {{ initials(m.name) }}
                    </div>
                    <span>{{ m.name }}</span>
                    <span class="text-gray-400">{{ m.email }}</span>
                  </div>
                </div>
              </div>

              <!-- Company rep selector — only for Program B -->
              <div v-if="call?.isB">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Zástupca firmy <span class="text-red-400">*</span>
                </label>
                <p class="text-xs text-gray-400 mb-2">Musí byť členom organizácie, ktorá vytvorila túto výzvu.</p>

                <div v-if="!orgMembers.length" class="text-sm text-orange-500 bg-orange-50 rounded-lg px-3 py-2">
                  Táto výzva nemá priradenú organizáciu alebo organizácia nemá žiadnych členov.
                </div>
                <select
                  v-else
                  v-model="form.company_rep_user_id"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option :value="null">— Vybrať zástupcu —</option>
                  <option v-for="m in orgMembers" :key="m.id" :value="m.id">
                    {{ m.name }} ({{ m.email }})
                  </option>
                </select>
              </div>

              <!-- Error -->
              <p v-if="error" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>

              <!-- Info note -->
              <div class="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                Po potvrdení sa pre všetky prihlášky tejto výzvy automaticky vytvoria hodnotiace hárky pre všetkých členov komisie{{ call?.isB ? ' a zástupcu firmy' : '' }}.
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <UiButton variant="outline" @click="close">Zavrieť</UiButton>
            <UiButton
              v-if="!commissionSetup && !loading"
              :disabled="saving || !form.commission_id || (call?.isB && !form.company_rep_user_id)"
              @click="submit"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Ukladám…
              </span>
              <span v-else>Priradiť komisiu</span>
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Member {
  id: number
  user_id: number
  name: string
  email: string
}

interface Commission {
  id: number
  name: string
  members: Member[]
}

interface OrgMember {
  id: number
  name: string
  email: string
}

const props = defineProps<{
  modelValue: boolean
  call: { id: number; name: string; isB: boolean } | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'saved'): void
}>()

const api          = useApi()
const { addToast } = useToast()

interface CommissionSetup {
  commission: { id: number; name: string } | null
  company_rep: { id: number; name: string; email: string } | null
}

const loading         = ref(false)
const saving          = ref(false)
const error           = ref<string | null>(null)
const commissions     = ref<Commission[]>([])
const orgMembers      = ref<OrgMember[]>([])
const commissionSetup = ref<CommissionSetup | null>(null)

const form = ref<{ commission_id: number | null; company_rep_user_id: number | null }>({
  commission_id:       null,
  company_rep_user_id: null,
})

const selectedCommission = computed(() =>
  form.value.commission_id
    ? commissions.value.find(c => c.id === form.value.commission_id) ?? null
    : null,
)

// ── Watch open ────────────────────────────────────────────────────────────────

watch(() => props.modelValue, (open) => {
  if (open && props.call) {
    form.value        = { commission_id: null, company_rep_user_id: null }
    error.value       = null
    commissionSetup.value = null
    fetchData()
  }
})

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchData() {
  if (!props.call) return
  loading.value = true
  try {
    if (props.call.isB) {
      const [comRes, orgRes, setupRes]: any = await Promise.all([
        api.get('/v1/admin/commissions'),
        api.get(`/v1/admin/calls/${props.call.id}/org-members`),
        api.get(`/v1/admin/calls/${props.call.id}/commission-setup`),
      ])
      commissions.value     = comRes?.data ?? []
      orgMembers.value      = orgRes?.data ?? []
      commissionSetup.value = setupRes?.commission_setup ?? null
    } else {
      const [comRes, setupRes]: any = await Promise.all([
        api.get('/v1/admin/commissions'),
        api.get(`/v1/admin/calls/${props.call.id}/commission-setup`),
      ])
      commissions.value     = comRes?.data ?? []
      commissionSetup.value = setupRes?.commission_setup ?? null
    }
  } catch {
    addToast({ message: 'Nepodarilo sa načítať dáta.', type: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submit() {
  if (!props.call || !form.value.commission_id) return
  if (props.call.isB && !form.value.company_rep_user_id) return
  saving.value = true
  error.value  = null
  try {
    const payload: Record<string, any> = { commission_id: form.value.commission_id }
    if (props.call.isB) payload.company_rep_user_id = form.value.company_rep_user_id
    const res: any = await api.post(`/v1/admin/calls/${props.call.id}/setup-commission`, payload)
    addToast({ message: res?.message ?? 'Komisia bola úspešne priradená.', type: 'success' })
    emit('saved')
    close()
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Nastala chyba pri priraďovaní komisie.'
  } finally {
    saving.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function close() {
  emit('update:modelValue', false)
}

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}
</script>
