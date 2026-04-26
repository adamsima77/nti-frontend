<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-12">
    <div class="w-full max-w-md">
      <!-- HEADER -->
      <div class="mb-8 text-center">
        <NuxtLink
          :to="localePath('/')"
          class="inline-block mb-6"
        />

        <h1 class="text-2xl md:text-3xl font-bold text-navy mb-2">
          {{ $t('auth.register.title') }}
        </h1>

        <p class="text-gray-600">
          {{ $t('auth.register.subtitle') }}
        </p>
      </div>

      <!-- STEP SELECTION -->
      <div
        v-if="step === 'type-selection'"
        class="space-y-4"
      >
        <p class="text-center text-gray-700 font-medium mb-6">
          {{ $t('auth.register.type_selection.title') }}
        </p>

        <!-- STUDENT -->
        <button
          class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
          @click="selectAccountType('student')"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors"
            >
              <GraduationCap class="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h3 class="font-bold text-navy mb-1">
                {{ $t('auth.register.type_selection.student.title') }}
              </h3>

              <p class="text-sm text-gray-600">
                {{ $t('auth.register.type_selection.student.description') }}
              </p>
            </div>
          </div>
        </button>

        <!-- ORGANIZATION -->
        <button
          class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
          @click="selectAccountType('organization')"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors"
            >
              <Briefcase class="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h3 class="font-bold text-navy mb-1">
                {{ $t('auth.register.type_selection.organization.title') }}
              </h3>

              <p class="text-sm text-gray-600">
                {{ $t('auth.register.type_selection.organization.description') }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- FORM -->
      <form
        v-else-if="step === 'register'"
        class="space-y-4"
        @submit.prevent="submitRegistration"
      >
        <!-- BACK -->
        <button
          type="button"
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          @click="step = 'type-selection'"
        >
          <ChevronLeft class="w-4 h-4" />
          {{ $t('auth.register.buttons.back') }}
        </button>

        <!-- STUDENT -->
        <div
          v-if="accountType === 'student'"
          class="space-y-4"
        >
          <UiInput
            v-model="formData.firstName"
            :label="$t('auth.register.fields.first_name')"
            :placeholder="$t('auth.register.placeholders.first_name')"
            required
            :error="errors.firstName"
          />

          <UiInput
            v-model="formData.lastName"
            :label="$t('auth.register.fields.last_name')"
            :placeholder="$t('auth.register.placeholders.last_name')"
            required
            :error="errors.lastName"
          />

          <UiInput
            v-model="formData.email"
            type="email"
            :label="$t('auth.register.fields.email')"
            :placeholder="$t('auth.register.placeholders.email')"
            required
            :error="errors.email"
          />

          <UiInput
            v-model="formData.password"
            type="password"
            :label="$t('auth.register.fields.password')"
            :placeholder="$t('auth.register.placeholders.password')"
            required
            :validate="validatePassword"
            :error="errors.password"
          />

          <UiInput
            v-model="formData.password_confirmation"
            type="password"
            :label="$t('auth.register.fields.password_confirmation')"
            :placeholder="$t('auth.register.placeholders.password')"
            required
            :error="errors.password_confirmation"
          />
        </div>

        <!-- ORGANIZATION -->
        <div
          v-else-if="accountType === 'organization'"
          class="space-y-4"
        >
          <UiInput
            v-model="formData.organizationName"
            :label="$t('auth.register.fields.organization_name')"
            :placeholder="$t('auth.register.placeholders.organization_name')"
            required
            :error="errors.organizationName"
          />

          <UiInput
            v-model="formData.email"
            type="email"
            :label="$t('auth.register.fields.email')"
            :placeholder="$t('auth.register.placeholders.organization_email')"
            required
            :error="errors.email"
          />

          <UiInput
            v-model="formData.password"
            type="password"
            :label="$t('auth.register.fields.password')"
            :placeholder="$t('auth.register.placeholders.password')"
            required
            :validate="validatePassword"
            :error="errors.password"
          />

          <UiInput
            v-model="formData.password_confirmation"
            type="password"
            :label="$t('auth.register.fields.password_confirmation')"
            :placeholder="$t('auth.register.placeholders.password')"
            required
            :error="errors.password_confirmation"
          />
        </div>

        <!-- TERMS -->
        <div class="flex items-start gap-2">
          <input
            id="terms"
            v-model="formData.termsAccepted"
            type="checkbox"
            class="mt-1 rounded border-gray-300"
            required
          />

          <label
            for="terms"
            class="text-sm text-gray-700"
          >
            {{ $t('auth.register.terms.text') }}

            <NuxtLink
              to="#"
              class="text-blue-600 hover:underline"
            >
              {{ $t('auth.register.terms.terms') }}
            </NuxtLink>

            {{ ' a ' }}

            <NuxtLink
              to="#"
              class="text-blue-600 hover:underline"
            >
              {{ $t('auth.register.terms.privacy') }}
            </NuxtLink>
          </label>
        </div>

        <!-- SUBMIT -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isSubmitting">
            {{ $t('auth.register.buttons.register') }}
          </span>

          <span v-else>
            {{ $t('auth.register.buttons.registering') }}
          </span>
        </button>

        <!-- LOGIN -->
        <p class="text-center text-gray-600">
          {{ $t('auth.register.login.text') }}
          <NuxtLink
            :to="localePath('/auth/login')"
            class="text-blue-600 hover:underline font-medium"
          >
            {{ $t('auth.register.login.link') }}
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
  title: 'Registrácia | NTI',
  meta: [
    {
      name: 'description',
      content: 'Zaregistrujte sa v NTI a začnite s nami vašu cestu!',
    },
  ],
})

