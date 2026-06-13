<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">

        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <div
          class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
          style="min-height: 500px;"
        >
          <!-- ── Loading skeleton ─────────────────────────────────────── -->
          <div v-if="isFetching" class="flex-1 flex items-center justify-center py-24">
            <div class="flex flex-col items-center gap-3 text-gray-400">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <span class="text-sm">{{ $t('application_modal_translations_2.loading_application') }}</span>
            </div>
          </div>

          <template v-else-if="application">
            <!-- ── Header ─────────────────────────────────────────────── -->
            <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText class="w-5 h-5 text-blue-600" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h2 class="text-lg font-semibold text-navy truncate">
                      {{ application.team?.name ?? $t('application_modal_translations_2.no_team_name') }}
                    </h2>
                    <span class="text-gray-400 text-sm font-mono">{{ application.reference ?? '' }}</span>
                    <UiStatusBadge :status="statusSlug" />
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5 truncate">
                    {{ application.call?.name ?? $t('application_modal_translations_2.no_call_name') }}
                  </p>
                </div>
              </div>
              <button
                class="ml-4 flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- ── Tabs ───────────────────────────────────────────────── -->
            <div class="flex border-b border-gray-100 px-6 py-5 gap-1 overflow-x-auto">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="[
                  'flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                ]"
                @click="activeTab = tab.id"
              >
                <component :is="tab.icon" class="w-4 h-4" />
                {{ tab.label }}
                <span
                  v-if="tab.badge"
                  class="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                >
                  {{ tab.badge }}
                </span>
              </button>
            </div>

            <!-- ── Tab content ────────────────────────────────────────── -->
            <div class="flex-1 overflow-y-auto">

              <!-- ═══════════ INFO TAB ═══════════ -->
              <div v-if="activeTab === 'info'" class="p-6 space-y-6">

                <!-- Quick stats row -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div v-for="stat in quickStats" :key="stat.label"
                    class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <p class="text-xs text-gray-400 mb-1">{{ stat.label }}</p>
                    <p class="text-sm font-semibold text-navy truncate">{{ stat.value }}</p>
                  </div>
                </div>

                <!-- Team members -->
                <div v-if="application.team?.members?.length" class="rounded-xl border border-gray-100 overflow-hidden">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <Users class="w-4 h-4 text-gray-400" />
                      {{ $t('application_modal_translations_2.team_members') }}
                    </h3>
                  </div>
                  <div class="divide-y divide-gray-50">
                    <div
                      v-for="member in application.team.members"
                      :key="member.user_id ?? member.id"
                      class="flex items-center gap-3 px-4 py-2.5"
                    >
                      <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-semibold text-blue-700">
                          {{ initials(memberFullName(member)) }}
                        </span>
                      </div>
                     <div class="min-w-0 flex-1">
                   <NuxtLink
                      v-if="member.student?.id"
                      :to="localePath(`/admin/prihlasky/student-detail/${member.student.id}`)"
                      >
                      <p class="text-sm font-medium text-navy hover:text-blue-500 transition-colors duration-300 truncate">
                          {{ memberFullName(member) }}
                      </p>
                  </NuxtLink>
                  <p v-else class="text-sm font-medium text-navy truncate">
                           {{ memberFullName(member) }}
                  </p>
                </div>
                      <span
                        v-if="member.role_name || member.role_id"
                        :class="[
                          'flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full',
                          member.role_id === 1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500',
                        ]"
                      >
                        {{ member.role_name ?? memberRoleLabel(member.role_id) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Assigned mentor(s) -->
                <div v-if="application.mentorships?.length" class="rounded-xl border border-gray-100 overflow-hidden">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <GraduationCap class="w-4 h-4 text-gray-400" />
                      {{ $t('application_modal_translations_2.assigned_mentors') }}
                    </h3>
                  </div>
                  <div class="divide-y divide-gray-50">
                    <div
                      v-for="ms in application.mentorships"
                      :key="ms.id"
                      class="flex items-center gap-3 px-4 py-2.5"
                    >
                      <div class="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-semibold text-emerald-700">
                          {{ initials(`${ms.mentor?.name ?? ''} ${ms.mentor?.surname ?? ''}`) }}
                        </span>
                      </div>
                      <p class="text-sm font-medium text-navy truncate">
                        {{ ms.mentor?.name }} {{ ms.mentor?.surname }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- ── Evaluations (commission scores) ─────────────────
                     Shown when the application has a commission assigned.
                     Uses evaluation records when available, otherwise falls
                     back to the call-level commission setup members.
                ──────────────────────────────────────────────────────── -->
                <div
                  v-if="application.evaluations?.length || application.callCommission"
                  class="rounded-xl border border-amber-100 overflow-hidden"
                >
                  <div class="px-4 py-3 bg-amber-50 border-b border-amber-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <Scale class="w-4 h-4 text-amber-500" />
                      {{ $t('application_modal_translations_2.commission_evaluation') }}
                    </h3>
                  </div>

                  <!-- Case 1: evaluation records exist — show scores per commission group -->
                  <template v-if="application.evaluations?.length">
                    <div
                      v-for="evaluation in application.evaluations"
                      :key="evaluation.commission?.id ?? 'no-commission'"
                      class="divide-y divide-amber-50"
                    >
                      <div class="px-4 py-2 bg-amber-50/50 flex items-center gap-2">
                        <span class="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                          {{ evaluation.commission?.name ?? '—' }}
                        </span>
                        <span class="text-xs text-amber-500">
                          {{ $t('application_modal_translations_2.submitted_count_format', { submitted: submittedCount(evaluation), total: evaluation.members.length }) }}
                        </span>
                      </div>

                      <div
                        v-for="member in evaluation.members"
                        :key="member.id"
                        class="flex items-center gap-3 px-4 py-3"
                      >
                        <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span class="text-xs font-semibold text-amber-700">
                            {{ initials(`${member.name} ${member.surname}`) }}
                          </span>
                        </div>

                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-navy truncate">
                            {{ member.name }} {{ member.surname }}
                          </p>
                          <p v-if="member.submitted_at" class="text-xs text-gray-400 mt-0.5">
                            {{ $t('application_modal_translations_2.submitted_date_label') }} {{ formatDate(member.submitted_at) }}
                          </p>
                          <p
                            v-if="member.internal_note"
                            class="text-xs text-amber-800 bg-amber-50/70 rounded px-2 py-1 mt-1.5 border border-amber-100/50 inline-block text-balance"
                          >
                            <span class="font-semibold text-amber-950">{{ $t('application_modal_translations_2.internal_note_label') }}</span> {{ member.internal_note }}
                          </p>
                        </div>

                        <template v-if="member.submitted_at && member.scores.length">
                          <div class="flex-shrink-0 flex items-center gap-1.5">
                            <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm font-bold">
                              {{ memberTotalScore(member) }} {{ $t('application_modal_translations_2.score_points_suffix') }}
                            </span>
                            <div
                              v-if="member.scores.length > 1"
                              class="text-xs text-gray-400 flex flex-col items-end gap-0.5"
                            >
                              <span v-for="score in member.scores" :key="score.criterion_id">
                                {{ score.criterion_name ?? `K${score.criterion_id}` }}: {{ score.score }}
                              </span>
                            </div>
                          </div>
                        </template>
                        <template v-else-if="member.submitted_at">
                          <span class="flex-shrink-0 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                            {{ $t('application_modal_translations_2.submitted_badge') }}
                          </span>
                        </template>
                        <template v-else>
                          <span class="flex-shrink-0 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium">
                            {{ $t('application_modal_translations_2.waiting_for_evaluation') }}
                          </span>
                        </template>
                      </div>

                      <div
                        v-if="commissionHasAnyScores(evaluation)"
                        class="px-4 py-2.5 bg-amber-50/70 flex items-center justify-between"
                      >
                        <span class="text-xs font-medium text-amber-700">{{ $t('application_modal_translations_2.commission_average') }}</span>
                        <span class="text-sm font-bold text-amber-900">
                          {{ commissionAverageScore(evaluation) }} {{ $t('application_modal_translations_2.score_points_suffix') }}
                        </span>
                      </div>
                    </div>
                  </template>

                  <!-- Case 2: no evaluation records yet — show call-level commission members as pending -->
                  <template v-else-if="application.callCommission">
                    <div class="divide-y divide-amber-50">
                      <div class="px-4 py-2 bg-amber-50/50 flex items-center gap-2">
                        <span class="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                          {{ application.callCommission.name }}
                        </span>
                        <span class="text-xs text-amber-500">
                          (0/{{ application.callCommission.members.length }} odovzdaných)
                        </span>
                      </div>
                      <div
                        v-for="member in application.callCommission.members"
                        :key="member.id"
                        class="flex items-center gap-3 px-4 py-3"
                      >
                        <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span class="text-xs font-semibold text-amber-700">
                            {{ initials(`${member.name} ${member.surname}`) }}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-navy truncate">
                            {{ member.name }} {{ member.surname }}
                          </p>
                        </div>
                        <span class="flex-shrink-0 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium">
                          {{ $t('application_modal_translations_2.waiting_for_evaluation') }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- Status history timeline -->
                <div v-if="application.statusHistory?.length" class="rounded-xl border border-gray-100 overflow-hidden">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <History class="w-4 h-4 text-gray-400" />
                      {{ $t('application_modal_translations_2.status_history') }}
                    </h3>
                  </div>
                  <div class="px-4 py-3 space-y-0">
                    <div
                      v-for="(entry, i) in application.statusHistory"
                      :key="entry.id"
                      class="flex gap-3"
                    >
                      <div class="flex flex-col items-center">
                        <div class="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <div v-if="i < application.statusHistory.length - 1" class="w-px flex-1 bg-gray-200 my-1" />
                      </div>
                      <div class="pb-3 min-w-0">
                        <p class="text-sm font-medium text-navy">{{ entry.status?.name ?? '—' }}</p>
                        <p v-if="entry.note" class="text-xs text-gray-400 mt-0.5">{{ entry.note }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">
                          {{ formatDate(entry.created_at) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- ═══════════ ANSWERS TAB ═══════════ -->
              <div v-else-if="activeTab === 'answers'" class="p-6 max-w-4xl mx-auto">

                <div v-if="isFetchingAnswers" class="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <div class="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span class="text-sm font-medium">{{ $t('application_modal_translations_2.loading_answers') }}</span>
                </div>

                <div
                  v-else-if="!formData || Object.keys(formData).length === 0"
                  class="flex flex-col items-center justify-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
                >
                  <FileText class="w-12 h-12 mb-3 text-slate-300 opacity-80" />
                  <p class="text-sm font-medium text-slate-500">{{ $t('application_modal_translations_2.no_form_answers') }}</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div
                    v-for="(value, key) in formData"
                    :key="key"
                    :class="[
                      'bg-white rounded-xl border border-slate-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md',
                      fieldSpansFullWidth(value) ? 'md:col-span-2' : '',
                    ]"
                  >
                    <!-- Field label -->
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {{ key }}
                    </p>

                    <!-- ── FILE ── -->
                    <template v-if="detectFieldType(value) === 'file'">
                      <div class="flex flex-col gap-2 mt-1.5">
                        <div
                          v-for="docId in parseFileIds(value)"
                          :key="docId"
                          class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 group"
                        >
                          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Paperclip class="w-4 h-4 text-blue-500" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-navy truncate">
                              {{ fileMetaMap[docId]?.file_name ?? $t('application_modal_translations_2.document_fallback_name', { id: docId }) }}
                            </p>
                            <p v-if="fileMetaMap[docId]?.created_at" class="text-xs text-slate-400 mt-0.5">
                              {{ formatDate(fileMetaMap[docId].created_at) }}
                            </p>
                          </div>
                          <button
                            class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            :disabled="downloadingIds.has(docId)"
                            @click="downloadDocument(docId, fileMetaMap[docId]?.file_name)"
                          >
                            <span
                              v-if="downloadingIds.has(docId)"
                              class="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"
                            />
                            <Download v-else class="w-3.5 h-3.5" />
                            {{ downloadingIds.has(docId) ? $t('application_modal_translations_2.downloading') : $t('application_modal_translations_2.download') }}
                          </button>
                        </div>
                      </div>
                    </template>

                    <!-- ── DATE ── -->
                    <template v-else-if="detectFieldType(value) === 'date'">
                      <div class="flex items-center gap-2 mt-1">
                        <CalendarDays class="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <p class="text-sm font-semibold text-slate-700">
                          {{ formatDateOnly(value) }}
                        </p>
                      </div>
                    </template>

                    <!-- ── BOOLEAN ── -->
                    <template v-else-if="detectFieldType(value) === 'boolean'">
                      <div class="flex items-center gap-2 mt-1">
                        <div
                          :class="[
                            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                            isTruthy(value) ? 'bg-emerald-100' : 'bg-red-50',
                          ]"
                        >
                          <Check v-if="isTruthy(value)" class="w-3 h-3 text-emerald-600" />
                          <X v-else class="w-3 h-3 text-red-400" />
                        </div>
                        <p class="text-sm font-semibold text-slate-700">
                          {{ isTruthy(value) ? $t('application_modal_translations_2.boolean_yes') : $t('application_modal_translations_2.boolean_no') }}
                        </p>
                      </div>
                    </template>

                    <!-- ── ARRAY (multi-select / checkbox group) ── -->
                    <template v-else-if="detectFieldType(value) === 'array'">
                      <div class="flex flex-wrap gap-2 mt-1.5">
                        <span
                          v-for="item in normalizeArray(value)"
                          :key="item"
                          class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100"
                        >
                          {{ item }}
                        </span>
                        <span v-if="!normalizeArray(value).length" class="text-sm text-slate-400">—</span>
                      </div>
                    </template>

                    <!-- ── LONG TEXT ── -->
                    <template v-else-if="detectFieldType(value) === 'longtext'">
                      <p class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mt-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {{ value }}
                      </p>
                    </template>

                    <!-- ── NUMBER / SHORT TEXT (default) ── -->
                    <template v-else>
                      <p class="text-base font-semibold text-slate-700 mt-1">
                        {{ value ?? '—' }}
                      </p>
                    </template>

                  </div>
                </div>
              </div>

              <!-- ═══════════ MANAGEMENT TAB ═══════════ -->
              <div v-else-if="activeTab === 'manage'" class="p-6 space-y-6">

                <!-- ── Status change ────────────────────────────────────── -->
                <div class="rounded-xl border border-gray-100 overflow-hidden">
                  <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <RefreshCw class="w-4 h-4 text-gray-400" />
                      {{ $t('application_modal_translations_2.status_change_title') }}
                    </h3>
                  </div>
                  <div class="px-4 py-4 space-y-3">
                    <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <span>{{ $t('application_modal_translations_2.current_status_label') }}</span>
                      <UiStatusBadge :status="statusSlug" />
                    </div>

                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-gray-500">{{ $t('application_modal_translations_2.new_status_label') }}</label>
                      <UiSelect
                        v-model="statusForm.status_id"
                        :options="statusOptions"
                        :disabled="isChangingStatus"
                        :placeholder="$t('application_modal_translations_2.new_status_placeholder')"
                      />
                      <!-- Inform admin when no transitions are available -->
                      <p v-if="statusOptions.length === 0" class="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Info class="w-3.5 h-3.5" />
                        {{ $t('application_modal_translations_2.no_transitions_available') }}
                      </p>
                    </div>

                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-gray-500">{{ $t('application_modal_translations_2.public_note_label') }}</label>
                      <textarea
                        v-model="statusForm.note"
                        rows="2"
                        :placeholder="$t('application_modal_translations_2.public_note_placeholder')"
                        class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none transition"
                      />
                    </div>

                    <div v-if="statusError" class="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle class="w-3.5 h-3.5" />
                      {{ statusError }}
                    </div>

                    <button
                      :disabled="!statusForm.status_id || isChangingStatus"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
                      @click="changeStatus"
                    >
                      <span v-if="isChangingStatus" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {{ $t('application_modal_translations_2.confirm_status_change') }}
                    </button>
                  </div>
                </div>

                <!-- ── Committee assignment ──────────────────────────── -->
                <div
                  v-if="showCommitteeSection"
                  class="rounded-xl border border-amber-100 bg-amber-50/40 overflow-hidden"
                >
                  <div class="px-4 py-3 bg-amber-50 border-b border-amber-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <Scale class="w-4 h-4 text-amber-500" />
                      {{ $t('application_modal_translations_2.evaluation_committee_title') }}
                    </h3>
                  </div>
                  <div class="px-4 py-4 space-y-3">
                    <template v-if="assignedCommittee">
                      <div class="flex items-center gap-3 p-3 rounded-xl bg-amber-100/60 border border-amber-200">
                        <Scale class="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-amber-700 mb-0.5">{{ $t('application_modal_translations_2.assigned_committee_label') }}</p>
                          <p class="text-sm font-semibold text-amber-900 truncate">{{ assignedCommittee.name }}</p>
                        </div>
                        <button
                          class="flex-shrink-0 p-1 rounded-lg hover:bg-amber-200 text-amber-600 hover:text-red-600 transition"
                          :title="$t('application_modal_translations_2.remove_committee_title')"
                          @click="removeCommittee(assignedCommittee.id)"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                      <p class="text-xs text-gray-400 flex items-center gap-1">
                        <Info class="w-3.5 h-3.5" />
                        {{ $t('application_modal_translations_2.single_committee_info') }}
                      </p>
                    </template>

                    <template v-else>
                      <p class="text-xs text-gray-500">
                        {{ $t('application_modal_translations_2.committee_selection_info') }}
                      </p>
                      <div v-if="isFetchingCommittees" class="flex items-center gap-2 text-xs text-gray-400 py-2">
                        <div class="w-4 h-4 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
                        {{ $t('application_modal_translations_2.loading_committees') }}
                      </div>
                      <div v-else class="flex gap-2">
                        <div class="flex-1">
                          <UiSelect
                            v-model="committeeForm.committee_id"
                            :options="committeeOptions"
                            :placeholder="$t('application_modal_translations_2.select_committee_placeholder')"
                          />
                        </div>
                        <button
                          :disabled="!committeeForm.committee_id || isAssigningCommittee"
                          class="px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                          @click="assignCommittee"
                        >
                          <span v-if="isAssigningCommittee" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <Plus v-else class="w-3.5 h-3.5" />
                          {{ $t('application_modal_translations_2.assign_button') }}
                        </button>
                      </div>
                    </template>

                    <div v-if="committeeError" class="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle class="w-3.5 h-3.5" />
                      {{ committeeError }}
                    </div>
                  </div>
                </div>

                <!-- ── Mentor assignment ──────────────────────────────── -->
                <div
                  v-if="showMentorSection"
                  class="rounded-xl border border-emerald-100 bg-emerald-50/40 overflow-hidden"
                >
                  <div class="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                    <h3 class="text-sm font-semibold text-navy flex items-center gap-2">
                      <GraduationCap class="w-4 h-4 text-emerald-600" />
                      {{ $t('application_modal_translations_2.assign_mentor_title') }}
                    </h3>
                  </div>
                  <div class="px-4 py-4 space-y-3">
                    <p class="text-xs text-gray-500">
                      {{ $t('application_modal_translations_2.mentor_selection_info') }}
                    </p>
                    <div v-if="isFetchingMentors" class="flex items-center gap-2 text-xs text-gray-400 py-2">
                      <div class="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                      {{ $t('application_modal_translations_2.loading_mentors') }}
                    </div>
                    <div v-if="application.mentorships?.length" class="space-y-1.5">
                      <p class="text-xs font-medium text-gray-500">{{ $t('application_modal_translations_2.assigned_mentors_label') }}</p>
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="ms in application.mentorships"
                          :key="ms.id"
                          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"
                        >
                          <GraduationCap class="w-3 h-3" />
                          {{ ms.mentor?.name }} {{ ms.mentor?.surname }}
                          <button
                            class="ml-0.5 hover:text-red-600 transition"
                            :title="$t('application_modal_translations_2.remove_mentor_title')"
                            @click="removeMentor(ms.id)"
                          >
                            <X class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <div class="flex-1">
                        <UiSelect
                          v-model="mentorForm.mentor_id"
                          :options="mentorOptions"
                          :placeholder="$t('application_modal_translations_2.select_mentor_placeholder')"
                        />
                      </div>
                      <button
                        :disabled="!mentorForm.mentor_id || isAssigningMentor"
                        class="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                        @click="assignMentor"
                      >
                        <span v-if="isAssigningMentor" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <Plus v-else class="w-3.5 h-3.5" />
                        {{ $t('application_modal_translations_2.assign_button') }}
                      </button>
                    </div>
                    <div v-if="mentorError" class="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle class="w-3.5 h-3.5" />
                      {{ mentorError }}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <!-- ── Footer ─────────────────────────────────────────────── -->
            <div class="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span class="text-xs text-gray-400">
                {{ $t('application_modal_translations_2.updated_at_label') }} {{ formatDate(application.last_update) }}
              </span>
              <button
                class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                @click="close"
              >
                {{ $t('application_modal_translations_2.close') }}
              </button>
            </div>
          </template>

          <!-- ── Error state ────────────────────────────────────────── -->
          <div v-else class="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertCircle class="w-10 h-10 mb-3 opacity-40" />
            <p class="text-sm">{{ $t('application_modal_translations_2.error_loading_failed') }}</p>
            <button class="mt-3 text-xs text-blue-600 hover:underline" @click="fetchApplication">
              {{ $t('application_modal_translations_2.try_again') }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import {
  X,
  FileText,
  Users,
  GraduationCap,
  History,
  RefreshCw,
  Scale,
  AlertCircle,
  Plus,
  Info,
  MessageSquare,
  Settings,
  Paperclip,
  Download,
  CalendarDays,
  Check,
} from 'lucide-vue-next'
import { useLocale } from 'vuetify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const api = useApi()
const toast = useToast()

// ── Types ──────────────────────────────────────────────────────────────────

interface Mentor {
  id: number
  name: string
  surname: string
}

interface Mentorship {
  id: number
  mentor: Mentor | null
  commission?: Committee | null
}

interface Committee {
  id: number
  name: string
}

interface TeamMember {
  id?: number
  user_id?: number
  name?: string
  surname?: string
  role_id?: number
  role_name?: string
  student?: { id?: number; name?: string } | null
}

interface EvaluationScore {
  criterion_id: number
  criterion_name: string | null
  score: string
  comment: string
}

interface EvaluationMember {
  id: number
  user_id: number
  name: string
  surname: string
  submitted_at: string | null
  scores: EvaluationScore[]
}

interface Evaluation {
  commission: Committee
  members: EvaluationMember[]
}

interface FileMeta {
  file_name: string
  file_path: string
  created_at: string | null
}

interface CallCommissionMember {
  id: number
  user_id: number
  name: string | null
  surname: string | null
}

interface CallCommission {
  id: number
  name: string
  members: CallCommissionMember[]
}

interface ApplicationDetail {
  id: number
  reference: string | null
  submitted_at: string | null
  last_update: string | null
  form_data: Record<string, any> | null
  call: { id: number; name: string } | null
  status: { id: number; name: string } | null
  team: { id: number; name: string; members: TeamMember[] } | null
  mentorships: Mentorship[]
  evaluations: Evaluation[]
  committee: Committee | null
  callCommission: CallCommission | null
  statusHistory: Array<{
    id: number
    status: { id: number; name: string } | null
    note?: string
    created_at: string
  }>
}


const localePath = useLocalePath()
// ── STATUS constants ───────────────────────────────────────────────────────

const STATE_DRAFT                = 'Draft'
const STATE_SUBMITTED            = 'Podané'
const STATE_IN_EVALUATION        = 'V hodnotení'
const STATE_SUPPLEMENT_REQUESTED = 'Vyžiadané doplnenie'
const STATE_APPROVED             = 'Schválené'
const STATE_REJECTED             = 'Zamietnuté'
const STATE_PAUSED               = 'Pozastavené'
const STATE_ONBOARDING           = 'Onboarding'
const STATE_ACTIVE_PROJECT       = 'Aktívny projekt'
const STATE_COMPLETED            = 'Ukončené'

const STATUS_SLUG: Record<string, string> = {
  [STATE_DRAFT]: 'draft',
  [STATE_SUBMITTED]: 'submitted',
  [STATE_IN_EVALUATION]: 'evaluating',
  [STATE_SUPPLEMENT_REQUESTED]: 'pending',
  [STATE_APPROVED]: 'approved',
  [STATE_REJECTED]: 'rejected',
  [STATE_PAUSED]: 'paused',
  [STATE_ONBOARDING]: 'onboarding',
  [STATE_ACTIVE_PROJECT]: 'active',
  [STATE_COMPLETED]: 'completed',
}

// Transitions keyed by status ID to avoid any unicode/encoding mismatch with
// Slovak diacritics when comparing name strings at runtime.
// IDs match the StatusOfApplicationSeeder insertion order:
//  1 Draft  2 Podané  3 V hodnotení  4 Vyžiadané doplnenie
//  5 Schválené  6 Zamietnuté  7 Pozastavené  8 Onboarding
//  9 Aktívny projekt  10 Ukončené
const BACKEND_TRANSITIONS: Record<number, number[]> = {
  1:  [2],        // Draft            → Podané
  2:  [3, 4],     // Podané           → V hodnotení | Vyžiadané doplnenie
  3:  [5, 6, 4],  // V hodnotení      → Schválené | Zamietnuté | Vyžiadané doplnenie
  4:  [2],        // Vyžiadané dopl.  → Podané
  5:  [8],        // Schválené        → Onboarding
  6:  [],         // Zamietnuté       → (terminal)
  7:  [9, 10],    // Pozastavené      → Aktívny projekt | Ukončené
  8:  [9],        // Onboarding       → Aktívny projekt
  9:  [7, 10],    // Aktívny projekt  → Pozastavené | Ukončené
  10: [],         // Ukončené         → (terminal)
}

// Committee assignment is only available when the application is submitted (pre-evaluation).
// Once in evaluation the committee is already locked and visible in the Info tab.
const COMMITTEE_STATUSES = [STATE_SUBMITTED]
const MENTOR_STATUSES    = [STATE_ONBOARDING]

// ── Props / emits ──────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: boolean
  applicationId: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'refreshed': []
}>()

// ── Core state ─────────────────────────────────────────────────────────────

const isFetching  = ref(false)
const application = ref<ApplicationDetail | null>(null)
const activeTab   = ref<'info' | 'answers' | 'manage'>('info')

// ── Derived ────────────────────────────────────────────────────────────────

const currentStatusName = computed(() => application.value?.status?.name ?? STATE_DRAFT)
const statusSlug        = computed(() => STATUS_SLUG[currentStatusName.value] ?? 'draft')

const showCommitteeSection = computed(() => COMMITTEE_STATUSES.includes(currentStatusName.value))
const showMentorSection    = computed(() => MENTOR_STATUSES.includes(currentStatusName.value))

/**
 * Resolve the assigned committee from multiple possible locations in the response:
 * 1. application.committee  (top-level committees[] array, first entry)
 * 2. mentorships[].commission
 * 3. evaluations[].commission  ← the API returns it here when in evaluation
 */
const assignedCommittee = computed((): Committee | null => {
  if (application.value?.committee) return application.value.committee
  for (const ms of application.value?.mentorships ?? []) {
    if (ms.commission) return ms.commission
  }
  for (const ev of application.value?.evaluations ?? []) {
    if (ev.commission) return ev.commission
  }
  return null
})

const quickStats = computed(() => [
  { label: t('application_modal_translations_2.stat_reference'), value: application.value?.reference ?? '—' },
  { label: t('application_modal_translations_2.stat_team'), value: application.value?.team?.name ?? '—' },
  { label: t('application_modal_translations_2.stat_call'), value: application.value?.call?.name ?? '—' },
  {
    label: t('application_modal_translations_2.stat_submitted_date'),
    value: application.value?.submitted_at
      ? new Date(application.value.submitted_at).toLocaleDateString('sk-SK')
      : '—',
  },
])

const tabs = computed(() => [
  { id: 'info',    label: t('application_modal_translations_2.tab_info'), icon: Info,          badge: null },
  { id: 'answers', label: t('application_modal_translations_2.tab_answers'),   icon: MessageSquare, badge: null },
  {
    id: 'manage',
    label: t('application_modal_translations_2.tab_manage'),
    icon: Settings,
    badge: showCommitteeSection.value || showMentorSection.value ? '!' : null,
  },
])

// ── Evaluation score helpers ───────────────────────────────────────────────

function memberTotalScore(member: EvaluationMember): number {
  return member.scores.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0)
}

function submittedCount(evaluation: Evaluation): number {
  return evaluation.members.filter(m => m.submitted_at !== null).length
}

function commissionHasAnyScores(evaluation: Evaluation): boolean {
  return evaluation.members.some(m => m.submitted_at && m.scores.length > 0)
}

function commissionAverageScore(evaluation: Evaluation): string {
  const submitted = evaluation.members.filter(m => m.submitted_at && m.scores.length > 0)
  if (!submitted.length) return '—'
  const avg = submitted.reduce((sum, m) => sum + memberTotalScore(m), 0) / submitted.length
  return avg % 1 === 0 ? String(avg) : avg.toFixed(1)
}

// ── Fetch application ──────────────────────────────────────────────────────

async function fetchApplication() {
  if (!props.applicationId) return
  isFetching.value = true
  try {
    const res  = await api.get(`/applications/${props.applicationId}`)
const callCommissionRaw: CallCommission | null = res?.call_commission ?? null
    const data = res?.application ?? res
    if (!data) throw new Error('No data received')

    // Committee can live in data.committees[], mentorships[].commission,
    // or evaluations[].commission — check all three.
    const topLevelCommittee: Committee | null =
      Array.isArray(data.committees) && data.committees.length > 0
        ? data.committees[0]
        : null

    const mentorshipCommittee: Committee | null =
      !topLevelCommittee && Array.isArray(data.mentorships)
        ? (data.mentorships.find((ms: any) => ms.commission)?.commission ?? null)
        : null

    const evaluationCommittee: Committee | null =
      !topLevelCommittee && !mentorshipCommittee && Array.isArray(data.evaluations)
        ? (data.evaluations.find((ev: any) => ev.commission)?.commission ?? null)
        : null

    application.value = {
      ...data,
      call: data.call ?? null,
      status: data.status ?? null,
      team: data.team
        ? {
            ...data.team,
            name: data.team.name ?? '—',
            members: data.team_members ?? data.team.members ?? [],
          }
        : null,
      statusHistory: data.status_history ?? [],
      committee: topLevelCommittee ?? mentorshipCommittee ?? evaluationCommittee,
      mentorships: data.mentorships ?? [],
      evaluations: data.evaluations ?? [],
      callCommission: callCommissionRaw,
    }
  } catch (error) {
    console.error('Fetch error:', error)
    application.value = null
    toast.addToast({ message: t('application_modal_translations_2.toast_fetch_error'), type: 'error' })
  } finally {
    isFetching.value = false
  }
}

// ── Form answers & field-type engine ──────────────────────────────────────

const isFetchingAnswers = ref(false)
const formData          = ref<Record<string, any> | null>(null)

/**
 * FILE REFERENCE DETECTION
 *
 * The backend stores file answers as a JSON-stringified array of Document IDs,
 * e.g. "[6]" or "[6,7]". We detect this pattern and resolve the IDs to real
 * file metadata via GET /documents/{id}.
 */
const FILE_REF_RE = /^\[\s*\d+(\s*,\s*\d+)*\s*\]$/

type FieldType = 'file' | 'date' | 'boolean' | 'array' | 'longtext' | 'text'

function detectFieldType(value: any): FieldType {
  if (value === null || value === undefined) return 'text'

  // Native JS array → multi-select / checkbox group
  if (Array.isArray(value)) return 'array'

  if (typeof value === 'boolean') return 'boolean'

  if (typeof value === 'string') {
    const trimmed = value.trim()

    // File reference: "[6]", "[3, 7]"
    if (FILE_REF_RE.test(trimmed)) return 'file'

    // ISO date only: "2026-06-03"
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return 'date'

    // Boolean strings from checkboxes
    if (trimmed === 'true' || trimmed === 'false') return 'boolean'

    // Long text
    if (trimmed.length > 60) return 'longtext'
  }

  return 'text'
}

/** Parse "[6]" or "[3, 7]" into [6] / [3, 7] */
function parseFileIds(value: string): number[] {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !isNaN(n) && n > 0)
  } catch {
    // fallback: extract numbers manually
    const nums = value.match(/\d+/g)
    if (nums) return nums.map(Number)
  }
  return []
}

/** Normalize a value to a string array for rendering multi-select answers */
function normalizeArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String)
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {}
  return []
}

