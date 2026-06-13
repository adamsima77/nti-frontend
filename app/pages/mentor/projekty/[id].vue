<!-- pages/mentor/projekty/[id].vue -->
<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <div
      v-if="loading"
      class="mb-6 rounded-lg border border-gray-100 bg-white p-4 text-sm text-gray-500"
    >
      {{ t('mentor_project_detail_1.loading') }}
    </div>

    <div
      v-else-if="pageError"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ pageError }}
    </div>

    <!-- Back -->
    <NuxtLink
      :to="localePath('/mentor/projekty')"
      class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors mb-6"
    >
      <ChevronLeft class="w-4 h-4" /> {{ t('mentor_project_detail_1.back') }}
    </NuxtLink>

    <!-- Project header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-2xl font-bold text-navy">{{ project.name }}</h1>
          <UiStatusBadge :status="project.status" />
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            :class="project.program === 'Program A' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'"
          >
            {{ project.program }}
          </span>
        </div>
        <p class="text-gray-500 text-sm">
          {{ project.teamName }} · {{ t('mentor_project_detail_1.assignedAt', { date: project.assignedAt }) }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: milestones + consultations -->
      <div class="lg:col-span-2 space-y-6">

        <!-- ── Milestones ── -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-navy flex items-center gap-2">
              <Flag class="w-4 h-4 text-purple-500" /> {{ t('mentor_project_detail_1.milestones') }}
            </h2>
            <span class="text-xs text-gray-400">
              {{ completedMilestones }}/{{ project.milestones.length }} {{ t('mentor_project_detail_1.completed') }}
            </span>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-100">
            <div v-for="(def, slug) in MILESTONE_STATUS_DEFS" :key="slug" class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" :class="def.dot" />
              <span class="text-xs text-gray-500">{{ def.label }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="(milestone, milestoneIndex) in project.milestones"
              :key="milestone.id"
              class="border rounded-lg overflow-hidden transition-all"
              :class="milestoneCardClass(milestone.status)"
            >
              <!-- Main row -->
              <div class="p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3 min-w-0">
                    <!-- Status icon -->
                    <div class="mt-0.5 shrink-0">
                      <CheckCircle v-if="milestone.status === 'completed'" class="w-5 h-5 text-green-500" />
                      <RotateCcw v-else-if="milestone.status === 'returned'" class="w-5 h-5 text-orange-500" />
                      <XCircle v-else-if="milestone.status === 'rejected'" class="w-5 h-5 text-red-500" />
                      <Clock v-else-if="milestone.status === 'pending_approval'" class="w-5 h-5 text-amber-500" />
                      <PlayCircle v-else-if="milestone.status === 'in_progress'" class="w-5 h-5 text-blue-400" />
                      <Lock v-else class="w-5 h-5 text-gray-300" />
                    </div>

                    <div class="min-w-0">
                      <p class="font-medium text-navy text-sm">{{ milestone.title }}</p>
                      <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span class="text-xs font-medium" :class="MILESTONE_STATUS_DEFS[milestone.status]?.text ?? 'text-gray-400'">
                          {{ MILESTONE_STATUS_DEFS[milestone.status]?.label ?? milestone.status }}
                        </span>
                        <span v-if="milestone.dueDate" class="text-xs text-gray-400">
                          · {{ t('mentor_project_detail_1.dueDateLabel', { date: formatDate(milestone.dueDate) }) }}
                        </span>
                        <span v-else-if="milestone.status === 'pending'" class="text-xs text-gray-400 italic">
                          · {{ t('mentor_project_detail_1.noDeadlineYet') }}
                        </span>
                      </div>
                      <p v-if="milestone.description" class="text-xs text-gray-500 mt-1 line-clamp-2">
                        {{ milestone.description }}
                      </p>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">

                    <!-- PENDING: unlock button -->
                    <template v-if="milestone.status === 'pending'">
                      <button
                        v-if="canUnlockMilestone(milestoneIndex)"
                        @click="toggleUnlockPanel(milestone.id)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
                      >
                        <Unlock class="w-3.5 h-3.5" /> {{ t('mentor_project_detail_1.unlock') }}
                      </button>
                      <span v-else class="text-xs text-gray-400 italic">
                        {{ t('mentor_project_detail_1.prevNotDone') }}
                      </span>
                    </template>

                    <!-- PENDING_APPROVAL: approve / reject / return + deadline edit -->
                    <template v-if="milestone.status === 'pending_approval'">
                      <button
                        @click="handleMilestoneAction(milestone.id, 'approve')"
                        :disabled="milestoneLoading === milestone.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle class="w-3.5 h-3.5" /> {{ t('mentor_project_detail_1.approve') }}
                      </button>
                      <button
                        @click="toggleReturnPanel(milestone.id, 'return')"
                        :disabled="milestoneLoading === milestone.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <RotateCcw class="w-3.5 h-3.5" /> {{ t('mentor_project_detail_1.return') }}
                      </button>
                      <button
                        @click="toggleReturnPanel(milestone.id, 'reject')"
                        :disabled="milestoneLoading === milestone.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <X class="w-3.5 h-3.5" /> {{ t('mentor_project_detail_1.reject') }}
                      </button>
                      <button
                        @click="toggleDeadlinePanel(milestone.id)"
                        :disabled="milestoneLoading === milestone.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        :title="t('mentor_project_detail_1.editDeadline')"
                      >
                        <CalendarDays class="w-3.5 h-3.5" />
                      </button>
                    </template>

                    <!-- IN_PROGRESS: waiting indicator + deadline edit -->
                    <template v-if="milestone.status === 'in_progress'">
                      <span class="text-xs text-blue-500 italic flex items-center gap-1">
                        <Clock class="w-3 h-3" /> {{ t('mentor_project_detail_1.waitingForStudent') }}
                      </span>
                      <button
                        @click="toggleDeadlinePanel(milestone.id)"
                        :disabled="milestoneLoading === milestone.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        :title="t('mentor_project_detail_1.editDeadline')"
                      >
                        <CalendarDays class="w-3.5 h-3.5" />
                      </button>
                    </template>

                    <!-- RETURNED: waiting for resubmit + deadline edit -->
                    <template v-if="milestone.status === 'returned'">
                      <span class="text-xs text-orange-500 italic flex items-center gap-1">
                        <Clock class="w-3 h-3" /> {{ t('mentor_project_detail_1.waitingForResubmit') }}
                      </span>
                      <button
                        @click="toggleDeadlinePanel(milestone.id)"
                        :disabled="milestoneLoading === milestone.id"
                        class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                        :title="t('mentor_project_detail_1.editDeadline')"
                      >
                        <CalendarDays class="w-3.5 h-3.5" />
                      </button>
                    </template>

                  </div>
                </div>

                <!-- ── Documents ── -->
                <div
                  v-if="milestone.documents?.length"
                  class="ml-8 mt-3"
                >
                  <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Paperclip class="w-3 h-3" /> {{ t('mentor_project_detail_1.attachments', { n: milestone.documents.length }) }}
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="doc in milestone.documents"
                      :key="doc.id"
                      @click="downloadDocument(doc)"
                      :disabled="downloadingDocId === doc.id"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-xs text-gray-600 transition-colors disabled:opacity-50 group"
                      :title="latestFileName(doc)"
                    >
                      <svg
                        v-if="downloadingDocId === doc.id"
                        class="animate-spin w-3 h-3 text-gray-400 shrink-0"
                        fill="none" viewBox="0 0 24 24"
                      >
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <FileText v-else class="w-3 h-3 text-purple-400 shrink-0 group-hover:text-purple-600 transition-colors" />
                      <span class="max-w-[180px] truncate">{{ latestFileName(doc) }}</span>
                      <Download class="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                    </button>
                  </div>
                </div>

                <!-- Comments thread -->
                <div
                  v-if="milestone.comments.length"
                  class="ml-8 space-y-2 mt-3"
                >
                  <div
                    v-for="comment in milestone.comments"
                    :key="comment.id"
                    class="flex gap-2"
                  >
                    <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {{ (comment.author ?? '?')[0] }}
                    </div>
                    <div class="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <div class="flex items-center justify-between mb-0.5">
                        <span class="text-xs font-medium text-navy">{{ comment.author }}</span>
                        <span class="text-xs text-gray-400">{{ comment.date }}</span>
                      </div>
                      <p class="text-xs text-gray-600">{{ comment.text }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ── Unlock panel (pending → in_progress) ── -->
              <div
                v-if="unlockPanelId === milestone.id"
                class="border-t border-blue-100 bg-blue-50/60 px-4 py-3"
              >
                <p class="text-xs font-medium text-blue-700 mb-3 flex items-center gap-1.5">
                  <Unlock class="w-3.5 h-3.5" /> {{ t('mentor_project_detail_1.setDeadlineToUnlock') }}
                </p>
                <div class="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">
                      {{ t('mentor_project_detail_1.startDate') }}
                      <span class="text-gray-400 font-normal ml-1">({{ t('mentor_project_detail_1.optional') }})</span>
                    </label>
                    <input
                      v-model="unlockStartDate[milestone.id]"
                      type="date"
                      class="w-full px-3 py-2 rounded border border-blue-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-600 mb-1">
                      {{ t('mentor_project_detail_1.deadline') }}
                      <span class="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                      v-model="unlockDeadline[milestone.id]"
                      type="date"
                      :min="todayIso"
                      class="w-full px-3 py-2 rounded border border-blue-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <button
                    @click="confirmUnlock(milestone.id)"
                    :disabled="milestoneLoading === milestone.id || !unlockDeadline[milestone.id]"
                    class="px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    <svg v-if="milestoneLoading === milestone.id" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <Unlock v-else class="w-3 h-3" />
                    {{ t('mentor_project_detail_1.confirmUnlock') }}
                  </button>
                  <button
                    @click="unlockPanelId = null"
                    class="px-3 py-2 border border-gray-200 text-gray-500 rounded text-xs hover:bg-gray-50"
                  >
                    {{ t('mentor_project_detail_1.cancel') }}
                  </button>
                </div>
              </div>

              <!-- ── Deadline-only edit panel ── -->
              <div
                v-if="deadlinePanelId === milestone.id"
                class="border-t border-gray-200 bg-gray-50/60 px-4 py-3"
              >
                <p class="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <CalendarDays class="w-3.5 h-3.5" /> {{ t('mentor_project_detail_1.editDeadline') }}
                </p>
                <div class="flex items-end gap-3">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-600 mb-1">{{ t('mentor_project_detail_1.deadline') }}</label>
                    <input
                      v-model="editDeadline[milestone.id]"
                      type="date"
                      :min="todayIso"
                      class="w-full px-3 py-2 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    />
                  </div>
                  <button
                    @click="confirmDeadlineEdit(milestone.id)"
                    :disabled="milestoneLoading === milestone.id || !editDeadline[milestone.id]"
                    class="px-3 py-2 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    <svg v-if="milestoneLoading === milestone.id" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <CalendarDays v-else class="w-3 h-3" />
                    {{ t('mentor_project_detail_1.saveDeadline') }}
                  </button>
                  <button
                    @click="deadlinePanelId = null"
                    class="px-3 py-2 border border-gray-200 text-gray-500 rounded text-xs hover:bg-gray-50"
                  >
                    {{ t('mentor_project_detail_1.cancel') }}
                  </button>
                </div>
              </div>

              <!-- ── Return / Reject panel ── -->
              <div
                v-if="returnPanelId === milestone.id"
                class="border-t px-4 py-3"
                :class="returnPanelAction === 'return' ? 'border-orange-100 bg-orange-50/50' : 'border-red-100 bg-red-50/50'"
              >
                <p class="text-xs font-medium mb-2 flex items-center gap-1.5" :class="returnPanelAction === 'return' ? 'text-orange-700' : 'text-red-700'">
                  <RotateCcw v-if="returnPanelAction === 'return'" class="w-3.5 h-3.5" />
                  <X v-else class="w-3.5 h-3.5" />
                  {{ returnPanelAction === 'return' ? t('mentor_project_detail_1.returnReason') : t('mentor_project_detail_1.rejectReason') }}
                  <span class="font-normal text-gray-400">({{ t('mentor_project_detail_1.minChars', { n: 20 }) }})</span>
                </p>
                <textarea
                  v-model="returnComment[milestone.id]"
                  rows="3"
                  :placeholder="returnPanelAction === 'return' ? t('mentor_project_detail_1.returnPlaceholder') : t('mentor_project_detail_1.rejectPlaceholder')"
                  class="w-full px-3 py-2 rounded border text-xs focus:outline-none focus:ring-2 resize-none"
                  :class="returnPanelAction === 'return' ? 'border-orange-200 focus:ring-orange-400' : 'border-red-200 focus:ring-red-400'"
                />
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs text-gray-400 flex-1">
                    {{ (returnComment[milestone.id] ?? '').length }}/20+
                  </span>
                  <button
                    @click="returnPanelId = null"
                    class="px-3 py-1.5 border border-gray-200 text-gray-500 rounded text-xs hover:bg-gray-50"
                  >
                    {{ t('mentor_project_detail_1.cancel') }}
                  </button>
                  <button
                    @click="confirmReturnOrReject(milestone.id)"
                    :disabled="milestoneLoading === milestone.id || (returnComment[milestone.id] ?? '').trim().length < 20"
                    class="px-3 py-1.5 text-white rounded text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
                    :class="returnPanelAction === 'return' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'"
                  >
                    <svg v-if="milestoneLoading === milestone.id" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ returnPanelAction === 'return' ? t('mentor_project_detail_1.confirmReturn') : t('mentor_project_detail_1.confirmReject') }}
                  </button>
                </div>
              </div>

            </div>

            <div v-if="!project.milestones.length" class="text-center py-8 text-sm text-gray-400">
              {{ t('mentor_project_detail_1.noMilestones') }}
            </div>
          </div>
        </div>

        <!-- ── Consultation log ── -->
        <div class="bg-white rounded-lg border border-gray-100 p-6">
          <h2 class="text-base font-semibold text-navy flex items-center gap-2 mb-4">
            <MessageSquare class="w-4 h-4 text-purple-500" /> {{ t('mentor_project_detail_1.consultations') }}
          </h2>

          <div class="space-y-3">
            <div
              v-for="c in project.consultations"
              :key="c.id"
              class="border border-gray-100 rounded-lg p-4 transition-colors"
              :class="confirmDeleteId === c.id ? 'border-red-200 bg-red-50/40' : ''"
            >
              <!-- Normal view -->
              <template v-if="confirmDeleteId !== c.id">
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="min-w-0">
                    <p class="font-medium text-navy text-sm">{{ c.title }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span class="text-xs text-gray-400">{{ c.date }} · {{ c.duration }} min</span>
                      <span
                        class="text-xs px-1.5 py-0.5 rounded font-medium"
                        :class="c.type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'"
                      >
                        {{ consultationTypeLabel(c.type) }}
                      </span>
                    </div>
                    <a
                      v-if="c.type === 'online' && c.meetingUrl"
                      :href="c.meetingUrl"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1"
                    >
                      <ExternalLink class="w-3 h-3" /> {{ t('mentor_project_detail_1.joinMeeting') }}
                    </a>
                  </div>
                  <div v-if="canManageConsultations" class="flex items-center gap-1 shrink-0">
                    <button
                      @click="openEditConsultation(c)"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      :title="t('mentor_project_detail_1.editConsultation')"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click="confirmDeleteId = c.id"
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      :title="t('mentor_project_detail_1.deleteConsultation')"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p v-if="c.summary" class="text-sm text-gray-600 leading-relaxed mb-3">{{ c.summary }}</p>
                <div v-if="c.actionItems?.length" class="space-y-1">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t('mentor_project_detail_1.tasks') }}</p>
                  <ul class="space-y-1">
                    <li
                      v-for="item in c.actionItems"
                      :key="item"
                      class="flex items-start gap-2 text-xs text-gray-600"
                    >
                      <ArrowRight class="w-3 h-3 mt-0.5 text-purple-400 shrink-0" /> {{ item }}
                    </li>
                  </ul>
                </div>
              </template>

              <!-- Delete confirmation -->
              <template v-else>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle class="w-4 h-4 shrink-0" />
                    <span>{{ t('mentor_project_detail_1.deleteConfirm') }} <strong>{{ c.title }}</strong>?</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      @click="confirmDeleteId = null"
                      class="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      {{ t('mentor_project_detail_1.cancel') }}
                    </button>
                    <button
                      @click="deleteConsultation(c.id)"
                      :disabled="deletingConsultationId === c.id"
                      class="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <svg v-if="deletingConsultationId === c.id" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <Trash2 v-else class="w-3 h-3" />
                      {{ t('mentor_project_detail_1.deleteConfirmBtn') }}
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <div v-if="!project.consultations.length" class="text-center py-8 text-sm text-gray-400">
              {{ t('mentor_project_detail_1.noConsultations') }}
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right sidebar ── -->
      <div class="space-y-4">
        <!-- Team info -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('mentor_project_detail_1.team') }}</h3>
          <div class="space-y-2">
            <div v-for="member in project.teamMembers" :key="member.id" class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                {{ member.name.split(' ').map((n: string) => n[0]).join('') }}
              </div>
              <div>
                <p class="text-sm font-medium text-navy">{{ member.name }}</p>
                <p class="text-xs text-gray-400">{{ member.role }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress card -->
        <div class="bg-white rounded-lg border border-gray-100 p-5">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ t('mentor_project_detail_1.progress') }}</h3>
          <div class="text-3xl font-bold text-navy mb-1">{{ milestoneProgressPct }}%</div>
          <div class="bg-gray-100 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full bg-purple-500 transition-all"
              :style="{ width: `${milestoneProgressPct}%` }"
            />
          </div>
          <p class="text-xs text-gray-400">
            {{ t('mentor_project_detail_1.milestonesOf', { completed: completedMilestones, total: project.milestones.length }) }}
          </p>

          <div class="mt-3 space-y-1">
            <div
              v-for="(def, slug) in MILESTONE_STATUS_DEFS"
              :key="slug"
              class="flex items-center justify-between text-xs"
            >
              <span class="flex items-center gap-1.5 text-gray-500">
                <span class="w-1.5 h-1.5 rounded-full" :class="def.dot" />
                {{ def.label }}
              </span>
              <span class="font-medium text-gray-700">
                {{ project.milestones.filter(m => m.status === slug).length }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick stats -->
        <div class="bg-white rounded-lg border border-gray-100 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">{{ t('mentor_project_detail_1.statsTitle') }}</h3>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor_project_detail_1.consultations') }}</span>
            <span class="font-medium text-navy">{{ project.consultations.length }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor_project_detail_1.totalTime') }}</span>
            <span class="font-medium text-navy">{{ totalConsultationTime }} min</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor_project_detail_1.lastConsultation') }}</span>
            <span class="font-medium text-navy">{{ project.consultations[0]?.date ?? '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">{{ t('mentor_project_detail_1.program') }}</span>
            <span class="font-medium text-navy">{{ project.program }}</span>
          </div>
        </div>

        <!-- PO info (Program B) -->
        <div v-if="project.productOwner && project.productOwner.name" class="bg-purple-50 border border-purple-100 rounded-lg p-5">
          <h3 class="text-sm font-semibold text-purple-800 mb-2">{{ t('mentor_project_detail_1.productOwner') }}</h3>
          <p class="font-medium text-purple-900 text-sm">{{ project.productOwner.name }}</p>
          <p class="text-xs text-purple-600 mt-0.5">{{ project.productOwner.email }}</p>
          <p class="text-xs text-purple-600 mt-0.5">{{ project.productOwner.organization }}</p>
        </div>
      </div>
    </div>

    <!-- ── Edit consultation modal ── -->
    <div v-if="showConsultationModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/40" @click="closeConsultationModal" />
      <div class="relative bg-white rounded-xl shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-semibold text-navy text-lg">{{ t('mentor_project_detail_1.editConsultation') }}</h3>
          <button @click="closeConsultationModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <FormField
            :field="{
              name: 'title',
              type: 'text',
              label: t('mentor_project_detail_1.topic'),
              placeholder: t('mentor_project_detail_1.topicPlaceholder'),
              required: true,
            }"
            v-model="consultationForm.title"
            :error="consultationErrors.title ?? undefined"
          />

          <div class="grid grid-cols-3 gap-4">
            <FormField
              :field="{ name: 'date', type: 'date', label: t('mentor_project_detail_1.date'), required: true }"
              v-model="consultationForm.date"
              :error="consultationErrors.date ?? undefined"
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('mentor_project_detail_1.time') }}</label>
              <input
                v-model="consultationForm.time"
                type="time"
                class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('mentor_project_detail_1.duration') }}</label>
              <input
                v-model.number="consultationForm.duration"
                type="number"
                min="1"
                placeholder="60"
                class="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <FormField
            :field="{
              name: 'type',
              type: 'select',
              label: t('mentor_project_detail_1.type'),
              options: [
                { value: 'online',   label: t('mentor_project_detail_1.typeOnline') },
                { value: 'personal', label: t('mentor_project_detail_1.typePersonal') },
              ],
              required: true,
            }"
            v-model="consultationForm.type"
          />

          <div v-if="consultationForm.type === 'online'">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ t('mentor_project_detail_1.meetingUrl') }}
              <span class="text-gray-400 font-normal ml-1">({{ t('mentor_project_detail_1.optional') }})</span>
            </label>
            <div class="flex items-center gap-2">
              <Video class="w-4 h-4 text-gray-400 shrink-0" />
              <input
                v-model="consultationForm.meeting_url"
                type="url"
                :placeholder="t('mentor_project_detail_1.meetingUrlPlaceholder')"
                class="flex-1 px-3 py-2.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                :class="consultationErrors.meeting_url ? 'border-red-300' : ''"
              />
            </div>
            <p v-if="consultationErrors.meeting_url" class="mt-1 text-xs text-red-500">
              {{ consultationErrors.meeting_url }}
            </p>
          </div>

          <FormField
            :field="{
              name: 'summary',
              type: 'textarea',
              label: t('mentor_project_detail_1.record'),
              placeholder: t('mentor_project_detail_1.recordPlaceholder'),
              required: true,
            }"
            v-model="consultationForm.summary"
            :error="consultationErrors.summary ?? undefined"
          />
        </div>

        <div
          v-if="consultationError"
          class="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 shrink-0" /> {{ consultationError }}
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeConsultationModal"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            {{ t('mentor_project_detail_1.cancel') }}
          </button>
          <button
            @click="saveConsultation"
            :disabled="isSavingConsultation"
            class="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="isSavingConsultation" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ isSavingConsultation ? t('mentor_project_detail_1.saving') : t('mentor_project_detail_1.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  ChevronLeft, Flag, MessageSquare, CheckCircle, Clock, X,
  Pencil, Trash2, ArrowRight, AlertCircle, Lock, Unlock,
  PlayCircle, XCircle, RotateCcw, ExternalLink, Video, CalendarDays,
  FileText, Download, Paperclip,
} from 'lucide-vue-next'
import type { Consultation, MentorProject, Milestone, MilestoneComment } from '../../../types/mentor'
import { useMentorDashboard } from '../../../composables/useMentorDashboard'

