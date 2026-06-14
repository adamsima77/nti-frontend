import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormSchema } from './applications'

// 1. Updated Interface to support Qualification Stack structures
export interface QualificationStack {
  id: number
  name: string
}

export interface Call {
  id: number
  programId: number
  programName: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: 'open' | 'closed' | 'archived'
  /** Ak backend zatiaľ neposiela schému formulára, krok 2 zobrazí upozornenie. */
  formSchema?: FormSchema
  maxTeams?: number
  applicantsCount?: number
  qualificationStack: QualificationStack | null // Added property definition
}

function extractCallsList(response: unknown): Record<string, unknown>[] {
  if (!response || typeof response !== 'object') return []
  const r = response as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[]
  if (Array.isArray(response)) return response as Record<string, unknown>[]
  return []
}

function extractSingleCall(response: unknown): Record<string, unknown> | null {
  if (!response || typeof response !== 'object') return null
  const r = response as Record<string, unknown>
  if (typeof r.id === 'number') return r as Record<string, unknown>
  const data = r.data
  if (data && typeof data === 'object' && !Array.isArray(data) && typeof (data as Record<string, unknown>).id === 'number') {
    return data as Record<string, unknown>
  }
  return null
}

function sliceDate(v: unknown): string {
  if (v == null) return ''
  const s = String(v)
  return s.length >= 10 ? s.slice(0, 10) : s
}

// 2. Updated Data Mapper to process the new API key
function mapApiCallToCall(raw: Record<string, unknown>): Call {
  const program = raw.program as Record<string, unknown> | undefined
  const isOpen = Boolean(raw.is_open)
  const formSchema = (raw.application_form_schema ?? raw.form_schema ?? raw.formSchema) as FormSchema | undefined
  
  // Safely extract qualification_stack payload object
  const rawStack = raw.qualification_stack as Record<string, unknown> | undefined
  const qualificationStack: QualificationStack | null = rawStack && typeof rawStack.id === 'number'
    ? { id: Number(rawStack.id), name: String(rawStack.name ?? 'Názov stacku chýba') }
    : null

  return {
    id: Number(raw.id),
    programId: Number(program?.id ?? 0),
    programName: String(program?.name ?? 'Program'),
    title: String(raw.name ?? 'Výzva'),
    description: String(raw.description ?? ''),
    startDate: sliceDate(raw.application_start),
    endDate: sliceDate(raw.application_deadline),
    status: isOpen ? 'open' : 'closed',
    applicantsCount: Number(raw.applicants_count ?? 0),
    formSchema,
    qualificationStack, // Expose safely map data to the UI components
  }
}

export const useCallsStore = defineStore('calls', () => {
  const api = useApi()
  const localeCookie = useCookie<string>('i18n_redirected', { default: () => 'sk' })

  const calls = ref<Call[]>([])
  const currentCall = ref<Call | null>(null)
  const isLoading = ref(false)

  const openCalls = computed(() => calls.value.filter((c) => c.status === 'open'))

  const fetchCalls = async () => {
    isLoading.value = true
    try {
      const lang = localeCookie.value === 'en' ? 'en' : 'sk'
      const response = await api.get(`/calls/lang/${lang}?per_page=100`)
      const list = extractCallsList(response)
      calls.value = list.map(mapApiCallToCall)
      return calls.value
    } catch {
      calls.value = []
      return calls.value
    } finally {
      isLoading.value = false
    }
  }

  /** Publikované výzvy z rovnakého endpointu ako zoznam (žiadny mock). */
  const fetchOpenCalls = async () => {
    return await fetchCalls()
  }

  const fetchCallById = async (id: number | string) => {
    isLoading.value = true
    const callId = typeof id === 'string' ? parseInt(id, 10) : id

    try {
      const lang = localeCookie.value === 'en' ? 'en' : 'sk'
      const response = await api.get(`/calls/${callId}/lang/${lang}`)
      
      const singleObj = extractSingleCall(response)
      currentCall.value = singleObj ? mapApiCallToCall(singleObj) : null

      if (currentCall.value) {
        const idx = calls.value.findIndex((c) => c.id === currentCall.value!.id)
        if (idx !== -1) calls.value[idx] = currentCall.value
      }

      return currentCall.value
    } catch {
      currentCall.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    calls: computed(() => calls.value),
    currentCall: computed(() => currentCall.value),
    isLoading: computed(() => isLoading.value),
    openCalls,
    fetchCalls,
    fetchOpenCalls,
    fetchCallById,
  }
})