<!-- pages/mentor/index.vue -->
<template>
  <MentorDashboard />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: 'auth',
  roles: ['mentor'],
})

useHead({ title: 'Dashboard | NTI Mentor' })
</script>
