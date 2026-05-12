// composables/useToast.ts
interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

export function useToast() {
  // Persist state across navigation + hydration
  const toasts = useState<Toast[]>('toasts', () => [])

  // Persistent incremental ID
  const nextId = useState<number>('toast-next-id', () => 0)

  function addToast({
    message,
    type = 'info',
    duration = 3000,
  }: Omit<Toast, 'id' | 'duration'> & { duration?: number }) {
    // Prevent empty/invisible toasts
    if (!message?.trim()) return

    const id = nextId.value++

    toasts.value.push({
      id,
      message,
      type,
      duration,
    })

    if (import.meta.client) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  /**
   * Persist toast across redirects/navigation.
   */
  function addToastAfterRedirect(
    toast: Omit<Toast, 'id' | 'duration'> & { duration?: number },
  ) {
    if (!import.meta.client) return

    sessionStorage.setItem(
      '_pending_toast',
      JSON.stringify({
        ...toast,
        duration: toast.duration ?? 3000,
      }),
    )
  }

  /**
   * Restore queued toast after redirect.
   */
  function flushPendingToast() {
    if (!import.meta.client) return

    const raw = sessionStorage.getItem('_pending_toast')

    if (!raw) return

    sessionStorage.removeItem('_pending_toast')

    try {
      const toast = JSON.parse(raw)

      addToast({
        message: toast.message,
        type: toast.type,
        duration: toast.duration,
      })
    } catch (err) {
      console.error('Failed to restore pending toast:', err)
    }
  }

  return {
    toasts,
    addToast,
    removeToast,
    addToastAfterRedirect,
    flushPendingToast,
  }
}