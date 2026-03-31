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

export const useTeamsStore = defineStore('teams', () => {
  const api = useApi()

  // State
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const userTeams = computed(() => teams.value)

  // Actions
  const fetchTeams = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/teams')
      teams.value = response.data || response
      return teams.value
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching teams:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchTeamById = async (id: number | string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/teams/${id}`)
      currentTeam.value = response.data || response
      return currentTeam.value
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error fetching team ${id}:`, err)
      throw err
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
    error.value = null

    try {
      const response = await api.post('/teams', teamData)
      const newTeam = response.data || response

      // Pridaj do zoznamu
      teams.value.push(newTeam)
      return newTeam
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error creating team:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateTeam = async (id: number | string, teamData: any) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.put(`/teams/${id}`, teamData)
      const updatedTeam = response.data || response

      // Update v zozname
      const index = teams.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }

      // Update currentTeam ak je to ten istý
      if (currentTeam.value?.id === id) {
        currentTeam.value = updatedTeam
      }

      return updatedTeam
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error updating team ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteTeam = async (id: number | string) => {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/teams/${id}`)

      // Odstráň zo zoznamu
      teams.value = teams.value.filter((t) => t.id !== id)

      // Clear currentTeam ak bol vymazaný
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error deleting team ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const inviteMember = async (teamId: number | string, inviteData: { email: string; role?: string }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(`/teams/${teamId}/invite`, inviteData)
      return response.data || response
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error inviting member to team ${teamId}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeMember = async (teamId: number | string, memberId: number) => {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`)

      // Update currentTeam members list
      if (currentTeam.value?.id === teamId) {
        currentTeam.value.members = currentTeam.value.members.filter((m) => m.id !== memberId)
      }
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error removing member ${memberId} from team ${teamId}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateMemberRole = async (
    teamId: number | string,
    memberId: number,
    role: string
  ) => {
    isLoading.value = true
    error.value = null

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
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error updating member role:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    teams: computed(() => teams.value),
    currentTeam: computed(() => currentTeam.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

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
