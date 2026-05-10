<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-lg text-center">
      <div class="bg-white rounded-2xl shadow p-10">

        <div class="text-5xl mb-4">⏳</div>

        <h1 class="text-2xl font-bold text-gray-900 mb-3">
          {{ $t('pending_approval.title') }}
        </h1>

        <p class="text-gray-500 text-sm leading-relaxed mb-8">
          {{ $t('pending_approval.description') }}
        </p>

        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-left">
          <p class="text-sm font-semibold text-yellow-800 mb-1">
            {{ $t('pending_approval.what_next') }}
          </p>
          <ul class="text-sm text-yellow-700 space-y-1">
            <li>🔍 {{ $t('pending_approval.step_review') }}</li>
            <li>✅ {{ $t('pending_approval.step_email') }}</li>
            <li>🚀 {{ $t('pending_approval.step_access') }}</li>
          </ul>
        </div>

        <button
          @click="handleLogout"
          class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {{ $t('auth.logout') }}
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()

const handleLogout = async () => {
  await auth.logout()
  await navigateTo('/auth/login')
}

const handleStorageChange = async (e: StorageEvent) => {
  if (e.key === '_t' && e.newValue) {
    await auth.getCurrentUser()
    await navigateTo(auth.redirectUser())
  }
}

onMounted(() => {
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>