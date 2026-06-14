import type {
  Consultation,
  Feedback,
  MentorDashboardResponse,
  MentorProject,
  Milestone,
  MilestoneStatus,
} from '../types/mentor'

type ApiErrorLike = { data?: any; message?: string }

function errorMessage(err: unknown, fallback: string) {
  const e = err as ApiErrorLike | null
  return e?.data?.message ?? e?.message ?? fallback
}

export const useMentorDashboard = () => {
  const api = useApi()
  const { addToast } = useToast()

  const dashboard = ref<MentorDashboardResponse | null>(null)
  const projects = ref<MentorProject[]>([])

  const milestonesByProjectId = ref<Record<number, Milestone[]>>({})
  const consultationsByProjectId = ref<Record<number, Consultation[]>>({})

  const loading = reactive({
    dashboard: false,
    projects: false,
    milestones: {} as Record<number, boolean>,
    consultations: {} as Record<number, boolean>,
    updateMilestone: {} as Record<string, boolean>, // `${projectId}:${milestoneId}`
    addConsultationNote: {} as Record<number, boolean>,
    submitFeedback: {} as Record<number, boolean>,
  })

  const error = reactive({
    dashboard: null as string | null,
    projects: null as string | null,
    milestones: {} as Record<number, string | null>,
    consultations: {} as Record<number, string | null>,
  })

  const fetchDashboard = async () => {
    loading.dashboard = true
    error.dashboard = null
    try {
      const res = await api.get('/mentor/dashboard')
      dashboard.value = (res ?? null) as MentorDashboardResponse | null

      // If backend returns projects in dashboard response, keep `projects` in sync.
      if (dashboard.value?.projects && Array.isArray(dashboard.value.projects)) {
        projects.value = dashboard.value.projects
      }
    } catch (err) {
      const msg = errorMessage(err, 'Nepodarilo sa načítať mentor dashboard.')
      error.dashboard = msg
      addToast({ message: msg, type: 'error' })
    } finally {
      loading.dashboard = false
    }
  }

  const fetchProjects = async () => {
    loading.projects = true
    error.projects = null
    try {
      const res = await api.get('/mentor/projects')
      projects.value = (res?.data ?? res ?? []) as MentorProject[]
    } catch (err) {
      const msg = errorMessage(err, 'Nepodarilo sa načítať projekty.')
      error.projects = msg
      addToast({ message: msg, type: 'error' })
    } finally {
      loading.projects = false
    }
  }

  const fetchMilestones = async (projectId: number) => {
    loading.milestones[projectId] = true
    error.milestones[projectId] = null
    try {
      const res = await api.get(`/mentor/projects/${projectId}/milestones`)
      const list = (res ?? []) as Milestone[]
      milestonesByProjectId.value = { ...milestonesByProjectId.value, [projectId]: list }

      // Also sync into projects list if it contains this project object.
      const p = projects.value.find((x) => x.id === projectId)
      if (p) p.milestones = list

      return list
    } catch (err) {
      const msg = errorMessage(err, 'Nepodarilo sa načítať míľniky.')
      error.milestones[projectId] = msg
      addToast({ message: msg, type: 'error' })
      return null
    } finally {
      loading.milestones[projectId] = false
    }
  }

  const updateMilestoneStatus = async (
    projectId: number,
    milestoneId: number,
    status: MilestoneStatus,
    comment?: string,
  ) => {
    const key = `${projectId}:${milestoneId}`
    loading.updateMilestone[key] = true

    // Optimistic update + rollback
    const list = milestonesByProjectId.value[projectId] ?? projects.value.find((p) => p.id === projectId)?.milestones
    const milestone = list?.find((m) => m.id === milestoneId)
    const prev = milestone?.status
    if (milestone) milestone.status = status

    try {
      await api.patch(`/mentor/projects/${projectId}/milestones/${milestoneId}`, {
        status,
        ...(comment ? { comment } : {}),
      })

      // Real-time-ish refresh: keep UI accurate even if backend returns derived changes.
      // Prefer a lightweight refetch of milestones for the project.
      await fetchMilestones(projectId)
    } catch (err) {
      if (milestone && prev) milestone.status = prev
      const msg = errorMessage(err, 'Nepodarilo sa zmeniť stav míľnika.')
      addToast({ message: msg, type: 'error' })
      throw err
    } finally {
      loading.updateMilestone[key] = false
    }
  }

  const addConsultationNote = async (projectId: number, note: string) => {
    loading.addConsultationNote[projectId] = true
    try {
      await api.post(`/mentor/projects/${projectId}/consultations`, { note })
      await fetchConsultations(projectId)
      addToast({ message: 'Záznam z konzultácie bol uložený.', type: 'success' })
    } catch (err) {
      const msg = errorMessage(err, 'Nepodarilo sa uložiť záznam z konzultácie.')
      addToast({ message: msg, type: 'error' })
      throw err
    } finally {
      loading.addConsultationNote[projectId] = false
    }
  }

  const fetchConsultations = async (projectId: number) => {
    loading.consultations[projectId] = true
    error.consultations[projectId] = null
    try {
      const res = await api.get(`/mentor/projects/${projectId}/consultations`)
      const list = (res ?? []) as Consultation[]
      consultationsByProjectId.value = { ...consultationsByProjectId.value, [projectId]: list }
      return list
    } catch (err) {
      const msg = errorMessage(err, 'Nepodarilo sa načítať konzultácie.')
      error.consultations[projectId] = msg
      addToast({ message: msg, type: 'error' })
      return null
    } finally {
      loading.consultations[projectId] = false
    }
  }

  const submitFeedback = async (projectId: number, feedback: Feedback) => {
    loading.submitFeedback[projectId] = true
    try {
      await api.post(`/mentor/projects/${projectId}/feedback`, feedback)
      addToast({ message: 'Feedback bol odoslaný.', type: 'success' })
    } catch (err) {
      const msg = errorMessage(err, 'Nepodarilo sa odoslať feedback.')
      addToast({ message: msg, type: 'error' })
      throw err
    } finally {
      loading.submitFeedback[projectId] = false
    }
  }

  return {
    dashboard,
    projects,
    milestonesByProjectId,
    consultationsByProjectId,
    loading,
    error,
    fetchDashboard,
    fetchProjects,
    fetchMilestones,
    updateMilestoneStatus,
    addConsultationNote,
    fetchConsultations,
    submitFeedback,
  }
}

