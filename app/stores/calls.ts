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
  /** Ak backend zatiaľ neposiela schému formulára, krok 2 zobrazí upozornenie. */
  formSchema?: FormSchema
  maxTeams?: number
  applicantsCount?: number
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

function mapApiCallToCall(raw: Record<string, unknown>): Call {
  const program = raw.program as Record<string, unknown> | undefined
  const status = raw.status as Record<string, unknown> | undefined
  const isOpen = Boolean(raw.is_open)
  const formSchema = (raw.form_schema ?? raw.formSchema) as FormSchema | undefined

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
    maxTeams: raw.max_teams != null ? Number(raw.max_teams) : undefined,
    formSchema,
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
      const obj =
        response && typeof response === 'object' && !Array.isArray(response)
          ? (response as Record<string, unknown>)
          : null
      currentCall.value = obj && typeof obj.id === 'number' ? mapApiCallToCall(obj) : null

      if (currentCall.value) {
        const idx = calls.value.findIndex((c) => c.id === currentCall.value!.id)
        if (idx !== -1) calls.value[idx] = currentCall.value
      }

      return currentCall.value
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
