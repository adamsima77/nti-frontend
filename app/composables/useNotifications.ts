export type PortalNotification = {
  id: number
  title: string
  body: string
  read: boolean
  createdAt: string | null
  category: string | null
}

const mapNotification = (row: Record<string, unknown>): PortalNotification => ({
  id: Number(row.id),
  title: String(row.title ?? ''),
  body: String(row.body ?? ''),
  read: Boolean(row.is_read),
  createdAt: row.created_at ? String(row.created_at) : null,
  category: row.category && typeof row.category === 'object'
    ? String((row.category as { slug?: string }).slug ?? '')
    : null,
})

export const useNotifications = () => {
  const api = useApi()
  const notifications = useState<PortalNotification[]>('portal-notifications', () => [])
  const loading = useState('portal-notifications-loading', () => false)

  const fetchNotifications = async () => {
    loading.value = true
    try {
      const res = await api.get('/notifications')
      const list = Array.isArray(res) ? res : []
      notifications.value = list.map((row) => mapNotification(row as Record<string, unknown>))
    } catch {
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`)
    const item = notifications.value.find((n) => n.id === id)
    if (item) item.read = true
  }

  const markAllAsRead = async () => {
    await api.post('/notifications/mark-all-read')
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
  }

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
