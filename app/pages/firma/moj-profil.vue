<template>
  <div class="max-w-lg mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-navy mb-1">Môj profil</h1>
      <p class="text-gray-500 text-sm">Upravte svoje osobné údaje</p>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="h-12 bg-gray-100 rounded-lg animate-pulse" />
      <div class="h-12 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <form v-else @submit.prevent="handleSave" class="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
      <h2 class="text-base font-semibold text-navy">Osobné údaje</h2>

      <div class="grid grid-cols-2 gap-4">
        <UiInput
          v-model="form.name"
          label="Meno"
          placeholder="Ján"
          required
          :error="errors.name"
        />
        <UiInput
          v-model="form.surname"
          label="Priezvisko"
          placeholder="Novák"
          required
          :error="errors.surname"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
        <input
          :value="authStore.user?.email"
          disabled
          type="email"
          class="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
        />
        <p class="text-xs text-gray-400 mt-1">E-mail nie je možné zmeniť</p>
      </div>

      <div v-if="saveSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
        Profil bol úspešne uložený.
      </div>
      <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {{ saveError }}
      </div>

      <div class="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <UiButton type="button" variant="danger" :disabled="isDeletingAccount" @click="deleteAccount">
          {{ isDeletingAccount ? 'Mažem účet...' : 'Vymazať účet' }}
        </UiButton>
        <div class="flex gap-3">
          <UiButton type="button" variant="secondary" @click="resetForm">Zrušiť</UiButton>
          <UiButton type="submit" :loading="isSaving">Uložiť zmeny</UiButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['partner'],
})

useHead({ title: 'Môj profil | NTI Firma' })

const authStore = useAuthStore()
const api = useApi()
const { addToast } = useToast()

const isLoading = ref(true)
const isSaving = ref(false)
const isDeletingAccount = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)

const form = reactive({ name: '', surname: '' })
const errors = reactive({ name: undefined as string | undefined, surname: undefined as string | undefined })

function loadForm() {
  form.name = authStore.user?.name ?? ''
  form.surname = authStore.user?.surname ?? ''
}

function resetForm() {
  loadForm()
  saveSuccess.value = false
  saveError.value = null
}

function validate() {
  errors.name = form.name.trim() ? undefined : 'Meno je povinné'
  errors.surname = form.surname.trim() ? undefined : 'Priezvisko je povinné'
  return !errors.name && !errors.surname
}

async function handleSave() {
  if (!validate()) return
  isSaving.value = true
  saveSuccess.value = false
  saveError.value = null
  try {
    await api.put('/profile', {
      name: form.name.trim(),
      surname: form.surname.trim(),
      email: authStore.user?.email,
      roles: authStore.user?.roles?.map((r: any) => r.id) ?? [],
    })
    await authStore.getCurrentUser()
    saveSuccess.value = true
    addToast({ message: 'Profil bol uložený.', type: 'success' })
  } catch (err: any) {
    saveError.value = err?.data?.message ?? err?.message ?? 'Uloženie zlyhalo.'
  } finally {
    isSaving.value = false
  }
}

async function deleteAccount() {
  const userId = authStore.user?.id
  if (!userId) return
  const confirmed = window.confirm('Naozaj chcete anonymizovať a vymazať účet? Túto akciu nie je možné vrátiť späť.')
  if (!confirmed) return
  isDeletingAccount.value = true
  try {
    await api.post(`/users/anonymize-user/${userId}`)
    authStore.$reset()
    addToast({ message: 'Účet bol anonymizovaný.', type: 'success' })
    await navigateTo('/auth/login')
  } catch (err: any) {
    addToast({ message: err?.data?.message ?? err?.message ?? 'Anonymizácia účtu zlyhala.', type: 'error' })
  } finally {
    isDeletingAccount.value = false
  }
}

onMounted(async () => {
  await authStore.getCurrentUser()
  loadForm()
  isLoading.value = false
})
</script>
