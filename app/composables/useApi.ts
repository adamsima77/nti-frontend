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

      // ✅ Attach token only on client
      const token = import.meta.client
        ? localStorage.getItem('_t')
        : null

      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // ✅ IMPORTANT: DO NOT override multipart requests
      const isFormData = options.body instanceof FormData

      if (!isFormData) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }
      // If FormData → let browser set Content-Type automatically
    },

   async onResponseError({ response, request }) {
  const isAuthMeRequest = String(request).includes('/auth/me')
  if (response.status === 401 || (response.status === 500 && isAuthMeRequest)) {
    // Don't redirect if this is the login request itself
    const isLoginRequest = String(request).includes('/auth/login')
    if (isLoginRequest) return

    if (import.meta.client) {
      localStorage.removeItem('_t')
    }
    auth.user = null

    const localePath = useLocalePath()
    await navigateTo(localePath('/auth/login'))
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