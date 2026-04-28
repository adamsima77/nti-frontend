<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="loader-ring" />
  </div>
</template>

<style scoped>
.loader-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid var(--color-blue-50);
  border-top-color: var(--color-blue-500);
  border-right-color: var(--color-blue-600);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>