definePageMeta({ layout: 'portal' })

const { t } = useI18n()
const localePath = useLocalePath()
const route      = useRoute()
const api        = useApi()
const { addToast } = useToast()
const authStore    = useAuthStore()
const { fetchProjects, fetchDashboard } = useMentorDashboard()

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

type MilestoneStatus = 'pending' | 'in_progress' | 'pending_approval' | 'completed' | 'rejected' | 'returned'

interface DocumentVersion {
  id: number
  document_id: number
  file_name: string
  file_path: string
}

interface MilestoneDocument {
  id: number
  owner_id: number
  security_classification_id: number
  created_at: string
  updated_at: string
  versions: DocumentVersion[]
  pivot?: { milestone_id: number; document_id: number }
}

interface MilestoneWithComments extends Milestone {
  status: MilestoneStatus
  comments: MilestoneComment[]
  documents: MilestoneDocument[]
}

type MentorProjectDetail = MentorProject & {
  productOwner?: { name: string; email?: string | null; organization?: string | null } | null
  teamMembers: Array<{ id: number; name: string; role: string }>
  consultations: Consultation[]
  milestones: MilestoneWithComments[]
}

// ──────────────────────────────────────────────────────────────
// Milestone status definitions  (computed so labels react to locale changes)
// ──────────────────────────────────────────────────────────────

