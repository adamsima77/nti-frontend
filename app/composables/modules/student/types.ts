export interface Milestone {
  id: number
  title: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'pending'
  description?: string | null
  completedAt?: string | null
}

export interface ApplicationDocumentRow {
  id: number
  name: string
  size?: string | null
  uploadedAt?: string | null
}

export type ApplicationStatus = 'approved' | 'evaluating' | 'submitted' | 'draft' | 'rejected'

export interface ApplicationHistoryEntry {
  status: ApplicationStatus
  date: string
  note?: string | null
}

export interface ApplicationComment {
  author: string
  text: string
  date: string
}

export interface Application {
  id: number
  title: string
  program: string
  team: string
  status: ApplicationStatus
  submittedAt: string | null
  members: number
  documents: number
  milestones: Milestone[]
  /** Detail stránka — z API */
  description?: string
  documentRows?: ApplicationDocumentRow[]
  history?: ApplicationHistoryEntry[]
  comments?: ApplicationComment[]
}

export interface ApplicationWithProgress extends Application {
  completedMilestones: number
}

export interface Team {
  id: number
  name: string
  members: number
  role: string
}

export interface Deadline {
  id: number
  title: string
  deadline: string
  daysLeft: number
}

export interface RequiredAction {
  id: number
  type: string
  message: string
  link: string
  deadline?: string
}

export interface DashboardStats {
  total: number
  approved: number
  inProcess: number
  rejected: number
}

export interface DashboardData {
  applications: Application[]
  teams: Team[]
  deadlines: Deadline[]
  actions: RequiredAction[]
  stats: DashboardStats
  activeProjectsWithMilestones: ApplicationWithProgress[]
}
