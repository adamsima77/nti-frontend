import { computed } from 'vue'
import type {
  Application,
  ApplicationComment,
  ApplicationDocumentRow,
  ApplicationHistoryEntry,
  ApplicationStatus,
  Milestone,
} from './types'

interface ApiMilestoneRaw {
  id: number
  title?: string
  name?: string
  due_date?: string
  dueDate?: string
  status?: string
  description?: string | null
  comments?: string | null
  completed_at?: string | null
  completedAt?: string | null
}

interface ApiStatusHistoryItem {
  id?: number
  status?: { id?: number; name?: string }
  note?: string | null
  created_at?: string
  changed_by?: {
    id: number
    name: string
  } | null,
  updated_at?: string
}

interface ApiDocumentItem {
  id: number
  name?: string
  size?: string | null
  uploaded_at?: string | null
}

interface ApiTeamMember {
  user_id: number
  name: string
  surname: string
  role_id: number
  role_name: string
  student?: {
    id: number
    academic_flags?: Array<{
      id: number
      name: string
      created_at?: string
      updated_at?: string
      pivot?: Record<string, unknown>
    }>
  }
}

interface ApiApplication {
  id: number
  name?: string 
  description?: string 

  reference?: string
  academic_flag?: boolean
  last_update?: string

  team_members?: ApiTeamMember[]
  team_members_count?: number

  form_data?: Record<string, unknown> | null

  documents?: ApiDocumentItem[]
  documents_count?: number

  mentorships?: any[]
  milestones?: ApiMilestoneRaw[]

  status_history?: ApiStatusHistoryItem[]

  category?: {
    id?: number
    name?: string
  } | null

  call?: {
    id?: number
    name: string
    program?: {
      name: string
    }
  }
  call_id?: number

  team?: {
    id?: number
    name: string
  }
  team_id?: number
  created_by?: number

  status?: string | {
    id?: number
    name?: string
  }

  submitted_at: string | null
}

function extractApplicationsList(res: unknown): ApiApplication[] {
  if (!res || typeof res !== 'object') return []
  if (Array.isArray(res)) return res as ApiApplication[]

  const r = res as Record<string, unknown>

  if (Array.isArray(r.data)) {
    return r.data as ApiApplication[]
  }

  // Laravel paginator / wrapped JSON: { data: { data: [...], meta } }
  const inner = r.data
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const nested = (inner as Record<string, unknown>).data
    if (Array.isArray(nested)) {
      return nested as ApiApplication[]
    }
  }

  return []
}

function extractSingleApplication(res: unknown): ApiApplication | null {
  if (!res || typeof res !== 'object') return null

  const r = res as Record<string, unknown>

  // Direct matching: { id: 1, ... }
  if (typeof r.id === 'number') {
    return r as unknown as ApiApplication
  }

  // Wrapped schema matching: { application: { id: 1, ... }, answer: ... }
  if (
    r.application &&
    typeof r.application === 'object' &&
    !Array.isArray(r.application) &&
    typeof (r.application as ApiApplication).id === 'number'
  ) {
    const app = r.application as ApiApplication

    // Inject matching answers block into form_data if original form_data context is null
    if (!app.form_data && r.answer && typeof r.answer === 'object' && !Array.isArray(r.answer)) {
      const answerObj = r.answer as Record<string, unknown>
      if (answerObj.answer && typeof answerObj.answer === 'object') {
        app.form_data = answerObj.answer as Record<string, unknown>
      }
    }
    
    return app
  }

  // Wrapped data property matching: { data: { id: 1, ... } }
  if (
    r.data &&
    typeof r.data === 'object' &&
    !Array.isArray(r.data) &&
    typeof (r.data as ApiApplication).id === 'number'
  ) {
    return r.data as ApiApplication
  }

  return null
}

function formatApiDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return String(iso) 
}

export function mapStatusFromApi(status: ApiApplication['status']): ApplicationStatus {
  const name = typeof status === 'string' ? status : (status?.name ?? '')
  const n = name.toLowerCase()
  if (n.includes('draft')) return 'draft'
  if (n.includes('podan')) return 'submitted'
  if (n.includes('hodnot')) return 'evaluating'
  if (n.includes('dopln')) return 'supplement'
  if (n.includes('schválen')) return 'approved'
  if (n.includes('zamiet')) return 'rejected'
  return 'draft'
}

