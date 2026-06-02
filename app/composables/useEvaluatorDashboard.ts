import type {
  ApplicationDetail,
  ApplicationSummary,
  Evaluation,
  EvaluationCriterion,
  EvaluationSummary,
  EvaluatorCall,
  EvaluatorDashboardResponse,
  EvaluatorDashboardStats,
} from '~/types/evaluator'

type ApiResponseLike = Record<string, unknown> | unknown[] | null | undefined

type ApiErrorLike = { data?: { message?: string }; message?: string }

function errorMessage(err: unknown, fallback: string): string {
  const e = err as ApiErrorLike | null
  return e?.data?.message ?? e?.message ?? fallback
}

function asObject(value: ApiResponseLike): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== 'object') return {}
  return value as Record<string, unknown>
}

function asList(value: ApiResponseLike): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[]
  const row = asObject(value)
  if (Array.isArray(row.data)) return row.data as Record<string, unknown>[]
  if (Array.isArray(row.items)) return row.items as Record<string, unknown>[]
  if (Array.isArray(row.calls)) return row.calls as Record<string, unknown>[]
  if (Array.isArray(row.applications)) return row.applications as Record<string, unknown>[]
  return []
}

function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function toString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : value == null ? fallback : String(value)
}

function toBoolean(value: unknown): boolean | null {
  if (value == null) return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return null
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  }
  return Boolean(value)
}

function mapCriterion(row: Record<string, unknown>): EvaluationCriterion {
  const score = row.score
  return {
    name: toString(row.name ?? row.label ?? ''),
    max_score: toNumber(row.max_score ?? row.maxScore, 0),
    score: score == null ? null : toNumber(score, 0),
    comment: row.comment == null ? undefined : toString(row.comment),
  }
}

function mapEvaluation(row: Record<string, unknown>): Evaluation {
  const criteriaSource = Array.isArray(row.criteria) ? row.criteria : []
  return {
    id: toNumber(row.id),
    application_id: toNumber(row.application_id ?? row.applicationId),
    criteria: criteriaSource.map(item => mapCriterion(item as Record<string, unknown>)),
    total_score: toNumber(row.total_score ?? row.totalScore),
    recommendation: toString(row.recommendation) as Evaluation['recommendation'],
    internal_note: row.internal_note == null ? undefined : toString(row.internal_note),
    submitted_at: row.submitted_at == null ? undefined : toString(row.submitted_at),
    locked: Boolean(row.locked ?? row.is_locked ?? false),
  }
}

function mapCall(row: Record<string, unknown>): EvaluatorCall {
  const criteriaSource = Array.isArray(row.criteria) ? row.criteria : []
  return {
    id: toNumber(row.id),
    name: toString(row.name ?? row.title ?? `Výzva #${toNumber(row.id)}`),
    program: toString(row.program ?? row.program_code ?? ''),
    status: toString(row.status ?? ''),
    deadline: toString(row.deadline ?? row.application_deadline ?? ''),
    applications_total: toNumber(row.applications_total ?? row.applicationsTotal ?? row.total ?? 0),
    applications_pending: toNumber(row.applications_pending ?? row.applicationsPending ?? row.pending ?? 0),
    applications_evaluated: toNumber(row.applications_evaluated ?? row.applicationsEvaluated ?? row.evaluated ?? 0),
    criteria: criteriaSource.length ? criteriaSource.map(item => mapCriterion(item as Record<string, unknown>)) : undefined,
  }
}

function mapApplicationSummary(row: Record<string, unknown>): ApplicationSummary {
  const teamRecord = row.team && typeof row.team === 'object' ? row.team as Record<string, unknown> : undefined
  const team: Record<string, unknown> = teamRecord ?? {}
  const teamMembersCount = toNumber(team.members_count ?? row.members_count ?? row.team_members_count, 0)
  const academicFlag = row.academic_flag ?? row.academicFlag ?? teamRecord?.academic_flag ?? teamRecord?.academicFlag

  return {
    id: toNumber(row.id),
    status: toString(row.status ?? ''),
    academic_flag: toBoolean(academicFlag),
    team: {
      id: toNumber(team.id ?? row.team_id),
      name: toString(team.name ?? row.team_name ?? row.teamName ?? ''),
      members_count: teamMembersCount,
    },
    my_score: row.my_score == null ? null : toNumber(row.my_score, 0),
    submitted_at: toString(row.submitted_at ?? row.submittedAt ?? ''),
    projectName: toString(row.project_name ?? row.projectName ?? row.name ?? row.title ?? ''),
    teamName: toString(row.team_name ?? row.teamName ?? team.name ?? ''),
    program: row.program == null ? undefined : toString(row.program),
    deadline: row.deadline == null ? null : toString(row.deadline),
    avgScore: row.avg_score == null && row.avgScore == null ? null : toNumber(row.avg_score ?? row.avgScore, 0),
    call_id: row.call_id == null ? null : toNumber(row.call_id),
  }
}

