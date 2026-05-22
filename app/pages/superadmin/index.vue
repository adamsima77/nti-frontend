<template></template>





<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['nti_superadmin'] 
})
</script>