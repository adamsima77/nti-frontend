import { ref, onUnmounted } from 'vue'

interface UseAutoSaveOptions {
  debounceMs?: number // Default 30000 (30 seconds)
  onSave: () => void | Promise<void> // Save callback
}

/**
 * Composable for debounced auto-save functionality
 * Saves automatically after specified delay of inactivity
 *
 * Usage:
 * ```ts
 * const { markDirty, lastSaveTime } = useAutoSave({
 *   debounceMs: 30000,
 *   onSave: async () => {
 *     await api.post('/endpoint', data)
 *   }
 * })
 *
 * // In your form, call markDirty() whenever data changes
 * watch(() => formData, () => markDirty(), { deep: true })
 * ```
 */
export const useAutoSave = (options: UseAutoSaveOptions) => {
  const { debounceMs = 30000, onSave } = options

  const lastSaveTime = ref<string | null>(null)
  const isSaving = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Mark form as dirty and schedule save
   * Resets the debounce timer each time this is called
   */
  const markDirty = () => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Schedule new save
    debounceTimer = setTimeout(async () => {
      await saveNow()
    }, debounceMs)
  }

  /**
   * Save immediately without waiting for debounce
   */
  const saveNow = async () => {
    if (isSaving.value) return

    isSaving.value = true
    try {
      await onSave()
      lastSaveTime.value = new Date().toLocaleTimeString('sk-SK')
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Error is usually handled by useApi toast
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Cancel pending save
   */
  const cancelPendingSave = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  /**
   * Clean up timer on component unmount
   */
  onUnmounted(() => {
    cancelPendingSave()
  })

  return {
    markDirty,
    saveNow,
    cancelPendingSave,
    lastSaveTime,
    isSaving,
  }
}