function mapApplicationDetail(row: Record<string, unknown>): ApplicationDetail {
  const summary = mapApplicationSummary(row)
  const documentsSource: unknown[] = Array.isArray(row.documents) ? row.documents : []
  const historySource: unknown[] = Array.isArray(row.history) ? row.history : []
  const teamRecord = row.team && typeof row.team === 'object' ? row.team as Record<string, unknown> : undefined
  const teamMembersSource: Record<string, unknown>[] = Array.isArray(row.teamMembers)
    ? row.teamMembers as Record<string, unknown>[]
    : Array.isArray(row.team_members)
      ? row.team_members as Record<string, unknown>[]
      : Array.isArray(teamRecord?.members)
        ? teamRecord!.members as Record<string, unknown>[]
        : []
  const commissionMembersSource: Record<string, unknown>[] = Array.isArray(row.commissionMembers)
    ? row.commissionMembers as Record<string, unknown>[]
    : Array.isArray(row.commission_members)
      ? row.commission_members as Record<string, unknown>[]
      : []

  return {
    ...summary,
    documents: documentsSource.map((doc) => {
      const rowDoc = doc as Record<string, unknown>
      return {
        id: toNumber(rowDoc.id),
        type: toString(rowDoc.type ?? rowDoc.name ?? ''),
        version: toNumber(rowDoc.version ?? 1),
        url: toString(rowDoc.url ?? rowDoc.path ?? ''),
      }
    }),
    history: historySource.map((item) => {
      const rowHistory = item as Record<string, unknown>
      return {
        status: toString(rowHistory.status ?? ''),
        changed_at: toString(rowHistory.changed_at ?? rowHistory.changedAt ?? ''),
        changed_by: toString(rowHistory.changed_by ?? rowHistory.changedBy ?? ''),
      }
    }),
    evaluation: row.evaluation && typeof row.evaluation === 'object'
      ? mapEvaluation(row.evaluation as Record<string, unknown>)
      : undefined,
    call: row.call && typeof row.call === 'object'
      ? mapCall(row.call as Record<string, unknown>)
      : null,
    teamMembers: teamMembersSource.map((member) => {
      const rowMember = member as Record<string, unknown>
      return {
        id: toNumber(rowMember.id),
        name: toString(rowMember.name ?? ''),
        role: toString(rowMember.role ?? ''),
      }
    }),
    commissionMembers: commissionMembersSource.map((member) => {
      const rowMember = member as Record<string, unknown>
      return {
        id: toNumber(rowMember.id),
        name: toString(rowMember.name ?? ''),
        score: rowMember.score == null ? null : toNumber(rowMember.score, 0),
      }
    }),
    description: row.description == null ? undefined : toString(row.description),
  }
}

function mapDashboard(value: ApiResponseLike): EvaluatorDashboardResponse {
  const row = asObject(value)
  return {
    stats: row.stats && typeof row.stats === 'object' ? row.stats as Partial<EvaluatorDashboardStats> : undefined,
    calls: asList(row.calls as ApiResponseLike).map(call => mapCall(call)),
    applications: asList(row.applications as ApiResponseLike).map(app => mapApplicationSummary(app)),
    recentApplications: asList((row.recentApplications ?? row.recent_applications) as ApiResponseLike).map(app => mapApplicationSummary(app)),
    urgentApplications: asList((row.urgentApplications ?? row.urgent_applications) as ApiResponseLike).map(app => mapApplicationSummary(app)),
  }
}

function extractEvaluationPayload(response: ApiResponseLike): Evaluation | null {
  const row = asObject(response)
  if (Array.isArray(row.criteria) || row.total_score !== undefined || row.totalScore !== undefined) {
    return mapEvaluation(row)
  }
  if (row.evaluation && typeof row.evaluation === 'object') {
    return mapEvaluation(row.evaluation as Record<string, unknown>)
  }
  return null
}

