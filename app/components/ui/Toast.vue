<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg', variantClasses[toast.type]]"
          role="alert"
        >
          <component
            :is="icons[toast.type]"
            class="w-5 h-5 shrink-0 mt-0.5"
          />
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            class="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors duration-200"
            aria-label="Zatvoriť"
            @click="removeToast(toast.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

const variantClasses = {
  success: 'bg-success-50 text-success-700 border-success-50',
  error: 'bg-danger-50 text-danger-700 border-danger-50',
  warning: 'bg-warning-50 text-warning-700 border-warning-50',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
