export const useApi = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()
  const base = import.meta.server
    ? config.apiBase
    : config.public.apiBase

  
  const token = useCookie<string | null>('auth_token')

  const apiFetch = $fetch.create({
    baseURL: base,
    credentials: 'include',

    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      }

      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        }
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        token.value = null
        auth.user = null
        throw new Error('Unauthorized')
      }
    },
  })

  return {
    get: (endpoint: string, options?: any) =>
      apiFetch(endpoint, { method: 'GET', ...options }),

    post: (endpoint: string, data?: any, options?: any) =>
      apiFetch(endpoint, { method: 'POST', body: data, ...options }),

    put: (endpoint: string, data?: any, options?: any) =>
      apiFetch(endpoint, { method: 'PUT', body: data, ...options }),

    patch: (endpoint: string, data?: any, options?: any) =>
      apiFetch(endpoint, { method: 'PATCH', body: data, ...options }),

    delete: (endpoint: string, options?: any) =>
      apiFetch(endpoint, { method: 'DELETE', ...options }),
  }
}