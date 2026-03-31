import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FormField {
  name: string
  type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'date' | 'file'
  label: string
  placeholder?: string
  description?: string
  required: boolean
  validation?: any
  options?: Array<{ label: string; value: any }>
  maxLength?: number
  minLength?: number
}

export interface FormSchema {
  id: string
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
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const userApplications = computed(() => applications.value)

  // Actions
  const fetchApplications = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/applications')
      applications.value = response.data || response
      return applications.value
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching applications:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchApplicationById = async (id: number | string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/applications/${id}`)
      currentApplication.value = response.data || response
      return currentApplication.value
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error fetching application ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createApplication = async (appData: Partial<Application>) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/applications', appData)
      const newApp = response.data || response

      applications.value.push(newApp)
      currentApplication.value = newApp
      
      // Clear draft if exists
      const draftKey = `${newApp.teamId}_${newApp.callId}`
      applicationDrafts.value.delete(draftKey)

      return newApp
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error creating application:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateApplication = async (id: number | string, appData: Partial<Application>) => {
    isLoading.value = true
    error.value = null

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
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error updating application ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const submitApplication = async (id: number | string) => {
    isLoading.value = true
    error.value = null

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
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error submitting application ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteApplication = async (id: number | string) => {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/applications/${id}`)

      applications.value = applications.value.filter((a) => a.id !== id)

      if (currentApplication.value?.id === id) {
        currentApplication.value = null
      }
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error deleting application ${id}:`, err)
      throw err
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
    
    const drafts = JSON.parse(localStorage.getItem('app_drafts') || '{}')
    delete drafts[draftKey]
    localStorage.setItem('app_drafts', JSON.stringify(drafts))
  }

  return {
    // State
    applications: computed(() => applications.value),
    currentApplication: computed(() => currentApplication.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    userApplications,

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
  }
})
