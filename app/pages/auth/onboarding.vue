<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12 mt-10">
    <div class="w-full max-w-lg">

      <ClientOnly>
      <StudentOnboarding
        v-if="auth.userRole === 'student'"
        @completed="handleCompleted"
      />

      <OrganizationOnboarding
        v-else-if="auth.userRole === 'company'"
        @completed="handleCompleted"
      />

      <div v-else class="text-center text-gray-500 text-sm">
        <UiLoader />
      </div>
      </ClientOnly>

    </div>
  </div>
</template>
<script setup lang="ts">
import OrganizationOnboarding from '~/components/OrganizationOnboarding.vue'
import StudentOnboarding from '~/components/StudentOnboarding.vue'

definePageMeta({
  middleware: 'onboarding',
})

const { t } = useI18n()
useHead({
  title: computed(() => t('auth.onboarding')),
})

const auth = useAuthStore()
const localePath = useLocalePath()

const redirectUser = async () => {
  const user = await auth.getCurrentUser()
  if (!user) return

  await navigateTo(localePath(auth.redirectUser(user)))
}

const handleCompleted = redirectUser
const syncAndRedirect = redirectUser

const handleStorageChange = async (e: StorageEvent) => {
  if (e.key === '_t') {
    if (e.newValue) {
      await redirectUser()
    } else {
      auth.$reset()
      await navigateTo(localePath('/auth/login'))
    }
  }
}

const handleFocus = async () => {
  await redirectUser()
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('focus', handleFocus)
})
</script>