function isTruthy(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}

/** A field should span full width when it is long text or a file block */
function fieldSpansFullWidth(value: any): boolean {
  const t = detectFieldType(value)
  if (t === 'longtext') return true
  if (t === 'file' && parseFileIds(value).length > 1) return true
  return false
}

async function fetchAnswers() {
  if (!props.applicationId || !application.value) return
  isFetchingAnswers.value = true
  try {
    const res = await api.get(`/application-answer/${props.applicationId}`)
    const raw = res.data ?? res

    let map: Record<string, any> = {}

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      // Handle { id, application_id, answer: { key: val }, ... } shape:
      // the answers live in raw.answer, not the envelope itself.
      if (raw.answer && typeof raw.answer === 'object' && !Array.isArray(raw.answer)) {
        map = raw.answer
      } else {
        map = raw
      }
    } else if (Array.isArray(raw)) {
      for (const entry of raw) {
        const label = entry.form_field?.name ?? entry.form_field_id
        map[label] = entry.value
      }
    }

    formData.value = Object.keys(map).length ? map : null

    // Pre-load file metadata for all file references found in the answers
    const fileIds: number[] = []
    for (const val of Object.values(map)) {
      if (typeof val === 'string' && FILE_REF_RE.test(val.trim())) {
        fileIds.push(...parseFileIds(val))
      }
    }
    if (fileIds.length) await fetchFileMeta(fileIds)
  } catch {
    formData.value = application.value?.form_data ?? null
  } finally {
    isFetchingAnswers.value = false
  }
}

