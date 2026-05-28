<template>
  <nav
    class="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 md:px-6 z-40 left-0 md:left-64 transition-all duration-300"
    :class="sidebarCollapsed ? 'md:!left-20' : ''"
  >
    <div class="flex items-center gap-3">
      <button
        class="md:hidden text-gray-600 hover:text-navy transition-colors"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="w-6 h-6" />
      </button>
      <div class="text-xs sm:text-sm text-gray-500">
        <slot name="breadcrumb" />
      </div>

      <!-- Locale Switcher - shown on md+ screens -->
      <div class="hidden md:flex items-center gap-1 ml-4">
        <button
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          :title="$t('locale.en_title')"
          @click="setLocale('en')"
        >
          EN
        </button>
        <button
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'sk' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          :title="$t('locale.sk_title')"
          @click="setLocale('sk')"
        >
          SK
        </button>
      </div>
    </div>

    <div
      ref="dropdownRef"
      class="flex items-center gap-2 sm:gap-3 md:gap-4"
    >
      <button
        class="text-gray-500 hover:text-navy transition-colors relative"
        @click="toggleNotifications"
      >
        <Bell class="w-5 h-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-danger-500 text-white text-[9px] sm:text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none"
        >
          {{ unreadCount }}
        </span>
      </button>

      <div
        v-if="showNotifications"
        class="absolute top-full right-0 mt-0 w-[calc(100vw-5rem)] sm:w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50"
      >
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <NuxtLink
            to="/notifikacie"
            @click="showNotifications = false"
            ><p class="font-medium text-sm">{{ $t('portal.notifications') }}</p></NuxtLink
          >
          <button
            :class="{
              'text-blue-500 text-xs sm:text-sm hover:underline': unreadCount > 0,
              'text-gray-500 text-xs sm:text-sm': unreadCount === 0,
            }"
            @click="markAllAsRead"
          >
            {{ $t('portal.mark_all_read') }}
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div
            v-if="notifications.length === 0"
            class="p-4 text-xs sm:text-sm text-gray-500 text-center"
          >
            {{ $t('portal.no_notifications') }}
          </div>
          <div v-else>
            <div
              v-for="n in notifications"
              :key="n.id"
              class="flex items-center justify-between px-4 py-3 text-xs sm:text-sm hover:bg-gray-50 border-b border-gray-100 active:scale-[0.99]"
            >
              <NuxtLink
                to="/notifikacie"
                class="flex flex-col flex-1 min-w-0 gap-0.5"
                @click="showNotifications = false"
              >
                <div :class="n.read ? 'text-gray-500 text-xs sm:text-sm' : 'text-navy font-medium text-xs sm:text-sm'">
                  {{ n.title }}
                </div>
                <p class="text-xs text-gray-400 truncate">{{ n.body }}</p>
              </NuxtLink>

              <button
                v-if="!n.read"
                class="text-green-500 hover:text-green-600 ml-2 shrink-0"
                :title="$t('portal.mark_as_read')"
                @click.stop="handleMarkAsRead(n.id)"
              >
                <Check class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <span class="hidden sm:inline text-sm font-medium text-navy truncate max-w-[120px] md:max-w-none">
        {{ userName }}
      </span>

      <button
        class="text-gray-500 hover:text-danger-600 transition-colors"
        :title="$t('portal.logout')"
        @click="handleLogout"
      >
        <LogOut class="w-5 h-5" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { Menu, Bell, LogOut, Check } from 'lucide-vue-next'
import { useNotifications } from '~/composables/useNotifications'

const { setLocale, locale } = useI18n()
const localePath = useLocalePath()

const props = defineProps({
  sidebarCollapsed: Boolean,
})
const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()

const userName = computed(() => {
  const user = authStore.user
  if (!user) return ''
  if (user.name && user.surname) return `${user.name} ${user.surname}`
  if (user.organization_name) return user.organization_name
  return user.email || ''
})

const handleLogout = async () => {
  await authStore.logout()
  navigateTo(localePath('/auth/login'))
}

const showNotifications = ref(false)
const {
  notifications,
  unreadCount,
  fetchNotifications,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
} = useNotifications()

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && !notifications.value.length) {
    await fetchNotifications()
  }
}

const handleMarkAsRead = async (id: number) => {
  try {
    await markNotificationAsRead(id)
  } catch {
    // useApi already surfaces errors
  }
}

const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
  } catch {
    // useApi already surfaces errors
  }
}

const dropdownRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (dropdownRef.value && target && !dropdownRef.value.contains(target)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