const MILESTONE_STATUS_DEFS = computed(
  (): Record<MilestoneStatus, { label: string; dot: string; text: string }> => ({
    pending:          { label: t('mentor_project_detail_1.milestoneStatus.pending'),          dot: 'bg-gray-300',   text: 'text-gray-400' },
    in_progress:      { label: t('mentor_project_detail_1.milestoneStatus.inProgress'),       dot: 'bg-blue-400',   text: 'text-blue-500' },
    pending_approval: { label: t('mentor_project_detail_1.milestoneStatus.pendingApproval'),  dot: 'bg-amber-400',  text: 'text-amber-600' },
    completed:        { label: t('mentor_project_detail_1.milestoneStatus.completed'),        dot: 'bg-green-500',  text: 'text-green-600' },
    rejected:         { label: t('mentor_project_detail_1.milestoneStatus.rejected'),         dot: 'bg-red-500',    text: 'text-red-600' },
    returned:         { label: t('mentor_project_detail_1.milestoneStatus.returned'),         dot: 'bg-orange-400', text: 'text-orange-600' },
  }),
)

// ──────────────────────────────────────────────────────────────
// Consultation type mappings
// ──────────────────────────────────────────────────────────────

const FORM_TYPE_TO_API: Record<string, string> = {
  online:   'online',
  personal: 'offline',
  written:  'offline',
}