// ── File metadata cache & download ────────────────────────────────────────

/**
 * Map of document_id → { file_name, file_path, created_at }
 * Populated on demand when answers are fetched.
 */
const fileMetaMap   = ref<Record<number, FileMeta>>({})
const downloadingIds = ref<Set<number>>(new Set())

async function fetchFileMeta(ids: number[]) {
  const missing = ids.filter(id => !(id in fileMetaMap.value))
  if (!missing.length) return

  await Promise.allSettled(
    missing.map(async (id) => {
      try {
        const res = await api.get(`/documents/${id}`)
        const version = res.current_version ?? null
        if (version) {
          fileMetaMap.value[id] = {
            file_name:  version.file_name,
            file_path:  version.file_path,
            created_at: version.created_at ?? null,
          }
        }
      } catch {
        // Leave missing — the download button will still work using the document ID
      }
    }),
  )
}

/**
 * Trigger an authenticated file download.
 *
 * The /documents/{id}/download endpoint requires auth:sanctum.
 * We use api.get with responseType 'blob' (same pattern as the GDPR export),
 * then create a temporary object URL so the browser triggers a Save dialog.
 */
async function downloadDocument(docId: number, fileName?: string) {
  if (downloadingIds.value.has(docId)) return

  // Reactively add: we need to replace the Set reference so Vue tracks it
  downloadingIds.value = new Set([...downloadingIds.value, docId])

  try {
    const blob: Blob = await api.get(`/documents/${docId}/download`, {
      responseType: 'blob',
    })

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href     = url
    anchor.download = fileName ?? `dokument-${docId}`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  } catch {
    toast.addToast({ message: t('application_modal_translations_2.toast_download_error'), type: 'error' })
  } finally {
    const next = new Set(downloadingIds.value)
    next.delete(docId)
    downloadingIds.value = next
  }
}

