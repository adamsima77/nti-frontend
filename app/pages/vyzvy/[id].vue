<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- HERO -->
    <div class="bg-gradient-to-br from-navy via-blue-900 to-blue-800 text-white py-14 px-6">
      <div class="max-w-5xl mx-auto">
        <UiBreadcrumbs
            class="mb-6 [&_*]:text-white"
          :items="[
            { label: 'Výzvy', to: localePath('/vyzvy') },
            { label: call?.title ?? '...' }
          ]"
        />

        <template v-if="pending">
          <UiSkeleton height="2.5rem" width="60%" class="mb-3" />
          <UiSkeleton height="1.25rem" width="30%" />
        </template>

        <template v-else-if="call">
          <div class="flex items-center gap-3 mb-3">
            <span
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                call.status === 'open'
                  ? 'bg-green-400/20 text-green-200'
                  : 'bg-gray-400/20 text-gray-300'
              ]"
            >
              {{ call.status === 'open' ? '🟢 Otvorené' : '🔒 Zatvorené' }}
            </span>
            <span class="text-blue-300 text-sm">{{ call.programName }}</span>
          </div>
          <h1 class="text-3xl font-bold">{{ call.title }}</h1>
          <p class="text-blue-200 mt-2 text-sm">{{ call.organization }}</p>
        </template>
      </div>
    </div>

    <!-- BODY -->
    <div class="max-w-5xl mx-auto px-6 py-10 w-full flex-1">

      <!-- LOADING -->
      <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
            <UiSkeleton height="1.5rem" width="35%" />
            <UiSkeleton height="1rem" width="100%" />
            <UiSkeleton height="1rem" width="90%" />
            <UiSkeleton height="1rem" width="80%" />
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
            <UiSkeleton height="1.5rem" width="40%" />
            <UiSkeleton height="1rem" width="70%" />
            <UiSkeleton height="1rem" width="70%" />
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <UiSkeleton height="1.25rem" width="50%" />
          <UiSkeleton height="1rem" width="100%" />
          <UiSkeleton height="1rem" width="100%" />
          <UiSkeleton height="1rem" width="100%" />
          <UiSkeleton height="3rem" class="w-full rounded-lg mt-4" />
        </div>
      </div>

      <!-- NOT FOUND -->
      <div
        v-else-if="!call"
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-12"
      >
        <UiEmptyState
          :icon="AlertCircle"
          title="Výzva nenájdená"
          description="Táto výzva neexistuje alebo bola odstránená."
        />
      </div>

      <!-- CONTENT -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- LEFT -->
        <div class="lg:col-span-2 space-y-6">

          <!-- DESCRIPTION -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-xl font-bold text-navy mb-4">O výzve</h2>
            <p class="text-gray-700 leading-relaxed">{{ call.description }}</p>
          </div>

          <!-- DATES -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-xl font-bold text-navy mb-5">Termíny</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
                <Calendar class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">Začiatok prihlášok</p>
                  <p class="font-semibold text-navy">{{ formatDate(call.applicationStart) }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 rounded-lg bg-red-50">
                <Clock class="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-red-400 font-medium uppercase tracking-wide mb-1">Uzávierka prihlášok</p>
                  <p class="font-semibold text-navy">{{ formatDate(call.applicationDeadline) }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 rounded-lg bg-green-50">
                <Calendar class="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-green-500 font-medium uppercase tracking-wide mb-1">Začiatok projektu</p>
                  <p class="font-semibold text-navy">{{ formatDate(call.startDate) }}</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Clock class="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Koniec projektu</p>
                  <p class="font-semibold text-navy">{{ formatDate(call.endDate) }}</p>
                </div>
              </div>

            </div>
          </div>

          <!-- CRITERIA -->
          <div
            v-if="call.criteria?.length"
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <h2 class="text-xl font-bold text-navy mb-5">Kritériá hodnotenia</h2>
            <ul class="space-y-3">
              <li
                v-for="criterion in call.criteria"
                :key="criterion.id"
                class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium"
              >
                <span class="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                {{ criterion.name }}
              </li>
            </ul>
          </div>

        </div>

        <!-- RIGHT -->
        <div class="space-y-5">

          <!-- INFO CARD -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 class="text-base font-bold text-navy mb-5">Informácie o výzve</h2>

            <dl class="space-y-4 text-sm">

              <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <dt class="text-gray-500 flex items-center gap-2">
                  <BookOpen class="w-4 h-4" /> Program
                </dt>
                <dd class="font-medium text-navy text-right">{{ call.programName || '—' }}</dd>
              </div>

              <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <dt class="text-gray-500 flex items-center gap-2">
                  <Building class="w-4 h-4" /> Organizácia
                </dt>
                <dd class="font-medium text-navy text-right">{{ call.organization || '—' }}</dd>
              </div>

              <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <dt class="text-gray-500 flex items-center gap-2">
                  <Users class="w-4 h-4" /> Prihlášok
                </dt>
                <dd class="font-medium text-navy">{{ call.applicantsCount ?? 0 }}</dd>
              </div>

              <div class="flex justify-between items-center">
                <dt class="text-gray-500 flex items-center gap-2">
                  <Activity class="w-4 h-4" /> Stav
                </dt>
                <dd>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                      call.status === 'open'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ call.status === 'open' ? '🟢 Otvorené' : '🔒 Zatvorené' }}
                  </span>
                </dd>
              </div>

            </dl>

            <!-- CTA -->
            <div class="mt-6">
              <NuxtLink
                v-if="call.status === 'open'"
                :to="localePath('/student/prihlasky/nova')"
              >
                <button class="w-full px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  Prihlásiť sa
                  <ChevronRight class="w-4 h-4" />
                </button>
              </NuxtLink>

              <div
                v-else
                class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800"
              >
                <span class="font-semibold">Prihlášky sú zatvorené</span><br />
                Táto výzva už neprijíma nové prihlášky.
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar, Clock, Users, Building,
  AlertCircle, BookOpen, Activity, ChevronRight
} from 'lucide-vue-next'
import { useCall } from '../../composables/modules/programs/fetchCall'

const localePath = useLocalePath()

definePageMeta({ layout: 'default' })

const route = useRoute()
const { call, pending } = useCall(route.params.id as string)

useSeoMeta({
  title: computed(() => call.value ? `${call.value.title} | NTI` : 'Detail výzvy | NTI'),
  description: computed(() => call.value?.description ?? ''),
})

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('sk-SK')
}
</script>