const authStore = useAuthStore()
const router = useRouter()
const api = useApi()
const localePath = useLocalePath()
const { addToast } = useToast()
const step = ref('type-selection')
const accountType = ref(null)
const isSubmitting = ref(false)

const formData = reactive({
  firstName: '',
  lastName: '',
  organizationName: '',
  email: '',
  password: '',
  password_confirmation: '',
  termsAccepted: false,
})

const errors = reactive({
  firstName: null,
  lastName: null,
  organizationName: null,
  email: null,
  password: null,
  password_confirmation: null,
})

const selectAccountType = (type) => {
  accountType.value = type
  step.value = 'register'
}

const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Heslo musí mať aspoň 8 znakov'
  }
  return null
}

const validateForm = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = null
  })

  let isValid = true

  if (accountType.value === 'student') {
    if (!formData.firstName) {
      errors.firstName = 'Meno je povinné'
      isValid = false
    }
    if (!formData.lastName) {
      errors.lastName = 'Priezvisko je povinné'
      isValid = false
    }
  } else if (accountType.value === 'organization') {
    if (!formData.organizationName) {
      errors.organizationName = 'Názov organizácie je povinný'
      isValid = false
    }
  }

  if (!formData.email) {
    errors.email = 'Email je povinný'
    isValid = false
  }

  if (!formData.password) {
    errors.password = 'Heslo je povinné'
    isValid = false
  }

  if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Heslá sa nezhodujú'
    isValid = false
  }

  if (!formData.termsAccepted) {
    addToast({ message: 'Musíte súhlasiť s podmienkami', type: 'warning' })
    isValid = false
  }

  return isValid
}

const submitRegistration = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const payload = {
      account_type: accountType.value,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      terms_accepted: formData.termsAccepted,
    }

    if (accountType.value === 'student') {
      payload.first_name = formData.firstName
      payload.last_name = formData.lastName
    } else {
      payload.organization_name = formData.organizationName
    }

    const response = await api.post('/auth/register', payload)

    // Ak registrácia vrátila token, prihlás užívateľa
    if (response.token) {
      await authStore.login(formData.email, formData.password)
      await router.push('/dashboard')
    } else {
      // Inak presmeruj na email verification
      await router.push({
        path: '/auth/verify-email',
        query: { email: formData.email },
      })
    }
  } catch (error) {
    addToast({ message: error.message || 'Chyba pri registrácii. Skúste neskôr.', type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>
