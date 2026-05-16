import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Permission {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
  permissions: Permission[]
}

interface User {
  id: number
  name: string
  surname: string
  email: string
  roles: Role[]
  status_id: number
  /** Verejná URL alebo relatívna (/storage/...); môže chýbať v starších odpovediach API. */
  avatar_url: string | null
  /** Relatívna cesta na disku (napr. avatars/...) z Laravel public disku. */
  avatar?: string | null
  organization_name: string | null
}

const enum UserStatus {
  PENDING_EMAIL      = 1,
  PENDING_ONBOARDING = 2,
  ACTIVE             = 3,
  INACTIVE           = 4,
  BANNED             = 5,
  PENDING_APPROVAL   = 6,
}

const ROLE_MAP: Record<string, string> = {
  'nti_superadmin': 'superadmin',
  'nti_admin':      'admin',
  'cms_editor':     'cms_editor',
  'student':        'student',
  'team_leader':    'student',
  'partner':        'company',
  'mentor':         'mentor',
  'evaluator':      'evaluator',
  'guest':          'guest',
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  const user        = ref<User | null>(null)
  const isLoading   = ref(false)
  const error       = ref<string | null>(null)
  const hydrated    = ref(false)
  const initPromise = ref<Promise<User | null> | null>(null)

  // ---- computed ----

  const isAuthenticated = computed(() => !!user.value)

  const isPendingOnboarding = computed(() =>
    user.value?.status_id === UserStatus.PENDING_ONBOARDING
  )

  const isPendingApproval = computed(() =>
    user.value?.status_id === UserStatus.PENDING_APPROVAL
  )

  const isActive = computed(() =>
    user.value?.status_id === UserStatus.ACTIVE
  )

  const userRoles = computed(() =>
    user.value?.roles?.map(r => r.name) ?? []
  )

  const userRole = computed(() => {
    for (const role of userRoles.value) {
      if (ROLE_MAP[role]) return ROLE_MAP[role]
    }
    return null
  })

  const userPermissions = computed(() =>
    user.value?.roles?.flatMap(r => r.permissions?.map(p => p.name) ?? []) ?? []
  )

  // ---- helpers ----

  const hasRole = (roles: string | string[]): boolean => {
    if (!userRoles.value.length) return false
    return Array.isArray(roles)
      ? roles.some(r => userRoles.value.includes(r))
      : userRoles.value.includes(roles)
  }

  const hasPermission = (permission: string): boolean => {
    if (hasRole(['nti_superadmin', 'nti_admin'])) return true
    return userPermissions.value.includes(permission)
  }

 const redirectUser = (u: User | null = null): string => {
  const userRef = u ?? user.value

  if (!userRef) return '/auth/login'

  if (userRef.status_id === UserStatus.PENDING_ONBOARDING) {
    return '/auth/onboarding'
  }

  if (userRef.status_id === UserStatus.PENDING_APPROVAL) {
    return '/auth/pending-approval'
  }

  const role = userRef.roles
    ?.map(r => ROLE_MAP[r.name])
    ?.find(Boolean)

  if (role === 'superadmin') return '/super-admin'
  if (role === 'admin')      return '/admin'
  if (role === 'cms_editor') return '/cms'
  if (role === 'evaluator')  return '/hodnotenie'
  if (role === 'company')    return '/firma'
  if (role === 'mentor')     return '/mentor'
  if (role === 'student')    return '/student'

  return '/'
}

  // ---- actions ----

  const getCurrentUser = async (opts?: { force?: boolean }): Promise<User | null> => {
    // Po mutácii profilu treba nový request; inak sa môže vrátiť zdieľaný starý /auth/me
    // spustený pred uložením (bez avatar_url).
    if (opts?.force && initPromise.value) {
      try {
        await initPromise.value
      } catch {
        /* ignore */
      }
      initPromise.value = null
    }

    if (initPromise.value) return initPromise.value

    initPromise.value = (async () => {
      try {
        const res = await api.get('/auth/me') as User
        user.value = res
        hydrated.value = true
        return res
      } catch {
        user.value = null
        hydrated.value = true
        return null
      } finally {
        initPromise.value = null
      }
    })()

    return initPromise.value
  }

  const patchUser = (data: Partial<User>) => {
    if (!user.value) return
    user.value = { ...user.value, ...data }
  }

  const syncUser = async () => {
    if (!import.meta.client) return
    return await getCurrentUser()
  }

  const login = async (email: string, password: string, cfTurnstileResponse: string): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        cf_turnstile_response: cfTurnstileResponse,
      }) as { token: string; user: User }

      if (import.meta.client) {
        localStorage.setItem('_t', res.token)
      }

      user.value = res.user
      await getCurrentUser()
    } catch (err: any) {
      const message = err?.data?.message ?? err?.response?.data?.message ?? err?.message ?? 'Login error'
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
    user.value     = null
    hydrated.value = false
    error.value    = null

    if (import.meta.client) {
      localStorage.removeItem('_t')
    }
  }

  const requestPasswordReset = async (email: string, lang: string, cfTurnstileResponse: string) => {
    return await api.post('/auth/forgot-password', {
      email,
      lang,
      cf_turnstile_response: cfTurnstileResponse,
    })
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
    isPendingApproval,
    isActive,

    userRoles,
    userRole,
    userPermissions,

    hasRole,
    hasPermission,
    redirectUser,

    login,
    logout,

    getCurrentUser,
    patchUser,
    syncUser,
    $reset,

    requestPasswordReset,
    resetPassword,
  }
})