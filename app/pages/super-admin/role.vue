Už je to jasné! Tvoj komponent <UiLoader /> je navrhnutý ako samostatný prekrývací prvok (overlay) a nemá v sebe slot, takže namiesto obalenia celej mriežky ho musíme použiť ako samostatný tag s podmienkou v-if="isLoading".

Keď bol použitý ako wrapper (obalový tag) a vnútri nemal naprogramovaný <slot />, tak kompletne skryl a zahodil celé svoje vnútro a zostal len točiť loader.

Tu je kompletne upravený a opravený súbor. Presunul som <UiLoader v-if="isLoading" /> na začiatok a mriežku s obsahom nechal voľne v HTML. Taktiež som v bloku catch pre istotu opravil syntax chybu (finally), ktorú som spravil v rýchlosti v minulej správe.

Útržok kódu
<template>
  <div class="max-w-7xl mx-auto px-6 py-10 relative">
    
    <UiLoader v-if="isLoading" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-navy">{{ $t('superadmin_permissions.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ $t('superadmin_permissions.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <UiButton :loading="isSaving" @click="savePermissions">
          <Save class="w-4 h-4 mr-1.5" />
          {{ $t('superadmin_permissions.save_changes') }}
        </UiButton>
      </div>
    </div>

    <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <div class="lg:col-span-3 lg:sticky lg:top-10 space-y-3 max-h-[calc(100vh-6rem)] flex flex-col">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 flex-shrink-0">
          {{ $t('superadmin_permissions.system_roles') }}
        </div>
        <div class="bg-white border border-gray-200 rounded-xl overflow-y-auto shadow-sm custom-scrollbar flex-1">
          <button
            v-for="role in roles"
            :key="role.id"
            class="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-none flex items-center justify-between transition-all group"
            :class="selectedRoleId === role.id ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-l-blue-600' : 'text-gray-700 hover:bg-gray-50'"
            @click="selectRole(role.id)"
          >
            <div class="flex flex-col">
              <span class="capitalize">{{ role.name }}</span>
              <span class="text-xs text-gray-400 font-normal group-hover:text-gray-500">
                {{ $t('superadmin_permissions.permissions_count', { count: rolePermissionsCount(role) }) }}
              </span>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      <div class="lg:col-span-9 space-y-6">
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="w-full sm:w-72">
            <UiInput
              v-model="search"
              :placeholder="$t('superadmin_permissions.search_placeholder')"
            />
          </div>
          <div class="flex items-center gap-4 text-xs font-medium text-gray-500 w-full sm:w-auto justify-end">
            <button 
              class="text-blue-600 hover:underline"
              @click="toggleGroupAll(true)"
            >
              {{ $t('superadmin_permissions.assign_all') }}
            </button>
            <span class="text-gray-300">|</span>
            <button 
              class="text-danger-500 hover:underline"
              @click="toggleGroupAll(false)"
            >
              {{ $t('superadmin_permissions.unassign_all') }}
            </button>
          </div>
        </div>

        <div v-if="filteredGroupedPermissions.length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
          <ShieldAlert class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{{ $t('superadmin_permissions.empty_state') }}</p>
        </div>

        <div 
          v-for="group in filteredGroupedPermissions" 
          :key="group.prefix" 
          class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div class="bg-gray-50 px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              <h3 class="font-bold text-navy capitalize text-sm tracking-wide">
                {{ $t('superadmin_permissions.module_label', { name: group.prefix }) }}
              </h3>
            </div>
            <span class="text-xs bg-gray-200/60 px-2 py-0.5 rounded-full text-gray-600 font-medium">
              {{ $t('superadmin_permissions.items_count', { count: group.permissions.length }) }}
            </span>
          </div>

          <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="perm in group.permissions"
              :key="perm.id"
              class="relative border rounded-xl p-4 flex items-start gap-3 transition-all cursor-pointer select-none group"
              :class="isAssigned(perm.id) 
                ? 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 shadow-sm' 
                : 'border-gray-100 hover:border-gray-300 bg-white'"
              @click="togglePermission(perm.id)"
            >
              <div 
                class="w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all flex-shrink-0"
                :class="isAssigned(perm.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 group-hover:border-gray-400 bg-white'"
              >
                <Check class="w-3 h-3 stroke-[3]" v-if="isAssigned(perm.id)" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors break-words">
                  {{ formatActionLabel(perm.name) }}
                </p>
                <p class="text-xs font-mono text-gray-400 mt-0.5 truncate">
                  {{ perm.name }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { Save, ChevronRight, Check, ShieldAlert } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_admin', 'nti_superadmin'],
})

