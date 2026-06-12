<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-6 py-10">

      <div class="mb-10">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
          {{ t('student_dashboard.home.milestone_title') }}
        </h1>
        <p class="mt-2 text-sm text-gray-500">
          {{ t('common.mile_sub') }}
        </p>
      </div>

      <div v-if="loading" class="space-y-6">
        <div
          v-for="n in 2"
          :key="n"
          class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div class="h-3 bg-gray-100 rounded w-1/4 mb-6" />
          <div class="space-y-4">
            <div v-for="m in 3" :key="m" class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
              <div class="flex-1 space-y-2 pt-1">
                <div class="h-3 bg-gray-200 rounded w-2/5" />
                <div class="h-3 bg-gray-100 rounded w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700"
      >
        Nepodarilo sa načítať míľniky. Skúste obnoviť stránku.
      </div>

      <div
        v-else-if="!calls.length"
        class="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center"
      >
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <p class="font-semibold text-gray-700 mb-1">Žiadne aktívne projekty</p>
        <p class="text-sm text-gray-400">Momentálne nemáte žiadne výzvy s míľnikmi.</p>
      </div>

      <div v-else class="space-y-8">
        <div
          v-for="call in calls"
          :key="call.id"
          class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div class="px-6 pt-6 pb-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <UiStatusBadge :status="call.status_of_call?.name" />
              </div>
              <h2 class="text-lg font-semibold text-gray-900 truncate">{{ call.name }}</h2>
              <p v-if="call.description" class="mt-0.5 text-sm text-gray-500 line-clamp-1">
                {{ call.description }}
              </p>

              <div 
                v-if="call.applications?.[0]?.mentorships && call.applications[0].mentorships.length"
                class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl"
              >
                <div
                  v-for="mentorship in call.applications[0].mentorships"
                  :key="mentorship.id"
                  v-show="mentorship.mentor"
                  class="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm"
                >
                  <div class="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center shrink-0 shadow-sm">
                    {{ mentorship.mentor?.name?.[0] ?? '' }}{{ mentorship.mentor?.surname?.[0] ?? '' }}
                  </div>
                  
                  <div class="min-w-0 flex-1">
                    <span class="inline-flex text-[9px] font-bold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 uppercase mb-0.5">
                      Pridelený Mentor
                    </span>
                    <h4 class="text-xs font-semibold text-gray-900 leading-tight truncate">
                      {{ mentorship.mentor?.name }} {{ mentorship.mentor?.surname }}
                    </h4>
                    <p class="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {{ mentorship.mentor?.email }}
                    </p>
                  </div>
                  
                  <div class="shrink-0">
                    <a
                      :href="`mailto:${mentorship.mentor?.email}`"
                      class="inline-flex items-center justify-center text-[10px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="shrink-0 text-right">
              <p class="text-xs text-gray-400 mb-0.5">Míľniky</p>
              <p class="text-2xl font-bold text-gray-900 leading-none">
                {{ call.milestones?.length ?? 0 }}
              </p>
            </div>
          </div>

          <div class="px-6 py-5">
            <div
              v-if="!call.milestones?.length"
              class="text-sm text-gray-400 italic py-2"
            >
              Táto výzva nemá žiadne míľniky.
            </div>

            <div v-else class="relative">
              <div
                v-if="call.milestones.length > 1"
                class="absolute left-[15px] top-5 bottom-5 w-px bg-gray-200"
              />

              <div class="space-y-5">
                <div
                  v-for="(milestone, index) in call.milestones"
                  :key="milestone.id"
                  class="relative flex gap-4"
                >
                  <div class="relative z-10 shrink-0">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white"
                      :class="milestoneNodeClass(milestone)"
                    >
                      <svg
                        v-if="milestone.milestone_status_id === 4 || milestone.milestone_status?.name === 'Schválené'"
                        class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <svg
                        v-if="milestone.milestone_status_id === 3 || milestone.milestone_status?.name === 'Dokončené'"
                        class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75l3 3m0 0l6-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg
                        v-if="milestone.milestone_status_id === 5 || milestone.milestone_status?.name === 'Zamietnuté'"
                        class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <svg
                        v-if="milestone.milestone_status_id === 6 || milestone.milestone_status?.name === 'Vrátené na doplnenie'"
                        class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span
                        v-else
                        class="text-xs font-bold"
                        :class="milestone.milestone_status_id === 2 || milestone.milestone_status?.name === 'V riešení' ? 'text-white' : 'text-gray-500'"
                      >
                      
                      </span>
                    </div>
                  </div>

                  <div
                    class="flex-1 min-w-0 rounded-xl border transition-colors"
                    :class="milestoneCardClass(milestone)"
                  >
                    <div class="px-4 py-3">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                          <p class="font-semibold text-sm text-gray-900 truncate">
                            {{ milestone.name ?? `Míľnik ${index + 1}` }}
                          </p>
                          <p
                            v-if="milestone.description"
                            class="mt-0.5 text-xs text-gray-500 line-clamp-2"
                          >
                            {{ milestone.description }}
                          </p>
                        </div>
                        <span
                          class="shrink-0 inline-flex text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap"
                          :class="milestoneStatusBadgeClass(milestone)"
                        >
                          {{ milestoneStatusLabel(milestone) }}
                        </span>
                      </div>

                      <div
                        v-if="milestone.deadline || milestone.start_date"
                        class="mt-2 flex items-center gap-1.5 text-xs text-gray-400"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                        </svg>
                        <template v-if="milestone.start_date">
                          Začiatok: {{ formatDate(milestone.start_date) }}
                          <span class="text-gray-300">|</span>
                        </template>
                        <template v-if="milestone.deadline">
                          Deadline: {{ formatDate(milestone.deadline) }}
                        </template>
                        <span v-if="isOverdue(milestone)" class="ml-1 text-red-500 font-medium">
                          · Po termíne
                        </span>
                        <span
                          v-else-if="milestone.start_date && new Date(milestone.start_date) > new Date()"
                          class="ml-1 text-blue-500 font-medium"
                        >
                          · Ešte nezačatý
                        </span>
                      </div>
                    </div>

                    <div
                      v-if="getDocuments(milestone).length"
                      class="border-t px-4 py-3"
                      :class="isVratenaNaDoplnenie(milestone) ? 'border-amber-100' : 'border-gray-100'"
                    >
                      <p class="text-xs font-medium mb-2" :class="isVratenaNaDoplnenie(milestone) ? 'text-amber-700' : 'text-gray-600'">
                        Nahrané prílohy
                      </p>
                      <div class="space-y-1.5">
                        <div
                          v-for="doc in getDocuments(milestone)"
                          :key="doc.id"
                          class="flex items-center justify-between rounded-lg border px-3 py-2"
                          :class="isVratenaNaDoplnenie(milestone)
                            ? 'border-amber-100 bg-amber-50/50'
                            : 'border-gray-100 bg-gray-50/60'"
                        >
                          <div class="flex items-center gap-2 min-w-0">
                            <svg
                              class="w-4 h-4 shrink-0"
                              :class="isVratenaNaDoplnenie(milestone) ? 'text-amber-500' : 'text-gray-400'"
                              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span class="text-xs text-gray-700 truncate">
                              {{ getDocFileName(doc) }}
                            </span>
                          </div>
                          <button
                            type="button"
                            class="shrink-0 flex items-center gap-1 text-xs font-medium transition-colors ml-3"
                            :class="isVratenaNaDoplnenie(milestone)
                              ? 'text-amber-700 hover:text-amber-900'
                              : 'text-indigo-600 hover:text-indigo-800'"
                            :disabled="downloadingDocs.has(doc.id)"
                            @click="downloadDocument(doc.id, getDocFileName(doc))"
                          >
                            <svg
                              v-if="downloadingDocs.has(doc.id)"
                              class="w-3.5 h-3.5 animate-spin"
                              fill="none" viewBox="0 0 24 24"
                            >
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Stiahnuť
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="milestone.comments && milestone.comments.length"
                      class="border-t border-gray-100 px-4 py-3 bg-gray-50/30"
                    >
                      <p class="text-xs font-medium text-gray-500 mb-2.5">
                        História riešenia a komentáre
                      </p>
                      <div class="space-y-3">
                        <div
                          v-for="comment in milestone.comments"
                          :key="comment.id"
                          class="bg-white border border-gray-150 rounded-xl p-3 shadow-sm"
                        >
                          <div class="flex items-center justify-between gap-2 mb-1.5">
                            <div class="flex items-center gap-1.5">
                              <div class="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                                {{ comment.user?.name?.[0] ?? 'Š' }}{{ comment.user?.surname?.[0] ?? '' }}
                              </div>
                              <span class="text-xs font-semibold text-gray-800">
                                {{ comment.user ? `${comment.user.name} ${comment.user.surname}` : 'Študent (Riešiteľ)' }}
                              </span>
                            </div>
                            <span class="text-[10px] text-gray-400">
                              {{ formatDate(comment.created_at) }}
                            </span>
                          </div>
                          <p class="text-xs text-gray-650 whitespace-pre-wrap leading-relaxed">
                            {{ comment.comment_text }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <template v-if="isVRieseni(milestone)">
                      <div class="border-t border-gray-100 px-4 py-3">

                        <template v-if="!isWithinDateRange(milestone)">
                          <p class="text-xs text-gray-400 italic flex items-center gap-1.5">
                            <svg class="w-4 h-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <template v-if="milestone.start_date && new Date(milestone.start_date) > new Date()">
                              Odovzdanie bude dostupné od {{ formatDate(milestone.start_date) }}.
                            </template>
                            <template v-else>
                              Termín odovzdania uplynul {{ formatDate(milestone.deadline!) }}.
                            </template>
                          </p>
                        </template>

                        <template v-else>
                          <button
                            type="button"
                            class="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            @click="toggleForm(milestone.id)"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            {{ formState[milestone.id]?.open ? 'Zavrieť formulár' : 'Odovzdať míľnik' }}
                          </button>

                          <div v-if="formState[milestone.id]?.open" class="mt-4 space-y-4">
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1.5">
                                Komentár <span class="text-red-500">*</span>
                              </label>
                              <textarea
                                v-model="formState[milestone.id].comment"
                                rows="4"
                                placeholder="Popíšte, čo ste vypracovali..."
                                class="w-full text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none placeholder-gray-400"
                              />
                            </div>

                            <div>
                              <UiFileUpload
                                v-model="formState[milestone.id].files"
                                label="Prílohy (voliteľné)"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                                :max-size="5"
                                :multiple="true"
                                description="Nahrajte súbory k odovzdaniu míľnika"
                                @error="(msg) => formState[milestone.id].fileError = msg"
                              />
                              <p v-if="formState[milestone.id].fileError" class="mt-1 text-xs text-red-600">
                                {{ formState[milestone.id].fileError }}
                              </p>
                            </div>

                            <p v-if="formState[milestone.id].submitError" class="text-xs text-red-600">
                              {{ formState[milestone.id].submitError }}
                            </p>

                            <div class="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                :disabled="formState[milestone.id].submitting || !formState[milestone.id].comment.trim()"
                                @click="submitAnswer(milestone)"
                              >
                                <svg
                                  v-if="formState[milestone.id].submitting"
                                  class="w-4 h-4 animate-spin"
                                  fill="none" viewBox="0 0 24 24"
                                >
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {{ formState[milestone.id].submitting ? 'Odosielam...' : 'Odovzdať na hodnotenie' }}
                              </button>
                              <button
                                type="button"
                                class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                @click="toggleForm(milestone.id)"
                              >
                                Zrušiť
                              </button>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>

                    <template v-else-if="isVratenaNaDoplnenie(milestone)">
                      <div class="border-t border-amber-100 px-4 py-3 space-y-3">

                        <template v-if="!isWithinDateRange(milestone)">
                          <p class="text-xs text-amber-700/70 italic flex items-center gap-1.5">
                            <svg class="w-4 h-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Termín doplnenia uplynul {{ formatDate(milestone.deadline!) }}.
                          </p>
                        </template>

                        <template v-else>
                          <button
                            type="button"
                            class="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                            @click="toggleForm(milestone.id)"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            {{ formState[milestone.id]?.open ? 'Zavrieť formulár' : 'Doplniť a znovu odovzdať' }}
                          </button>

                          <div v-if="formState[milestone.id]?.open" class="space-y-4">
                            <div>
                              <label class="block text-xs font-medium text-gray-700 mb-1.5">
                                Komentár / doplnenie <span class="text-red-500">*</span>
                              </label>
                              <textarea
                                v-model="formState[milestone.id].comment"
                                rows="4"
                                placeholder="Popíšte vykonané zmeny a doplnenia..."
                                class="w-full text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none placeholder-gray-400"
                              />
                            </div>

                            <div>
                              <UiFileUpload
                                v-model="formState[milestone.id].files"
                                label="Aktualizované prílohy (voliteľné)"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                                :max-size="5"
                                :multiple="true"
                                description="Nahrajte aktualizované súbory"
                                @error="(msg) => formState[milestone.id].fileError = msg"
                              />
                              <p v-if="formState[milestone.id].fileError" class="mt-1 text-xs text-red-600">
                                {{ formState[milestone.id].fileError }}
                              </p>
                            </div>

                            <p v-if="formState[milestone.id].submitError" class="text-xs text-red-600">
                              {{ formState[milestone.id].submitError }}
                            </p>

                            <div class="flex items-center gap-3 pt-1">
                              <button
                                type="button"
                                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                :disabled="formState[milestone.id].submitting || !formState[milestone.id].comment.trim()"
                                @click="submitAnswer(milestone)"
                              >
                                <svg
                                  v-if="formState[milestone.id].submitting"
                                  class="w-4 h-4 animate-spin"
                                  fill="none" viewBox="0 0 24 24"
                                >
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {{ formState[milestone.id].submitting ? 'Odosielam...' : 'Znovu odovzdať' }}
                              </button>
                              <button
                                type="button"
                                class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                @click="toggleForm(milestone.id)"
                              >
                                Zrušiť
                              </button>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="call.milestones?.length" class="px-6 pb-5">
            <div class="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Postup</span>
              <span>
                {{ completedCount(call.milestones) }} / {{ call.milestones.length }} dokončených
              </span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-indigo-500 rounded-full transition-all duration-500"
                :style="{ width: progressPercent(call.milestones) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

useHead({
  title: t('student_dashboard.home.milestone_title'),
})

definePageMeta({
  layout: 'portal',
  middleware: ['auth'],
  roles: ['student'],
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocumentVersion {
  id: number
  file_name: string
  file_path: string
}

interface MilestoneDocument {
  id: number
  latest_version?: DocumentVersion
  versions?: DocumentVersion[]
}

interface MilestoneStatusRelation {
  id?: number
  name: string
}

interface MilestoneComment {
  id: number
  milestone_id: number
  user_id: number
  comment_text: string
  created_at: string
  user?: {
    id: number
    name: string
    surname: string
  }
}

interface Milestone {
  id: number
  name?: string
  description?: string
  start_date?: string
  deadline?: string
  milestone_status_id: number
  milestone_status?: MilestoneStatusRelation
  documents?: MilestoneDocument[]
  comments?: MilestoneComment[]
}

interface CallStatus {
  name: string
}

interface MentorUser {
  id: number
  name: string
  surname: string
  email: string
  avatar_url?: string | null
}

interface Mentorship {
  id: number
  application_id: number
  mentor_user_id: number
  created_at: string
  mentor?: MentorUser
}

interface Application {
  id: number
  call_id: number
  team_id: number
  active_status: number
  academic_flag: boolean | null
  mentorships?: Mentorship[]
}

interface Call {
  id: number
  name: string
  description?: string
  status_of_call?: CallStatus
  milestones?: Milestone[]
  applications?: Application[]
}

interface FormState {
  open: boolean
  comment: string
  files: File[] | null
  fileError: string | null
  submitting: boolean
  submitError: string | null
}

// ─── Composables ─────────────────────────────────────────────────────────────

const api = useApi()

// ─── State ───────────────────────────────────────────────────────────────────

const calls = ref<Call[]>([])
const loading = ref(true)
const error = ref(false)
const formState = reactive<Record<number, FormState>>({})
const downloadingDocs = ref<Set<number>>(new Set())

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchMilestones() {
  loading.value = true
  error.value = false
  try {
    const data = await api.get('/fetch-student-milestones')
    calls.value = data ?? []
  } catch (err) {
    console.error('Chyba pri sťahovaní míľnikov:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchMilestones)

// ─── Document helpers ─────────────────────────────────────────────────────────

function getDocuments(milestone: Milestone): MilestoneDocument[] {
  return milestone.documents ?? []
}

function getDocFileName(doc: MilestoneDocument): string {
  if (doc.latest_version?.file_name) return doc.latest_version.file_name
  if (doc.versions?.length) {
    const sorted = [...doc.versions].sort((a, b) => b.id - a.id)
    return sorted[0].file_name
  }
  return `Dokument #${doc.id}`
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function ensureFormState(milestoneId: number) {
  if (!formState[milestoneId]) {
    formState[milestoneId] = {
      open: false,
      comment: '',
      files: null,
      fileError: null,
      submitting: false,
      submitError: null,
    }
  }
}

function toggleForm(milestoneId: number) {
  ensureFormState(milestoneId)
  const state = formState[milestoneId]
  state.open = !state.open
  if (!state.open) {
    state.comment = ''
    state.files = null
    state.fileError = null
    state.submitError = null
  }
}

async function submitAnswer(milestone: Milestone) {
  ensureFormState(milestone.id)
  const state = formState[milestone.id]

  if (!state.comment.trim()) return

  state.submitting = true
  state.submitError = null

  try {
    const fd = new FormData()
    fd.append('comment', state.comment.trim())

    if (Array.isArray(state.files)) {
      state.files.forEach(file => fd.append('files[]', file))
    }

    await api.post(`/update-milestone/${milestone.id}`, fd)

    state.open = false
    state.comment = ''
    state.files = null
    state.fileError = null

    await fetchMilestones()
  } catch (err: any) {
    console.error('Chyba pri odosielaní odpovede:', err)
    state.submitError = err?.data?.message ?? 'Nepodarilo sa odoslať odpoveď. Skúste znova.'
  } finally {
    state.submitting = false
  }
}

// ─── Download ────────────────────────────────────────────────────────────────

async function downloadDocument(docId: number, fileName?: string) {
  const current = new Set(downloadingDocs.value)
  current.add(docId)
  downloadingDocs.value = current

  try {
    const blob = await api.get(`/documents/${docId}/download`, {
      responseType: 'blob',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName ?? `dokument-${docId}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Chyba pri sťahovaní dokumentu:', err)
  } finally {
    const updated = new Set(downloadingDocs.value)
    updated.delete(docId)
    downloadingDocs.value = updated
  }
}

// ─── Status helpers ──────────────────────────────────────────────────────────

function getStatusKey(milestone: Milestone): string | number {
  if (milestone.milestone_status?.name) return milestone.milestone_status.name.trim()
  return milestone.milestone_status_id ?? 1
}

function isVRieseni(milestone: Milestone): boolean {
  const key = getStatusKey(milestone)
  return key === 2 || key === 'V riešení'
}

function isVratenaNaDoplnenie(milestone: Milestone): boolean {
  const key = getStatusKey(milestone)
  return key === 6 || key === 'Vrátené na doplnenie'
}

function isWithinDateRange(milestone: Milestone): boolean {
  const now = new Date()

  if (milestone.start_date && new Date(milestone.start_date) > now) {
    return false
  }

  if (milestone.deadline && new Date(milestone.deadline) < now) {
    return false
  }

  return true
}

function isOverdue(milestone: Milestone): boolean {
  if (!milestone.deadline) return false
  const key = getStatusKey(milestone)
  if (key === 4 || key === 'Schválené') return false
  if (key === 3 || key === 'Dokončené') return false
  return new Date(milestone.deadline) < new Date()
}

function completedCount(milestones: Milestone[]): number {
  return milestones.filter(m => {
    const key = getStatusKey(m)
    return key === 4 || key === 'Schválené'
  }).length
}

function progressPercent(milestones: Milestone[]): number {
  if (!milestones.length) return 0
  return Math.round((completedCount(milestones) / milestones.length) * 100)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Styling helpers ─────────────────────────────────────────────────────────

function milestoneNodeClass(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  switch (key) {
    case 4:
    case 'Schválené':            return 'bg-emerald-500'
    case 3:
    case 'Dokončené':            return 'bg-teal-500'
    case 5:
    case 'Zamietnuté':           return 'bg-red-500'
    case 6:
    case 'Vrátené na doplnenie': return 'bg-amber-500'
    case 2:
    case 'V riešení':            return 'bg-indigo-500'
    default:                     return 'bg-gray-200'
  }
}

// Modifikovaná verzia bez zbytočného vynechávania riadkov
function milestoneCardClass(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  switch (key) {
    case 4:
    case 'Schválené':            return 'border-emerald-200 bg-emerald-50/40'
    case 3:
    case 'Dokončené':            return 'border-teal-200 bg-teal-50/40'
    case 5:
    case 'Zamietnuté':           return 'border-red-200 bg-red-50/30'
    case 6:
    case 'Vrátené na doplnenie': return 'border-amber-200 bg-amber-50/40'
    case 2:
    case 'V riešení':            return 'border-indigo-200 bg-indigo-50/30'
    default:                     return 'border-gray-200 bg-gray-50/60'
  }
}

function milestoneStatusBadgeClass(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  switch (key) {
    case 4:
    case 'Schválené':            return 'bg-emerald-100 text-emerald-700'
    case 3:
    case 'Dokončené':            return 'bg-teal-100 text-teal-700'
    case 5:
    case 'Zamietnuté':           return 'bg-red-100 text-red-700'
    case 6:
    case 'Vrátené na doplnenie': return 'bg-amber-100 text-amber-800'
    case 2:
    case 'V riešení':            return 'bg-indigo-100 text-indigo-700'
    default:                     return 'bg-gray-100 text-gray-500'
  }
}

function milestoneStatusLabel(milestone: Milestone): string {
  const key = getStatusKey(milestone)
  if (typeof key === 'string') return key
  switch (key) {
    case 1: return 'Plánované'
    case 2: return 'V riešení'
    case 3: return 'Dokončené'
    case 4: return 'Schválené'
    case 5: return 'Zamietnuté'
    case 6: return 'Vrátené na doplnenie'
    default: return 'Neznámy'
  }
}
</script>