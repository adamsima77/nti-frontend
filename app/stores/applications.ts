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
  maxFileSize?: number
  allowMultiple?: boolean
  accept?: string
  documentUpload?: boolean
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
    fields: string[]
  }>
}

export interface Application {
  id?: number
  teamId: number
  callId: number
  title: string
  description: string
  status: 'draft' | 'submitted' | 'evaluating' | 'approved' | 'rejected' | 'onboarding' | 'active_project' | 'ended_project'
  data: Record<string, any>
  submittedAt?: string
  createdAt?: string
  updatedAt?: string
}

export const useApplicationsStore = defineStore('applications', () => {
  const api = useApi()

  // State
  const applications = ref<Application[]>([])
  const currentApplication = ref<Application | null>(null)
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

  return {
    applications: computed(() => applications.value),
    currentApplication: computed(() => currentApplication.value),
    isLoading: computed(() => isLoading.value),
    userApplications,

    fetchApplications,
    fetchApplicationById,
    createApplication,
    updateApplication,
    submitApplication,
    deleteApplication,
  }
})