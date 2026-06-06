<template>
  <button
    @click="open = true"
    class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-150"
  >
    <Send class="w-4 h-4" />
    Hromadný e-mail
  </button>

  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @mousedown.self="closeModal"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
          appear
        >
          <div
            v-if="open"
            class="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Send class="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 class="text-base font-semibold text-navy leading-tight">Hromadný e-mail</h2>
                  <p class="text-xs text-gray-400">Odoslať e-mail vybraným používateľom</p>
                </div>
              </div>
              <button
                @click="closeModal"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                :disabled="loading"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div v-if="success" class="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle class="w-7 h-7 text-green-600" />
              </div>
              <p class="text-base font-semibold text-navy mb-1">E-mail bol zaradený do fronty</p>
              <p class="text-sm text-gray-400 mb-6">Správy budú doručené príjemcom čoskoro.</p>
              <button
                @click="resetAndClose"
                class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Zavrieť
              </button>
            </div>

            <form v-else @submit.prevent="handleSubmit" novalidate>
              <div class="px-6 py-5 space-y-5">

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">
                    Výzva <span class="text-gray-400 font-normal ml-1">(voliteľné)</span>
                  </label>
                  <div class="relative">
                    <Layers class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      v-model="form.call_id"
                      class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      :class="fieldError('call_id') ? 'border-red-400' : 'border-gray-300'"
                      :disabled="loading || loadingOptions"
                    >
                      <option :value="null">— Všetky výzvy —</option>
                      <option v-for="call in calls.filter(Boolean)" :key="call?.id" :value="call?.id">
                        {{ call?.name }}
                      </option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="fieldError('call_id')" class="mt-1 text-xs text-red-500">{{ fieldError('call_id') }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">
                    Rola <span class="text-gray-400 font-normal ml-1">(voliteľné)</span>
                  </label>
                  <div class="relative">
                    <Users class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      v-model="form.role_id"
                      class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      :class="fieldError('role_id') ? 'border-red-400' : 'border-gray-300'"
                      :disabled="loading || loadingOptions"
                    >
                      <option :value="null">— Všetky roly —</option>
                      <option v-for="role in roles" :key="role?.id" :value="role?.id">
                        {{ role?.name }}
                      </option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="fieldError('role_id')" class="mt-1 text-xs text-red-500">{{ fieldError('role_id') }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">
                    Šablóna e-mailu <span class="text-red-500 ml-0.5">*</span>
                  </label>
                  <div class="relative">
                    <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      v-model="form.email_id"
                      class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      :class="fieldError('email_id') ? 'border-red-400' : 'border-gray-300'"
                      :disabled="loading || loadingOptions"
                    >
                      <option :value="null" disabled>Vyberte šablónu…</option>
                      <option v-for="tpl in emailTemplates" :key="tpl.id" :value="tpl.id">
                        {{ tpl.slug ? `${tpl.slug} – ${tpl.subject ?? tpl.name ?? ''}` : tpl.subject ?? tpl.name ?? `#${tpl.id}` }}
                      </option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="fieldError('email_id')" class="mt-1 text-xs text-red-500">{{ fieldError('email_id') }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">
                    Predmet <span class="text-red-500 ml-0.5">*</span>
                  </label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      v-model="form.subject"
                      type="text"
                      maxlength="2000"
                      placeholder="Zadajte predmet e-mailu…"
                      class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      :class="fieldError('subject') ? 'border-red-400' : 'border-gray-300'"
                      :disabled="loading"
                    />
                  </div>
                  <div class="flex justify-between mt-1">
                    <p v-if="fieldError('subject')" class="text-xs text-red-500">{{ fieldError('subject') }}</p>
                    <p class="text-xs text-gray-400 ml-auto">{{ form.subject.length }}/2000</p>
                  </div>
                </div>

                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                >
                  <div
                    v-if="apiError"
                    class="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs"
                  >
                    <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{{ apiError }}</span>
                  </div>
                </Transition>

              </div>

              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <button
                  type="button"
                  @click="closeModal"
                  :disabled="loading"
                  class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  :disabled="loading || loadingOptions"
                  class="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                  <Send v-else class="w-4 h-4" />
                  {{ loading ? 'Odosielam…' : 'Odoslať' }}
                </button>
              </div>
            </form>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import {
  Send, X, Users, Mail, FileText, ChevronDown,
  Layers, AlertCircle, CheckCircle, Loader2,
} from 'lucide-vue-next'

interface SelectOption { id: number; name: string }
interface EmailTemplateOption { id: number; slug?: string; subject?: string; name?: string }
interface FormState {
  call_id:  number | null
  role_id:  number | null
  subject:  string
  email_id: number | null
}
interface ValidationErrors {
  call_id?:  string
  role_id?:  string
  subject?:  string
  email_id?: string
}

const api = useApi()

const open            = ref(false)
const loading         = ref(false)
const loadingOptions  = ref(false)
const success         = ref(false)
const apiError        = ref<string | null>(null)
const errors          = ref<ValidationErrors>({})

const calls          = ref<SelectOption[]>([])
const roles          = ref<SelectOption[]>([])
const emailTemplates = ref<EmailTemplateOption[]>([])

const form = reactive<FormState>({
  call_id:  null,
  role_id:  null,
  subject:  '',
  email_id: null,
})

const fieldError = (key: keyof ValidationErrors) => errors.value[key] ?? null

function resetForm() {
  form.call_id  = null
  form.role_id  = null
  form.subject  = ''
  form.email_id = null
  errors.value   = {}
  apiError.value = null
  success.value  = false
}

function closeModal() {
  if (loading.value) return
  open.value = false
  setTimeout(resetForm, 200)
}

function resetAndClose() {
  open.value = false
  setTimeout(resetForm, 200)
}

function validate(): boolean {
  const e: ValidationErrors = {}
  if (!form.email_id)        e.email_id = 'Vyberte e-mailovú šablónu.'
  if (!form.subject.trim())  e.subject  = 'Predmet je povinný.'
  else if (form.subject.length > 2000) e.subject = 'Predmet môže mať najviac 2 000 znakov.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleSubmit() {
  apiError.value = null
  if (!validate()) return

  loading.value = true
  try {
    await api.post('/send-bulk-email', {
      ...(form.call_id  && { call_id:  form.call_id }),
      ...(form.role_id  && { role_id:  form.role_id }),
      subject:  form.subject.trim(),
      email_id: form.email_id,
    })
    success.value = true
  } catch (err: any) {
    if (err?.response?.status === 422) {
      const e = err?.response?.data?.errors ?? {}
      errors.value = {
        call_id:  e.call_id?.[0],
        role_id:  e.role_id?.[0],
        subject:  e.subject?.[0],
        email_id: e.email_id?.[0],
      }
    } else {
      apiError.value = err?.response?.data?.message ?? 'Nastala chyba. Skúste to znovu.'
    }
  } finally {
    loading.value = false
  }
}

// Watch template select to auto-populate subject inputs
watch(() => form.email_id, (newId) => {
  if (newId) {
    const activeTemplate = emailTemplates.value.find(t => t.id === newId)
    if (activeTemplate?.subject) {
      form.subject = activeTemplate.subject
    }
  }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) closeModal()
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)

  try {
    loadingOptions.value = true

    const [callsRes, rolesRes, templatesRes] = await Promise.all([
      api.get('/admin/calls'),
      api.get('/roles'),
      api.get('/fetch-all-templates'),
    ])

    calls.value = Array.isArray(callsRes)
      ? callsRes
      : callsRes.data?.data ?? callsRes.data ?? []

    roles.value = rolesRes.roles
      ?? rolesRes.data?.roles
      ?? rolesRes.data
      ?? []

    emailTemplates.value = templatesRes

    console.log('calls', calls.value)
    console.log('roles', roles.value)
    console.log('templates', emailTemplates.value)

  } catch (e) {
    console.error(e)
    apiError.value = 'Nepodarilo sa načítať možnosti.'
  } finally {
    loadingOptions.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>