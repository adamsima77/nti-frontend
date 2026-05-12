export interface Milestone {
  id: number
  title: string
  dueDate: string
  status: 'completed' | 'in_progress' | 'pending'
}

export interface Application {
  id: number
  title: string
  program: string
  team: string
  status: 'approved' | 'evaluating' | 'submitted' | 'draft' | 'rejected'
  submittedAt: string | null
  members: number
  documents: number
  milestones: Milestone[]
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
