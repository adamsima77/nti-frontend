import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Role {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  surname: string
  email: string
  roles: Role[]
  status_id: number
  avatar_url: string | null
  organization_name: string | null
}

enum UserStatus {
  PENDING_EMAIL = 1,
  PENDING_ONBOARDING = 2,
  ACTIVE = 3,
  INACTIVE = 4,
  BANNED = 5,
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)


  const hydrated = ref(false)
  const initPromise = ref<Promise<User | null> | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  const isPendingOnboarding = computed(() =>
    user.value?.status_id === UserStatus.PENDING_ONBOARDING
  )

  const isActive = computed(() =>
    user.value?.status_id === UserStatus.ACTIVE
  )

  const userRoles = computed(() =>
    user.value?.roles?.map(r => r.name) ?? []
  )

  const ROLE_MAP: Record<string, string> = {
    nti_admin: 'admin',
    nti_superadmin: 'admin',
    student: 'student',
    team_lead: 'student',
    partner: 'company',
    mentor: 'mentor',
    evaluator: 'evaluator',
  }

  const userRole = computed(() => {
    for (const role of userRoles.value) {
      if (ROLE_MAP[role]) return ROLE_MAP[role]
    }
    return null
  })

  const hasRole = (roles: string | string[]): boolean => {
    if (!userRoles.value.length) return false
    return Array.isArray(roles)
      ? roles.some(r => userRoles.value.includes(r))
      : userRoles.value.includes(roles)
  }

  
  const redirectUser = (u: User | null = null): string => {
    const userRef = u ?? user.value

    if (!userRef) return '/auth/login'

    if (userRef.status_id === UserStatus.PENDING_ONBOARDING) {
      return '/auth/onboarding'
    }

    const role = userRef.roles
      ?.map(r => ROLE_MAP[r.name])
      ?.find(Boolean)

    if (role === 'admin') return '/admin'
    if (role === 'evaluator') return '/hodnotenie'
    if (role === 'company') return '/firma'
    if (role === 'mentor') return '/mentor'
    if (role === 'student') return '/student'

    return '/'
  }

  
  const getCurrentUser = async (): Promise<User | null> => {
    if (initPromise.value) return initPromise.value

    initPromise.value = (async () => {
      try {
        const res = await api.get('/auth/me') as User
        user.value = res
        hydrated.value = true
        return res
      } catch (e) {
        user.value = null
        hydrated.value = true
        return null
      } finally {
        initPromise.value = null
      }
    })()

    return initPromise.value
  }

  
  const syncUser = async () => {
    if (!import.meta.client) return
    return await getCurrentUser()
  }

  const login = async (email: string, password: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      }) as { token: string; user: User }

      if (import.meta.client) {
        localStorage.setItem('_t', res.token)
      }

      user.value = res.user

      await getCurrentUser()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login error'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      $reset()
    }
  }

  const $reset = () => {
    user.value = null
    hydrated.value = false
    error.value = null

    if (import.meta.client) {
      localStorage.removeItem('_t')
    }
  }

  const requestPasswordReset = async (email: string) => {
    return await api.post('/auth/forgot-password', { email })
  }

  const resetPassword = async (
    token: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    return await api.post('/auth/reset-password', {
      token,
      email,
      password,
      password_confirmation,
    })
  }

  return {
    user,
    isLoading,
    error,
    hydrated,

    isAuthenticated,
    isPendingOnboarding,
    isActive,

    userRoles,
    userRole,

    hasRole,
    redirectUser,

    login,
    logout,

    getCurrentUser,
    syncUser,
    $reset,

    requestPasswordReset,
    resetPassword,
  }
})