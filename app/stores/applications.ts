import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FormField {
  name: string
  type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'date' | 'file' | 'repeater'
  label: string
  placeholder?: string
  description?: string
  required: boolean
  validation?: any
  options?: Array<{ label: string; value: any }>
  maxLength?: number
  minLength?: number
  // File upload specific
  maxFileSize?: number // bytes, default 10MB
  allowMultiple?: boolean
  accept?: string // MIME types: 'image/*', 'application/pdf', etc.
  /** Ak true (alebo legacy name document_ids), súbor sa nahrá na /documents a do modelu sa uložia ID. */
  documentUpload?: boolean
  /** Pre type === 'repeater': definícia stĺpcov v jednom riadku */
  fields?: FormField[]
}

export interface FormSchema {
  id?: string
  title?: string
  description?: string
  fields: FormField[]
  sections?: Array<{
    title: string
    description?: string
    fields: string[] // field names in this section
  }>
}

export interface Application {
  id?: number
  teamId: number
  callId: number
  title: string
  description: string
  status: 'draft' | 'submitted' | 'evaluating' | 'approved' | 'rejected'
  data: Record<string, any> // form data
  submittedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApplicationDraft {
  id?: number
  teamId: number
  callId: number
  data: Record<string, any>
  lastSavedAt?: string
}

export const useApplicationsStore = defineStore('applications', () => {
  const api = useApi()

  // State
  const applications = ref<Application[]>([])
  const currentApplication = ref<Application | null>(null)
  const applicationDrafts = ref<Map<string, ApplicationDraft>>(new Map())
  const draftRevision = ref(0)
  const isLoading = ref(false)

  // Computed
  const userApplications = computed(() => applications.value)

  // Actions
  const fetchApplications = async () => {
    isLoading.value = true

    try {
      const response = await api.get('/applications')
      const list = Array.isArray((response as any)?.data?.data)
        ? (response as any).data.data
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : Array.isArray(response)
            ? response
            : []
      applications.value = list
      return applications.value
    } finally {
      isLoading.value = false
    }
  }

  const fetchApplicationById = async (id: number | string) => {
    isLoading.value = true

    try {
      const response = await api.get(`/applications/${id}`)
      const raw = (response as any)?.data ?? response
      currentApplication.value = raw
      return currentApplication.value
    } finally {
      isLoading.value = false
    }
  }

  const createApplication = async (payload: {
    callId: number
    teamId: number
    documentIds: number[]
    formData?: Record<string, string>
  }) => {
    isLoading.value = true

    try {
      const body: Record<string, unknown> = {
        call_id: payload.callId,
        team_id: payload.teamId,
        document_ids: payload.documentIds,
      }
      if (payload.formData && Object.keys(payload.formData).length > 0) {
        body.form_data = payload.formData
      }

      const response = await api.post('/applications', body) as { data?: { id: number }; id?: number }

      const raw = response?.data ?? response
      const id = raw?.id
      if (id == null) throw new Error('Neplatná odpoveď servera')

      const newApp = { id, teamId: payload.teamId, callId: payload.callId } as Application
      applications.value.push(newApp)
      currentApplication.value = newApp

      const draftKey = `${payload.teamId}_${payload.callId}`
      applicationDrafts.value.delete(draftKey)

      return newApp
    } finally {
      isLoading.value = false
    }
  }

  const updateApplication = async (id: number | string, appData: Partial<Application>) => {
    isLoading.value = true

    try {
      const response = await api.put(`/applications/${id}`, appData)
      const updatedApp = response.data || response

      const index = applications.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        applications.value[index] = updatedApp
      }

      if (currentApplication.value?.id === id) {
        currentApplication.value = updatedApp
      }

      return updatedApp
    } finally {
      isLoading.value = false
    }
  }

  const submitApplication = async (id: number | string) => {
    isLoading.value = true

    try {
      const response = await api.post(`/applications/${id}/submit`, {})
      const submittedApp = response.data || response

      const index = applications.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        applications.value[index] = submittedApp
      }

      if (currentApplication.value?.id === id) {
        currentApplication.value = submittedApp
      }

      return submittedApp
    } finally {
      isLoading.value = false
    }
  }

  const deleteApplication = async (id: number | string) => {
    isLoading.value = true

    try {
      await api.delete(`/applications/${id}`)

      applications.value = applications.value.filter((a) => a.id !== id)

      if (currentApplication.value?.id === id) {
        currentApplication.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  // Draft management (client-side autosave)
  const saveDraft = (teamId: number, callId: number, data: Record<string, any>) => {
    const draftKey = `${teamId}_${callId}`
    applicationDrafts.value.set(draftKey, {
      teamId,
      callId,
      data,
      lastSavedAt: new Date().toISOString(),
    })

    draftRevision.value += 1

    // Also persist to localStorage for offline support
    const drafts = JSON.parse(localStorage.getItem('app_drafts') || '{}')
    drafts[draftKey] = applicationDrafts.value.get(draftKey)
    localStorage.setItem('app_drafts', JSON.stringify(drafts))
  }

  const getDraft = (teamId: number, callId: number): ApplicationDraft | undefined => {
    const draftKey = `${teamId}_${callId}`

    // Check memory first
    if (applicationDrafts.value.has(draftKey)) {
      return applicationDrafts.value.get(draftKey)
    }

    // Check localStorage
    const drafts = JSON.parse(localStorage.getItem('app_drafts') || '{}')
    if (drafts[draftKey]) {
      return drafts[draftKey]
    }

    return undefined
  }

  const clearDraft = (teamId: number, callId: number) => {
    const draftKey = `${teamId}_${callId}`
    applicationDrafts.value.delete(draftKey)

    draftRevision.value += 1

    const drafts = JSON.parse(localStorage.getItem('app_drafts') || '{}')
    delete drafts[draftKey]
    localStorage.setItem('app_drafts', JSON.stringify(drafts))
  }

  const listDraftsFromStorage = (): ApplicationDraft[] => {
    if (import.meta.server) return []
    try {
      const drafts = JSON.parse(localStorage.getItem('app_drafts') || '{}')
      const out: ApplicationDraft[] = []
      for (const v of Object.values(drafts)) {
        if (v && typeof v === 'object' && 'teamId' in v && 'callId' in v) {
          out.push(v as ApplicationDraft)
        }
      }
      return out
    } catch {
      return []
    }
  }

  return {
    // State
    applications: computed(() => applications.value),
    currentApplication: computed(() => currentApplication.value),
    isLoading: computed(() => isLoading.value),

    // Computed
    userApplications,
    draftRevision: computed(() => draftRevision.value),

    // Actions
    fetchApplications,
    fetchApplicationById,
    createApplication,
    updateApplication,
    submitApplication,
    deleteApplication,

    // Draft management
    saveDraft,
    getDraft,
    clearDraft,
    listDraftsFromStorage,
  }
})
