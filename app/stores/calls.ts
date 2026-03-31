import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormSchema } from './applications'

export interface Call {
  id: number
  programId: number
  programName: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: 'open' | 'closed' | 'archived'
  formSchema: FormSchema
  maxTeams?: number
  applicantsCount?: number
}

export const useCallsStore = defineStore('calls', () => {
  const api = useApi()

  // State
  const calls = ref<Call[]>([])
  const currentCall = ref<Call | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const openCalls = computed(() => calls.value.filter((c) => c.status === 'open'))

  // Actions
  const fetchCalls = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/calls')
      calls.value = response.data || response
      return calls.value
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching calls:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchOpenCalls = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get('/calls/open')
      calls.value = response.data || response
      return calls.value
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching open calls:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchCallById = async (id: number | string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(`/calls/${id}`)
      currentCall.value = response.data || response
      return currentCall.value
    } catch (err) {
      error.value = (err as Error).message
      console.error(`Error fetching call ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    calls: computed(() => calls.value),
    currentCall: computed(() => currentCall.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    openCalls,

    // Actions
    fetchCalls,
    fetchOpenCalls,
    fetchCallById,
  }
})
