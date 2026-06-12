import { ref, computed } from 'vue'

export interface OrgCall {
  id: number
  name: string
  description: string | null
  application_deadline: string | null
  project_start: string | null
  project_end: string | null
  status: string | null
  call_type: string | null
  program: string | null
  applications_count: number
  assigned_team: { id: number; name: string } | null
}

export interface OrgDashboardStats {
  total_calls: number
  active_calls: number
  in_progress: number
  completed: number
}

export function useOrgDashboard() {
  const api = useApi()
  const authStore = useAuthStore()

  // useState persists across page navigations within the same session
  const orgId  = useState<number | null>('org-id', () => null)
  const myRole = useState<'organization_admin' | 'member' | 'po' | null>('org-my-role', () => null)

  const stats        = useState<OrgDashboardStats>('org-stats', () => ({ total_calls: 0, active_calls: 0, in_progress: 0, completed: 0 }))
  const calls        = useState<OrgCall[]>('org-calls', () => [])
  const teams        = useState<any[]>('org-teams', () => [])
  const applications = useState<any[]>('org-applications', () => [])
  const isLoading    = ref(false)
  const error        = ref<string | null>(null)

  const isMember = computed(() => myRole.value === 'member')
  const isAdmin  = computed(() => myRole.value === 'organization_admin')
  const isPo     = computed(() => myRole.value === 'po')

  const fetchMyOrganization = async () => {
    const res = await api.get('/my-organization') as any
    orgId.value  = res?.organization?.id ?? null
    myRole.value = res?.my_role ?? null
  }

  const fetchMemberDashboard = async () => {
    if (!orgId.value) return
    const res = await api.get(`/organizations/${orgId.value}/member-dashboard`) as any
    stats.value        = res?.stats ?? { total_calls: 0, active_calls: 0, in_progress: 0, completed: 0 }
    calls.value        = res?.calls ?? []
    teams.value        = res?.teams ?? []
    applications.value = res?.applications ?? []
  }

  const load = async () => {
    // Skip network calls if role is already known (navigating between pages)
    if (myRole.value !== null) return

    isLoading.value = true
    error.value     = null
    try {
      await authStore.getCurrentUser()
      await fetchMyOrganization()
      if (myRole.value === 'member' || myRole.value === 'po') {
        await fetchMemberDashboard()
      }
    } catch (err: any) {
      error.value = err?.data?.message ?? err?.message ?? 'Nastala chyba pri načítaní.'
    } finally {
      isLoading.value = false
    }
  }

  const reload = async () => {
    myRole.value = null
    orgId.value  = null
    await load()
  }

  return { orgId, myRole, isMember, isAdmin, isPo, stats, calls, teams, applications, isLoading, error, load, reload }
}