// ── Statuses ───────────────────────────────────────────────────────────────

const allStatuses = ref<Array<{ id: number; name: string }>>([])

const statusOptions = computed(() => {
  const currentId = application.value?.status?.id
  if (!currentId) return []
  const allowed = BACKEND_TRANSITIONS[currentId] ?? []
  return allStatuses.value
    .filter(s => allowed.includes(s.id))
    .map(s => ({ value: s.id, label: s.name }))
})

async function fetchStatuses() {
  try {
    const res = await api.get('/admin-app-statuses')
    allStatuses.value = res.statuses ?? []
  } catch { /* non-critical */ }
}

// ── Status change ──────────────────────────────────────────────────────────

const statusForm      = reactive({ status_id: null as number | null, note: '' })
const isChangingStatus = ref(false)
const statusError      = ref<string | null>(null)

async function changeStatus() {
  if (!statusForm.status_id || !props.applicationId) return
  statusError.value    = null
  isChangingStatus.value = true
  try {
    const res = await api.post(`/change-app-state/${props.applicationId}/admin`, {
      state_id: statusForm.status_id,
      note:     statusForm.note || undefined,
    })
    application.value     = res.data ?? res
    statusForm.status_id  = null
    statusForm.note       = ''
    toast.addToast({ message: t('application_modal_translations_2.toast_status_success'), type: 'success' })
    emit('refreshed')
    close()
  } catch (err: any) {
    statusError.value = err?.data?.message ?? t('application_modal_translations_2.change_status_error_fallback')
  } finally {
    isChangingStatus.value = false
  }
}

