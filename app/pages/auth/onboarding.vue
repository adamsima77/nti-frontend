<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-lg">

      <StudentOnboarding
        v-if="userRole === 'student'"
         @completed="handleCompleted"
      />

      <OrganizationOnboarding
        v-else-if="userRole === 'company'"
         @completed="handleCompleted"
      />

    
      <div v-else class="text-center text-gray-500 text-sm">
        Načítavam...
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
import OrganizationOnboarding from '~/components/OrganizationOnboarding.vue'
import StudentOnboarding from '~/components/StudentOnboarding.vue'

definePageMeta({
  middleware: 'onboarding',
})

const auth = useAuthStore()
const userRole = computed(() => auth.userRole)

const syncAndRedirect = async () => {
  const user = await auth.getCurrentUser()

  await nextTick()

  
  if (user?.status_id === 3) {
    await navigateTo(auth.redirectUser(user))
  }
}

const handleCompleted = async () => {
  await syncAndRedirect()
}

const handleStorageChange = async (e: StorageEvent) => {
  if (e.key === '_t' && e.newValue) {
    await syncAndRedirect()
  }
}


const handleFocus = async () => {
  await syncAndRedirect()
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