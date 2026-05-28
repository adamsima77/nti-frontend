export type MilestoneStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  // allow backend extensions without breaking the UI
  | (string & {})

export interface MilestoneComment {
  id: number
  author: string
  date: string
  text: string
}

export interface Milestone {
  id: number
  title: string
  dueDate: string
  status: MilestoneStatus
  description?: string | null
  comments: MilestoneComment[]
}

export type MentorProjectStatus = 'active' | 'paused' | 'completed' | 'draft' | string

export interface MentorProject {
  id: number
  name: string
  teamName?: string | null
  program?: string | null
  status: MentorProjectStatus
  assignedAt?: string | null
  productOwner?: { name: string; email?: string | null } | null
  teamMembers?: Array<{ id: number; name: string; role: string }>

  teamSize?: number | null
  consultationsCount?: number | null

  milestonesCompleted?: number | null
  milestonesTotal?: number | null
  nextMilestone?: string | null
  pendingMilestone?: boolean | null

  milestones?: Milestone[]
}

export type ConsultationType = 'online' | 'personal' | 'written' | string

export interface Consultation {
  id: number
  projectId: number
  projectName: string
  title: string
  date: string
  duration: number
  type: string
  summary: string
  actionItems: string[]
}

export interface Feedback {
  rating?: number
  message: string
  recommendation?: string
}

export interface MentorDashboardStats {
  totalProjects: number
  activeProjects: number
  pendingMilestones: number
  consultationsThisMonth: number
}

export interface MentorDashboardAction {
  id: number | string
  message: string
  link?: string
}

export interface MentorDashboardItemConsultation {
  id: number
  projectId?: number
  projectName: string
  summary: string
  date: string
}

export interface MentorDashboardResponse {
  stats?: Partial<MentorDashboardStats>
  projects?: MentorProject[]
  pendingActions?: MentorDashboardAction[]
  recentConsultations?: MentorDashboardItemConsultation[]
}

