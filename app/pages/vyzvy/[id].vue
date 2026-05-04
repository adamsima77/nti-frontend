<template>
      <!-- CONTENT -->
      <div class="max-w-5xl mx-auto px-6 py-10 w-full">

        <div class="mb-8">
          <UiBreadcrumbs class="mt-10"
            :items="[
              { label: 'Výzvy', to: localePath('/vyzvy') },
              { label: call?.title }
            ]"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div class="lg:col-span-2 space-y-8">

            <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 class="text-2xl font-bold text-navy mb-4">O výzve</h2>
              <p class="text-gray-700 text-lg leading-relaxed">
                {{ call?.description }}
              </p>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 class="text-2xl font-bold text-navy mb-6">Termín prihlášky</h2>

              <div class="space-y-4">

                <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <Calendar class="w-6 h-6 text-blue-600" />
                  <div>
                    <p class="text-sm text-gray-600">Začiatok</p>
                    <p class="font-semibold text-navy">
                      {{ formatDate(call?.applicationStart) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <Clock class="w-6 h-6 text-red-600" />
                  <div>
                    <p class="text-sm text-gray-600">Uzávierka</p>
                    <p class="font-semibold text-navy">
                      {{ formatDate(call?.applicationDeadline) }}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div class="space-y-6">

            <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">

              <h2 class="text-lg font-bold text-navy mb-5">Informácie</h2>

              <dl class="space-y-4">

                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">Program</dt>
                  <dd class="text-sm font-medium">{{ call?.programName }}</dd>
                </div>

                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">Stav</dt>
                  <dd class="text-sm font-medium">
                    {{ call?.status === 'open' ? 'Otvorené' : 'Zatvorené' }}
                  </dd>
                </div>

                <div class="flex justify-between">
                  <dt class="text-sm text-gray-600">Prihlášok</dt>
                  <dd class="text-sm font-medium">{{ call?.applicantsCount ?? 0 }}</dd>
                </div>

              </dl>

            </div>

            <div v-if="call?.status === 'open'">
              <NuxtLink :to="localePath('/student/prihlasky/nova')">
                <button class="w-full px-6 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  Prihlásiť sa
                </button>
              </NuxtLink>
            </div>

            <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">
                <span class="font-semibold">Prihlášky sú zatvorené</span><br />
                Táto výzva už neprijíma nové prihlášky.
              </p>
            </div>

          </div>

        </div>
      </div>
</template>

<script setup lang="ts">
import { Calendar, Clock, FileText, ArrowLeft, AlertCircle, Users, Building } from 'lucide-vue-next'
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