function mapMilestoneStatus(s: unknown): Milestone['status'] {
  const v = String(s ?? '')
  if (v === 'completed' || v === 'in_progress' || v === 'pending') return v
  return 'pending'
}
function mapHistory(app: ApiApplication): any[] {
  const raw = app.status_history ?? []
  return [...raw]
    .filter((h) => h?.created_at)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((h) => {
      // Vytiahneme surový ISO timestamp z changed_by alebo z created_at
      const rawDateStr = h.changed_by?.updated_at ?? h.created_at
      let formattedTimestamp = ''

      if (rawDateStr) {
        const d = new Date(rawDateStr)
        // Skontrolujeme, či je dátum validný
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0')
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const year = d.getFullYear()
          const hours = String(d.getHours()).padStart(2, '0')
          const minutes = String(d.getMinutes()).padStart(2, '0')
          
          // Vygeneruje formát: "07.06.2026 11:22"
          formattedTimestamp = `${day}.${month}.${year} ${hours}:${minutes}`
        }
      }

      return {
        status: mapStatusFromApi(h.status),
        date: formatApiDate(h.created_at), // Ponechané pre pravý panel (iba dátum)
        note: h.note ?? null,
        changed_by: h.changed_by ? {
          id: h.changed_by.id,
          name: h.changed_by.name,
          updated_at: formattedTimestamp 
        } : null
      }
    })
}

function mapDocumentRows(app: ApiApplication): ApplicationDocumentRow[] {
  const docs = app.documents ?? []
  return docs.map((d) => ({
    id: d.id,
    name: d.name ?? `Dokument #${d.id}`,
    size: d.size ?? null,
    uploadedAt: d.uploaded_at ? formatApiDate(d.uploaded_at) : null,
  }))
}

function mapMilestones(app: ApiApplication): Milestone[] {
  return (app.milestones ?? []).map((m: ApiMilestoneRaw) => ({
    id: m.id,
    title: m.title ?? m.name ?? 'Míľnik',
    dueDate: m.due_date ?? m.dueDate ?? '',
    status: mapMilestoneStatus(m.status),
    description: m.description ?? m.comments ?? null,
    completedAt: m.completed_at ?? m.completedAt ?? null,
  }))
}

/**
 * Map API response to Application interface (zoznam aj detail).
 */
export const mapApplication = (app: ApiApplication): Application => {
  const documentRows = mapDocumentRows(app)
  const docCount = app.documents_count ?? documentRows.length
  const teamMembers = app.team_members ?? []

  return {
    id: app.id,
    title: app.name ?? app.call?.name ?? `Prihláška #${app.id}`,
    program: app.call?.program?.name ?? app.call?.name ?? 'Program',
    team: app.team?.name ?? (app.team_id != null ? `Tím #${app.team_id}` : 'Tím'),
    teamId: app.team_id ?? null,
    callId: app.call?.id ?? app.call_id ?? null,
    status: mapStatusFromApi(app.status),
    teamMembers,
    formData: app.form_data ?? {},
    submittedAt: app.submitted_at,
    members: app.team_members_count ?? teamMembers.length,
    documents: docCount,
    category: app.category?.name ?? '',
    milestones: mapMilestones(app),
    description: app.description ?? '',
    documentRows,
    history: mapHistory(app), // Tu sa už nachádza pole s changed_by objektom
    comments: [] as ApplicationComment[],
  }
}

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
        const res = (await api.get('/applications?per_page=100')) as unknown
        const apps = extractApplicationsList(res)
        return apps.map(mapApplication)
      } catch (err) {
        console.error('Failed to fetch applications:', err)
        return []
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
 * Fetch single application by ID (reaktívne pri zmene route).
 */
export const useApplication = (getId: () => string | number) => {
  const api = useApi()
  const { locale } = useI18n()

  const key = computed(() => `application-${getId()}-${locale.value}`)

  const { data, pending, error, refresh } = useAsyncData(
    key,
    async () => {
      const id = getId()
      if (id === '' || id === undefined || id === null) return null
      try {
        const res = await api.get(`/applications/${id}`) as unknown
        const raw = extractSingleApplication(res)
        return raw ? mapApplication(raw) : null
      } catch (err) {
        console.error(`Failed to fetch application ${id}:`, err)
        return null
      }
    },
    {
      watch: [key],
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