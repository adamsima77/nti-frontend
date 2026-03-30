interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function addToast({
    message,
    type = 'info',
    duration = 3000,
  }: Omit<Toast, 'id' | 'duration'> & { duration?: number }) {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  return { toasts: readonly(toasts), addToast, removeToast }
}