// ── Committees ─────────────────────────────────────────────────────────────

const committees           = ref<Committee[]>([])
const isFetchingCommittees = ref(false)
const committeeForm        = reactive({ committee_id: null as number | null })
const isAssigningCommittee = ref(false)
const committeeError       = ref<string | null>(null)

const committeeOptions = computed(() => {
  if (assignedCommittee.value) return []
  return committees.value.map(c => ({ value: c.id, label: c.name }))
})

async function fetchCommittees() {
  isFetchingCommittees.value = true
  try {
    const res = await api.get('/evaluator/fetch-commissions')
    committees.value = res.commissions ?? res.data ?? []
  } catch { /* non-critical */ }
  finally { isFetchingCommittees.value = false }
}

async function assignCommittee() {
  if (!committeeForm.committee_id || !props.applicationId) return
  committeeError.value       = null
  isAssigningCommittee.value = true
  try {
    await api.post(`/add-committee/${props.applicationId}/committee/${committeeForm.committee_id}`)
    await fetchApplication()
    committeeForm.committee_id = null
    toast.addToast({ message: t('application_modal_translations_2.toast_committee_success'), type: 'success' })
    emit('refreshed')
  } catch (err: any) {
    committeeError.value = err?.data?.message ?? t('application_modal_translations_2.assign_committee_error_fallback')
  } finally {
    isAssigningCommittee.value = false
  }
}

