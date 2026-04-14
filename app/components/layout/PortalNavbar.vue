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
          @click="setLocale('en')"
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          :title="$t('locale.en_title')"
        >
          EN
        </button>
        <button
          @click="setLocale('sk')"
          :class="[
            'px-2 py-1 text-xs font-medium rounded transition-colors duration-200',
            locale === 'sk' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          :title="$t('locale.sk_title')"
        >
          SK
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 md:gap-4" ref="dropdownRef">
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
          <NuxtLink to = "/notifikacie" @click = "showNotifications = false"><p class="font-medium text-sm">{{ $t('portal.notifications') }}</p></NuxtLink>
          <button
            :class="{'text-blue-500 text-xs sm:text-sm hover:underline': unreadCount > 0,
                     'text-gray-500 text-xs sm:text-sm': unreadCount === 0}"
            @click="markAllAsRead"
          >
            {{ $t('portal.mark_all_read') }}
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div v-if="notifications.length === 0" class="p-4 text-xs sm:text-sm text-gray-500 text-center">
            {{ $t('portal.no_notifications') }}
          </div>
          <div v-else>
  <div
    v-for="(n, index) in notifications"
    :key="index"
    class="flex items-center justify-between px-4 py-3 text-xs sm:text-sm hover:bg-gray-50 border-b border-gray-100 active:scale-[0.99]"
  >
    
    <NuxtLink
      :to="n.link || ''"
      class="flex items-center justify-between w-full gap-2"
      @click = "showNotifications = false"
    >
      <div :class="n.read ? 'text-gray-500 text-xs sm:text-sm' : 'text-navy font-medium text-xs sm:text-sm'">
        {{ n.title }}
      </div>
      <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-navy transition-colors" />
    </NuxtLink>

   
   <button
  v-if="!n.read"
  @click.stop="markAsRead(index)"
  class="text-green-500 hover:text-green-600 ml-2"
  :title="$t('portal.mark_as_read')"
>
  <Check class="w-4 h-4" />
</button>
<button
  v-else
  @click.stop="toggleRead(index)"
  class="ml-2"
  :title="$t('portal.mark_as_unread')"
>
  <Check class="w-4 h-4 text-blue-400" />
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

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { Menu, Bell, LogOut, ChevronRight, Check } from 'lucide-vue-next'

const { setLocale, locale } = useI18n()

const props = defineProps({
  sidebarCollapsed: Boolean
})
const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()

const userName = computed(() => {
  const user = authStore.user
  if (!user) return ''
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
  if (user.organization_name) return user.organization_name
  return user.email || ''
})

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/auth/login')
}

const showNotifications = ref(false)
const notifications = ref([
  { title: 'New user registered', time: '2 min ago', read: false, link: '/users' },
  { title: 'Server restart scheduled', time: '10 min ago', read: false, link: '/status' },
  { title: 'Invoice paid', time: '1 hour ago', read: true, link: '/invoices' }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAsRead = (index) => {
  notifications.value[index].read = true
}

const markAllAsRead = () => {
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))
}

const dropdownRef = ref(null)

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showNotifications.value = false
  }
}

const toggleRead = (index) => {
  notifications.value[index].read = !notifications.value[index].read
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>