<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-lg">

      <StudentOnboarding
        v-if="userRole === 'student'"
        @success="handleSuccess"
      />

      <OrganizationOnboarding
        v-else-if="userRole === 'company'"
        @success="handleSuccess"
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

const auth   = useAuthStore()
const router = useRouter()

definePageMeta({
  middleware: 'onboarding',
})


const userRole = computed(() => auth.userRole)

const handleSuccess = () => {

  auth.getCurrentUser().then(() => {
    router.push(auth.redirectUser())
  })
}
</script>