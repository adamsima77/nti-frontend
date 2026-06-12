<template>
  <div class="max-w-5xl mx-auto px-4 py-10">

    <!-- Page header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-navy mb-1">{{ $t('common.notifications')}}</h1>
        <p class="text-gray-500 text-sm">{{ $t('common.notifications_desc') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="emailModalOpen = true"
          v-if = "canSendEmail"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-150"
          >
          <Send class="w-4 h-4" />
          {{ $t('common.bulk') }}
        </button>
        
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        @click="filterType = 'all'"
        :class="filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-600 hover:text-white transition"
      >
        Všetky
      </button>
      <button
        v-for="type in availableTypes"
        :key="type.value"
        @click="filterType = type.value"
        :class="filterType === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
        class="px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-600 hover:text-white transition"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Notification list -->
    <div class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="flex justify-between items-start p-4 hover:bg-gray-50 transition relative"
        :class="notification.read ? 'opacity-70' : ''"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            :class="notificationColor(notification.type)"
          >
            <component :is="notificationIcon(notification.type)" class="w-5 h-5 text-white" />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-medium text-navy">{{ notification.title }}</p>
            <p class="text-xs text-gray-500">{{ notification.message }}</p>
            <p class="text-xs text-gray-400">{{ notification.date }}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button
            @click="toggleRead(notification.id)"
            class="text-xs text-gray-400 hover:text-gray-700"
          >
            {{ notification.read ? 'Označiť ako neprečítané' : 'Označiť ako prečítané' }}
          </button>
        </div>
      </div>
      <div v-if="!filteredNotifications.length" class="p-8 text-center text-gray-400 text-sm">
        Žiadne notifikácie
      </div>
    </div>

  </div>

  <!-- ── Bulk e-mail modal ────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"  leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div
        v-if="emailModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @mousedown.self="closeEmail"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"  leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-2"
          appear
        >
          <div v-if="emailModalOpen" class="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">

            <!-- Header -->
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
              <button @click="closeEmail" :disabled="email.loading" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Success -->
            <div v-if="email.success" class="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle class="w-7 h-7 text-green-600" />
              </div>
              <p class="text-base font-semibold text-navy mb-1">E-mail bol zaradený do fronty</p>
              <p class="text-sm text-gray-400 mb-6">Správy budú doručené príjemcom čoskoro.</p>
              <button @click="closeEmail" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Zavrieť</button>
            </div>

            <!-- Form -->
            <form v-if="!email.success" @submit.prevent="submitEmail" novalidate>
              <div class="px-6 py-5 space-y-5">

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Výzva <span class="text-gray-400 font-normal ml-1">(voliteľné)</span></label>
                  <div class="relative">
                    <Layers class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select v-model="email.form.call_id" :disabled="email.loading || loadingOptions" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" :class="email.errors.call_id ? 'border-red-400' : 'border-gray-300'">
                      <option :value="null">— Všetky výzvy —</option>
                      <option v-for="c in calls" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="email.errors.call_id" class="mt-1 text-xs text-red-500">{{ email.errors.call_id }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Rola <span class="text-gray-400 font-normal ml-1">(voliteľné)</span></label>
                  <div class="relative">
                    <Users class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select v-model="email.form.role_id" :disabled="email.loading || loadingOptions" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" :class="email.errors.role_id ? 'border-red-400' : 'border-gray-300'">
                      <option :value="null">— Všetky roly —</option>
                      <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="email.errors.role_id" class="mt-1 text-xs text-red-500">{{ email.errors.role_id }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Šablóna e-mailu <span class="text-red-500 ml-0.5">*</span></label>
                  <div class="relative">
                    <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select v-model="email.form.email_id" :disabled="email.loading || loadingOptions" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" :class="email.errors.email_id ? 'border-red-400' : 'border-gray-300'">
                      <option :value="null" disabled>Vyberte šablónu…</option>
                      <option v-for="t in emailTemplates" :key="t.id" :value="t.id">{{ t.subject }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="email.errors.email_id" class="mt-1 text-xs text-red-500">{{ email.errors.email_id }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Predmet <span class="text-red-500 ml-0.5">*</span></label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input v-model="email.form.subject" type="text" maxlength="2000" placeholder="Zadajte predmet e-mailu…" :disabled="email.loading" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" :class="email.errors.subject ? 'border-red-400' : 'border-gray-300'" />
                  </div>
                  <div class="flex justify-between mt-1">
                    <p v-if="email.errors.subject" class="text-xs text-red-500">{{ email.errors.subject }}</p>
                    <p class="text-xs text-gray-400 ml-auto">{{ email.form.subject.length }}/2000</p>
                  </div>
                </div>

                <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
                  <div v-if="email.apiError" class="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{{ email.apiError }}</span>
                  </div>
                </Transition>
              </div>

              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <button type="button" @click="closeEmail" :disabled="email.loading" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">Zrušiť</button>
                <button type="submit" :disabled="email.loading || loadingOptions" class="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                  <Loader2 v-if="email.loading" class="w-4 h-4 animate-spin" />
                  <Send v-else class="w-4 h-4" />
                  {{ email.loading ? 'Odosielam…' : 'Odoslať' }}
                </button>
              </div>
            </form>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Bulk notification modal ─────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"  leave-from-class="opacity-100" leave-to-class="opacity-0"
    >
      <div
        v-if="notifModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @mousedown.self="closeNotif"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95 translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"  leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-2"
          appear
        >
          <div v-if="notifModalOpen" class="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Bell class="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 class="text-base font-semibold text-navy leading-tight">Hromadná notifikácia</h2>
                  <p class="text-xs text-gray-400">Odoslať notifikáciu vybraným používateľom</p>
                </div>
              </div>
              <button @click="closeNotif" :disabled="notif.loading" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Success -->
            <div v-if="notif.success" class="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle class="w-7 h-7 text-green-600" />
              </div>
              <p class="text-base font-semibold text-navy mb-1">Notifikácia bola odoslaná</p>
              <p class="text-sm text-gray-400 mb-6">Príjemcovia ju uvidia vo svojich notifikáciách.</p>
              <button @click="closeNotif" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">Zavrieť</button>
            </div>

            <!-- Form -->
            <form v-if="!notif.success" @submit.prevent="submitNotif" novalidate>
              <div class="px-6 py-5 space-y-5">

                <!-- Category picker -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-2">Kategória <span class="text-red-500 ml-0.5">*</span></label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="cat in notifCategories" :key="cat.value" type="button"
                      @click="notif.form.category = cat.value" :disabled="notif.loading"
                      class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all"
                      :class="notif.form.category === cat.value
                        ? `${cat.activeClass} border-transparent ring-2 ring-offset-1 ${cat.ringClass}`
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                    >
                      <component :is="cat.icon" class="w-4 h-4 shrink-0" />
                      {{ cat.label }}
                    </button>
                  </div>
                  <p v-if="notif.errors.category" class="mt-1.5 text-xs text-red-500">{{ notif.errors.category }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Výzva <span class="text-gray-400 font-normal ml-1">(voliteľné)</span></label>
                  <div class="relative">
                    <Layers class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select v-model="notif.form.call_id" :disabled="notif.loading || loadingOptions" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" :class="notif.errors.call_id ? 'border-red-400' : 'border-gray-300'">
                      <option :value="null">— Všetky výzvy —</option>
                      <option v-for="c in calls" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="notif.errors.call_id" class="mt-1 text-xs text-red-500">{{ notif.errors.call_id }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Rola <span class="text-gray-400 font-normal ml-1">(voliteľné)</span></label>
                  <div class="relative">
                    <Users class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select v-model="notif.form.role_id" :disabled="notif.loading || loadingOptions" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" :class="notif.errors.role_id ? 'border-red-400' : 'border-gray-300'">
                      <option :value="null">— Všetky roly —</option>
                      <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
                    </select>
                    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p v-if="notif.errors.role_id" class="mt-1 text-xs text-red-500">{{ notif.errors.role_id }}</p>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Nadpis <span class="text-red-500 ml-0.5">*</span></label>
                  <div class="relative">
                    <Type class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input v-model="notif.form.title" type="text" maxlength="255" placeholder="Nadpis notifikácie…" :disabled="notif.loading" class="w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" :class="notif.errors.title ? 'border-red-400' : 'border-gray-300'" />
                  </div>
                  <div class="flex justify-between mt-1">
                    <p v-if="notif.errors.title" class="text-xs text-red-500">{{ notif.errors.title }}</p>
                    <p class="text-xs text-gray-400 ml-auto">{{ notif.form.title.length }}/255</p>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Správa <span class="text-red-500 ml-0.5">*</span></label>
                  <textarea v-model="notif.form.body" rows="3" maxlength="2000" placeholder="Text notifikácie…" :disabled="notif.loading" class="w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none" :class="notif.errors.body ? 'border-red-400' : 'border-gray-300'" />
                  <div class="flex justify-between mt-1">
                    <p v-if="notif.errors.body" class="text-xs text-red-500">{{ notif.errors.body }}</p>
                    <p class="text-xs text-gray-400 ml-auto">{{ notif.form.body.length }}/2000</p>
                  </div>
                </div>

                <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
                  <div v-if="notif.apiError" class="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{{ notif.apiError }}</span>
                  </div>
                </Transition>
              </div>

              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <button type="button" @click="closeNotif" :disabled="notif.loading" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">Zrušiť</button>
                <button type="submit" :disabled="notif.loading || loadingOptions" class="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                  <Loader2 v-if="notif.loading" class="w-4 h-4 animate-spin" />
                  <Bell v-else class="w-4 h-4" />
                  {{ notif.loading ? 'Odosielam…' : 'Odoslať' }}
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  Users, MessageSquare, Flag, AlertTriangle, Clock,
  Send, Bell, X, Mail, FileText, ChevronDown, Layers,
  AlertCircle, CheckCircle, Loader2, Type,
} from 'lucide-vue-next'

definePageMeta({ layout: 'portal', middleware: 'auth' })
useHead({ title: 'Notifikácie | NTI' })

// ── Shared select data (loaded once for both modals) ───────────────────────
interface SelectOption      { id: number; name: string }
interface EmailTemplateOption { id: number; subject: string; slug: string }

const authStore = useAuthStore()
const canSendEmail = computed(() => authStore.hasPermission('notifications.send_bulk_email_messages'))

const api = useApi()
const loadingOptions  = ref(false)
const calls           = ref<SelectOption[]>([])
const roles           = ref<SelectOption[]>([])
const emailTemplates  = ref<EmailTemplateOption[]>([])

async function fetchOptions() {
  loadingOptions.value = true
  try {
    const [callsRes, rolesRes, templatesRes] = await Promise.all([
      api.get('/calls'),
      api.get('/roles'),
      api.get('/fetch-all-templates'),
    ])
    calls.value          = callsRes
    roles.value          = rolesRes.roles
    emailTemplates.value = templatesRes
  } finally {
    loadingOptions.value = false
  }
}

// ── Existing notification list logic ───────────────────────────────────────
const availableTypes = [
  { value: 'project',      label: 'Projekty'     },
  { value: 'milestone',    label: 'Míľniky'      },
  { value: 'consultation', label: 'Konzultácie'  },
  { value: 'system_alert', label: 'Systém'       },
]

const { notifications: apiNotifications, fetchNotifications, markAsRead } = useNotifications()

const notifications = computed(() =>
  apiNotifications.value.map((n) => ({
    id:      n.id,
    type:    n.category ?? 'system_alert',
    title:   n.title,
    message: n.body,
    date:    n.createdAt ? new Date(n.createdAt).toLocaleDateString('sk-SK') : '',
    read:    n.read,
  })),
)

const filterType = ref<'all' | string>('all')

const filteredNotifications = computed(() =>
  notifications.value.filter((n) => filterType.value === 'all' || n.type === filterType.value),
)

const notificationIcon = (type: string) => {
  switch (type) {
    case 'project':      return Users
    case 'milestone':    return Flag
    case 'consultation': return MessageSquare
    case 'system_alert': return AlertTriangle
    default:             return Clock
  }
}

const notificationColor = (type: string) => {
  switch (type) {
    case 'project':      return 'bg-blue-600'
    case 'milestone':    return 'bg-yellow-500'
    case 'consultation': return 'bg-purple-600'
    case 'system_alert': return 'bg-red-600'
    default:             return 'bg-gray-400'
  }
}

const toggleRead = async (id: number) => {
  const n = notifications.value.find((item) => item.id === id)
  if (!n || n.read) return
  await markAsRead(id)
}

// ── Bulk e-mail modal ──────────────────────────────────────────────────────
const emailModalOpen = ref(false)

const email = reactive({
  loading:  false,
  success:  false,
  apiError: null as string | null,
  errors:   {} as Record<string, string | undefined>,
  form: {
    call_id:  null as number | null,
    role_id:  null as number | null,
    subject:  '',
    email_id: null as number | null,
  },
})

function resetEmail() {
  email.form     = { call_id: null, role_id: null, subject: '', email_id: null }
  email.errors   = {}
  email.apiError = null
  email.success  = false
}

function closeEmail() {
  if (email.loading) return
  emailModalOpen.value = false
  setTimeout(resetEmail, 200)
}

function validateEmail(): boolean {
  const e: Record<string, string> = {}
  if (!email.form.email_id)          e.email_id = 'Vyberte e-mailovú šablónu.'
  if (!email.form.subject.trim())    e.subject  = 'Predmet je povinný.'
  else if (email.form.subject.length > 2000) e.subject = 'Predmet môže mať najviac 2 000 znakov.'
  email.errors = e
  return Object.keys(e).length === 0
}

async function submitEmail() {
  email.apiError = null
  if (!validateEmail()) return
  email.loading = true
  try {
    await api.post('/send-bulk-email', {
      ...(email.form.call_id  && { call_id:  email.form.call_id }),
      ...(email.form.role_id  && { role_id:  email.form.role_id }),
      subject:  email.form.subject.trim(),
      email_id: email.form.email_id,
    })
    email.success = true
  } catch (err: any) {
    if (err?.response?.status === 422) {
      const e = err?.response?.data?.errors ?? {}
      email.errors = {
        call_id:  e.call_id?.[0],
        role_id:  e.role_id?.[0],
        subject:  e.subject?.[0],
        email_id: e.email_id?.[0],
      }
    } else {
      email.apiError = err?.response?.data?.message ?? 'Nastala chyba. Skúste to znovu.'
    }
  } finally {
    email.loading = false
  }
}

// ── Bulk notification modal ────────────────────────────────────────────────
const notifModalOpen = ref(false)

const notifCategories = [
  { value: 'project',      label: 'Projekty',     icon: Users,         activeClass: 'bg-blue-50 text-blue-700',   ringClass: 'ring-blue-400'   },
  { value: 'milestone',    label: 'Míľniky',      icon: Flag,          activeClass: 'bg-yellow-50 text-yellow-700', ringClass: 'ring-yellow-400' },
  { value: 'consultation', label: 'Konzultácie',  icon: MessageSquare, activeClass: 'bg-purple-50 text-purple-700', ringClass: 'ring-purple-400' },
  { value: 'system_alert', label: 'Systém',       icon: AlertTriangle, activeClass: 'bg-red-50 text-red-700',    ringClass: 'ring-red-400'    },
]

const notif = reactive({
  loading:  false,
  success:  false,
  apiError: null as string | null,
  errors:   {} as Record<string, string | undefined>,
  form: {
    category: null as string | null,
    call_id:  null as number | null,
    role_id:  null as number | null,
    title:    '',
    body:     '',
  },
})

function resetNotif() {
  notif.form     = { category: null, call_id: null, role_id: null, title: '', body: '' }
  notif.errors   = {}
  notif.apiError = null
  notif.success  = false
}

function closeNotif() {
  if (notif.loading) return
  notifModalOpen.value = false
  setTimeout(resetNotif, 200)
}

function validateNotif(): boolean {
  const e: Record<string, string> = {}
  if (!notif.form.category)        e.category = 'Vyberte kategóriu.'
  if (!notif.form.title.trim())    e.title    = 'Nadpis je povinný.'
  else if (notif.form.title.length > 255) e.title = 'Nadpis môže mať najviac 255 znakov.'
  if (!notif.form.body.trim())     e.body     = 'Správa je povinná.'
  else if (notif.form.body.length > 2000) e.body = 'Správa môže mať najviac 2 000 znakov.'
  notif.errors = e
  return Object.keys(e).length === 0
}

async function submitNotif() {
  notif.apiError = null
  if (!validateNotif()) return
  notif.loading = true
  try {
    await api.post('/notifications/send-bulk', {
      category: notif.form.category,
      title:    notif.form.title.trim(),
      body:     notif.form.body.trim(),
      ...(notif.form.call_id && { call_id: notif.form.call_id }),
      ...(notif.form.role_id && { role_id: notif.form.role_id }),
    })
    notif.success = true
  } catch (err: any) {
    if (err?.response?.status === 422) {
      const e = err?.response?.data?.errors ?? {}
      notif.errors = {
        category: e.category?.[0],
        call_id:  e.call_id?.[0],
        role_id:  e.role_id?.[0],
        title:    e.title?.[0],
        body:     e.body?.[0],
      }
    } else {
      notif.apiError = err?.response?.data?.message ?? 'Nastala chyba. Skúste to znovu.'
    }
  } finally {
    notif.loading = false
  }
}

// ── Escape key + lifecycle ─────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (emailModalOpen.value) closeEmail()
  if (notifModalOpen.value) closeNotif()
}

onMounted(() => {
  fetchNotifications()
 if (authStore.userRole === 'admin' || authStore.userRole === 'superadmin') {
       fetchOptions()
  }

  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>