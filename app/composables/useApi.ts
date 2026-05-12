export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

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

      const token = import.meta.client
        ? localStorage.getItem('_t')
        : null

      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      const isFormData = options.body instanceof FormData

      if (!isFormData) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }
    },

    async onResponseError({ response, request }) {
      const isAuthEndpoint = String(request).includes('/auth/login')
        || String(request).includes('/auth/register')
        || String(request).includes('/auth/forgot-password')
        || String(request).includes('/auth/reset-password')
        || String(request).includes('/auth/resend-verification')
        || String(request).includes('/auth/verify-email')

      // Treat both 401 and 500 on protected endpoints as session loss.
      // Laravel can return 500 instead of 401 when Sanctum middleware crashes
      // on a missing/revoked token before the auth check completes.
      const isSessionLoss =
        response.status === 401 ||
        (response.status === 500 && !isAuthEndpoint)

      if (isSessionLoss && !isAuthEndpoint) {
        // $reset() clears user AND removes the token from localStorage,
        // preventing the next request from sending a dead token.
        auth.$reset()

        if (import.meta.client) {
          const localePath = useLocalePath()
          await navigateTo(localePath('/auth/login'))
        }
      }
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