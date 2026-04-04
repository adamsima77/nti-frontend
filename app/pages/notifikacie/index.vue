<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-navy mb-1">Notifikácie</h1>
      <p class="text-gray-500 text-sm">Prehľad vašich oznámení</p>
    </div>

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
          <button @click="toggleRead(notification.id)" class="text-xs text-gray-400 hover:text-gray-700">
            {{ notification.read ? 'Označiť ako neprečítané' : 'Označiť ako prečítané' }}
          </button>
        </div>
      </div>
      <div v-if="!filteredNotifications.length" class="p-8 text-center text-gray-400 text-sm">
        Žiadne notifikácie
      </div>
    </div>

    <div class="mt-4 text-right">
      <button
        @click="clearAll"
        class="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 transition"
      >
        Vymazať všetky
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, MessageSquare, Flag, Clock, ChevronRight, AlertTriangle } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal',
  //middleware: 'auth'
})

useHead({ title: 'Notifikácie | NTI' })


const authStore = useAuthStore()
const userRole = authStore.user?.role || 'student'

const availableTypes = [
  { value: 'project', label: 'Projekty' },
  { value: 'milestone', label: 'Míľniky' },
  { value: 'consultation', label: 'Konzultácie' },
  { value: 'system_alert', label: 'Systém' },
]

const notifications = ref([
  { id: 1, type: 'project', title: 'Nový projekt', message: 'EcoTrack priradený', date: '02.04.2026', read: false, roles: ['mentor', 'student'] },
  { id: 2, type: 'milestone', title: 'Míľnik čaká na schválenie', message: 'AI chatbot – MVP', date: '01.04.2026', read: false, roles: ['mentor', 'evaluator'] },
  { id: 3, type: 'consultation', title: 'Nová konzultácia', message: 'EcoTrack review', date: '28.03.2026', read: true, roles: ['mentor'] },
  { id: 4, type: 'system_alert', title: 'Údržba systému', message: 'Downtime 04.04.2026 02:00–04:00', date: '03.04.2026', read: false, roles: ['admin', 'superadmin', 'mentor', 'student'] },
])

const filterType = ref<'all' | string>('all')

const filteredNotifications = computed(() =>
  notifications.value.filter(n =>
    n.roles.includes(userRole) && (filterType.value === 'all' || n.type === filterType.value)
  )
)

const notificationIcon = (type: string) => {
  switch (type) {
    case 'project': return Users
    case 'milestone': return Flag
    case 'consultation': return MessageSquare
    case 'system_alert': return AlertTriangle
    default: return Clock
  }
}

const notificationColor = (type: string) => {
  switch (type) {
    case 'project': return 'bg-blue-600'
    case 'milestone': return 'bg-yellow-500'
    case 'consultation': return 'bg-purple-600'
    case 'system_alert': return 'bg-red-600'
    default: return 'bg-gray-400'
  }
}

const toggleRead = (id: number) => {
  const n = notifications.value.find(n => n.id === id)
  if (n) n.read = !n.read
}

const clearAll = () => { notifications.value = [] }
</script>
