import type { Application, Milestone } from './types'

interface ApiMilestone {
  id: number
  title: string
  due_date: string
  status: 'completed' | 'in_progress' | 'pending'
}

interface ApiApplication {
  id: number
  name?: string
  call?: {
    name: string
    program?: {
      name: string
    }
  }
  team?: {
    name: string
  }
  team_id?: number
  status?: string | { id?: number; name?: string }
  submitted_at: string | null
  team_members_count?: number
  documents_count?: number
  documents?: { id: number }[]
  milestones?: ApiMilestone[]
}

function extractApplicationsList(res: unknown): ApiApplication[] {
  if (!res || typeof res !== 'object') return []
  if (Array.isArray(res)) return res as ApiApplication[]
  const r = res as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as ApiApplication[]
  return []
}

function extractSingleApplication(res: unknown): ApiApplication | null {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  if (typeof r.id === 'number') return r as unknown as ApiApplication
  const inner = r.data
  if (inner && typeof inner === 'object' && !Array.isArray(inner) && typeof (inner as ApiApplication).id === 'number') {
    return inner as ApiApplication
  }
  return null
}

function mapStatusFromApi(status: ApiApplication['status']): Application['status'] {
  const name = typeof status === 'string' ? status : (status?.name ?? '')
  const n = name.toLowerCase()
  if (n.includes('draft')) return 'draft'
  if (n.includes('podan')) return 'submitted'
  if (n.includes('hodnot')) return 'evaluating'
  if (n.includes('dopln')) return 'submitted'
  if (n.includes('schválen')) return 'approved'
  if (n.includes('zamiet')) return 'rejected'
  return 'draft'
}

/**
 * Map API response to Application interface
 */
export const mapApplication = (app: ApiApplication): Application => ({
  id: app.id,
  title: app.name ?? app.call?.name ?? `Prihláška #${app.id}`,
  program: app.call?.program?.name ?? app.call?.name ?? 'Program',
  team: app.team?.name ?? (app.team_id != null ? `Tím #${app.team_id}` : 'Tím'),
  status: mapStatusFromApi(app.status),
  submittedAt: app.submitted_at,
  members: app.team_members_count ?? 0,
  documents: app.documents_count ?? (Array.isArray(app.documents) ? app.documents.length : 0),
  milestones: (app.milestones ?? []).map((m: ApiMilestone) => ({
    id: m.id,
    title: m.title,
    dueDate: m.due_date,
    status: m.status,
  })),
})

/**
 * Fetch all applications for the current user
 */
export const useApplications = () => {
  const api = useApi()
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useAsyncData(
    () => `applications-${locale.value}`,
    async () => {
      try {
        const res = await api.get('/applications') as unknown
        const apps = extractApplicationsList(res)
        return apps.map(mapApplication)
      } catch (err) {
        console.error('Failed to fetch applications:', err)
        return [] // Return empty array on error
      }
    },
    {
      watch: [() => locale.value],
      default: () => [] as Application[],
      transform: (result) => result || [],
    }
  )

  return {
    applications: computed(() => data.value || []),
    pending,
    error,
    refresh,
  }
}

/**
 * Fetch single application by ID
 */
export const useApplication = (id: string | number) => {
  const api = useApi()
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useAsyncData(
    () => `application-${id}-${locale.value}`,
    async () => {
      try {
        const res = await api.get(`/applications/${id}`) as unknown
        const raw = extractSingleApplication(res)
        return raw ? mapApplication(raw) : null
      } catch (err) {
        console.error(`Failed to fetch application ${id}:`, err)
        return null // Return null on error
      }
    },
    {
      watch: [() => locale.value],
      default: () => null as Application | null,
    }
  )

  return {
    application: computed(() => data.value ?? null),
    pending,
    error,
    refresh,
  }
}