const API_TYPE_TO_FORM: Record<string, string> = {
  online:   'online',
  offline:  'personal',
  personal: 'personal',
  written:  'written',
}

// Computed so labels react to locale changes
const CONSULTATION_TYPE_LABELS = computed((): Record<string, string> => ({
  online:   t('mentor_project_detail_1.consultationType.online'),
  offline:  t('mentor_project_detail_1.consultationType.offline'),
  personal: t('mentor_project_detail_1.consultationType.personal'),
  written:  t('mentor_project_detail_1.consultationType.written'),
}))

useHead({ title: t('mentor_project_detail_1.pageTitle') })

// ──────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────

const loading   = ref(false)
const pageError = ref<string | null>(null)

const project = reactive<MentorProjectDetail>({
  id:            Number(route.params.id),
  name:          '',
  teamName:      '',
  program:       '',
  status:        'draft',
  assignedAt:    '',
  productOwner:  null,
  teamMembers:   [],
  milestones:    [],
  consultations: [],
})

const todayIso = new Date().toISOString().split('T')[0] ?? ''

// ──────────────────────────────────────────────────────────────
// Data loading
// ──────────────────────────────────────────────────────────────

const loadProject = async () => {
  loading.value   = true
  pageError.value = null
  try {
    const data = await api.get<MentorProjectDetail>(`/mentor/projects/${project.id}`)
    Object.assign(project, data)
  } catch {
    pageError.value = t('mentor_project_detail_1.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(loadProject)

// ──────────────────────────────────────────────────────────────
// Computed
// ──────────────────────────────────────────────────────────────

const completedMilestones = computed(
  () => project.milestones.filter((m) => m.status === 'completed').length,
)

const milestoneProgressPct = computed(() =>
  project.milestones.length
    ? Math.round((completedMilestones.value / project.milestones.length) * 100)
    : 0,
)

const totalConsultationTime = computed(() =>
  project.consultations.reduce((sum, c) => sum + (c.duration ?? 0), 0),
)

const canManageConsultations = computed(
  () =>
    authStore.hasPermission('mentorship.edit_any') ||
    authStore.hasPermission('mentorship.edit_own'),
)

// ──────────────────────────────────────────────────────────────
// Milestone helpers
// ──────────────────────────────────────────────────────────────

const milestoneLoading = ref<number | null>(null)

// ── Unlock panel ─────────────────────────────────────────────
const unlockPanelId   = ref<number | null>(null)
const unlockStartDate = reactive<Record<number, string>>({})
const unlockDeadline  = reactive<Record<number, string>>({})

// ── Deadline-only edit panel ──────────────────────────────────
const deadlinePanelId = ref<number | null>(null)
const editDeadline    = reactive<Record<number, string>>({})

// ── Return / Reject panel ────────────────────────────────────
const returnPanelId     = ref<number | null>(null)
const returnPanelAction = ref<'return' | 'reject'>('return')
const returnComment     = reactive<Record<number, string>>({})

const closeAllPanels = () => {
  unlockPanelId.value   = null
  deadlinePanelId.value = null
  returnPanelId.value   = null
}

const toggleUnlockPanel = (milestoneId: number) => {
  if (unlockPanelId.value === milestoneId) { closeAllPanels(); return }
  closeAllPanels()
  unlockPanelId.value = milestoneId
}

const toggleDeadlinePanel = (milestoneId: number) => {
  if (deadlinePanelId.value === milestoneId) { closeAllPanels(); return }
  closeAllPanels()
  deadlinePanelId.value = milestoneId
}

const toggleReturnPanel = (milestoneId: number, action: 'return' | 'reject') => {
  if (returnPanelId.value === milestoneId && returnPanelAction.value === action) {
    closeAllPanels(); return
  }
  closeAllPanels()
  returnPanelId.value     = milestoneId
  returnPanelAction.value = action
}

const canUnlockMilestone = (index: number): boolean => {
  if (index === 0) return true
  return project.milestones.slice(0, index).every(
    (m) => m.status === 'completed' || m.status === 'rejected',
  )
}

const milestoneCardClass = (status: MilestoneStatus): string =>
  ({
    pending:          'border-gray-100 bg-white',
    in_progress:      'border-blue-200 bg-blue-50/30',
    pending_approval: 'border-amber-200 bg-amber-50/30',
    completed:        'border-green-200 bg-green-50/30',
    rejected:         'border-red-200 bg-red-50/30',
    returned:         'border-orange-200 bg-orange-50/30',
  })[status] ?? 'border-gray-100 bg-white'

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('sk-SK')
}

// ──────────────────────────────────────────────────────────────
// Document helpers
// ──────────────────────────────────────────────────────────────

const downloadingDocId = ref<number | null>(null)

const latestFileName = (doc: MilestoneDocument): string =>
  doc.versions?.at(-1)?.file_name ?? `document-${doc.id}`

const downloadDocument = async (doc: MilestoneDocument) => {
  if (downloadingDocId.value === doc.id) return
  downloadingDocId.value = doc.id
  try {
    const blob = await api.get<Blob>(`/documents/${doc.id}/download`, {
      responseType: 'blob',
    })
    const url      = URL.createObjectURL(blob)
    const anchor   = document.createElement('a')
    anchor.href    = url
    anchor.download = latestFileName(doc)
    anchor.click()
    URL.revokeObjectURL(url)
  } catch {
    addToast({ message: t('mentor_project_detail_1.errors.downloadFailed'), type: 'error' })
  } finally {
    downloadingDocId.value = null
  }
}

// ──────────────────────────────────────────────────────────────
// Milestone actions
// ──────────────────────────────────────────────────────────────

const confirmUnlock = async (milestoneId: number) => {
  const deadline  = unlockDeadline[milestoneId]
  const startDate = unlockStartDate[milestoneId]

  if (!deadline) {
    addToast({ message: t('mentor_project_detail_1.errors.deadlineRequired'), type: 'error' })
    return
  }

  milestoneLoading.value = milestoneId
  try {
    await api.patch(`/mentor/projects/${project.id}/milestones/${milestoneId}`, {
      status:   'in_progress',
      deadline,
      ...(startDate ? { start_date: startDate } : {}),
    })
    closeAllPanels()
    await Promise.all([fetchProjects(), fetchDashboard()])
    await loadProject()
    addToast({ message: t('mentor_project_detail_1.milestoneUnlocked'), type: 'success' })
  } catch {
    addToast({ message: t('mentor_project_detail_1.errors.unlockFailed'), type: 'error' })
  } finally {
    milestoneLoading.value = null
  }
}

const confirmDeadlineEdit = async (milestoneId: number) => {
  const deadline = editDeadline[milestoneId]
  if (!deadline) {
    addToast({ message: t('mentor_project_detail_1.errors.deadlineRequired'), type: 'error' })
    return
  }

  milestoneLoading.value = milestoneId
  try {
    await api.patch(
      `/mentor/projects/${project.id}/milestones/${milestoneId}/dates`,
      { deadline },
    )
    closeAllPanels()
    delete editDeadline[milestoneId]
    await loadProject()
    addToast({ message: t('mentor_project_detail_1.deadlineUpdated'), type: 'success' })
  } catch {
    addToast({ message: t('mentor_project_detail_1.errors.actionFailed'), type: 'error' })
  } finally {
    milestoneLoading.value = null
  }
}

const handleMilestoneAction = async (milestoneId: number, _action: 'approve') => {
  milestoneLoading.value = milestoneId
  try {
    await api.patch(`/mentor/projects/${project.id}/milestones/${milestoneId}`, {
      status: 'completed',
    })
    await Promise.all([fetchProjects(), fetchDashboard()])
    await loadProject()
    addToast({ message: t('mentor_project_detail_1.milestoneApproved'), type: 'success' })
  } catch {
    addToast({ message: t('mentor_project_detail_1.errors.actionFailed'), type: 'error' })
  } finally {
    milestoneLoading.value = null
  }
}

const confirmReturnOrReject = async (milestoneId: number) => {
  const comment = (returnComment[milestoneId] ?? '').trim()
  if (comment.length < 20) {
    addToast({ message: t('mentor_project_detail_1.errors.rejectCommentRequired'), type: 'error' })
    return
  }

  milestoneLoading.value = milestoneId
  const apiStatus = returnPanelAction.value === 'return' ? 'returned' : 'rejected'

  try {
    await api.patch(`/mentor/projects/${project.id}/milestones/${milestoneId}`, {
      status:  apiStatus,
      comment,
    })
    returnComment[milestoneId] = ''
    closeAllPanels()
    await Promise.all([fetchProjects(), fetchDashboard()])
    await loadProject()
    addToast({
      message: returnPanelAction.value === 'return'
        ? t('mentor_project_detail_1.milestoneReturned')
        : t('mentor_project_detail_1.milestoneRejected'),
      type: 'success',
    })
  } catch {
    addToast({ message: t('mentor_project_detail_1.errors.actionFailed'), type: 'error' })
  } finally {
    milestoneLoading.value = null
  }
}

// ──────────────────────────────────────────────────────────────
// Consultation helpers
// ──────────────────────────────────────────────────────────────

const consultationTypeLabel = (type: string) => CONSULTATION_TYPE_LABELS.value[type] ?? type

const confirmDeleteId        = ref<number | null>(null)
const deletingConsultationId = ref<number | null>(null)

const deleteConsultation = async (consultationId: number) => {
  deletingConsultationId.value = consultationId
  try {
    await api.delete(`/mentor/projects/${project.id}/consultations/${consultationId}`)
    project.consultations = project.consultations.filter((c) => c.id !== consultationId)
    confirmDeleteId.value = null
    addToast({ message: t('mentor_project_detail_1.consultationDeleted'), type: 'success' })
  } catch {
    addToast({ message: t('mentor_project_detail_1.errors.deleteFailed'), type: 'error' })
  } finally {
    deletingConsultationId.value = null
  }
}

const showConsultationModal = ref(false)
const isSavingConsultation  = ref(false)
const consultationError     = ref<string | null>(null)
const editingConsultation   = ref<Consultation | null>(null)

const nowTime = new Date().toTimeString().slice(0, 5)

const consultationForm = reactive({
  title:       '',
  date:        todayIso,
  time:        nowTime,
  duration:    60 as number,
  type:        'online' as string,
  summary:     '',
  meeting_url: '',
})

const consultationErrors = reactive<Record<string, string | null>>({
  title:       null,
  date:        null,
  summary:     null,
  meeting_url: null,
})

const openEditConsultation = (c: Consultation) => {
  editingConsultation.value = c

  let parsedDate = todayIso
  let parsedTime = nowTime
  if (c.scheduledAt) {
    const dt = new Date(c.scheduledAt)
    if (!isNaN(dt.getTime())) {
      parsedDate = dt.toISOString().split('T')[0] ?? todayIso
      parsedTime = dt.toTimeString().slice(0, 5)
    }
  } else if (c.date) {
    parsedDate = c.date
  }

  Object.assign(consultationForm, {
    title:       c.title,
    date:        parsedDate,
    time:        parsedTime,
    duration:    c.duration,
    type:        API_TYPE_TO_FORM[c.type] ?? 'personal',
    summary:     c.summary ?? '',
    meeting_url: c.meetingUrl ?? '',
  })
  showConsultationModal.value = true
}

const closeConsultationModal = () => {
  showConsultationModal.value = false
  editingConsultation.value   = null
  consultationError.value     = null
  Object.assign(consultationForm, {
    title: '', date: todayIso, time: nowTime,
    duration: 60, type: 'online', summary: '', meeting_url: '',
  })
  Object.assign(consultationErrors, { title: null, date: null, summary: null, meeting_url: null })
}

const validateConsultation = (): boolean => {
  consultationErrors.title   = consultationForm.title.trim()   ? null : t('mentor_project_detail_1.errors.titleRequired')
  consultationErrors.date    = consultationForm.date           ? null : t('mentor_project_detail_1.errors.dateRequired')
  consultationErrors.summary = consultationForm.summary.trim() ? null : t('mentor_project_detail_1.errors.summaryRequired')

  if (consultationForm.type === 'online') {
    const url = consultationForm.meeting_url.trim()
    consultationErrors.meeting_url = url && !/^https?:\/\/.+/.test(url)
      ? t('mentor_project_detail_1.errors.urlInvalid')
      : null
  } else {
    consultationErrors.meeting_url = null
  }

  return !Object.values(consultationErrors).some(Boolean)
}

const saveConsultation = async () => {
  if (!validateConsultation() || !editingConsultation.value) return

  isSavingConsultation.value = true
  consultationError.value    = null

  try {
    const apiType     = FORM_TYPE_TO_API[consultationForm.type] ?? 'offline'
    const scheduledAt = `${consultationForm.date}T${consultationForm.time}:00`

    await api.put(
      `/mentor/projects/${project.id}/consultations/${editingConsultation.value.id}`,
      {
        title:        consultationForm.title.trim(),
        type:         apiType,
        scheduled_at: scheduledAt,
        duration:     consultationForm.duration,
        agenda:       consultationForm.summary.trim(),
        meeting_url:  consultationForm.type === 'online' && consultationForm.meeting_url.trim()
                        ? consultationForm.meeting_url.trim()
                        : null,
      },
    )

    await loadProject()
    closeConsultationModal()
    addToast({ message: t('mentor_project_detail_1.consultationUpdated'), type: 'success' })
  } catch {
    consultationError.value = t('mentor_project_detail_1.errors.saveFailed')
  } finally {
    isSavingConsultation.value = false
  }
}
</script>