async function removeCommittee(committeeId: number) {
  if (!props.applicationId) return
  try {
    await api.delete(`/remove-committee/${props.applicationId}`)
    if (application.value) {
      application.value.committee  = null
      application.value.mentorships = application.value.mentorships.map(ms => ({
        ...ms,
        commission: ms.commission?.id === committeeId ? null : ms.commission,
      }))
    }
    toast.addToast({ message: t('application_modal_translations_2.toast_committee_removed'), type: 'success' })
    emit('refreshed')
  } catch {
    toast.addToast({ message: t('application_modal_translations_2.toast_committee_remove_error'), type: 'error' })
  }
}

// ── Mentors ────────────────────────────────────────────────────────────────

const mentors           = ref<Mentor[]>([])
const isFetchingMentors = ref(false)
const mentorForm        = reactive({ mentor_id: null as number | null })
const isAssigningMentor = ref(false)
const mentorError       = ref<string | null>(null)

const mentorOptions = computed(() =>
  mentors.value
    .filter(m => !application.value?.mentorships?.some(ms => ms.mentor?.id === m.id))
    .map(m => ({ value: m.id, label: `${m.name} ${m.surname}`.trim() })),
)

async function fetchMentors() {
  isFetchingMentors.value = true
  try {
    const res = await api.get('/mentors')
    mentors.value = res.mentors ?? res.data ?? []
  } catch { /* non-critical */ }
  finally { isFetchingMentors.value = false }
}

