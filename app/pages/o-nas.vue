<template>
  <section class="relative mt-20 bg-white py-16 sm:py-20 md:py-24 px-6 md:px-20 rounded-2xl shadow-xl overflow-hidden">
    <div class="relative z-10 flex flex-col gap-6">

      <!-- TEXT SECTION (STATIC - NO SKELETON NEEDED) -->
      <div class="space-y-6">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-navy leading-tight">
          {{ $t('about_nti.title') }}
        </h2>

        <p class="text-base sm:text-lg md:text-xl text-gray-500">
          {{ $t('about_nti.description') }}
        </p>

        <!-- CARDS (STATIC FROM I18N) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <UiInfoCard
            v-for="(item, index) in tm('about_nti.cards')"
            :key="index"
            :title="rt(item.title)"
            :description="rt(item.description)"
          />
        </div>
      </div>

      <!-- TEAM SECTION (ONLY API - HAS LOADING STATE) -->
      <div class="flex flex-col mt-10">
        
        <!-- LOADING -->
        <template v-if="members_pending">
          <div class="space-y-6">
            <UiSkeleton height="2rem" width="30%" />

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div
                v-for="i in 4"
                :key="'team-skeleton-' + i"
                class="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4"
              >
                <UiSkeleton variant="rect" class="w-20 h-20 rounded-full" />
                <UiSkeleton height="1rem" width="60%" />
                <UiSkeleton height="0.9rem" width="40%" />
              </div>
            </div>
          </div>
        </template>

        <!-- DATA -->
        <template v-else>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy mb-8">
            {{ $t('about_nti.team.title') }}
          </h2>

          <div
            v-if="members?.length"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <UiTeamCard
              v-for="(item, index) in members"
              :key="index"
              image=""
              :name="item?.name"
              :role="item?.site_member_translations?.[0]?.job_position"
            />
          </div>

          <!-- EMPTY STATE -->
          <div v-else class="text-gray-400 text-sm">
            No team members found.
          </div>
        </template>

      </div>

    </div>
  </section>
</template>

<script setup>
import { useMembers } from '../composables/modules/content/site_members/fetchSiteMembers'
import { fetchMeta } from '../composables/modules/content/meta_tags/fetchMetaByPageLang'
import { PageType } from '../composables/modules/content/enum/PageType'

const { metaTags } = fetchMeta(PageType.ABOUT)
const meta = computed(() => metaTags.value?.meta_tag_translations?.[0])

useSeoMeta({
  title: computed(() => meta.value?.title),
  description: computed(() => meta.value?.description),
  ogTitle: computed(() => meta.value?.og_title),
  ogDescription: computed(() => meta.value?.og_description),
  ogType: computed(() => meta.value?.og_type),
  ogUrl: computed(() => meta.value?.og_url),
  twitterCard: computed(() => meta.value?.twitter_card),
  twitterTitle: computed(() => meta.value?.twitter_title),
  twitterDescription: computed(() => meta.value?.twitter_description),
})

const { t } = useI18n() 
const { tm, rt } = useI18n()
const { members, pending: members_pending  } = useMembers()
</script>
