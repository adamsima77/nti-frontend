export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const localeCookie = useCookie<string>('i18n_redirected', { default: () => 'sk' })

  const baseURL = import.meta.server
    ? config.apiBase
    : config.public.apiBase

  const apiFetch = $fetch.create({
    baseURL,
    credentials: 'include',

    onRequest({ options }) {
      options.headers = {
        ...options.headers,
      }

      const loc = localeCookie.value === 'en' ? 'en' : 'sk'
      options.headers = {
        ...options.headers,
        'X-Locale': loc,
      }

      // Attach token only on client
      const token = import.meta.client
        ? localStorage.getItem('_t')
        : null

      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // DO NOT set Content-Type for FormData — let the browser set it with boundary
      const isFormData = options.body instanceof FormData
      if (!isFormData) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }
    },

    async onResponseError({ response, request }) {
      if (response.status === 401) {
        const isLoginRequest = String(request).includes('/auth/login')
        if (isLoginRequest) return

        if (import.meta.client) {
          localStorage.removeItem('_t')
        }
        auth.user = null

        const localePath = useLocalePath()
        await navigateTo(localePath('/auth/login'))
        return
      }

      // For all other errors (422 validation, 500 server errors, etc.)
      // do NOT swallow — let the error propagate so callers can catch it.
      // The response data is available on the error object as e.data.
    },
  })

  return {
    get: (endpoint: string, options: any = {}) =>
      apiFetch(endpoint, { method: 'GET', ...options }),

    post: (endpoint: string, data?: any, options: any = {}) =>
      apiFetch(endpoint, { method: 'POST', body: data, ...options }),

    put: (endpoint: string, data?: any, options: any = {}) =>
      apiFetch(endpoint, { method: 'PUT', body: data, ...options }),

    patch: (endpoint: string, data?: any, options: any = {}) =>
      apiFetch(endpoint, { method: 'PATCH', body: data, ...options }),

    delete: (endpoint: string, options: any = {}) =>
      apiFetch(endpoint, { method: 'DELETE', ...options }),
  }
}