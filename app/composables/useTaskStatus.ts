export const normalizeTaskStatus = (status: string | { name?: string } | undefined | null): string => {
  const raw = typeof status === 'string'
    ? status
    : status && typeof status.name === 'string'
      ? status.name
      : ''

  const normalized = raw.trim().toLowerCase()

  return {
    draft: 'draft',
    'čaká na schválenie': 'pending_approval',
    pending: 'pending',
    'publikované': 'published',
    published: 'published',
    'v párovaní': 'matching',
    'pridelené': 'assigned',
    assigned: 'assigned',
    'v realizácii': 'in_progress',
    'in_progress': 'in_progress',
    closed: 'closed',
    'uzavreté': 'closed',
    completed: 'closed',
  }[normalized] ?? normalized.replace(/\s+/g, '_')
}

export const apiTaskStatusState = (status: string): string => {
  return {
    draft: 'Draft',
    pending: 'Čaká na schválenie',
    published: 'Publikované',
    matching: 'V párovaní',
    assigned: 'Pridelené',
    in_progress: 'V realizácii',
    closed: 'Uzavreté',
  }[status] ?? status
}

export const getStatusLabel = (status: string): string => {
  return {
    draft: 'Draft',
    pending: 'Čaká na schválenie',
    published: 'Publikované do backlogu',
    matching: 'V párovaní',
    assigned: 'Pridelené',
    in_progress: 'V realizácii',
    closed: 'Uzavreté',
  }[status] ?? status
}