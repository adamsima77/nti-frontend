import type { Team } from './types'

interface ApiTeam {
  id: number
  name: string
  members?: unknown[] | number
  user_role?: string
  my_role?: string
  myRole?: string
  [key: string]: unknown
}

function extractTeamsListResponse(res: unknown): ApiTeam[] {
  if (!res || typeof res !== 'object') return []
  if (Array.isArray(res)) return res as ApiTeam[]
  const r = res as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as ApiTeam[]
  if (Array.isArray(r.teams)) return r.teams as ApiTeam[]
  return []
}

function extractSingleTeamResponse(res: unknown): ApiTeam | null {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  if (typeof r.id === 'number') return r as ApiTeam
  const inner = r.team ?? r.data
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) return inner as ApiTeam
  return null
}

function mapDashboardRole(r: string | undefined): string {
  if (r === 'Vedúci tímu') return 'Team Lead'
  return r ?? 'Člen tímu'
}

/**
 * Map API response to dashboard Team summary (member count + role label).
 */
export const mapTeam = (team: ApiTeam): Team => {
  const membersField = team.members
  const memberCount = Array.isArray(membersField)
    ? membersField.length
    : typeof membersField === 'number'
      ? membersField
      : 0

  const rawRole =
    typeof team.user_role === 'string'
      ? team.user_role
      : typeof team.my_role === 'string'
        ? team.my_role
        : typeof team.myRole === 'string'
          ? team.myRole
          : undefined

  return {
    id: team.id,
    name: team.name ?? '',
    members: memberCount,
    role: mapDashboardRole(rawRole),
  }
}

/**
 * Fetch all teams for the current user
 */
export const useTeams = () => {
  const api = useApi()
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useAsyncData(
    () => `teams-${locale.value}`,
    async () => {
      try {
        const res = await api.get('/teams') as unknown
        const teams = extractTeamsListResponse(res)
        return teams.map(mapTeam)
      } catch (err) {
        console.error('Failed to fetch teams:', err)
        return [] // Return empty array on error
      }
    },
    {
      watch: [() => locale.value],
      default: () => [] as Team[],
      transform: (result) => result || [],
    }
  )

  return {
    teams: computed(() => data.value || []),
    pending,
    error,
    refresh,
  }
}

/**
 * Fetch single team by ID
 */
export const useTeam = (id: string | number) => {
  const api = useApi()
  const { locale } = useI18n()

  const { data, pending, error, refresh } = useAsyncData(
    () => `team-${id}-${locale.value}`,
    async () => {
      try {
        const res = await api.get(`/teams/${id}`) as unknown
        const raw = extractSingleTeamResponse(res)
        return raw ? mapTeam(raw) : null
      } catch (err) {
        console.error(`Failed to fetch team ${id}:`, err)
        return null // Return null on error
      }
    },
    {
      watch: [() => locale.value],
      default: () => null as Team | null,
    }
  )

  return {
    team: computed(() => data.value ?? null),
    pending,
    error,
    refresh,
  }
}
