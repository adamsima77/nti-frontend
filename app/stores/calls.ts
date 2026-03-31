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

// Mock test call for development
const TEST_CALL: Call = {
  id: 999,
  programId: 1,
  programName: 'Test Program',
  title: 'Testovacia výzva - Upload & Formulár',
  description: 'Toto je testovacia výzva na testovanie uploadu príloh a dynamického formulára. Vyplňte všetky polia a nahrajte dokumenty.',
  startDate: '2026-03-01',
  endDate: '2026-12-31',
  status: 'open',
  formSchema: {
    title: 'Testovacia prihláška',
    description: 'Test formulára so všetkými typmi polí',
    fields: [
      { name: 'projectName', label: 'Názov projektu', type: 'text', required: true, placeholder: 'napr. Môj projekt' },
      { name: 'projectDesc', label: 'Popis', type: 'textarea', required: true, placeholder: 'Opíšte projekt...' },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'budget', label: 'Rozpočet (EUR)', type: 'number', required: true },
      { name: 'deadline', label: 'Termín realizácie', type: 'date', required: true },
      {
        name: 'category',
        label: 'Kategória',
        type: 'select',
        required: true,
        options: [
          { label: 'Web app', value: 'web' },
          { label: 'Mobile app', value: 'mobile' },
          { label: 'Data Analytics', value: 'analytics' },
        ],
      },
      { name: 'documents', label: 'Prílohy (PDF, obrázky)', type: 'file', required: false, allowMultiple: true, accept: 'application/pdf,image/*', maxFileSize: 5 * 1024 * 1024 },
      { name: 'agree', label: 'Súhlasím s podmienkami', type: 'checkbox', required: true },
    ],
    sections: [
      { title: 'Základné údaje', description: 'Informácie o projekte', fields: ['projectName', 'projectDesc', 'category'] },
      { title: 'Kontakt', description: '', fields: ['email'] },
      { title: 'Plán', description: '', fields: ['budget', 'deadline'] },
      { title: 'Prílohy', description: 'Nahrajte relevantné súbory', fields: ['documents'] },
      { title: 'Súhlas', description: '', fields: ['agree'] },
    ],
  },
  maxTeams: 10,
  applicantsCount: 1,
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
      // Fallback to test call for development
      console.warn('API error, loading test call:', err)
      calls.value = [TEST_CALL]
      error.value = null
      return calls.value
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
