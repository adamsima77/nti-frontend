import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface TeamMember {
  id: number
  name: string
  email: string
  role: 'Team Lead' | 'Developer' | 'Designer' | 'Analyst' | string
  joinedAt?: string
}

interface Team {
  id: number
  name: string
  description?: string
  myRole: string
  createdAt: string
  members: TeamMember[]
  applications: any[]
}

/** Align backend team role labels with UI permission checks (see timy/[id].vue). */
function mapTeamRoleName(name: string | undefined): string {
  if (!name) return 'Člen tímu'
  if (name === 'Vedúci tímu') return 'Team Lead'
  return name
}

function memberDisplayName(m: Record<string, unknown>): string {
  const name = typeof m.name === 'string' ? m.name : ''
  const surname = typeof m.surname === 'string' ? m.surname : ''
  const combined = [name, surname].filter(Boolean).join(' ').trim()
  if (combined) return combined
  const email = typeof m.email === 'string' ? m.email : ''
  return email || 'Neznámy'
}

function extractTeamsList(response: unknown): Record<string, unknown>[] {
  if (!response || typeof response !== 'object') return []
  if (Array.isArray(response)) return response as Record<string, unknown>[]
  const r = response as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[]
  if (Array.isArray(r.teams)) return r.teams as Record<string, unknown>[]
  return []
}

function extractSingleTeam(response: unknown): Record<string, unknown> | null {
  if (!response || typeof response !== 'object') return null
  const r = response as Record<string, unknown>
  const raw = r.team ?? r.data ?? r
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  return null
}

function mapApiMember(m: Record<string, unknown>): TeamMember {
  const pivot = (m.pivot && typeof m.pivot === 'object' ? m.pivot : {}) as Record<string, unknown>
  const roleFromPivot = pivot.role && typeof pivot.role === 'object'
    ? (pivot.role as { name?: string }).name
    : undefined
  const rawRole =
    typeof m.role === 'string'
      ? m.role
      : typeof roleFromPivot === 'string'
        ? roleFromPivot
        : undefined

  return {
    id: Number(m.id),
    name: memberDisplayName(m),
    email: typeof m.email === 'string' ? m.email : '',
    role: mapTeamRoleName(rawRole),
  }
}

function normalizeTeamFromApi(
  raw: Record<string, unknown> | null | undefined,
  currentUserId: number | null,
): Team | null {
  if (!raw || typeof raw.id === 'undefined') return null

  const membersRaw = raw.members
  let members: TeamMember[] = []
  if (Array.isArray(membersRaw)) {
    members = membersRaw.map((m) => mapApiMember(m as Record<string, unknown>))
  }

  let myRole =
    typeof raw.myRole === 'string'
      ? raw.myRole
      : typeof raw.my_role === 'string'
        ? raw.my_role
        : undefined

  if (!myRole && currentUserId != null && Array.isArray(membersRaw)) {
    const me = (membersRaw as Record<string, unknown>[]).find((m) => Number(m.id) === currentUserId)
    if (me) myRole = mapApiMember(me).role
  }

  myRole = mapTeamRoleName(myRole ?? 'Člen tímu')

  const createdRaw = raw.createdAt ?? raw.created_at
  const createdAt =
    typeof createdRaw === 'string'
      ? createdRaw.slice(0, 10)
      : createdRaw != null
        ? String(createdRaw).slice(0, 10)
        : ''

  const applications = Array.isArray(raw.applications) ? raw.applications : []

  return {
    id: Number(raw.id),
    name: typeof raw.name === 'string' ? raw.name : '',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    myRole,
    createdAt,
    members,
    applications,
  }
}

// Mock test team for development
const TEST_TEAM: Team = {
  id: 999,
  name: 'Test Team',
  description: 'Testovací tím na testovanie aplikácie',
  myRole: 'Team Lead',
  createdAt: '2026-03-01',
  members: [
    { id: 1, name: 'Jana Testová', email: 'jana@test.local', role: 'Team Lead' },
    { id: 2, name: 'Marko Tester', email: 'marko@test.local', role: 'Developer' },
  ],
  applications: [],
}

