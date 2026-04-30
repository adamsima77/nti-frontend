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
}
 
export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
 
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
 
  
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
 
  const isAuthenticated = computed(() => !!user.value)
 
  const userRoles = computed(() =>
    user.value?.roles?.map(r => r.name) ?? []
  )

  const ROLE_MAP: Record<string, string> = {
  'nti_admin': 'admin',
  'nti_superadmin': 'admin',
  'student': 'student',
  'team_lead': 'student',
  'partner': 'company',
  'mentor': 'mentor',
  'evaluator': 'evaluator',
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
 
 const redirectUser = (u: User): string => {
  const role = userRole.value  
  if (role === 'admin')     return '/admin'
  if (role === 'evaluator') return '/hodnotenie'
  if (role === 'company')   return '/firma'
  if (role === 'mentor')    return '/mentor'
  if (role === 'student')   return '/student'
  return '/'
}
 
  const login = async (email: string, password: string): Promise<void> => {
    isLoading.value = true
    error.value = null
 
    try {
      const res = await api.post('/auth/login', { email, password }) as { token: string; user: User }
 
      
      token.value = res.token
      user.value = res.user
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Chyba pri prihlasovaní'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }
 
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch {
      
    } finally {
      user.value = null
      token.value = null 
    }
  }
 
  const getCurrentUser = async (): Promise<User> => {
    const res = await api.get('/auth/me') as User
    user.value = res
    return res
  }
 
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    userRoles,
    userRole, 
    hasRole,
    redirectUser,
    login,
    logout,
    getCurrentUser,
  }
})