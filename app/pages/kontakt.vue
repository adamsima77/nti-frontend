<template>
  <UiToast />

  <section class="bg-white py-16 px-4 mt-30 shadow-2xl rounded-lg">
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy mb-4">
          {{ $t('contact.page.title') }}
        </h1>

        <p class="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto">
          {{ $t('contact.page.subtitle') }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Contact info -->
        <div class="flex-1 bg-gray-50 p-8 rounded-lg border border-gray-200">

          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6">
            {{ $t('contact.page.info.title') }}
          </h2>

          <div class="mb-4">
            <p class="text-xs sm:text-sm text-gray-400">
              {{ $t('contact.page.info.email') }}
            </p>

            <p class="text-sm sm:text-base md:text-lg text-blue-600 font-medium">
              info@nti.sk
            </p>
          </div>

          <div class="mb-4">
            <p class="text-xs sm:text-sm text-gray-400">
              {{ $t('contact.page.info.phone') }}
            </p>

            <p class="text-sm sm:text-base md:text-lg text-navy font-medium">
              +421 900 000 000
            </p>
          </div>

          <div class="mb-6">
            <p class="text-xs sm:text-sm text-gray-400">
              {{ $t('contact.page.info.address') }}
            </p>

            <p class="text-sm sm:text-base md:text-lg text-navy font-medium">
              Nitra, Slovensko
            </p>
          </div>

          <div class="w-full h-60 rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21227.500730949265!2d18.06898346631861!3d48.31366715207584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b3ee43b2f6763%3A0x75a567f979f5bed3!2sUniverzita%20Kon%C5%A1tant%C3%ADna%20Filozofa%20v%20Nitre!5e0!3m2!1ssk!2ssk!4v1774452992434!5m2!1ssk!2ssk"
              class="w-full h-full border-0"
            />
          </div>
        </div>

        <!-- Form -->
        <div class="flex-1 bg-white p-6 rounded-lg border border-gray-200">

          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6">
            {{ $t('contact.page.form.title') }}
          </h2>

          <form
            class="flex flex-col gap-4"
            @submit.prevent="handleSubmit"
          >

            <!-- Name -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">
                {{ $t('contact.page.form.fields.first_name') }}:
              </label>

              <input
                v-model="name"
                type="text"
                :placeholder="$t('contact.page.form.fields.first_name')"
                :class="inputClass(name, 2)"
                @blur="touched.name = true"
              />

              <span
                v-if="touched.name && name.length < 2"
                class="text-xs text-red-500"
              >
                {{ $t('contact.page.form.errors.min_2') }}
              </span>
            </div>

            <!-- Surname -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">
                {{ $t('contact.page.form.fields.last_name') }}:
              </label>

              <input
                v-model="surname"
                type="text"
                :placeholder="$t('contact.page.form.fields.last_name')"
                :class="inputClass(surname, 2)"
                @blur="touched.surname = true"
              />

              <span
                v-if="touched.surname && surname.length < 2"
                class="text-xs text-red-500"
              >
                {{ $t('contact.page.form.errors.min_2') }}
              </span>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">
                {{ $t('contact.page.form.fields.email') }}:
              </label>

              <input
                v-model="email"
                type="email"
                :placeholder="$t('contact.page.form.fields.email')"
                :class="inputClass(email, 1, true)"
                @blur="touched.email = true"
              />

              <span
                v-if="touched.email && !isValidEmail(email)"
                class="text-xs text-red-500"
              >
                {{ $t('contact.page.form.errors.invalid_email') }}
              </span>
            </div>

            <!-- Message -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">
                {{ $t('contact.page.form.fields.message') }}:
              </label>

              <textarea
                v-model="description"
                :placeholder="$t('contact.page.form.fields.message')"
                :class="inputClass(description, 10)"
                class="h-32"
                @blur="touched.description = true"
              />

              <span
                v-if="touched.description && description.length < 10"
                class="text-xs text-red-500"
              >
                {{ $t('contact.page.form.errors.min_10') }}
              </span>
            </div>

            <!-- GDPR -->
            <div class="flex flex-col gap-1">

              <label class="flex items-start gap-3 cursor-pointer group">

                <div class="relative mt-0.5 flex-shrink-0">

                  <input
                    v-model="consentAccepted"
                    type="checkbox"
                    class="sr-only peer"
                    @change="touched.consent = true"
                  />

                  <div
                    class="w-4 h-4 rounded border-2 transition-colors flex items-center justify-center"
                    :class="consentAccepted
                      ? 'bg-blue-600 border-blue-600'
                      : touched.consent
                        ? 'border-red-400'
                        : 'border-gray-300 group-hover:border-blue-400'"
                  >
                    <svg
                      v-if="consentAccepted"
                      class="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <span class="text-sm text-gray-600 leading-snug">
                  {{ $t('contact.page.form.consent.text') }}

                  <NuxtLink
                    to="/privacy-policy"
                    class="text-blue-600 hover:underline"
                  >
                    {{ $t('contact.page.form.consent.link') }}
                  </NuxtLink>
                </span>
              </label>

              <span
                v-if="touched.consent && !consentAccepted"
                class="text-xs text-red-500"
              >
                {{ $t('contact.page.form.errors.consent_required') }}
              </span>
            </div>

            <!-- Turnstile -->
            <div class="turnstile-wrapper">
              <NuxtTurnstile
                ref="turnstile"
                v-model="turnstileToken"
                :options="{
                  theme: 'light',
                  size: 'flexible'
                }"
                @error="resetTurnstile"
                @expired="resetTurnstile"
              />
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="submitting || !turnstileToken"
              class="bg-blue-600 cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base md:text-lg py-3 rounded-md transition"
            >
              {{
                submitting
                  ? $t('contact.page.form.submitting')
                  : $t('contact.page.form.button')
              }}
            </button>

          </form>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick } from 'vue'
