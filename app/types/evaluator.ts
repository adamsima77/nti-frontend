export interface EvaluationCriterion {
  name: string
  max_score: number
  score: number | null
  comment?: string
}

export interface Evaluation {
  id: number
  application_id: number
  criteria: EvaluationCriterion[]
  total_score: number
  recommendation: 'approve' | 'reject' | 'supplement'
  internal_note?: string
  submitted_at?: string
  locked: boolean
}

export interface EvaluationSummary {
  id: number
  commission_member_id: number
  evaluator: {
    id: number | null
    name: string
  }
  submitted_at: string
  criteria: EvaluationCriterion[]
  total_score: number
  recommendation: 'approve' | 'reject' | 'supplement'
}

export interface EvaluatorCall {
  id: number
  name: string
  program: 'A' | 'B' | string
  status: string
  deadline: string
  applications_total: number
  applications_pending: number
  applications_evaluated: number
  criteria?: EvaluationCriterion[]
}

export interface ApplicationSummary {
  id: number
  status: string
  team: {
    id: number
    name: string
    members_count: number
  }
  my_score: number | null
  submitted_at: string
  academic_flag?: boolean | null
  projectName?: string
  teamName?: string
  program?: string
  deadline?: string | null
  avgScore?: number | null
  call_id?: number | null
  category?: {
    id: number
    name: string
  } | null
}

export interface ApplicationDetail extends ApplicationSummary {
  applicant_name?: string
  school?: string
  study_program?: string
  study_year?: string
  form_data?: Record<string, unknown>
  documents: { id: number; type: string; version: number; url: string }[]
  history: { status: string; changed_at: string; changed_by: string }[]
  evaluation?: Evaluation
  call?: EvaluatorCall | null
  teamMembers?: { id: number; name: string; role: string }[]
  commissionMembers?: { id: number; name: string; score: number | null }[]
  description?: string
  academic_flag?: boolean | null
}

export interface EvaluatorDashboardStats {
  total: number
  pending: number
  evaluated: number
  decided: number
}

export interface EvaluatorDashboardResponse {
  stats?: Partial<EvaluatorDashboardStats>
  calls?: EvaluatorCall[]
  applications?: ApplicationSummary[]
  recentApplications?: ApplicationSummary[]
  urgentApplications?: ApplicationSummary[]
}
