<template>
  <span
    :class="[
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
      statusClasses,
    ]"
  >
    <span
      class="w-2 h-2 rounded-full"
      :style="{ backgroundColor: statusColor }"
    ></span>
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) =>
      ['approved', 'pending', 'rejected', 'evaluating', 'active', 'draft', 'submitted', 'paused'].includes(value),
  },
})

const statusConfig = {
  approved: {
    label: 'Schválené',
    color: '#16803C',
    bgClass: 'bg-success-50 text-success-700',
  },
  pending: {
    label: 'Čaká na doplnenie',
    color: '#92400E',
    bgClass: 'bg-warning-50 text-warning-700',
  },
  rejected: {
    label: 'Zamietnuté',
    color: '#DC2626',
    bgClass: 'bg-danger-50 text-danger-700',
  },
  evaluating: {
    label: 'V hodnotení',
    color: '#0D5FBF',
    bgClass: 'bg-blue-50 text-blue-600',
  },
  active: {
    label: 'Aktívny projekt',
    color: '#7C3AED',
    bgClass: 'bg-purple-50 text-purple-700',
  },
  draft: {
    label: 'Draft',
    color: '#64748B',
    bgClass: 'bg-gray-50 text-gray-500 border border-gray-200',
  },
  submitted: {
    label: 'Podané',
    color: '#065F46',
    bgClass: 'bg-green-50 text-green-700',
  },
  paused: {
    label: 'Pozastavené',
    color: '#9A3412',
    bgClass: 'bg-gradient-to-r from-orange-50 to-orange-50 text-orange-700',
  },
}

const statusColor = computed(() => statusConfig[props.status]?.color || '#64748B')
const statusLabel = computed(() => statusConfig[props.status]?.label || props.status)
const statusClasses = computed(() => statusConfig[props.status]?.bgClass || 'bg-gray-50')
</script>
