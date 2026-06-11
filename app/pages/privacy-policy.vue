<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto mt-10">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.title') }}</h1>
        <p class="text-lg text-slate-600">{{ $t('privacy_policy.subtitle') }}</p>
      </div>

      <!-- Content -->
      <div class="prose prose-slate max-w-none">
        <!-- Last Updated -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p class="text-sm text-slate-700 m-0">
            <strong>{{ $t('privacy_policy.last_updated') }}:</strong> {{ $t('privacy_policy.last_updated_date') }}
          </p>
        </div>

        <!-- Section 1: Introduction -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.introduction.title') }}</h2>
          <p class="text-slate-700 mb-4">{{ $t('privacy_policy.introduction.content') }}</p>
        </section>

        <!-- Section 2: Data Collection -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.collection.title') }}</h2>
          <p class="text-slate-700 mb-4">{{ $t('privacy_policy.collection.intro') }}</p>
          <ul class="list-disc list-inside text-slate-700 space-y-2">
            <li>{{ $t('privacy_policy.collection.personal_info') }}</li>
            <li>{{ $t('privacy_policy.collection.contact_info') }}</li>
            <li>{{ $t('privacy_policy.collection.usage_data') }}</li>
            <li>{{ $t('privacy_policy.collection.device_info') }}</li>
          </ul>
        </section>

        <!-- Section 3: Data Usage -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.usage.title') }}</h2>
          <p class="text-slate-700 mb-4">{{ $t('privacy_policy.usage.intro') }}</p>
          <ul class="list-disc list-inside text-slate-700 space-y-2">
            <li>{{ $t('privacy_policy.usage.provide_service') }}</li>
            <li>{{ $t('privacy_policy.usage.improve_service') }}</li>
            <li>{{ $t('privacy_policy.usage.communication') }}</li>
            <li>{{ $t('privacy_policy.usage.support') }}</li>
          </ul>
        </section>

        <!-- Section 4: Data Protection -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.protection.title') }}</h2>
          <p class="text-slate-700">{{ $t('privacy_policy.protection.content') }}</p>
        </section>

        <!-- Section 5: Your Rights -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.rights.title') }}</h2>
          <p class="text-slate-700 mb-4">{{ $t('privacy_policy.rights.intro') }}</p>
          <ul class="list-disc list-inside text-slate-700 space-y-2">
            <li>{{ $t('privacy_policy.rights.access') }}</li>
            <li>{{ $t('privacy_policy.rights.correction') }}</li>
            <li>{{ $t('privacy_policy.rights.deletion') }}</li>
            <li>{{ $t('privacy_policy.rights.objection') }}</li>
          </ul>
        </section>

        <!-- Section 6: Contact -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.contact.title') }}</h2>
          <p class="text-slate-700">
            {{ $t('privacy_policy.contact.content') }}
            <NuxtLink to="/kontakt" class="text-blue-600 hover:underline">
              {{ $t('privacy_policy.contact.link_text') }}
            </NuxtLink>
          </p>
        </section>

        <!-- Footer -->
        <div class="bg-slate-100 rounded-lg p-6 mt-8">
          <p class="text-sm text-slate-600 m-0">{{ $t('privacy_policy.footer') }}</p>
        </div>
      </div>

      <!-- Back to home -->
      <div class="text-center mt-12">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {{ $t('privacy_policy.back_home') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No middleware required - this is a public page
</script>

<style scoped>
.prose {
  color: inherit;
}

.prose strong {
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.prose h2 {
  color: rgb(15, 23, 42);
}

.prose ul {
  margin: 1rem 0;
}

.prose li {
  margin: 0.5rem 0;
}
</style>