export const useTeamsStore = defineStore('teams', () => {
  const api = useApi()
  const auth = useAuthStore()

  // State
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const isLoading = ref(false)

  // Computed
  const userTeams = computed(() => teams.value)

  // Actions
  const fetchTeams = async () => {
    isLoading.value = true

    try {
      const response = await api.get('/teams')
      const list = extractTeamsList(response)
      const uid = auth.user?.id ?? null
      teams.value = list
        .map((item) => normalizeTeamFromApi(item, uid))
        .filter((t): t is Team => t != null)
      return teams.value
    } catch (err) {
      // Fallback to test team for development
      teams.value = [TEST_TEAM]
      return teams.value
    } finally {
      isLoading.value = false
    }
  }

  const fetchTeamById = async (id: number | string) => {
    isLoading.value = true

    try {
      const response = await api.get(`/teams/${id}`)
      const raw = extractSingleTeam(response)
      const uid = auth.user?.id ?? null
      currentTeam.value = raw ? normalizeTeamFromApi(raw, uid) : null
      return currentTeam.value
    } finally {
      isLoading.value = false
    }
  }

  const createTeam = async (teamData: {
    name: string
    description?: string
    members?: string[] // emails na pozvanie
  }) => {
    isLoading.value = true

    try {
      const response = await api.post('/teams', teamData)
      const raw = extractSingleTeam(response)
      const uid = auth.user?.id ?? null
      const newTeam = raw ? normalizeTeamFromApi(raw, uid) : null
      if (newTeam) teams.value.push(newTeam)
      return newTeam
    } finally {
      isLoading.value = false
    }
  }

  const updateTeam = async (id: number | string, teamData: any) => {
    isLoading.value = true

    try {
      const response = await api.put(`/teams/${id}`, teamData)
      const raw = extractSingleTeam(response)
      const uid = auth.user?.id ?? null
      const updatedTeam = raw ? normalizeTeamFromApi(raw, uid) : null

      if (updatedTeam) {
        const index = teams.value.findIndex((t) => t.id === id)
        if (index !== -1) teams.value[index] = updatedTeam
        if (currentTeam.value?.id === id) currentTeam.value = updatedTeam
      }

      return updatedTeam
    } finally {
      isLoading.value = false
    }
  }

  const deleteTeam = async (id: number | string) => {
    isLoading.value = true

    try {
      await api.delete(`/teams/${id}`)

      // Odstráň zo zoznamu
      teams.value = teams.value.filter((t) => t.id !== id)

      // Clear currentTeam ak bol vymazaný
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  const inviteMember = async (teamId: number | string, inviteData: { email: string; role?: string }) => {
    isLoading.value = true

    try {
      const response = await api.post(`/teams/${teamId}/invite`, inviteData)
      return response.data || response
    } finally {
      isLoading.value = false
    }
  }

  const removeMember = async (teamId: number | string, memberId: number) => {
    isLoading.value = true

    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`)

      // Update currentTeam members list
      if (currentTeam.value?.id === teamId) {
        currentTeam.value.members = currentTeam.value.members.filter((m) => m.id !== memberId)
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateMemberRole = async (teamId: number | string, memberId: number, role: string) => {
    isLoading.value = true

    try {
      const response = await api.patch(`/teams/${teamId}/members/${memberId}`, { role })

      // Update in currentTeam members list
      if (currentTeam.value?.id === teamId) {
        const member = currentTeam.value.members.find((m) => m.id === memberId)
        if (member) {
          member.role = role
        }
      }

      return response.data || response
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    teams: computed(() => teams.value),
    currentTeam: computed(() => currentTeam.value),
    isLoading: computed(() => isLoading.value),

    // Computed
    userTeams,

    // Actions
    fetchTeams,
    fetchTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
  }
})