async function assignMentor() {
  if (!mentorForm.mentor_id || !props.applicationId) return
  mentorError.value    = null
  isAssigningMentor.value = true
  try {
    const res = await api.post(
      `/mentor/admin/applications/${props.applicationId}/mentors/${mentorForm.mentor_id}`,
    )
    if (res.data) application.value = res.data
    else await fetchApplication()
    mentorForm.mentor_id = null
    toast.addToast({ message: t('application_modal_translations_2.toast_mentor_success'), type: 'success' })
    emit('refreshed')
  } catch (err: any) {
    mentorError.value = err?.data?.message ?? t('application_modal_translations_2.assign_mentor_error_fallback')
  } finally {
    isAssigningMentor.value = false
  }
}

async function removeMentor(mentorshipId: number) {
  if (!props.applicationId) return
  try {
    await api.delete(`/admin/applications/${props.applicationId}/mentorships/${mentorshipId}`)
    if (application.value?.mentorships) {
      application.value.mentorships = application.value.mentorships.filter(
        ms => ms.id !== mentorshipId,
      )
    }
    toast.addToast({ message: t('application_modal_translations_2.toast_mentor_removed'), type: 'success' })
    emit('refreshed')
  } catch {
    toast.addToast({ message: t('application_modal_translations_2.toast_mentor_remove_error'), type: 'error' })
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

watch(
  [() => props.modelValue, () => props.applicationId],
  async ([open, id]) => {
    if (!open || !id) return

    activeTab.value    = 'info'
    formData.value     = null
    fileMetaMap.value  = {}

    await fetchApplication()
    await fetchStatuses()

    await Promise.allSettled([
      fetchAnswers(),
      fetchCommittees(),
      fetchMentors(),
    ])
  },
  { immediate: true },
)

watch(
  () => application.value?.status?.name,
  (name) => {
    if (!name) return
    if (COMMITTEE_STATUSES.includes(name)) fetchCommittees()
    if (MENTOR_STATUSES.includes(name))    fetchMentors()
  },
)

// ── Helpers ────────────────────────────────────────────────────────────────

function close() {
  emit('update:modelValue', false)
}

function memberRoleLabel(roleId?: number): string {
  if (roleId === 1) return t('application_modal_translations_2.role_leader')
  if (roleId === 2) return t('application_modal_translations_2.role_member')
  return ''
}

function memberFullName(member: TeamMember): string {
  const parts = [member.name, member.surname].filter(Boolean)
  if (parts.length) return parts.join(' ')
  return member.student?.name ?? t('application_modal_translations_2.unknown_member')
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDateOnly(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}. ${month}. ${year}`
}
</script>