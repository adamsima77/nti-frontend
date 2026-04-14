import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// User interface
interface User {
  id?: number
  email: string
  first_name?: string
  last_name?: string
  organization_name?: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const userRole = computed(() => user.value?.role || null)

  const hasRole = (role: string | string[]): boolean => {
    if (!userRole.value) return false
    if (Array.isArray(role)) {
      return role.includes(userRole.value)
    }
    return userRole.value === role
  }

  // Actions
  const login = async (email: string, password: string): Promise<any> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      token.value = response.token
      user.value = response.user

      // Uložiť do sessionStorage (voliteľné)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_token', response.token)
      }

      return response
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: any): Promise<any> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', userData)

      // registration môže automaticky prihlásiť alebo vyžaduje email verification
      if (response.token) {
        token.value = response.token
        user.value = response.user
      }

      return response
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Backend logout (voliteľné)
      if (token.value) {
        await api.post('/auth/logout', {})
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Vždy vyčistiť state
      token.value = null
      user.value = null
      isLoading.value = false

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_token')
      }
    }
  }

  const verifyEmail = async (verificationPath: string): Promise<any> => {
    isLoading.value = true
    error.value = null
    try {
      // verificationPath bude napr: "12/abcde...hash?expires=123&signature=xyz"
      const response = await api.post(`/auth/verify-email/${verificationPath}`, {})

      // Ak backend po overení vráti aj usera a token, prihlásime ho
      if (response.token && response.user) {
        token.value = response.token
        user.value = response.user
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_token', response.token)
        }
      }
      return response
    } catch (err: any) {
      error.value = err.message || 'Overenie zlyhalo'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resendVerificationEmail = async (email: string): Promise<any> => {
    isLoading.value = true
    try {
      return await api.post('/auth/email/resend', { email })
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const requestPasswordReset = async (email: string): Promise<any> => {
    try {
      return await api.post('/auth/forgot-password', { email })
    } catch (err) {
      error.value = (err as Error).message
      throw err
    }
  }

  const resetPassword = async (token: string, password: string, password_confirmation: string): Promise<any> => {
    try {
      return await api.post('/auth/reset-password', {
        token,
        password,
        password_confirmation,
      })
    } catch (err) {
      error.value = (err as Error).message
      throw err
    }
  }

  const getCurrentUser = async (): Promise<any> => {
    try {
      const response = await api.get('/auth/me')
      user.value = response.user
      return response
    } catch (err) {
      token.value = null
      user.value = null
      throw err
    }
  }

  // Hydrate z sessionStorage (na page load)
  const hydrate = (): void => {
    if (typeof window !== 'undefined') {
      const savedToken = sessionStorage.getItem('auth_token')
      if (savedToken) {
        token.value = savedToken
        // Zload aktuálneho usera z backendu
        getCurrentUser().catch(() => {
          token.value = null
        })
      }
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    userRole,

    // Methods
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    getCurrentUser,
    hasRole,
    hydrate,
  }
})
