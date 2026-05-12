import type { DashboardData, DashboardStats, Deadline, RequiredAction, Application, ApplicationWithProgress } from './types'
import { useApplications } from './useApplications'
import { useTeams } from './useTeams'
import { useCalls } from '../programs/fetchCalls'

/**
 * Calculate days remaining until deadline
 */
function daysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Extract deadlines from applications (application deadlines)
 */
function extractDeadlinesFromApplications(applications: Application[]): Deadline[] {
  const deadlines: Deadline[] = []
  let id = 1

  applications.forEach((app) => {
    if (app.status === 'draft' || app.status === 'submitted' || app.status === 'evaluating') {
      // For draft/submitted: show submission deadline
      const submittedAt = app.submittedAt
      if (submittedAt) {
        deadlines.push({
          id: id++,
          title: `${app.title} — Submission deadline`,
          deadline: new Date(submittedAt).toISOString().split('T')[0] || submittedAt,
          daysLeft: daysUntilDeadline(submittedAt),
        })
      }
    }

    // Show milestones as deadlines
    app.milestones?.forEach((milestone) => {
      if (milestone.status !== 'completed') {
        deadlines.push({
          id: id++,
          title: `${app.title} — ${milestone.title}`,
          deadline: milestone.dueDate,
          daysLeft: daysUntilDeadline(milestone.dueDate),
        })
      }
    })
  })

  // Sort by days left (soonest first) and limit to 5
  return deadlines
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)
}

/**
 * Generate required actions based on application status
 */
function generateRequiredActions(applications: Application[]): RequiredAction[] {
  const actions: RequiredAction[] = []
  let id = 1

  applications.forEach((app) => {
    if (app.status === 'draft') {
      actions.push({
        id: id++,
        type: 'draft',
        message: `Dokončite rozpracovanú prihlášku "${app.title}"`,
        link: `/student/prihlasky/${app.id}`,
      })
    }

    if (app.status === 'submitted' && app.documents < 2) {
      actions.push({
        id: id++,
        type: 'supplement',
        message: `Doplňte dokumenty k prihláške "${app.title}"`,
        link: `/student/prihlasky/${app.id}`,
      })
    }

    if (app.status === 'evaluating') {
      actions.push({
        id: id++,
        type: 'waiting',
        message: `Prihlaska "${app.title}" je v procese hodnotenia`,
        link: `/student/prihlasky/${app.id}`,
      })
    }
  })

  return actions
}

/**
 * Calculate dashboard statistics
 */
function calculateStats(applications: Application[]): DashboardStats {
  return {
    total: applications.length,
    approved: applications.filter((a) => a.status === 'approved').length,
    inProcess: applications.filter((a) => ['submitted', 'evaluating'].includes(a.status)).length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }
}

/**
 * Get active projects (approved applications with milestones)
 */
function getActiveProjectsWithMilestones(applications: Application[]): ApplicationWithProgress[] {
  return applications
    .filter((a) => a.status === 'approved' && a.milestones && a.milestones.length > 0)
    .map((app) => ({
      ...app,
      completedMilestones: app.milestones.filter((m) => m.status === 'completed').length,
    }))
}

/**
 * Fetch and aggregate all dashboard data
 */
export const useDashboard = () => {
  const { applications, pending: appsPending } = useApplications()
  const { teams, pending: teamsPending } = useTeams()

  const deadlines = computed(() => extractDeadlinesFromApplications(applications.value || []))
  const actions = computed(() => generateRequiredActions(applications.value || []))
  const stats = computed(() => calculateStats(applications.value || []))
  const activeProjectsWithMilestones = computed(() =>
    getActiveProjectsWithMilestones(applications.value || [])
  )

  const data = computed<DashboardData>(() => ({
    applications: applications.value,
    teams: teams.value,
    deadlines: deadlines.value,
    actions: actions.value,
    stats: stats.value,
    activeProjectsWithMilestones: activeProjectsWithMilestones.value,
  }))

  const pending = computed(() => appsPending.value || teamsPending.value)

  return {
    data,
    applications,
    teams,
    deadlines,
    actions,
    stats,
    activeProjectsWithMilestones,
    pending,
  }
}
