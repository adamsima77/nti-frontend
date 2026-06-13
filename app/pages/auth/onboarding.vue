<template>
  <!-- Keep layout classes uniform for both server and client -->
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12 mt-10">
    <div class="w-full max-w-lg">

      <!-- Set fallback-tag="span" so the server structure matches the client wrapper -->
      <ClientOnly fallback-tag="span">
        <!-- Only render your store-dependent UI once mounted -->
        <template v-if="isMounted">
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
        </template>
        
        <!-- Optional: What shows up on the server while the page loads -->
        <template #fallback>
          <div class="text-center text-gray-500 text-sm">
            <UiLoader />
          </div>
        </template>
      </ClientOnly>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

// 1. Introduce a mounting flag
const isMounted = ref(false)

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
  // 2. Flip the flag immediately on mount
  isMounted.value = true
  
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('focus', handleFocus)
})
</script>