<template>
  <span
    :class="[
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
      statusClasses,
    ]"
  >
    <span
      class="w-2 h-2 rounded-full shrink-0"
      :style="{ backgroundColor: statusColor }"
    />
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const statusConfig: Record<string, { label: string; color: string; bgClass: string }> = {
  // ── Applications / projects ────────────────────────────
  approved: {
    label:   'Schválené',
    color:   '#16803C',
    bgClass: 'bg-success-50 text-success-700',
  },
  pending: {
    label:   'Čaká na doplnenie',
    color:   '#92400E',
    bgClass: 'bg-warning-50 text-warning-700',
  },
  rejected: {
    label:   'Zamietnuté',
    color:   '#DC2626',
    bgClass: 'bg-danger-50 text-danger-700',
  },
  evaluating: {
    label:   'V hodnotení',
    color:   '#0D5FBF',
    bgClass: 'bg-blue-50 text-blue-600',
  },
  active: {
    label:   'Aktívny',
    color:   '#16A34A',
    bgClass: 'bg-green-50 text-green-700',
  },
  draft: {
    label:   'Draft',
    color:   '#64748B',
    bgClass: 'bg-gray-50 text-gray-500 border border-gray-200',
  },
  submitted: {
    label:   'Podané',
    color:   '#065F46',
    bgClass: 'bg-green-50 text-green-700',
  },
  paused: {
    label:   'Pozastavené',
    color:   '#9A3412',
    bgClass: 'bg-orange-50 text-orange-700',
  },

  // ── CMS / partners ─────────────────────────────────────
  published: {
    label:   'Publikované',
    color:   '#16A34A',
    bgClass: 'bg-green-50 text-green-700',
  },
  concept: {
    label:   'Koncept',
    color:   '#F59E0B',
    bgClass: 'bg-orange-50 text-orange-700',
  },

  // ── Assignments / tasks ────────────────────────────────
  matching: {
    label:   'V párovaní',
    color:   '#7C3AED',
    bgClass: 'bg-purple-50 text-purple-700',
  },
  assigned: {
    label:   'Pridelené',
    color:   '#0369A1',
    bgClass: 'bg-sky-50 text-sky-700',
  },
  in_progress: {
    label:   'V realizácii',
    color:   '#D97706',
    bgClass: 'bg-warning-50 text-warning-700',
  },
  completed: {
    label:   'Dokončené',
    color:   '#16803C',
    bgClass: 'bg-success-50 text-success-700',
  },
  closed: {
    label:   'Uzavreté',
    color:   '#64748B',
    bgClass: 'bg-gray-100 text-gray-500',
  },

  // ── User account statuses ──────────────────────────────

  inactive: {
    label:   'Neaktívny',
    color:   '#94A3B8',
    bgClass: 'bg-gray-100 text-gray-500',
  },
  pending_email: {
    label:   'Čaká na overenie emailu',
    color:   '#D97706',
    bgClass: 'bg-amber-50 text-amber-700',
  },
  pending_onboarding: {
    label:   'Čaká na onboarding',
    color:   '#0D5FBF',
    bgClass: 'bg-blue-50 text-blue-600',
  },
  pending_approval: {
    label:   'Čaká na schválenie',
    color:   '#92400E',
    bgClass: 'bg-warning-50 text-warning-700',
  },
  banned: {
    label:   'Zablokovaný',
    color:   '#DC2626',
    bgClass: 'bg-danger-50 text-danger-700',
  },
  anonymized: {
    label:   'Anonymizovaný',
    color:   '#94A3B8',
    bgClass: 'bg-gray-100 text-gray-400 border border-gray-200',
  },
}

const cfg = computed(() => statusConfig[props.status])

const statusColor   = computed(() => cfg.value?.color   ?? '#94A3B8')
const statusLabel   = computed(() => cfg.value?.label   ?? props.status)
const statusClasses = computed(() => cfg.value?.bgClass ?? 'bg-gray-50 text-gray-500')
</script>