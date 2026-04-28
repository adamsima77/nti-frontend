<template>
  <UiToast />
  <section class="bg-white py-16 px-4 mt-30 shadow-2xl rounded-lg">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy mb-4">{{ $t('contact.page.title') }}</h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto">
          {{ $t('contact.page.subtitle') }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1 bg-gray-50 p-8 rounded-lg border border-gray-200">
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6">{{ $t('contact.page.info.title') }}</h2>
          <div class="mb-4">
            <p class="text-xs sm:text-sm text-gray-400">{{ $t('contact.page.info.email') }}</p>
            <p class="text-sm sm:text-base md:text-lg text-blue-600 font-medium">info@nti.sk</p>
          </div>
          <div class="mb-4">
            <p class="text-xs sm:text-sm text-gray-400">{{ $t('contact.page.info.phone') }}</p>
            <p class="text-sm sm:text-base md:text-lg text-navy font-medium">+421 900 000 000</p>
          </div>
          <div class="mb-6">
            <p class="text-xs sm:text-sm text-gray-400">{{ $t('contact.page.info.address') }}</p>
            <p class="text-sm sm:text-base md:text-lg text-navy font-medium">Nitra, Slovensko</p>
          </div>
          <div class="w-full h-60 rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d21227.500730949265!2d18.06898346631861!3d48.31366715207584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b3ee43b2f6763%3A0x75a567f979f5bed3!2sUniverzita%20Kon%C5%A1tant%C3%ADna%20Filozofa%20v%20Nitre!5e0!3m2!1ssk!2ssk!4v1774452992434!5m2!1ssk!2ssk"
              class="w-full h-full border-0"
            />
          </div>
        </div>

        <div class="flex-1 bg-white p-8 rounded-lg border border-gray-200">
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-6">{{ $t('contact.page.form.title') }}</h2>

          <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">{{ $t('contact.page.form.fields.first_name') }}:</label>
              <input
                v-model="name"
                type="text"
                :placeholder="$t('contact.page.form.fields.first_name')"
                :class="inputClass(name, 2)"
                @blur="touched.name = true"
              />
              <span v-if="touched.name && name.length < 2" class="text-xs text-red-500">Minimálne 2 znaky</span>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">{{ $t('contact.page.form.fields.last_name') }}:</label>
              <input
                v-model="surname"
                type="text"
                :placeholder="$t('contact.page.form.fields.last_name')"
                :class="inputClass(surname, 2)"
                @blur="touched.surname = true"
              />
              <span v-if="touched.surname && surname.length < 2" class="text-xs text-red-500">Minimálne 2 znaky</span>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">{{ $t('contact.page.form.fields.email') }}:</label>
              <input
                v-model="email"
                type="email"
                :placeholder="$t('contact.page.form.fields.email')"
                :class="inputClass(email, 1, true)"
                @blur="touched.email = true"
              />
              <span v-if="touched.email && !isValidEmail(email)" class="text-xs text-red-500">Neplatný e-mail</span>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-500 font-bold">{{ $t('contact.page.form.fields.message') }}:</label>
              <textarea
                v-model="description"
                :placeholder="$t('contact.page.form.fields.message')"
                :class="inputClass(description, 10)"
                class="h-32"
                @blur="touched.description = true"
              />
              <span v-if="touched.description && description.length < 10" class="text-xs text-red-500">Minimálne 10 znakov</span>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="bg-blue-600 cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base md:text-lg py-3 rounded-md transition"
            >
              {{ submitting ? 'Odosielam...' : $t('contact.page.form.button') }}
            </button>

          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { createSubmission } from '../composables/modules/content/contact/createContactSubmission'
import { useToast } from '../composables/useToast'

useSeoMeta({
  title: 'Kontakt | NTI',
  description: 'Kontaktuj tím NTI. Máš otázky, návrhy alebo záujem o spoluprácu? Spoj sa s nami a radi ti pomôžeme.',
  ogTitle: 'Kontakt — NTI',
  ogDescription: 'Spoj sa s tímom NTI. Máš otázky? Chceš spolupracošvať? Napíš nám a odpovieme čo 24 hodín.',
  ogType: 'website',
  ogUrl: 'https://nti.sk/kontakt',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Kontakt — NTI',
  twitterDescription: 'Kontaktuj tím NTI. Máš otázky alebo záujem o spoluprácu?',
})

const { addToast } = useToast()

const name = ref('')
const surname = ref('')
const email = ref('')
const description = ref('')
const submitting = ref(false)

const touched = reactive({
  name: false,
  surname: false,
  email: false,
  description: false,
})

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

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
      : 'border-red-400 focus:border-red-500 bg-red-50'
]

const isFormValid = () =>
  isValid(name.value, 2) &&
  isValid(surname.value, 2) &&
  isValidEmail(email.value) &&
  isValid(description.value, 10)

const handleSubmit = async () => {
  touched.name = true
  touched.surname = true
  touched.email = true
  touched.description = true

  if (!isFormValid()) {
    addToast({ message: 'Vyplňte správne všetky polia.', type: 'warning' })
    return
  }

  submitting.value = true

  try {
    await createSubmission({
      name: name.value,
      surname: surname.value,
      email: email.value,
      description: description.value,
    })
    addToast({ message: 'Správa bola odoslaná!', type: 'success' })
    name.value = ''
    surname.value = ''
    email.value = ''
    description.value = ''
    touched.name = false
    touched.surname = false
    touched.email = false
    touched.description = false
  } catch (e) {
    addToast({ message: 'Nastala chyba, skúste znova.', type: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>