import { createSubmission } from '../composables/modules/content/contact/createContactSubmission'
import { useToast } from '../composables/useToast'
import { fetchMeta } from '../composables/modules/content/meta_tags/fetchMetaByPageLang'
import { PageType } from '../composables/modules/content/enum/PageType'

const { metaTags } = fetchMeta(PageType.CONTACT)
const meta = computed(() => metaTags.value?.meta_tag_translations?.[0])

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: computed(() => meta.value?.title),
  description: computed(() => meta.value?.description),
  ogTitle: computed(() => meta.value?.og_title),
  ogDescription: computed(() => meta.value?.og_description),
  ogType: computed(() => meta.value?.og_type),
  ogUrl: computed(() => meta.value?.og_url),
  twitterCard: computed(() => meta.value?.twitter_card),
  twitterTitle: computed(() => meta.value?.twitter_title),
  twitterDescription: computed(() => meta.value?.twitter_description),
})

const { addToast } = useToast()
const { t } = useI18n()

const turnstile = ref(null)

const name = ref('')
const surname = ref('')
const email = ref('')
const description = ref('')
const consentAccepted = ref(false)
const submitting = ref(false)
const turnstileToken = ref('')

const touched = reactive({
  name: false,
  surname: false,
  email: false,
  description: false,
  consent: false,
})

const isValidEmail = (val) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const isValid = (val, min = 1, isEmail = false) => {
  if (isEmail) return isValidEmail(val)
  return val.trim().length >= min
}

const inputClass = (val, min = 1, isEmail = false) => [
  'p-3 text-sm sm:text-base border rounded-md focus:outline-none transition',
  val.length === 0
    ? 'border-gray-200 focus:border-blue-500'
    : isValid(val, min, isEmail)
      ? 'border-green-400 focus:border-green-500 bg-green-50'
      : 'border-red-400 focus:border-red-500 bg-red-50',
]

const isFormValid = () =>
  isValid(name.value, 2) &&
  isValid(surname.value, 2) &&
  isValidEmail(email.value) &&
  isValid(description.value, 10) &&
  consentAccepted.value &&
  !!turnstileToken.value

const resetTurnstile = () => {
  turnstileToken.value = ''

  nextTick(() => {
    turnstile.value?.reset?.()
  })
}

const resetForm = () => {
  name.value = ''
  surname.value = ''
  email.value = ''
  description.value = ''
  consentAccepted.value = false

  touched.name = false
  touched.surname = false
  touched.email = false
  touched.description = false
  touched.consent = false
}

const handleSubmit = async () => {
  touched.name = true
  touched.surname = true
  touched.email = true
  touched.description = true
  touched.consent = true

  if (!isFormValid()) {
    addToast({
      message: t('contact.page.form.errors.fill_all'),
      type: 'warning'
    })

    return
  }

  submitting.value = true

  try {
    await createSubmission({
      name: name.value,
      surname: surname.value,
      email: email.value,
      description: description.value,
      consent: consentAccepted.value,
      cf_turnstile_response: turnstileToken.value,
    })

    addToast({
      message: t('contact.page.form.success'),
      type: 'success'
    })

    resetForm()
    resetTurnstile()

  } catch (e) {

    resetTurnstile()

    addToast({
      message: t('contact.page.form.error'),
      type: 'error'
    })

  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.turnstile-wrapper {
  width: 100%;
  max-width: 330px;
  overflow: hidden;
}

.turnstile-wrapper :deep(iframe) {
  max-width: 100%;
}
</style>