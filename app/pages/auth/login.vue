<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">

      <form
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-5"
        @submit.prevent="handleLogin"
      >
        <div class="mb-8 text-center">
          <NuxtLink to="/" class="inline-block mb-6" />

          <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">
            {{ $t('auth.login.title') }}
          </h1>

          <p class="text-gray-600">
            {{ $t('auth.login.subtitle') }}
          </p>
        </div>

        <UiInput
          v-model="formData.email"
          type="email"
          :label="$t('auth.login.fields.email.label')"
          :placeholder="$t('auth.login.fields.email.placeholder')"
          required
          :error="errors.email"
        />

        <UiInput
          v-model="formData.password"
          type="password"
          :label="$t('auth.login.fields.password.label')"
          :placeholder="$t('auth.login.fields.password.placeholder')"
          required
          :error="errors.password"
        />

        <div class="flex justify-end">
          <NuxtLink
            to="/auth/forgot-password"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ $t('auth.login.forgot_password') }}
          </NuxtLink>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">
            {{ $t('auth.login.submit') }}
          </span>
          <span v-else>
            {{ $t('auth.login.loading') }}
          </span>
        </button>

        <p class="text-center text-gray-600 text-sm">
          {{ $t('auth.login.no_account') }}
          <NuxtLink
            to="/auth/register"
            class="text-blue-600 hover:underline font-medium"
          >
            {{ $t('auth.login.register') }}
          </NuxtLink>
        </p>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

useHead({
  title: 'Prihlásenie | NTI',
  meta: [
    {
      name: 'description',
      content: 'Prihlaste sa do vášho NTI účtu',
    },
  ],
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const { addToast } = useToast()
const isLoading = ref(false)

const formData = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: null,
  password: null,
})

const validateForm = () => {
  errors.email = null
  errors.password = null

  let isValid = true

  if (!formData.email) {
    errors.email = 'Email je povinný'
    isValid = false
  }

  if (!formData.password) {
    errors.password = 'Heslo je povinné'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    await authStore.login(formData.email, formData.password)

    // Presmeruj na dashboard alebo na redirection URL z query
    const redirectUrl = route.query.redirect || '/dashboard'
    await router.push(redirectUrl)
  } catch (error) {
    addToast({ message: error.message || 'Chyba pri prihlasovaní. Skúste neskôr.', type: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>
