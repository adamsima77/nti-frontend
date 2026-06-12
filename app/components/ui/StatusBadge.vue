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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const props = defineProps<{
  status: string
}>()

const statusConfig: Record<string, { labelKey: string; color: string; bgClass: string }> = {
  // ── Applications / projects ────────────────────────────
  approved: {
    labelKey: 'status_labels.approved',
    color:    '#16803C',
    bgClass:  'bg-success-50 text-success-700',
  },
  pending: {
    labelKey: 'status_labels.pending',
    color:    '#92400E',
    bgClass:  'bg-warning-50 text-warning-700',
  },
  // Vyžiadané doplnenie — mapuje sem z mapStatusFromApi
  supplement: {
    labelKey: 'status_labels.supplement',
    color:    '#B45309',
    bgClass:  'bg-amber-50 text-amber-700 border border-amber-200',
  },
  rejected: {
    labelKey: 'status_labels.rejected',
    color:    '#DC2626',
    bgClass:  'bg-danger-50 text-danger-700',
  },
  evaluating: {
    labelKey: 'status_labels.evaluating',
    color:    '#0D5FBF',
    bgClass:  'bg-blue-50 text-blue-600',
  },
  active: {
    labelKey: 'status_labels.active',
    color:    '#16A34A',
    bgClass:  'bg-green-50 text-green-700',
  },
  draft: {
    labelKey: 'status_labels.draft',
    color:    '#64748B',
    bgClass:  'bg-gray-50 text-gray-500 border border-gray-200',
  },
  submitted: {
    labelKey: 'status_labels.submitted',
    color:    '#065F46',
    bgClass:  'bg-green-50 text-green-700',
  },
  paused: {
    labelKey: 'status_labels.paused',
    color:    '#9A3412',
    bgClass:  'bg-orange-50 text-orange-700',
  },
  onboarding: {
    labelKey: 'status_labels.onboarding',
    color:    '#2563EB',
    bgClass:  'bg-blue-50 text-blue-700 border border-blue-200',
  },
  active_project: {
    labelKey: 'status_labels.active_project',
    color:    '#16A34A',
    bgClass:  'bg-green-50 text-green-700 border border-green-200',
  },
  ended_project: {
    labelKey: 'status_labels.ended_project',
    color:    '#475569',
    bgClass:  'bg-slate-100 text-slate-700 border border-slate-200',
  },

  // ── CMS / partners ─────────────────────────────────────
  published: {
    labelKey: 'status_labels.published',
    color:    '#16A34A',
    bgClass:  'bg-green-50 text-green-700',
  },
  concept: {
    labelKey: 'status_labels.concept',
    color:    '#F59E0B',
    bgClass:  'bg-orange-50 text-orange-700',
  },

  // ── Assignments / tasks ────────────────────────────────
  matching: {
    labelKey: 'status_labels.matching',
    color:    '#7C3AED',
    bgClass:  'bg-purple-50 text-purple-700',
  },
  assigned: {
    labelKey: 'status_labels.assigned',
    color:    '#0369A1',
    bgClass:  'bg-sky-50 text-sky-700',
  },
  in_progress: {
    labelKey: 'status_labels.in_progress',
    color:    '#D97706',
    bgClass:  'bg-warning-50 text-warning-700',
  },
  completed: {
    labelKey: 'status_labels.completed',
    color:    '#16803C',
    bgClass:  'bg-success-50 text-success-700',
  },
  closed: {
    labelKey: 'status_labels.closed',
    color:    '#64748B',
    bgClass:  'bg-gray-100 text-gray-500',
  },

  // ── User account statuses ──────────────────────────────
  inactive: {
    labelKey: 'status_labels.inactive',
    color:    '#94A3B8',
    bgClass:  'bg-gray-100 text-gray-500',
  },
  pending_email: {
    labelKey: 'status_labels.pending_email',
    color:    '#D97706',
    bgClass:  'bg-amber-50 text-amber-700',
  },
  pending_onboarding: {
    labelKey: 'status_labels.pending_onboarding',
    color:    '#0D5FBF',
    bgClass:  'bg-blue-50 text-blue-600',
  },
  pending_approval: {
    labelKey: 'status_labels.pending_approval',
    color:    '#92400E',
    bgClass:  'bg-warning-50 text-warning-700',
  },
  banned: {
    labelKey: 'status_labels.banned',
    color:    '#DC2626',
    bgClass:  'bg-danger-50 text-danger-700',
  },
  anonymized: {
    labelKey: 'status_labels.anonymized',
    color:    '#94A3B8',
    bgClass:  'bg-gray-100 text-gray-400 border border-gray-200',
  },

  // ── Fallback slovenské stringy z API ──────────────────
  'Draft':                 { labelKey: 'status_labels.draft',            color: '#64748B', bgClass: 'bg-gray-50 text-gray-500 border border-gray-200' },
  'Publikované':           { labelKey: 'status_labels.published',        color: '#16A34A', bgClass: 'bg-green-50 text-green-700' },
  'V párovaní':            { labelKey: 'status_labels.matching',         color: '#7C3AED', bgClass: 'bg-purple-50 text-purple-700' },
  'Pridelené':             { labelKey: 'status_labels.assigned',         color: '#0369A1', bgClass: 'bg-sky-50 text-sky-700' },
  'V realizácii':          { labelKey: 'status_labels.in_progress',      color: '#D97706', bgClass: 'bg-warning-50 text-warning-700' },
  'Uzavreté':              { labelKey: 'status_labels.closed',           color: '#64748B', bgClass: 'bg-gray-100 text-gray-500' },
  'Čaká na schválenie':    { labelKey: 'status_labels.pending_approval', color: '#92400E', bgClass: 'bg-warning-50 text-warning-700' },
  'Podané':                { labelKey: 'status_labels.submitted',        color: '#0D5FBF', bgClass: 'bg-blue-50 text-blue-700' },
  'V hodnotení':           { labelKey: 'status_labels.evaluating',       color: '#0D5FBF', bgClass: 'bg-blue-50 text-blue-600' },
  'Vyžiadané doplnenie':   { labelKey: 'status_labels.supplement',       color: '#B45309', bgClass: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'Schválené':             { labelKey: 'status_labels.approved',         color: '#16803C', bgClass: 'bg-success-50 text-success-700' },
  'Zamietnuté':            { labelKey: 'status_labels.rejected',         color: '#DC2626', bgClass: 'bg-danger-50 text-danger-700' },
  'Dokončené':             { labelKey: 'status_labels.completed',        color: '#16803C', bgClass: 'bg-success-50 text-success-700' },
  'V riešení':             { labelKey: 'status_labels.in_progress',      color: '#D97706', bgClass: 'bg-warning-50 text-warning-700' },
  'Plánované':             { labelKey: 'status_labels.planned',          color: '#64748B', bgClass: 'bg-gray-50 text-gray-500 border border-gray-200' },
  'Vrátené na doplnenie':  { labelKey: 'status_labels.supplement',       color: '#B45309', bgClass: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'Onboarding':            { labelKey: 'status_labels.onboarding',       color: '#2563EB', bgClass: 'bg-blue-50 text-blue-700 border border-blue-200' },
  'Aktívny projekt':       { labelKey: 'status_labels.active_project',   color: '#16A34A', bgClass: 'bg-green-50 text-green-700 border border-green-200' },
  'Ukončené':              { labelKey: 'status_labels.ended_project',    color: '#475569', bgClass: 'bg-slate-100 text-slate-700 border border-slate-200' },
}

const cfg = computed(() => {
  return statusConfig[props.status] || {
    labelKey: `status_labels.${props.status}`,
    color: '#94A3B8',
    bgClass: 'bg-gray-50 text-gray-500 border border-gray-200',
  }
})

const statusColor   = computed(() => cfg.value.color)
const statusClasses = computed(() => cfg.value.bgClass)

const statusLabel = computed(() => {
  if (cfg.value.labelKey && te(cfg.value.labelKey)) {
    return t(cfg.value.labelKey)
  }
  return te(`status_labels.${props.status}`) ? t(`status_labels.${props.status}`) : (props.status || t('status_labels.unknown'))
})
</script>