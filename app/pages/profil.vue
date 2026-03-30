<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-navy mb-8">Môj profil</h1>

    <!-- Success alert -->
    <div
      v-if="showSuccess"
      class="mb-6 bg-success-50 border border-green-200 rounded-lg p-4 flex items-center gap-2"
    >
      <Check class="w-5 h-5 text-green-600" />
      <span class="text-sm text-green-700 font-medium">Profil bol úspešne uložený</span>
    </div>

    <!-- Profile header card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex items-center gap-6">
        <div
          class="w-16 h-16 rounded-full bg-navy text-white text-xl font-bold flex items-center justify-center flex-shrink-0"
        >
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="font-semibold text-navy text-lg">{{ form.firstName }} {{ form.lastName }}</h2>
          <p class="text-sm text-gray-500">{{ form.email }}</p>
        </div>
        <div class="flex items-center gap-4 flex-shrink-0">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
          >
            Študent
          </span>
          <div class="text-right">
            <div class="text-sm text-gray-500">3 tímy · 5 prihlášok</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form sections - full width, stacked -->
    <div class="space-y-6">
      <!-- Personal info -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-bold text-navy mb-5">Osobné údaje</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <UiInput
            v-model="form.firstName"
            label="Meno"
            required
          />
          <UiInput
            v-model="form.lastName"
            label="Priezvisko"
            required
          />
          <UiInput
            v-model="form.email"
            label="Email"
            type="email"
            disabled
          />
          <UiInput
            v-model="form.phone"
            label="Telefón"
            type="tel"
            placeholder="+421..."
          />
        </div>
      </div>

      <!-- Education -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-bold text-navy mb-5">Vzdelanie</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
          <UiSelect
            v-model="form.university"
            label="Univerzita"
            :options="universityOptions"
          />
          <UiSelect
            v-model="form.faculty"
            label="Fakulta"
            :options="facultyOptions"
          />
          <UiSelect
            v-model="form.year"
            label="Ročník"
            :options="yearOptions"
          />
        </div>
      </div>

      <!-- About + CV side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-navy mb-5">O mne</h2>
          <div class="space-y-5">
            <UiTextarea
              v-model="form.bio"
              label="Bio"
              placeholder="Krátky popis o vás..."
              :max-length="500"
              show-count
              :rows="6"
            />
            <UiInput
              v-model="form.linkedin"
              label="LinkedIn URL"
              type="url"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
        </div>

        <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 class="text-lg font-bold text-navy mb-4">Životopis</h3>
          <div
            class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer flex-1 flex flex-col items-center justify-center"
          >
            <Upload class="w-10 h-10 text-gray-300 mb-3" />
            <p class="text-sm text-gray-500 mb-1">Nahrajte svoj životopis</p>
            <p class="text-xs text-gray-400">.pdf, .docx</p>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-bold text-navy mb-5">Zručnosti</h2>
        <div
          v-if="form.skills.length"
          class="flex flex-wrap gap-2 mb-4"
        >
          <span
            v-for="(skill, i) in form.skills"
            :key="i"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600"
          >
            {{ skill }}
            <button
              type="button"
              class="hover:text-blue-800"
              @click="removeSkill(i)"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
        <div class="flex gap-2 max-w-md">
          <input
            v-model="newSkill"
            placeholder="Pridať zručnosť..."
            class="flex-1 px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @keydown.enter.prevent="addSkill"
          />
          <UiButton
            size="sm"
            variant="outline"
            @click="addSkill"
            >Pridať</UiButton
          >
        </div>
      </div>

      <!-- Save -->
      <div class="flex">
        <UiButton @click="saveProfile">Uložiť zmeny</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { X, Check, Upload } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
})

useHead({ title: 'Môj profil | NTI' })

const authStore = useAuthStore()

if (!authStore.user) {
  authStore.user = {
    id: 1,
    email: 'jan.novak@example.com',
    first_name: 'Ján',
    last_name: 'Novák',
    role: 'student',
  }
  authStore.token = 'mock-token'
}

const form = reactive({
  firstName: 'Ján',
  lastName: 'Novák',
  email: 'jan.novak@example.com',
  phone: '+421 912 345 678',
  university: 'SPU Nitra',
  faculty: 'FEM',
  year: '3',
  bio: 'Študent informatiky so záujmom o udržateľné technológie a IoT riešenia. Aktívne sa zapájam do hackathonov a študentských projektov.',
  linkedin: 'https://linkedin.com/in/jan-novak',
  skills: ['Vue.js', 'TypeScript', 'Node.js', 'IoT', 'Python'],
})

const newSkill = ref('')
const showSuccess = ref(false)

const universityOptions = [
  { value: 'SPU Nitra', label: 'SPU Nitra' },
  { value: 'UKF Nitra', label: 'UKF Nitra' },
  { value: 'STU Bratislava', label: 'STU Bratislava' },
  { value: 'UK Bratislava', label: 'UK Bratislava' },
]

const facultyOptions = [
  { value: 'FEM', label: 'Fakulta ekonomiky a manažmentu' },
  { value: 'FAPZ', label: 'Fakulta agrobiológie a potravinových zdrojov' },
  { value: 'FBP', label: 'Fakulta biotechnológie a potravinárstva' },
  { value: 'TF', label: 'Technická fakulta' },
]

const yearOptions = [
  { value: '1', label: '1. ročník Bc.' },
  { value: '2', label: '2. ročník Bc.' },
  { value: '3', label: '3. ročník Bc.' },
  { value: '4', label: '1. ročník Ing.' },
  { value: '5', label: '2. ročník Ing.' },
]

const userInitials = computed(() => {
  return `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase()
})

function addSkill() {
  const skill = newSkill.value.trim()
  if (skill && !form.skills.includes(skill)) {
    form.skills.push(skill)
    newSkill.value = ''
  }
}

function removeSkill(index: number) {
  form.skills.splice(index, 1)
}

function saveProfile() {
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}
</script>