const { t } = useI18n()

useHead({ title: t('superadmin_permissions.page_title') })

const api = useApi()
const { addToast } = useToast()

interface Permission {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
  permissions: Permission[]
}

const roles = ref<Role[]>([])
const allUniquePermissions = ref<Permission[]>([])
const selectedRoleId = ref<number | null>(null)
const search = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

// State representing the live permission assignments for the chosen role
const activeAssignments = ref<Set<number>>(new Set())

// ── Fetch Initial Dataset ───────────────────────────────────────────────────

async function loadMatrixData() {
  isLoading.value = true
  try {
    const response = await api.get('/roles-permissions') as { roles: Role[] }
    roles.value = response?.roles ?? []

    // Extract every unique permission across all roles to construct our baseline grid
    const permMap = new Map<number, string>()
    roles.value.forEach(role => {
      role.permissions?.forEach(p => permMap.set(p.id, p.name))
    })

    allUniquePermissions.value = Array.from(permMap.entries()).map(([id, name]) => ({ id, name }))

    // Pre-select the first role if available
    if (roles.value.length > 0) {
      selectRole(roles.value[0].id)
    }
  } catch (error) {
    console.error('Chyba pri načítaní matice práv:', error)
    try {
      addToast({ message: t('superadmin_permissions.load_error'), type: 'error' })
    } catch (e) {
      addToast({ message: 'Chyba pri načítaní dát.', type: 'error' })
    }
  } finally {
    isLoading.value = false
  }
}

// ── Role Selection Handling ─────────────────────────────────────────────────

function selectRole(roleId: number) {
  selectedRoleId.value = roleId
  const foundRole = roles.value.find(r => r.id === roleId)
  
  activeAssignments.value = new Set(foundRole?.permissions?.map(p => p.id) ?? [])
}

function rolePermissionsCount(role: Role): number {
  return role.permissions?.length ?? 0
}

// ── Assignment Modifiers ────────────────────────────────────────────────────

function isAssigned(permissionId: number): boolean {
  return activeAssignments.value.has(permissionId)
}

function togglePermission(permissionId: number) {
  if (activeAssignments.value.has(permissionId)) {
    activeAssignments.value.delete(permissionId)
  } else {
    activeAssignments.value.add(permissionId)
  }
}

function toggleGroupAll(assignAll: boolean) {
  filteredGroupedPermissions.value.forEach(group => {
    group.permissions.forEach(perm => {
      if (assignAll) {
        activeAssignments.value.add(perm.id)
      } else {
        activeAssignments.value.delete(perm.id)
      }
    })
  })
}

// ── Computed Groupings & Filters ────────────────────────────────────────────

function formatActionLabel(name: string): string {
  const parts = name.split('.')
  if (parts.length <= 1) return name
  return parts.slice(1).join('.').replace(/_/g, ' ')
}

const filteredGroupedPermissions = computed(() => {
  const query = search.value.toLowerCase().trim()
  
  const baseFiltered = allUniquePermissions.value.filter(p => p.name.toLowerCase().includes(query))

  const groups: Record<string, Permission[]> = {}
  
  baseFiltered.forEach(perm => {
    const prefix = perm.name.split('.')[0] || 'všeobecné'
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(perm)
  })

  return Object.keys(groups).sort().map(prefix => ({
    prefix,
    permissions: groups[prefix].sort((a, b) => a.name.localeCompare(b.name))
  }))
})

// ── Push Assignments to Server ──────────────────────────────────────────────

async function savePermissions() {
  if (!selectedRoleId.value) return
  
  isSaving.value = true
  try {
    const permissionIds = Array.from(activeAssignments.value)

    await api.post(`/sync-permissions/${selectedRoleId.value}/permissions`, {
      permissions: permissionIds
    })

    addToast({ message: t('superadmin_permissions.save_success'), type: 'success' })

    // Update local root dataset mirror
    const currentRole = roles.value.find(r => r.id === selectedRoleId.value)
    if (currentRole) {
      currentRole.permissions = allUniquePermissions.value.filter(p => permissionIds.includes(p.id))
    }
  } catch (error) {
    addToast({ message: t('superadmin_permissions.save_error'), type: 'error' })
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadMatrixData()
})
</script>

<style scoped>
/* Custom lightweight scrollbar definition for the sidebar card */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* Tailwind gray-300 */
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8; /* Tailwind gray-400 */
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
</style>