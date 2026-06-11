import type { DashboardStats, Deadline, RequiredAction } from './types'

// ----------------------------------------------------------------------------
// Types matching the dedicated /student/dashboard endpoint response shape
// (can be moved to types.ts once stable)
// ----------------------------------------------------------------------------

export interface DashboardApplication {
  id: number
  title: string
  team: string | null
  program: string | null
  status: string
  submittedAt: string | null
  members: number
  documents: number
}

export interface DashboardTeam {
  id: number
  name: string
  members: number
  role: string
}

export interface DashboardMilestone {
  id: number
  title: string
  dueDate: string | null
  status: 'completed' | 'in_progress' | 'pending'
}

export interface ActiveProject {
  id: number
  title: string
  team: string
  completedMilestones: number
  milestones: DashboardMilestone[]
}

interface DashboardResponse {
  stats: DashboardStats
  applications: DashboardApplication[]
  actions: RequiredAction[]
  deadlines: Deadline[]
  teams: DashboardTeam[]
  activeProjectsWithMilestones: ActiveProject[]
}

// ----------------------------------------------------------------------------

export const useDashboard = () => {
  const api = useApi()

const { data, pending, refresh } = useAsyncData<DashboardResponse>(
  'student-dashboard',
  () => api.get('/v1/student/dashboard') as Promise<DashboardResponse>,
)

  return {
    applications:                 computed<DashboardApplication[]>(() => data.value?.applications                 ?? []),
    teams:                        computed<DashboardTeam[]>        (() => data.value?.teams                        ?? []),
    deadlines:                    computed<Deadline[]>             (() => data.value?.deadlines                    ?? []),
    actions:                      computed<RequiredAction[]>       (() => data.value?.actions                      ?? []),
    stats:                        computed<DashboardStats>         (() => data.value?.stats                        ?? { total: 0, approved: 0, inProcess: 0, rejected: 0 }),
    activeProjectsWithMilestones: computed<ActiveProject[]>        (() => data.value?.activeProjectsWithMilestones ?? []),
    pending,
    refresh,
  }
}