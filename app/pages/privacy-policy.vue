<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
    

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-12">
        <div class="prose prose-slate max-w-none">
            <div class="text-center mb-10">
        <h1 class="text-4xl font-bold text-slate-900 mb-4 tracking-tight">{{ $t('privacy_policy.title') }}</h1>
        <p class="text-lg text-slate-600">{{ $t('privacy_policy.subtitle') }}</p>
      </div>
          
          

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.introduction.title') }}</h2>
            <p class="text-slate-700 mb-4 leading-relaxed">{{ $t('privacy_policy.introduction.content') }}</p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.collection.title') }}</h2>
            <p class="text-slate-700 mb-4 leading-relaxed">{{ $t('privacy_policy.collection.intro') }}</p>
            <ul class="list-disc list-inside text-slate-700 space-y-2">
              <li>{{ $t('privacy_policy.collection.personal_info') }}</li>
              <li>{{ $t('privacy_policy.collection.contact_info') }}</li>
              <li>{{ $t('privacy_policy.collection.usage_data') }}</li>
              <li>{{ $t('privacy_policy.collection.device_info') }}</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.usage.title') }}</h2>
            <p class="text-slate-700 mb-4 leading-relaxed">{{ $t('privacy_policy.usage.intro') }}</p>
            <ul class="list-disc list-inside text-slate-700 space-y-2">
              <li>{{ $t('privacy_policy.usage.provide_service') }}</li>
              <li>{{ $t('privacy_policy.usage.improve_service') }}</li>
              <li>{{ $t('privacy_policy.usage.communication') }}</li>
              <li>{{ $t('privacy_policy.usage.support') }}</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.protection.title') }}</h2>
            <p class="text-slate-700 leading-relaxed">{{ $t('privacy_policy.protection.content') }}</p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.rights.title') }}</h2>
            <p class="text-slate-700 mb-4 leading-relaxed">{{ $t('privacy_policy.rights.intro') }}</p>
            <ul class="list-disc list-inside text-slate-700 space-y-2">
              <li>{{ $t('privacy_policy.rights.access') }}</li>
              <li>{{ $t('privacy_policy.rights.correction') }}</li>
              <li>{{ $t('privacy_policy.rights.deletion') }}</li>
              <li>{{ $t('privacy_policy.rights.objection') }}</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ $t('privacy_policy.contact.title') }}</h2>
            <p class="text-slate-700 leading-relaxed">
              {{ $t('privacy_policy.contact.content') }}
              <NuxtLink :to="localePath('/kontakt')" class="text-blue-600 hover:text-blue-700 hover:underline font-medium ml-1">
                {{ $t('privacy_policy.contact.link_text') }}
              </NuxtLink>
            </p>
          </section>

          <div class="bg-slate-50 border border-slate-100 rounded-xl p-5 mt-8">
            <p class="text-sm text-slate-600 m-0 leading-relaxed">{{ $t('privacy_policy.footer') }}</p>
          </div>
        </div>
         <div class=" mt-10">
        <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {{ $t('privacy_policy.back_home') }}
        </NuxtLink>
      </div>
      </div>

     
    </div>
  </div>
</template>

<script setup lang="ts">
    const localePath = useLocalePath()
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