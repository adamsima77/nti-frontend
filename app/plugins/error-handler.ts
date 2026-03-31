/**
 * Global error handler plugin
 * Handles unhandled errors and displays them as toast notifications
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Handle unhandled promise rejections
  nuxtApp.hook('app:error', (error) => {
    const toast = useToast()
    const message = error instanceof Error ? error.message : String(error)
    
    console.error('Unhandled error:', error)
    
    toast.addToast({
      message: `Chyba: ${message}`,
      type: 'error',
      duration: 5000,
    })
  })

  // Handle Vue errors
  if (!import.meta.server) {
    window.addEventListener('error', (event) => {
      const toast = useToast()
      console.error('Window error:', event.error)
      
      toast.addToast({
        message: `Aplikačná chyba: ${event.error?.message || 'Neznáma chyba'}`,
        type: 'error',
        duration: 5000,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      const toast = useToast()
      console.error('Unhandled rejection:', event.reason)
      
      let message = 'Neznáma chyba'
      if (event.reason instanceof Error) {
        message = event.reason.message
      } else if (typeof event.reason === 'string') {
        message = event.reason
      }
      
      toast.addToast({
        message: `Chyba: ${message}`,
        type: 'error',
        duration: 5000,
      })
    })
  }
})