export const useEvaluatorDashboard = () => {
  const api = useApi()
  const { addToast } = useToast()

  const dashboard = ref<EvaluatorDashboardResponse | null>(null)
  const calls = ref<EvaluatorCall[]>([])
  const applicationsByCallId = ref<Record<number, ApplicationSummary[]>>({})
  const applicationDetailsById = ref<Record<number, ApplicationDetail>>({})
  const applicationDetail = ref<ApplicationDetail | null>(null)
  const allEvaluations = ref<EvaluationSummary[]>([])
  const hasSubmittedEvaluation = ref(false)

  const loading = reactive({
    dashboard: false,
    calls: false,
    applications: {} as Record<number, boolean>,
    applicationDetail: {} as Record<number, boolean>,
    evaluation: {} as Record<number, boolean>,
    supplement: {} as Record<number, boolean>,
  })

  const error = reactive({
    dashboard: null as string | null,
    calls: null as string | null,
    applications: {} as Record<number, string | null>,
    applicationDetail: {} as Record<number, string | null>,
  })

  const fetchDashboard = async () => {
    loading.dashboard = true
    error.dashboard = null
    try {
      const res = await api.get('/evaluator/dashboard') as ApiResponseLike
      dashboard.value = mapDashboard(res)
      if (dashboard.value.calls?.length) {
        calls.value = dashboard.value.calls
      }
      return dashboard.value
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa načítať evaluator dashboard.')
      error.dashboard = message
      addToast({ message, type: 'error' })
      return null
    } finally {
      loading.dashboard = false
    }
  }

  const fetchCalls = async () => {
    loading.calls = true
    error.calls = null
    try {
      const res = await api.get('/evaluator/calls') as ApiResponseLike
      const list = asList(res).map(call => mapCall(call))
      calls.value = list
      if (dashboard.value) {
        dashboard.value = { ...dashboard.value, calls: list }
      }
      return list
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa načítať výzvy.')
      error.calls = message
      addToast({ message, type: 'error' })
      return null
    } finally {
      loading.calls = false
    }
  }

  const fetchApplications = async (callId: number) => {
    loading.applications[callId] = true
    error.applications[callId] = null
    try {
      const res = await api.get(`/evaluator/calls/${callId}/applications`) as ApiResponseLike
      const list = asList(res).map(app => mapApplicationSummary(app))
      applicationsByCallId.value = { ...applicationsByCallId.value, [callId]: list }
      return list
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa načítať prihlášky.')
      error.applications[callId] = message
      addToast({ message, type: 'error' })
      return null
    } finally {
      loading.applications[callId] = false
    }
  }

  const fetchApplicationDetail = async (applicationId: number) => {
    loading.applicationDetail[applicationId] = true
    error.applicationDetail[applicationId] = null
    try {
      const res = await api.get(`/evaluator/applications/${applicationId}`) as ApiResponseLike
      const detail = mapApplicationDetail(asObject(res))
      applicationDetailsById.value = { ...applicationDetailsById.value, [applicationId]: detail }
      applicationDetail.value = detail
      hasSubmittedEvaluation.value = Boolean(detail.evaluation)
      return detail
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa načítať detail prihlášky.')
      error.applicationDetail[applicationId] = message
      addToast({ message, type: 'error' })
      return null
    } finally {
      loading.applicationDetail[applicationId] = false
    }
  }

  const fetchAllEvaluations = async (applicationId: number) => {
    try {
      const res = await api.get(`/evaluator/applications/${applicationId}/evaluations`) as ApiResponseLike
      const list = asList(res).map((item) => {
        const row = asObject(item)
        const evaluatorRow = row.evaluator && typeof row.evaluator === 'object'
          ? row.evaluator as Record<string, unknown>
          : undefined

        return {
          id: toNumber(row.id),
          commission_member_id: toNumber(row.commission_member_id ?? row.commissionMemberId ?? row.member_id ?? evaluatorRow?.id),
          evaluator: {
            id: toNumber(evaluatorRow?.id ?? row.evaluator_id ?? null),
            name: toString(evaluatorRow?.name ?? row.evaluator_name ?? row.name ?? ''),
          },
          submitted_at: toString(row.submitted_at ?? row.submittedAt ?? ''),
          criteria: Array.isArray(row.criteria) ? row.criteria.map(item => mapCriterion(item as Record<string, unknown>)) : [],
          total_score: toNumber(row.total_score ?? row.totalScore),
          recommendation: toString(row.recommendation) as EvaluationSummary['recommendation'],
        }
      })
      allEvaluations.value = list
      hasSubmittedEvaluation.value = list.some((item) => item.commission_member_id === useAuthStore().user?.id)
      return list
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa načítať zoznam hodnotení.')
      addToast({ message, type: 'error' })
      return []
    }
  }

  const updateApplicationStatus = async (applicationId: number, status: 'schvalene' | 'zamietnute' | 'vyziadane_doplnenie') => {
    const statusMap: Record<string, string> = {
      schvalene: 'Schválené',
      zamietnute: 'Zamietnuté',
      vyziadane_doplnenie: 'Vyžiadané doplnenie',
    }

    try {
      await api.patch(`/applications/${applicationId}/status`, { status_name: statusMap[status] })
      await fetchApplicationDetail(applicationId)
      addToast({ message: 'Status prihlášky bol aktualizovaný.', type: 'success' })
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa aktualizovať status prihlášky.')
      addToast({ message, type: 'error' })
      throw err
    }
  }

  const submitEvaluation = async (applicationId: number, payload: Record<string, unknown>) => {
    loading.evaluation[applicationId] = true
    try {
      const res = await api.post(`/evaluator/applications/${applicationId}/evaluations`, payload) as ApiResponseLike
      const evaluation = extractEvaluationPayload(res)
      if (evaluation) {
        const existing = applicationDetailsById.value[applicationId]
        applicationDetailsById.value = {
          ...applicationDetailsById.value,
          [applicationId]: existing
            ? { ...existing, evaluation }
            : {
                id: applicationId,
                status: '',
                team: { id: 0, name: '', members_count: 0 },
                my_score: null,
                submitted_at: '',
                documents: [],
                history: [],
                evaluation,
              },
        }
        if (applicationDetail.value) {
          applicationDetail.value = { ...applicationDetail.value, evaluation }
        }
        hasSubmittedEvaluation.value = true
      }
      return evaluation
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa uložiť hodnotenie.')
      if ((err as any)?.response?.status === 422) {
        hasSubmittedEvaluation.value = true
      }
      addToast({ message, type: 'error' })
      throw err
    } finally {
      loading.evaluation[applicationId] = false
    }
  }

  const updateEvaluation = async (applicationId: number, evaluationId: number, payload: Record<string, unknown>) => {
    loading.evaluation[applicationId] = true
    try {
      const res = await api.patch(`/evaluator/applications/${applicationId}/evaluations/${evaluationId}`, payload) as ApiResponseLike
      const evaluation = extractEvaluationPayload(res)
      if (evaluation) {
        const existing = applicationDetailsById.value[applicationId]
        applicationDetailsById.value = {
          ...applicationDetailsById.value,
          [applicationId]: existing
            ? { ...existing, evaluation }
            : {
                id: applicationId,
                status: '',
                team: { id: 0, name: '', members_count: 0 },
                my_score: null,
                submitted_at: '',
                documents: [],
                history: [],
                evaluation,
              },
        }
        if (applicationDetail.value) {
          applicationDetail.value = { ...applicationDetail.value, evaluation }
        }
        hasSubmittedEvaluation.value = true
      }
      return evaluation
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa upraviť hodnotenie.')
      if ((err as any)?.response?.status === 422) {
        hasSubmittedEvaluation.value = true
      }
      addToast({ message, type: 'error' })
      throw err
    } finally {
      loading.evaluation[applicationId] = false
    }
  }

  const requestSupplement = async (applicationId: number, reason: string) => {
    loading.supplement[applicationId] = true
    try {
      await api.post(`/evaluator/applications/${applicationId}/supplement-request`, { reason })
      addToast({ message: 'Žiadosť o doplnenie bola odoslaná.', type: 'success' })
    } catch (err) {
      const message = errorMessage(err, 'Nepodarilo sa odoslať žiadosť o doplnenie.')
      addToast({ message, type: 'error' })
      throw err
    } finally {
      loading.supplement[applicationId] = false
    }
  }

  return {
    dashboard,
    calls,
    applicationsByCallId,
    applicationDetailsById,
    applicationDetail,
    allEvaluations,
    hasSubmittedEvaluation,
    loading,
    error,
    fetchDashboard,
    fetchCalls,
    fetchApplications,
    fetchApplicationDetail,
    fetchAllEvaluations,
    submitEvaluation,
    updateEvaluation,
    updateApplicationStatus,
    requestSupplement,
  }
}
