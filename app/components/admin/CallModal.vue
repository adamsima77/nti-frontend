<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? $t('callModal.titleEdit') : $t('callModal.titleNew')"
    size="xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="metaLoading" class="flex justify-center py-16">
      <UiLoader />
    </div>

    <template v-else>
      <div
        v-if="activeTab !== 'form' && languageOptions.length > 1"
        class="flex items-center gap-2 mb-4 pb-3.5 border-b border-gray-100 -mx-6 px-6"
      >
        <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mr-1.5">{{ $t('callModal.language') }}</span>
        <button
          v-for="lang in languageOptions"
          :key="lang.value"
          type="button"
          class="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold tracking-wide transition-all"
          :class="activeLang === lang.value
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-slate-500 hover:bg-gray-200'"
          @click="activeLang = lang.value"
        >
          {{ lang.code.toUpperCase() }}
          <span
            v-if="activeLang !== lang.value && hasLangErrors(lang.value)"
            class="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"
          />
        </button>
        <span class="ml-auto text-[11px] text-slate-300 italic">
          {{ $t('callModal.languageSwitcherHint') }}
        </span>
      </div>

      <div class="flex gap-0 border-b border-gray-200 -mx-6 px-6 mb-6">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          :class="[
            'relative pb-3 pt-1 pr-5 text-sm font-medium transition-colors',
            activeTab === tab.key
              ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-t'
              : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="activeTab = tab.key as typeof activeTab"
        >
          {{ tab.label }}
          <span
            v-if="tab.badge !== undefined && tab.badge > 0"
            class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
            :class="activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- PO closure approval banner -->
      <div
        v-if="isEditing && form.po_closure_approved_at && allStatusOptions.find(s => s.value === form.status_id)?.label !== 'Uzavreté'"
        class="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 mb-6"
      >
        <div class="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-green-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-green-800">{{ $t('callModal.poClosureApprovedTitle') }}</p>
          <p class="text-xs text-green-600 mt-0.5">{{ $t('callModal.poClosureApprovedHint', { date: formatPoClosureDate(form.po_closure_approved_at) }) }}</p>
        </div>
      </div>

      <div v-show="activeTab === 'basic'" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">
              {{ $t('callModal.program') }} <span class="text-red-400">*</span>
            </label>
            <UiSelect v-model="form.program_id" :options="visibleProgramOptions" :placeholder="$t('callModal.selectProgram')" />
            <p v-if="errors.program_id" class="text-xs text-red-500 mt-1">{{ errors.program_id }}</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('callModal.status') }}</label>
            <UiSelect v-model="form.status_id" :options="statusOptions" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">{{ $t('callModal.qualificationStack') }}</label>
          <UiSelect
            v-model="form.qualification_stack_id"
            :options="qualificationStackOptions"
            :placeholder="$t('callModal.noStackOptional')"
          />
          <p v-if="errors.qualification_stack_id" class="text-xs text-red-500 mt-1">{{ errors.qualification_stack_id }}</p>
        </div>

        <div class="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-4">
          <p class="text-[11px] font-semibold text-blue-500 uppercase tracking-wide -mb-1">
            {{ $t('callModal.contentInLanguage') }}: <span class="font-extrabold">{{ currentLangLabel }}</span>
          </p>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">
              {{ $t('callModal.callName') }} <span class="text-red-400">*</span>
            </label>
            <input
              v-model="currentName"
              type="text"
              :placeholder="$t('callModal.callNamePlaceholder')"
              class="w-full rounded-lg border px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
              :class="errors[`name_${activeLang}`] ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-300'"
            />
            <p v-if="errors[`name_${activeLang}`]" class="text-xs text-red-500 mt-1">{{ errors[`name_${activeLang}`] }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">
              {{ $t('callModal.description') }} <span class="text-red-400">*</span>
            </label>
            <textarea
              v-model="currentDescription"
              rows="3"
              :placeholder="$t('callModal.descriptionPlaceholder')"
              class="w-full rounded-lg border px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 resize-none transition-colors"
              :class="errors[`description_${activeLang}`] ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-300'"
            />
            <p v-if="errors[`description_${activeLang}`]" class="text-xs text-red-500 mt-1">{{ errors[`description_${activeLang}`] }}</p>
          </div>
        </div>
        <hr class="border-gray-100" />

        <div>
          <p class="text-xs font-semibold text-slate-500 mb-3">{{ $t('callModal.applicationDatesHeading') }}</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">{{ $t('callModal.dateStart') }} <span class="text-red-400">*</span></label>
              <input v-model="form.application_start" type="date" :class="dateInputClass('application_start')" />
              <p v-if="errors.application_start" class="text-xs text-red-500 mt-1">{{ errors.application_start }}</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">{{ $t('callModal.dateDeadline') }} <span class="text-red-400">*</span></label>
              <input v-model="form.application_deadline" type="date" :class="dateInputClass('application_deadline')" />
              <p v-if="errors.application_deadline" class="text-xs text-red-500 mt-1">{{ errors.application_deadline }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-slate-500 mb-3">{{ $t('callModal.projectDatesHeading') }}</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">{{ $t('callModal.projectStart') }} <span class="text-red-400">*</span></label>
              <input v-model="form.project_start" type="date" :class="dateInputClass('project_start')" />
              <p v-if="errors.project_start" class="text-xs text-red-500 mt-1">{{ errors.project_start }}</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">{{ $t('callModal.projectEnd') }} <span class="text-red-400">*</span></label>
              <input v-model="form.project_end" type="date" :class="dateInputClass('project_end')" />
              <p v-if="errors.project_end" class="text-xs text-red-500 mt-1">{{ errors.project_end }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="isEditing"
          class="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors"
          :class="form.force_closed ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="form.force_closed ? 'bg-red-100' : 'bg-gray-100'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" :class="form.force_closed ? 'text-red-500' : 'text-gray-400'">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold leading-snug" :class="form.force_closed ? 'text-red-700' : 'text-navy'">
                {{ $t('callModal.forceCloseTitle') }}
              </p>
              <p class="text-xs mt-0.5 leading-relaxed" :class="form.force_closed ? 'text-red-500' : 'text-slate-400'">
                {{
                  form.force_closed
                    ? $t('callModal.forceCloseActiveHint')
                    : $t('callModal.forceCloseInactiveHint')
                }}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            :aria-checked="form.force_closed"
            class="relative ml-4 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 flex-shrink-0"
            :class="form.force_closed ? 'bg-red-500 focus:ring-red-400' : 'bg-gray-200 focus:ring-gray-300'"
            @click="form.force_closed = !form.force_closed"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              :class="form.force_closed ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <div v-show="activeTab === 'form'" class="space-y-4">
        <p class="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 leading-relaxed" v-html="$t('callModal.formTabHint')"></p>
        <p v-if="errors._form" class="text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">{{ errors._form }}</p>

        <div class="space-y-2">
          <div
            v-for="(field, idx) in formFields"
            :key="field.id"
            class="rounded-lg border transition-colors"
            :class="editingFieldIdx === idx ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200 bg-white'"
          >
            <div class="flex items-center gap-3 px-3 py-2.5">
              <GripVertical class="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />
              <component :is="FIELD_TYPE_CONFIG[field.type].icon" class="w-4 h-4 flex-shrink-0" :class="FIELD_TYPE_CONFIG[field.type].color" />
              <span class="flex-1 text-sm font-medium text-navy truncate min-w-0">
                {{ field.label || $t('callModal.fieldDefaultLabel', { num: idx + 1 }) }}
              </span>
              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
                {{ $t(FIELD_TYPE_CONFIG[field.type].labelKey) }}
              </span>
              <span v-if="field.required" class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-500 flex-shrink-0">
                {{ $t('callModal.fieldRequiredBadge') }}
              </span>
              <div class="flex items-center gap-0.5 ml-1 flex-shrink-0">
                <button :disabled="idx === 0" class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" @click="moveField(idx, idx - 1)">
                  <ChevronUp class="w-3.5 h-3.5" />
                </button>
                <button :disabled="idx === formFields.length - 1" class="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" @click="moveField(idx, idx + 1)">
                  <ChevronDown class="w-3.5 h-3.5" />
                </button>
                <button class="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors" @click="editingFieldIdx = editingFieldIdx === idx ? null : idx">
                  <component :is="editingFieldIdx === idx ? X : Pencil" class="w-3.5 h-3.5" />
                </button>
                <button class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors" @click="removeField(idx)">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div v-if="editingFieldIdx === idx" class="border-t border-blue-200 px-4 pb-4 pt-3 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.fieldNameLabel') }} <span class="text-red-400">*</span></label>
                  <input v-model="field.label" type="text" :placeholder="$t('callModal.fieldNamePlaceholder')" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" @input="onLabelInput(field)" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.fieldTypeLabel') }}</label>
                  <select v-model="field.type" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" @change="onTypeChange(field)">
                    <option v-for="(cfg, key) in FIELD_TYPE_CONFIG" :key="key" :value="key">{{ $t(cfg.labelKey) }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.fieldIdentifierLabel') }} <span class="text-gray-400 font-normal">({{ $t('callModal.automatic') }})</span></label>
                  <input v-model="field.name" type="text" placeholder="napr. project_name" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div v-if="field.type !== 'file' && field.type !== 'checkbox' && field.type !== 'radio'">
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.fieldSampleTextLabel') }}</label>
                  <input v-model="field.placeholder" type="text" :placeholder="$t('callModal.fieldSampleTextPlaceholder')" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div v-if="field.type === 'file'">
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.fieldAllowedFormatsLabel') }}</label>
                  <input v-model="field.accept" type="text" placeholder=".pdf,.doc,.docx" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.fieldHelpTextLabel') }}</label>
                <input v-model="field.help_text" type="text" :placeholder="$t('callModal.fieldHelpTextPlaceholder')" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>

              <div v-if="['select', 'radio', 'checkbox'].includes(field.type)">
                <label class="block text-xs text-slate-500 mb-1.5">{{ $t('callModal.fieldOptionsLabel') }}</label>
                <div class="space-y-1.5">
                  <div v-for="(opt, oi) in field.options" :key="oi" class="flex items-center gap-2">
                    <input :value="opt" type="text" :placeholder="$t('callModal.fieldOptionPlaceholder')" class="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" @input="field.options[oi] = ($event.target as HTMLInputElement).value" />
                    <button class="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" @click="field.options.splice(oi, 1)"><X class="w-3.5 h-3.5" /></button>
                  </div>
                  <button class="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1" @click="field.options.push('')">
                    <Plus class="w-3 h-3" /> {{ $t('callModal.fieldAddOption') }}
                  </button>
                </div>
              </div>

              <label class="flex items-center gap-2 cursor-pointer w-fit">
                <input v-model="field.required" type="checkbox" class="accent-blue-600 w-3.5 h-3.5" />
                <span class="text-xs text-slate-600">{{ $t('callModal.fieldRequiredLabel') }}</span>
              </label>
            </div>
          </div>

          <div v-if="formFields.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText class="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p class="text-sm text-gray-400">{{ $t('callModal.formEmptyTitle') }}</p>
            <p class="text-xs text-gray-300 mt-1">{{ $t('callModal.formEmptySubtitle') }}</p>
          </div>
        </div>

        <div class="relative">
          <button class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-all" @click="showFieldPicker = !showFieldPicker">
            <Plus class="w-4 h-4" />
            {{ $t('callModal.fieldAddButton') }}
            <ChevronDown class="w-3.5 h-3.5 ml-1 transition-transform" :class="showFieldPicker && 'rotate-180'" />
          </button>
          <div v-if="showFieldPicker" class="absolute top-full left-0 mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-3 gap-1 w-72">
            <button v-for="(cfg, key) in FIELD_TYPE_CONFIG" :key="key" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors" @click="addField(key as FieldType); showFieldPicker = false">
              <component :is="cfg.icon" class="w-4 h-4 flex-shrink-0" :class="cfg.color" />
              <span class="text-xs text-slate-700">{{ $t(cfg.labelKey) }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'criteria'" class="space-y-4">
        <p class="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 leading-relaxed" v-html="$t('callModal.criteriaTabHint')"></p>
        <p v-if="errors._criteria" class="text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">{{ errors._criteria }}</p>

        <div class="flex items-center justify-between">
          <label class="block text-xs font-semibold text-slate-500">
            {{ $t('callModal.availableCriteriaLabel') }} <span class="text-red-400">* ({{ $t('callModal.selectAtLeastOne') }})</span>
          </label>
        </div>

        <div v-if="criteriaLoading" class="py-8 flex justify-center"><UiLoader size="sm" /></div>

        <div v-else-if="allDisplayCriteria.length === 0" class="text-center py-8 text-sm text-gray-400">
          {{ $t('callModal.noCriteriaAvailable') }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="criterion in allDisplayCriteria"
            :key="criterion.id"
            :class="[
              'rounded-xl border transition-all',
              isCriterionSelected(criterion.id)
                ? 'border-blue-300 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white',
            ]"
          >
            <div
              class="flex items-start gap-3 p-3.5 cursor-pointer select-none"
              @click="toggleCriterion(criterion.id)"
            >
              <div
                class="mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors"
                :class="isCriterionSelected(criterion.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'"
              >
                <Check v-if="isCriterionSelected(criterion.id)" class="w-2.5 h-2.5 text-white" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-navy leading-snug">
                    {{ criterionDisplayName(criterion) }}
                  </p>
                  <span
                    v-if="activeLang && !criterion.translations[activeLang]?.name"
                    class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-500 flex-shrink-0"
                  >
                    {{ $t('callModal.noTranslationBadge') }}
                  </span>
                  <span
                    v-if="criterion.id < 0"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 flex-shrink-0"
                  >
                    {{ $t('callModal.newCriterionBadge') }}
                  </span>
                </div>
                <p v-if="criterionDescription(criterion)" class="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {{ criterionDescription(criterion) }}
                </p>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0" @click.stop>
                <div
                  v-if="isCriterionSelected(criterion.id)"
                  class="flex items-center gap-1.5 text-xs font-medium"
                >
                  <span class="text-slate-400 text-[11px]">{{ $t('callModal.weight') }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-white text-[11px] font-bold"
                    :class="weightColor(getCriterion(criterion.id)!.weight)"
                  >
                    {{ getCriterion(criterion.id)!.weight }}
                  </span>
                </div>
                <button
                  v-if="criterion.id < 0"
                  class="p-1 rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors"
                  :title="$t('callModal.removeNewCriterionTooltip')"
                  @click.stop="removeLocalCriterion(criterion.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              v-if="isCriterionSelected(criterion.id)"
              class="border-t border-blue-100 px-4 pb-3.5 pt-3 space-y-3"
            >
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold text-slate-500">{{ $t('callModal.criterionWeightLabel') }}</label>
                  <span class="text-xs text-slate-400">{{ $t(`callModal.weightLabels.${getCriterion(criterion.id)!.weight - 1}`) }}</span>
                </div>
                <div class="flex gap-1">
                  <button
                    v-for="w in 10"
                    :key="w"
                    :class="[
                      'flex-1 h-7 rounded text-[11px] font-bold transition-all',
                      getCriterion(criterion.id)!.weight === w
                        ? weightButtonActive(w)
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                    ]"
                    :title="`Váha ${w} — ${$t(`callModal.weightLabels.${w - 1}`)}`"
                    @click="setCriterionWeight(criterion.id, w)"
                  >
                    {{ w }}
                  </button>
                </div>
              </div>

              <label class="flex items-center gap-2.5 cursor-pointer w-fit">
                <div
                  class="relative w-8 h-4 rounded-full transition-colors flex-shrink-0"
                  :class="getCriterion(criterion.id)!.is_academic_signal ? 'bg-amber-400' : 'bg-gray-200'"
                  @click="toggleAcademicSignal(criterion.id)"
                >
                  <div
                    class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                    :class="getCriterion(criterion.id)!.is_academic_signal ? 'translate-x-4' : 'translate-x-0.5'"
                  />
                </div>
                <span class="text-xs text-slate-600">
                  {{ $t('callModal.academicSignal') }}
                  <span class="text-slate-400 ml-1">({{ $t('callModal.academicSignalHint') }})</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div class="pt-1">
          <button
            v-if="!showNewCriterionForm"
            class="flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800 border border-violet-200 hover:border-violet-400 rounded-lg px-3 py-2 bg-violet-50 hover:bg-violet-100 transition-all"
            @click="openNewCriterionForm"
          >
            <Plus class="w-4 h-4" />
            {{ $t('callModal.createNewCriterionButton') }}
          </button>

          <div
            v-else
            class="rounded-xl border border-violet-300 bg-violet-50/50 p-4 space-y-4"
          >
            <p class="text-xs font-semibold text-violet-700">{{ $t('callModal.newCriterionFormTitle') }}</p>

            <div
              v-for="lang in languageOptions"
              :key="`nc_lang_${lang.value}`"
              class="space-y-2.5 rounded-lg bg-white border border-violet-100 p-3"
            >
              <p class="text-[11px] font-bold text-violet-500 uppercase tracking-wide">
                {{ lang.code.toUpperCase() }} — {{ lang.label }}
                <span v-if="lang.value === languageOptions[0]?.value" class="text-red-400 font-normal normal-case tracking-normal ml-1">({{ $t('callModal.required') }})</span>
              </p>

              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.criterionNameInputLabel') }}</label>
                <input
                  v-model="newCriterionDraft.translations[lang.value].name"
                  type="text"
                  :placeholder="lang.value === languageOptions[0]?.value ? $t('callModal.criterionNamePlaceholderSK') : $t('callModal.criterionNamePlaceholderEN')"
                  class="w-full rounded-md border px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet-300"
                  :class="newCriterionError && lang.value === languageOptions[0]?.value ? 'border-red-400' : 'border-gray-200'"
                  @keyup.enter="addLocalCriterion"
                />
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.criterionDescriptionInputLabel') }} <span class="text-gray-400 font-normal">({{ $t('callModal.optional') }})</span></label>
                <input
                  v-model="newCriterionDraft.translations[lang.value].description"
                  type="text"
                  :placeholder="lang.value === languageOptions[0]?.value ? $t('callModal.criterionDescriptionPlaceholderSK') : $t('callModal.criterionDescriptionPlaceholderEN')"
                  class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-violet-300"
                  @keyup.enter="addLocalCriterion"
                />
              </div>
            </div>

            <p v-if="newCriterionError" class="text-xs text-red-500">{{ newCriterionError }}</p>

            <div class="flex items-center gap-2 pt-1">
              <button
                class="flex items-center gap-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5 transition-colors"
                @click="addLocalCriterion"
              >
                <Check class="w-3.5 h-3.5" />
                {{ $t('callModal.addAndSelectButton') }}
              </button>
              <button
                class="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                @click="cancelNewCriterion"
              >
                {{ $t('callModal.cancel') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="form.criteria.length > 0" class="flex items-center gap-4 text-xs text-slate-500 pt-1">
          <span>
            {{ $t('callModal.selectedLabel') }}: <strong class="text-slate-700">{{ form.criteria.length }}</strong>
            {{ criteriaCountLabel }}
          </span>
          <span v-if="localNewCriteria.filter(nc => isCriterionSelected(nc.id)).length > 0" class="text-violet-600">
            <strong>{{ localNewCriteria.filter(nc => isCriterionSelected(nc.id)).length }}</strong> {{ $t('callModal.newCriteriaSummarySuffix') }}
          </span>
          <span v-if="academicSignalCount > 0" class="text-amber-600">
            <strong>{{ academicSignalCount }}</strong> {{ academicSignalCountLabel }}
          </span>
          <span class="ml-auto text-slate-400">
            {{ $t('callModal.averageWeightLabel') }}: <strong class="text-slate-600">{{ averageWeight }}</strong>
          </span>
        </div>
      </div>

      <div v-show="activeTab === 'milestones'" class="space-y-4">
        <p class="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 leading-relaxed">
          {{ $t('callModal.milestones.hint') }}
        </p>

        <div v-if="milestonesLoading" class="py-8 flex justify-center"><UiLoader size="sm" /></div>

        <div v-else class="space-y-2">
          <div v-for="m in milestones" :key="m.id" class="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
            <div class="flex items-center gap-3">
              <Flag class="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-navy truncate">{{ m.name }}</p>
                <p class="text-xs text-slate-400">
                 {{ m.start_date ? new Date(m.start_date).toLocaleDateString('sk-SK') : '—' }} → {{ m.deadline ? new Date(m.deadline).toLocaleDateString('sk-SK') : '—' }}
                  <span v-if="m.milestone_status?.name" class="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {{ m.milestone_status.name }}
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-0.5 flex-shrink-0">
                <button
                  class="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                  :title="$t('callModal.milestones.editTooltip')"
                  @click="openEditMilestoneForm(m)"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                  :title="$t('callModal.milestones.deleteTooltip')"
                  @click="deleteMilestone(m)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="milestones.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <Flag class="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p class="text-sm text-gray-400">{{ $t('callModal.milestones.emptyTitle') }}</p>
            <p class="text-xs text-gray-300 mt-1">{{ $t('callModal.milestones.emptySubtitle') }}</p>
          </div>
        </div>

        <div class="relative">
          <button
            v-if="!showMilestoneForm"
            class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-all"
            @click="openNewMilestoneForm"
          >
            <Plus class="w-4 h-4" />
            {{ $t('callModal.milestones.addButton') }}
          </button>

          <div v-else class="rounded-xl border border-blue-300 bg-blue-50/50 p-4 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="block text-xs text-slate-500 mb-1">
                  {{ $t('callModal.milestones.nameLabel') }} <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="milestoneDraft.name"
                  type="text"
                  :placeholder="$t('callModal.milestones.namePlaceholder')"
                  class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.milestones.startDateLabel') }}</label>
                <input v-model="milestoneDraft.start_date" type="date" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.milestones.deadlineLabel') }}</label>
                <input v-model="milestoneDraft.deadline" type="date" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div class="col-span-2">
                <label class="block text-xs text-slate-500 mb-1">{{ $t('callModal.milestones.callLabel') }}</label>
                <select v-model="milestoneDraft.call_id" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                  <option v-for="c in allCallOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </div>
            </div>

            <p v-if="milestoneError" class="text-xs text-red-500">{{ milestoneError }}</p>

            <div class="flex items-center gap-2 pt-1">
              <button class="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors" @click="saveMilestone">
                <Check class="w-3.5 h-3.5" />
                {{ $t('callModal.milestones.saveButton') }}
              </button>
              <button class="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" @click="cancelMilestoneForm">
                {{ $t('callModal.milestones.cancelButton') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'commission'" class="space-y-5">
        <div v-if="commissionLoading" class="flex items-center gap-2 text-sm text-gray-400 py-6">
          <div class="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          Načítavam…
        </div>

        <template v-else>
          <!-- Locked — aspoň jedna prihláška je v hodnotení -->
          <div v-if="commissionLocked" class="space-y-4">
            <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span class="text-amber-500 mt-0.5">🔒</span>
              <div>
                <p class="text-sm font-medium text-amber-800">Komisia je uzamknutá</p>
                <p class="text-xs text-amber-600 mt-0.5">Aspoň jedna prihláška je v stave hodnotenia — komisiu nie je možné zmeniť.</p>
              </div>
            </div>
            <div v-if="commissionSetup?.commission" class="rounded-xl border border-gray-200 divide-y divide-gray-100 text-sm">
              <div class="flex items-center justify-between px-4 py-3">
                <span class="text-gray-500">Komisia</span>
                <span class="font-medium text-navy">{{ commissionSetup.commission.name }}</span>
              </div>
              <div v-if="commissionSetup.company_rep" class="flex items-center justify-between px-4 py-3">
                <span class="text-gray-500">Zástupca firmy</span>
                <div class="text-right">
                  <p class="font-medium text-navy">{{ commissionSetup.company_rep.name }}</p>
                  <p class="text-xs text-gray-400">{{ commissionSetup.company_rep.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Editovateľné — žiadna prihláška ešte nie je v hodnotení -->
          <template v-else>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">
                Hodnotiaca komisia
              </label>
              <select
                v-model="commissionForm.commission_id"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option :value="null">— Vybrať komisiu —</option>
                <option v-for="c in commissions" :key="c.id" :value="c.id">
                  {{ c.name }} ({{ c.members.length }} {{ c.members.length === 1 ? 'hodnotiteľ' : c.members.length < 5 ? 'hodnotitelia' : 'hodnotiteľov' }})
                </option>
              </select>

              <div v-if="selectedCommission" class="mt-2 rounded-lg bg-gray-50 px-3 py-2 space-y-1">
                <p v-if="!selectedCommission.members.length" class="text-xs text-gray-400 italic">Komisia nemá žiadnych hodnotiteľov.</p>
                <div
                  v-for="m in selectedCommission.members"
                  :key="m.id"
                  class="flex items-center gap-2 text-xs text-gray-600"
                >
                  <div class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {{ memberInitials(m.name) }}
                  </div>
                  <span>{{ m.name }}</span>
                  <span class="text-gray-400">{{ m.email }}</span>
                </div>
              </div>
            </div>

            <div v-if="isProgramB">
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Zástupca firmy</label>
              <p class="text-xs text-gray-400 mb-2">Musí byť členom organizácie, ktorá vytvorila túto výzvu.</p>
              <div v-if="!orgMembers.length" class="text-sm text-orange-500 bg-orange-50 rounded-lg px-3 py-2">
                Táto výzva nemá priradenú organizáciu alebo organizácia nemá žiadnych členov.
              </div>
              <select
                v-else
                v-model="commissionForm.company_rep_user_id"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option :value="null">— Vybrať zástupcu —</option>
                <option v-for="m in orgMembers" :key="m.id" :value="m.id">
                  {{ m.name }} ({{ m.email }})
                </option>
              </select>
            </div>

            <div class="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
              Po uložení sa pre všetky prihlášky tejto výzvy automaticky vytvoria hodnotiace hárky pre všetkých členov komisie{{ isProgramB ? ' a zástupcu firmy' : '' }}.
            </div>
          </template>
        </template>
      </div>
    </template>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">{{ $t('callModal.cancel') }}</UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? $t('callModal.savingStatus') : $t('callModal.saveButton') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Type, AlignLeft, Hash, Mail, ChevronDown, ChevronUp,
  Circle, CheckSquare, Calendar, Paperclip,
  Plus, Trash2, GripVertical, X, Pencil, FileText, Check, Flag,
} from 'lucide-vue-next'

const { t } = useI18n()

// ── Types ──────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'date' | 'file'

interface FormField {
  id: string
  type: FieldType
  label: string
  name: string
  placeholder: string
  required: boolean
  help_text: string
  options: string[]
  accept: string
}

/** Translation entry for a single language */
interface TranslationDraft {
  name: string
  description: string
}

/** A criterion from the server or locally created — always keyed by language_id */
interface Criterion {
  id: number
  translations: Record<number, TranslationDraft>
  /** Fallback display string when no translation exists for active lang */
  fallback: string
}

interface CriterionPivot {
  id: number
  weight: number
  is_academic_signal: boolean
}

interface CallTranslation {
  language_id: number
  name: string
  description?: string
}

interface LanguageOption {
  value: number
  label: string
  /** Derived short code e.g. "sk", "en" */
  code: string
}

interface CallRaw {
  id?: number
  name?: string
  description?: string
  program_id?: number
  status_id?: number
  qualification_stack_id?: number | null
  force_closed?: boolean | number | string
  po_closure_approved_at?: string | null
  application_start?: string
  application_deadline?: string
  project_start?: string
  project_end?: string
  status?: { id: number; name: string }
  call_translations?: CallTranslation[]
  callTranslations?: CallTranslation[]
  call_criteria?: {
    id: number
    name?: string
    description?: string
    pivot?: { weight: number; is_academic_signal: boolean }
  }[]
  callCriteria?: {
    id: number
    name?: string
    description?: string
    pivot?: { weight: number; is_academic_signal: boolean }
  }[]
  application_form_schema?: { fields?: FormField[] }
  form_schema?: { fields?: FormField[] }
  program?: { id: number; name: string }
  qualification_stack?: { id: number; name?: string }
}

// ── Props / emits ──────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: boolean
  call?: CallRaw | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const formatPoClosureDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('sk-SK') : '—'

// ── Constants ──────────────────────────────────────────────────────────────

const FIELD_TYPE_CONFIG: Record<FieldType, { labelKey: string; icon: any; color: string }> = {
  text:     { labelKey: 'callModal.fieldTypes.text',     icon: Type,        color: 'text-blue-500' },
  textarea: { labelKey: 'callModal.fieldTypes.textarea', icon: AlignLeft,   color: 'text-indigo-500' },
  number:   { labelKey: 'callModal.fieldTypes.number',   icon: Hash,        color: 'text-violet-500' },
  email:    { labelKey: 'callModal.fieldTypes.email',    icon: Mail,        color: 'text-sky-500' },
  select:   { labelKey: 'callModal.fieldTypes.select',   icon: ChevronDown, color: 'text-amber-500' },
  radio:    { labelKey: 'callModal.fieldTypes.radio',    icon: Circle,      color: 'text-orange-500' },
  checkbox: { labelKey: 'callModal.fieldTypes.checkbox', icon: CheckSquare, color: 'text-emerald-500' },
  date:     { labelKey: 'callModal.fieldTypes.date',     icon: Calendar,    color: 'text-rose-500' },
  file:     { labelKey: 'callModal.fieldTypes.file',     icon: Paperclip,   color: 'text-teal-500' },
}

const PROGRAM_A_DEFAULTS: FormField[] = [
  { id: 'doc_executive_summary',      type: 'file', label: 'Executive Summary',      name: 'executive_summary',      required: true, help_text: 'Stručný opis problému, riešenia, trhu a prínosu', placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
  { id: 'doc_technical_architecture', type: 'file', label: 'Technická architektúra', name: 'technical_architecture', required: true, help_text: 'Opis riešenia, technológií, modulov a prevádzky',      placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
  { id: 'doc_roadmap',                type: 'file', label: 'Roadmapa',               name: 'roadmap',                required: true, help_text: 'Míľniky, plán realizácie a harmonogram',              placeholder: '', options: [], accept: '.pdf,.doc,.docx,.xlsx' },
  { id: 'doc_budget',                 type: 'file', label: 'Rozpočet',               name: 'budget',                 required: true, help_text: 'Plán čerpania grantu a očakávané náklady',            placeholder: '', options: [], accept: '.pdf,.doc,.docx,.xlsx' },
  { id: 'doc_risk_analysis',          type: 'file', label: 'Riziková analýza',       name: 'risk_analysis',          required: true, help_text: 'Identifikácia rizík, dopadov a mitigácií',            placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
  { id: 'doc_monetization_model',     type: 'file', label: 'Monetizačný model',      name: 'monetization_model',     required: true, help_text: 'Spôsob vytvárania hodnoty a príjmov produktu',       placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
]

// ── Tabs ───────────────────────────────────────────────────────────────────

const activeTab = ref<'basic' | 'form' | 'criteria' | 'milestones' | 'commission'>('basic')

const TABS = computed(() => {
  const tabs: { key: string; label: string; badge?: number }[] = [
    { key: 'basic',    label: t('callModal.tabs.basic'),    badge: undefined },
    { key: 'form',     label: t('callModal.tabs.form'),     badge: formFields.value.length },
    { key: 'criteria', label: t('callModal.tabs.criteria'), badge: form.value.criteria.length },
  ]

  if (isEditing.value) {
    tabs.push({ key: 'milestones', label: t('callModal.tabs.milestones'), badge: milestones.value.length })
  }

  tabs.push({ key: 'commission', label: 'Komisia', badge: undefined })

  return tabs
})

// ── API / toasts ───────────────────────────────────────────────────────────

const api = useApi()
const { addToast } = useToast()

// ── Options ────────────────────────────────────────────────────────────────

const programOptions           = ref<{ value: number; label: string }[]>([])
const allStatusOptions         = ref<{ value: number; label: string }[]>([])
const availableTransitionNames = ref<string[] | null>(null) // null = neobmedzené (create mode)
const originalStatusId         = ref<number | null>(null)
const languageOptions          = ref<LanguageOption[]>([])
const qualificationStackOptions = ref<{ value: number; label: string }[]>([])
const availableCriteria        = ref<Criterion[]>([])

const metaLoading     = ref(false)
const criteriaLoading = ref(false)
const isSaving        = ref(false)

const statusOptions = computed(() => {
  if (availableTransitionNames.value === null) return allStatusOptions.value
  const transitions = allStatusOptions.value.filter(s =>
    availableTransitionNames.value!.includes(s.label)
  )

  const currentOption = allStatusOptions.value.find(s => s.value === originalStatusId.value)
  if (currentOption && !transitions.find(s => s.value === currentOption.value)) {
    return [currentOption, ...transitions]
  }
  return transitions
})

// ── Commission tab state ───────────────────────────────────────────────────

interface CommissionMember { id: number; user_id: number; name: string; email: string }
interface CommissionOption { id: number; name: string; members: CommissionMember[] }
interface OrgMember { id: number; name: string; email: string }
interface CommissionSetupResult {
  commission: { id: number; name: string } | null
  company_rep: { id: number; name: string; email: string } | null
}

const commissionLoading  = ref(false)
const commissions        = ref<CommissionOption[]>([])
const orgMembers         = ref<OrgMember[]>([])
const commissionSetup    = ref<CommissionSetupResult | null>(null)
const commissionLocked   = ref(false)
const commissionForm     = ref<{ commission_id: number | null; company_rep_user_id: number | null }>({
  commission_id: null, company_rep_user_id: null,
})

const isProgramB = computed(() => {
  const prog = programOptions.value.find(p => p.value === form.value.program_id)
  return (prog?.label ?? '').toLowerCase().includes('b')
})

const selectedCommission = computed(() =>
  commissionForm.value.commission_id
    ? commissions.value.find(c => c.id === commissionForm.value.commission_id) ?? null
    : null,
)

function memberInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

async function fetchCommissionData(callId?: number) {
  commissionLoading.value = true
  try {
    const requests: Promise<any>[] = [api.get('/v1/admin/commissions') as Promise<any>]
    if (callId) {
      requests.push(api.get(`/v1/admin/calls/${callId}/commission-setup`) as Promise<any>)
      if (isProgramB.value) {
        requests.push(api.get(`/v1/admin/calls/${callId}/org-members`) as Promise<any>)
      }
    }
    const [comRes, setupRes, orgRes] = await Promise.all(requests)
    commissions.value     = comRes?.data ?? comRes ?? []
    commissionSetup.value = setupRes?.commission_setup ?? null
    commissionLocked.value = setupRes?.locked ?? false
    orgMembers.value      = orgRes?.data ?? []
    if (commissionSetup.value?.commission?.id) {
      commissionForm.value.commission_id = commissionSetup.value.commission.id
    }
    if (commissionSetup.value?.company_rep?.id) {
      commissionForm.value.company_rep_user_id = commissionSetup.value.company_rep.id
    }
  } catch (e: any) {
    addToast({ message: e?.message ?? 'Nepodarilo sa načítať komisie.', type: 'error' })
  } finally {
    commissionLoading.value = false
  }
}

// ── Milestones tab state ───────────────────────────────────────────────────

interface MilestoneRow {
  id: number
  name: string
  description?: string | null
  start_date: string | null
  deadline: string | null
  call_id: number | null
  call?: { id: number; name: string } | null
  milestone_status?: { id: number; name: string } | null
}

const milestones          = ref<MilestoneRow[]>([])
const milestonesLoading   = ref(false)
const showMilestoneForm    = ref(false)
const editingMilestoneId   = ref<number | null>(null)
const milestoneError       = ref('')
const allCallOptions       = ref<{ value: number; label: string }[]>([])

const emptyMilestoneDraft = () => ({
  name: '',
  start_date: '',
  deadline: '',
  call_id: props.call?.id ?? null as number | null,
})

const milestoneDraft = ref(emptyMilestoneDraft())

async function fetchMilestones(callId: number) {
  milestonesLoading.value = true
  try {
    const res: any = await api.get(`/v1/admin/calls/${callId}/milestones-admin`)
    milestones.value = res?.data ?? res ?? []
  } catch {
    addToast({ message: t('callModal.milestones.toasts.loadError'), type: 'error' })
  } finally {
    milestonesLoading.value = false
  }
}

async function fetchCallOptionsForMilestones() {
  try {
    const res: any = await api.get('/v1/admin/calls?per_page=100')
    const list: any[] = Array.isArray(res) ? res : res?.data ?? []
    allCallOptions.value = list.map((c: any) => ({
      value: c.id,
      label: c.name ?? c.call_translations?.[0]?.name ?? `#${c.id}`,
    }))
  } catch { /* non-fatal */ }
}

function openNewMilestoneForm() {
  milestoneDraft.value     = emptyMilestoneDraft()
  editingMilestoneId.value = null
  milestoneError.value     = ''
  showMilestoneForm.value  = true
}

function openEditMilestoneForm(m: MilestoneRow) {
  milestoneDraft.value = {
    name:       m.name,
    start_date: m.start_date?.slice(0, 10) ?? '',
    deadline:   m.deadline?.slice(0, 10) ?? '',
    call_id:    m.call_id,
  }
  editingMilestoneId.value = m.id
  milestoneError.value     = ''
  showMilestoneForm.value  = true
}

function cancelMilestoneForm() {
  showMilestoneForm.value  = false
  editingMilestoneId.value = null
  milestoneError.value     = ''
}

async function saveMilestone() {
  if (!milestoneDraft.value.name.trim()) {
    milestoneError.value = t('callModal.milestones.validation.nameRequired')
    return
  }
  if (
    milestoneDraft.value.start_date &&
    milestoneDraft.value.deadline &&
    milestoneDraft.value.deadline < milestoneDraft.value.start_date
  ) {
    milestoneError.value = t('callModal.milestones.validation.deadlineOrder')
    return
  }
  milestoneError.value = ''

  const payload = {
    name:       milestoneDraft.value.name.trim(),
    start_date: milestoneDraft.value.start_date || null,
    deadline:   milestoneDraft.value.deadline || null,
    call_id:    milestoneDraft.value.call_id,
  }

  try {
    if (editingMilestoneId.value) {
      const updated: any = await api.put(`/v1/admin/update-milestone/${editingMilestoneId.value}`, payload)
      const idx = milestones.value.findIndex(m => m.id === editingMilestoneId.value)
      if (payload.call_id !== props.call?.id) {
        // Reassigned away from this call — remove from the current list
        if (idx !== -1) milestones.value.splice(idx, 1)
      } else if (idx !== -1) {
        milestones.value[idx] = updated?.data ?? updated
      }
    } else {
      const created: any = await api.post('/v1/admin/save-milestone', payload)
      milestones.value.push(created?.data ?? created)
    }
    addToast({ message: t('callModal.milestones.toasts.saveSuccess'), type: 'success' })
    showMilestoneForm.value  = false
    editingMilestoneId.value = null
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? t('callModal.milestones.toasts.saveError')
    milestoneError.value = msg
    addToast({ message: msg, type: 'error' })
  }
}

async function deleteMilestone(m: MilestoneRow) {
  if (!confirm(t('callModal.milestones.deleteConfirm'))) return
  try {
    await api.delete(`/v1/admin/delete-milestone/${m.id}`)
    milestones.value = milestones.value.filter(x => x.id !== m.id)
    addToast({ message: t('callModal.milestones.toasts.deleteSuccess'), type: 'success' })
  } catch {
    addToast({ message: t('callModal.milestones.toasts.deleteError'), type: 'error' })
  }
}

/** Currently active language tab (language_id) */
const activeLang = ref<number | null>(null)

// Only show Program A when creating; show all when editing
const visibleProgramOptions = computed(() => {
  if (isEditing.value) return programOptions.value
  return programOptions.value.filter(o => o.label.toLowerCase().trim() === 'program a')
})

/** Label for the currently active language */
const currentLangLabel = computed(() =>
  languageOptions.value.find(l => l.value === activeLang.value)?.label ?? '—'
)

// ── Form ───────────────────────────────────────────────────────────────────

const isEditing = computed(() => !!props.call?.id)

const emptyForm = () => ({
  program_id:              null as number | null,
  status_id:               null as number | null,
  qualification_stack_id:  null as number | null,
  /** Map of language_id → { name, description } */
  translations:            {} as Record<number, TranslationDraft>,
  application_start:       '',
  application_deadline:    '',
  project_start:           '',
  project_end:             '',
  force_closed:            false,
  po_closure_approved_at:  null as string | null,
  criteria:                [] as CriterionPivot[],
})

const form    = ref(emptyForm())
const errors  = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

// ── Writable computeds for current-language name & description ─────────────

const currentName = computed({
  get: () => activeLang.value != null
    ? (form.value.translations[activeLang.value]?.name ?? '')
    : '',
  set: (val: string) => {
    if (activeLang.value != null) {
      if (!form.value.translations[activeLang.value]) {
        form.value.translations[activeLang.value] = { name: '', description: '' }
      }
      form.value.translations[activeLang.value].name = val
    }
  },
})

const currentDescription = computed({
  get: () => activeLang.value != null
    ? (form.value.translations[activeLang.value]?.description ?? '')
    : '',
  set: (val: string) => {
    if (activeLang.value != null) {
      if (!form.value.translations[activeLang.value]) {
        form.value.translations[activeLang.value] = { name: '', description: '' }
      }
      form.value.translations[activeLang.value].description = val
    }
  },
})

// ── Form builder ───────────────────────────────────────────────────────────

const formFields      = ref<FormField[]>([])
const editingFieldIdx = ref<number | null>(null)
const showFieldPicker = ref(false)
const isFormDirty     = ref(false)

function generateId() {
  return `field_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function labelToName(label: string): string {
  const base = label.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '_')
  if (!base) return 'pole'
  return /^[a-z]/.test(base) ? base : 'f_' + base
}

function onLabelInput(field: FormField) {
  isFormDirty.value = true
  field.name = labelToName(field.label)
}

function onTypeChange(field: FormField) {
  isFormDirty.value = true
  if (!['select', 'radio', 'checkbox'].includes(field.type)) field.options = []
  else if (field.options.length === 0) field.options = ['']
  if (field.type !== 'file') field.accept = ''
  else if (!field.accept) field.accept = '.pdf,.doc,.docx'
}

function addField(type: FieldType) {
  isFormDirty.value = true
  formFields.value.push({
    id: generateId(), type, label: '', name: '', placeholder: '',
    required: false, help_text: '',
    options: ['select', 'radio', 'checkbox'].includes(type) ? [''] : [],
    accept: type === 'file' ? '.pdf,.doc,.docx' : '',
  })
  editingFieldIdx.value = formFields.value.length - 1
}

function removeField(idx: number) {
  isFormDirty.value = true
  formFields.value.splice(idx, 1)
  if (editingFieldIdx.value === idx) editingFieldIdx.value = null
  else if (editingFieldIdx.value !== null && editingFieldIdx.value > idx) editingFieldIdx.value--
}

function moveField(from: number, to: number) {
  isFormDirty.value = true
  const [moved] = formFields.value.splice(from, 1)
  formFields.value.splice(to, 0, moved)
  if (editingFieldIdx.value === from) editingFieldIdx.value = to
}

// ── Criteria display helpers ───────────────────────────────────────────────

/**
 * Returns the criterion name in activeLang, falling back to the first
 * available translation, then to a generic label.
 */
function criterionDisplayName(criterion: Criterion): string {
  if (activeLang.value != null && criterion.translations[activeLang.value]?.name) {
    return criterion.translations[activeLang.value].name
  }
  const first = Object.values(criterion.translations).find(t => t.name)
  return first?.name ?? criterion.fallback ?? `${t('callModal.criterionFallbackPrefix')} #${criterion.id}`
}

function criterionDescription(criterion: Criterion): string | undefined {
  if (activeLang.value != null && criterion.translations[activeLang.value]?.description) {
    return criterion.translations[activeLang.value].description
  }
  const first = Object.values(criterion.translations).find(t => t.description)
  return first?.description ?? undefined
}

// ── Criteria pivot helpers ─────────────────────────────────────────────────

function getCriterion(id: number): CriterionPivot | undefined {
  return form.value.criteria.find(c => c.id === id)
}

function isCriterionSelected(id: number): boolean {
  return form.value.criteria.some(c => c.id === id)
}

function toggleCriterion(id: number) {
  const idx = form.value.criteria.findIndex(c => c.id === id)
  if (idx === -1) {
    form.value.criteria.push({ id, weight: 5, is_academic_signal: false })
  } else {
    form.value.criteria.splice(idx, 1)
  }
}

function setCriterionWeight(id: number, weight: number) {
  const c = getCriterion(id)
  if (c) c.weight = weight
}

function toggleAcademicSignal(id: number) {
  const c = getCriterion(id)
  if (c) c.is_academic_signal = !c.is_academic_signal
}

function weightColor(w: number): string {
  if (w <= 2) return 'bg-gray-400'
  if (w <= 4) return 'bg-blue-300'
  if (w <= 6) return 'bg-blue-500'
  if (w <= 8) return 'bg-blue-700'
  return 'bg-indigo-800'
}

function weightButtonActive(w: number): string {
  if (w <= 2) return 'bg-gray-400 text-white'
  if (w <= 4) return 'bg-blue-300 text-white'
  if (w <= 6) return 'bg-blue-500 text-white'
  if (w <= 8) return 'bg-blue-700 text-white'
  return 'bg-indigo-800 text-white'
}

const academicSignalCount = computed(() =>
  form.value.criteria.filter(c => c.is_academic_signal).length
)

const averageWeight = computed(() => {
  if (!form.value.criteria.length) return '—'
  const sum = form.value.criteria.reduce((a, c) => a + c.weight, 0)
  return (sum / form.value.criteria.length).toFixed(1)
})

const criteriaCountLabel = computed(() => {
  const n = form.value.criteria.length
  if (n === 1) return t('callModal.criteriaCountSingular')
  if (n < 5)   return t('callModal.criteriaCountPluralFew')
  return t('callModal.criteriaCountPluralMany')
})

const academicSignalCountLabel = computed(() => {
  const n = academicSignalCount.value
  if (n === 1) return t('callModal.academicSignalCountSingular')
  if (n < 5)   return t('callModal.academicSignalCountPluralFew')
  return t('callModal.academicSignalCountPluralMany')
})

// ── Local new-criterion form ───────────────────────────────────────────────
// New criteria use negative temp IDs (never clash with real DB IDs).
// On submit they are POSTed first; real IDs are swapped in before the call save.

let _tempIdSeq = -1

const localNewCriteria     = ref<Criterion[]>([])
const showNewCriterionForm = ref(false)
const newCriterionDraft    = ref<{ translations: Record<number, TranslationDraft> }>({ translations: {} })
const newCriterionError    = ref('')

/** Combined list: server criteria + locally drafted ones */
const allDisplayCriteria = computed<Criterion[]>(() => [
  ...availableCriteria.value,
  ...localNewCriteria.value,
])

function openNewCriterionForm() {
  // Ensure draft translations object has keys for all loaded languages
  newCriterionDraft.value = {
    translations: Object.fromEntries(
      languageOptions.value.map(l => [l.value, { name: '', description: '' }])
    ),
  }
  showNewCriterionForm.value = true
}

function addLocalCriterion() {
  const primaryLangId = languageOptions.value[0]?.value
  if (!primaryLangId || !newCriterionDraft.value.translations[primaryLangId]?.name?.trim()) {
    newCriterionError.value = t('callModal.validation.newCriterionPrimaryRequired', { lang: languageOptions.value[0]?.label ?? t('callModal.primaryLanguageFallback') })
    return
  }
  newCriterionError.value = ''
  const tempId = _tempIdSeq--

  // Deep-copy draft translations
  const translations: Record<number, TranslationDraft> = {}
  for (const [langId, tr] of Object.entries(newCriterionDraft.value.translations)) {
    translations[Number(langId)] = { name: tr.name.trim(), description: tr.description.trim() }
  }

  localNewCriteria.value.push({
    id:           tempId,
    translations,
    fallback:     translations[primaryLangId]?.name ?? `${t('callModal.criterionFallbackPrefix')} #${Math.abs(tempId)}`,
  })
  form.value.criteria.push({ id: tempId, weight: 5, is_academic_signal: false })
  showNewCriterionForm.value = false
}

function removeLocalCriterion(tempId: number) {
  localNewCriteria.value = localNewCriteria.value.filter(nc => nc.id !== tempId)
  form.value.criteria    = form.value.criteria.filter(c => c.id !== tempId)
}

function cancelNewCriterion() {
  showNewCriterionForm.value = false
  newCriterionError.value    = ''
}

// ── Language helpers ───────────────────────────────────────────────────────

/** Derive a short language code from a full label */
function deriveLangCode(label: string): string {
  const l = label.toLowerCase()
  if (l === 'sk' || l.includes('sloven'))                         return 'sk'
  if (l === 'en' || l.includes('english') || l.includes('anglič')) return 'en'
  if (l === 'cs' || l.includes('češtin') || l.includes('czech'))  return 'cs'
  if (l === 'de' || l.includes('deutsch') || l.includes('nemčina')) return 'de'
  return label.length <= 3 ? label.toLowerCase() : label.slice(0, 2).toLowerCase()
}

/** Whether a given language has any active validation errors */
function hasLangErrors(langId: number): boolean {
  return !!errors.value[`name_${langId}`] || !!errors.value[`description_${langId}`]
}

/** Initialize the form.translations map for all loaded languages */
function initTranslations() {
  form.value.translations = Object.fromEntries(
    languageOptions.value.map(l => [l.value, { name: '', description: '' }])
  )
}

// ── Meta fetchers ──────────────────────────────────────────────────────────

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [programs, statuses, languages] = await Promise.all([
      api.get('/program-types')  as Promise<any>,
      api.get('/call-statuses')  as Promise<any>,
      api.get('/languages')      as Promise<any>,
    ])
    const list = (r: any): any[] => Array.isArray(r) ? r : r?.data ?? []

    programOptions.value = list(programs).map((p: any) => ({
      value: p.id,
      label: p.typeOfProgram?.name ?? p.name ?? `#${p.id}`,
    }))
    allStatusOptions.value = list(statuses).map((s: any) => ({
      value: s.id,
      label: s.name,
    }))
    languageOptions.value = list(languages).map((l: any) => ({
      value: l.id,
      label: l.name,
      code:  deriveLangCode(l.name),
    }))

    // Set active language BEFORE metaLoading flips to false so the template
    // never renders with activeLang === null.
    activeLang.value = languageOptions.value[0]?.value ?? null

    // Fetch qualification stacks using the primary language code (best-effort).
    // Normalize labels by preferring the primary language translation when present.
    const primaryCode = languageOptions.value[0]?.code ?? 'sk'
    const primaryLangId = languageOptions.value[0]?.value ?? null
    try {
      const stacksRes: any = await api.get(`/qualification-stacks/lang/${primaryCode}`)
      const stacksList: any[] = Array.isArray(stacksRes) ? stacksRes : stacksRes?.data ?? []
      qualificationStackOptions.value = stacksList.map((s: any) => {
        // translations may be an array of { language_id, name }
        const trs: any[] = s.translations ?? s.translation ?? s.translations_ ?? []
        let label = trs?.find((tr: any) => {
          const lid = tr.language_id ?? tr.languageId ?? tr.language?.id
          return primaryLangId != null && lid === primaryLangId
        })?.name
        label = label ?? trs?.[0]?.name ?? s.name ?? `#${s.id}`
        return { value: s.id, label }
      })
    } catch { /* non-fatal — stacks are optional */ }
  } catch {
    addToast({ message: t('callModal.toasts.metaError'), type: 'error' })
  } finally {
    metaLoading.value = false
  }
}

async function fetchCriteria() {
  criteriaLoading.value = true
  try {
    const res: any = await api.get('/v1/admin/criteria')
    const list: any[] = Array.isArray(res) ? res : res?.data ?? []

    availableCriteria.value = list.map((c: any) => {
      // Accept multiple possible translation keys returned by different endpoints
      const rawTrs: any[] = c.criterionTranslations ?? c.criterion_translations ?? c.translations ?? c.translation ?? []
      const translations: Record<number, TranslationDraft> = {}
      for (const tr of rawTrs) {
        const langId = tr.language_id ?? tr.languageId ?? tr.language?.id
        if (langId) {
          translations[Number(langId)] = {
            name:        tr.name        ?? tr.title ?? '',
            description: tr.description ?? tr.desc  ?? '',
          }
        }
      }
      // Fallback name when translations are empty (e.g. legacy data)
      const fallback = c.name ?? rawTrs[0]?.name ?? rawTrs[0]?.title ?? `${t('callModal.criterionFallbackPrefix')} #${c.id}`
      return { id: c.id, translations, fallback } as Criterion
    })
  } catch { /* non-fatal */ } finally {
    criteriaLoading.value = false
  }
}

// ── Watch: modal open/close ────────────────────────────────────────────────
const fullCallData = ref<CallRaw | null>(null)
watch(() => props.modelValue, async (open) => {
  if (!open) return

  // ── Reset all transient state ──────────────────────────────────────────
  activeTab.value        = 'basic'
  activeLang.value       = null   // will be set inside fetchMeta
  editingFieldIdx.value  = null
  showFieldPicker.value  = false
  errors.value           = {}
  touched.value          = {}
  isFormDirty.value      = false
  localNewCriteria.value    = []
  showNewCriterionForm.value = false
  newCriterionError.value    = ''
  commissions.value          = []
  orgMembers.value           = []
  commissionSetup.value      = null
  commissionLocked.value     = false
  commissionForm.value       = { commission_id: null, company_rep_user_id: null }
  availableTransitionNames.value = null
  originalStatusId.value         = null
  milestones.value          = []
  showMilestoneForm.value   = false
  editingMilestoneId.value  = null
  milestoneError.value      = ''
  milestoneDraft.value      = emptyMilestoneDraft()

  await Promise.all([fetchMeta(), fetchCriteria()])

  // ── Derive default status & initialize translation slots ──────────────
  const defaultStatusId =
    statusOptions.value.find(s => s.label.toLowerCase().includes('koncept'))?.value
    ?? statusOptions.value[0]?.value ?? null

  const allLangIds = languageOptions.value.map(l => l.value)

  if (props.call?.id) {
    // ── EDIT MODE ──────────────────────────────────────────────────────
    // Prefer a full resource from the API when possible — list endpoints
    // often return a shallow/trimmed item. Merge the fetched resource
    // over the provided `props.call` so we keep any locally-present
    // fields while preferring the server's canonical representation.
    let c: any = props.call
    try {
      const [fullRes, workflowRes]: any[] = await Promise.all([
        api.get(`/v1/admin/calls/${props.call.id}`),
        api.get(`/v1/calls/${props.call.id}/workflow`).catch(() => null),
      ])
      const fetched = Array.isArray(fullRes) ? fullRes[0] : fullRes?.data ?? fullRes
      if (fetched) c = { ...(props.call ?? {}), ...(fetched ?? {}) }
      if (workflowRes?.available_transitions) {
        availableTransitionNames.value = workflowRes.available_transitions
      }
    } catch {
      // Non-fatal: fall back to the passed-in prop if fetch fails
      c = props.call
    }

    // Initialize all language slots to empty, then fill from existing translations
    const translations: Record<number, TranslationDraft> = Object.fromEntries(
      allLangIds.map(id => [id, { name: '', description: '' }])
    )
    const callTrs = c.call_translations ?? c.callTranslations ?? []
    for (const tr of callTrs) {
      if (tr.language_id && allLangIds.includes(tr.language_id)) {
        translations[tr.language_id] = {
          name:        tr.name        ?? '',
          description: tr.description ?? '',
        }
      }
    }

    originalStatusId.value = c.status_id ?? c.status?.id ?? null
    form.value = {
      program_id:             c.program_id ?? c.program?.id ?? null,
      status_id:              c.status_id  ?? c.status?.id  ?? null,
     qualification_stack_id: c.qualification_stack_id ?? c.qualification_stack?.id ?? null,
      translations,
      application_start:      c.application_start?.slice(0, 10)    ?? '',
      application_deadline:   c.application_deadline?.slice(0, 10) ?? '',
      project_start:          c.project_start?.slice(0, 10)        ?? '',
      project_end:            c.project_end?.slice(0, 10)          ?? '',
      force_closed:            c.force_closed === true || String(c.force_closed) === '1' || Number(c.force_closed) === 1,
      po_closure_approved_at:  c.po_closure_approved_at ?? null,
      criteria: (c.call_criteria ?? c.callCriteria ?? []).map(cr => ({
        id:                 cr.id,
        weight:             cr.pivot?.weight             ?? 5,
        is_academic_signal: !!cr.pivot?.is_academic_signal,
      })),
    }

    const rawFields = c.application_form_schema?.fields ?? c.form_schema?.fields ?? []
    formFields.value = rawFields.length > 0 ? JSON.parse(JSON.stringify(rawFields)) : []

    fetchCommissionData(props.call.id)
    fetchMilestones(props.call.id)
    fetchCallOptionsForMilestones()
  } else {
    // ── CREATE MODE ────────────────────────────────────────────────────
    form.value = {
      ...emptyForm(),
      status_id:    defaultStatusId,
      translations: Object.fromEntries(allLangIds.map(id => [id, { name: '', description: '' }])),
    }
    formFields.value = JSON.parse(JSON.stringify(PROGRAM_A_DEFAULTS))

    if (visibleProgramOptions.value.length === 1) {
      form.value.program_id = visibleProgramOptions.value[0].value
    }

    fetchCommissionData()
  }
})

watch(() => form.value.program_id, (newId) => {
  if (isEditing.value || !newId || isFormDirty.value || formFields.value.length > PROGRAM_A_DEFAULTS.length) return
  const selected   = programOptions.value.find(p => p.value === newId)
  const isProgramA = selected?.label?.toLowerCase() === 'program a'
  if (isProgramA) {
    formFields.value = JSON.parse(JSON.stringify(PROGRAM_A_DEFAULTS))
  }
})

// ── Real-time date cross-validation ───────────────────────────────────────

watch(
  [() => form.value.application_start, () => form.value.application_deadline],
  ([start, end]) => {
    if (start && end && end < start)
      errors.value.application_deadline = t('callModal.validation.deadlineOrder')
    else
      delete errors.value.application_deadline
  },
)

watch(
  [() => form.value.project_start, () => form.value.project_end],
  ([start, end]) => {
    if (start && end && end < start)
      errors.value.project_end = t('callModal.validation.projectEndOrder')
    else
      delete errors.value.project_end
  },
)

// ── Validation ─────────────────────────────────────────────────────────────

function isValid(field: string) { return !errors.value[field] }

function validate(): boolean {
  errors.value = {}

  // 1. ZÁKLADNÉ INFO — non-translatable fields
  if (!form.value.program_id) errors.value.program_id = t('callModal.validation.programRequired')

  if (!form.value.application_start)    errors.value.application_start    = t('callModal.validation.requiredField')
  if (!form.value.application_deadline) errors.value.application_deadline = t('callModal.validation.requiredField')
  if (!form.value.project_start)        errors.value.project_start        = t('callModal.validation.requiredField')
  if (!form.value.project_end)          errors.value.project_end          = t('callModal.validation.requiredField')

  if (form.value.application_start && form.value.application_deadline &&
      form.value.application_deadline < form.value.application_start) {
    errors.value.application_deadline = t('callModal.validation.deadlineOrder')
  }
  if (form.value.project_start && form.value.project_end &&
      form.value.project_end < form.value.project_start) {
    errors.value.project_end = t('callModal.validation.projectEndOrder')
  }

  // 2. ZÁKLADNÉ INFO — translatable fields (all languages)
  for (const lang of languageOptions.value) {
    const tr = form.value.translations[lang.value] ?? { name: '', description: '' }
    if (!tr.name.trim()) {
      errors.value[`name_${lang.value}`] = t('callModal.validation.nameTranslatableRequired', { code: lang.code.toUpperCase() })
    }
    if (!tr.description.trim()) {
      errors.value[`description_${lang.value}`] = t('callModal.validation.descriptionTranslatableRequired', { code: lang.code.toUpperCase() })
    }
  }

  if (Object.keys(errors.value).length > 0) {
    activeTab.value = 'basic'
    // Automatically switch to the first language tab that has errors
    const firstErrorLang = languageOptions.value.find(l =>
      errors.value[`name_${l.value}`] || errors.value[`description_${l.value}`]
    )
    if (firstErrorLang) activeLang.value = firstErrorLang.value
    addToast({ message: t('callModal.toasts.validationBasicError'), type: 'error' })
    return false
  }

  // 3. FORMULÁR PRIHLÁŠKY
  for (const field of formFields.value) {
    if (!field.label.trim()) {
      activeTab.value = 'form'
      errors.value._form = t('callModal.validation.formFieldNameRequired')
      addToast({ message: t('callModal.toasts.formFieldNameError'), type: 'error' })
      return false
    }
    if (!field.name.trim() || !/^[a-z][a-z0-9_]*$/.test(field.name)) {
      activeTab.value = 'form'
      errors.value._form = t('callModal.validation.formFieldIdentifierInvalid', { label: field.label })
      addToast({ message: t('callModal.toasts.formFieldIdentifierError', { label: field.label }), type: 'error' })
      return false
    }
  }
  const names = formFields.value.map(f => f.name)
  if (names.length !== new Set(names).size) {
    activeTab.value = 'form'
    errors.value._form = t('callModal.validation.formFieldDuplicate')
    addToast({ message: t('callModal.toasts.formFieldDuplicateError'), type: 'error' })
    return false
  }

  // 4. NOVÉ KRITÉRIÁ — primary language name required
  const primaryLangId = languageOptions.value[0]?.value
  for (const nc of localNewCriteria.value) {
    if (primaryLangId && !nc.translations[primaryLangId]?.name?.trim()) {
      activeTab.value = 'criteria'
      errors.value._criteria = t('callModal.validation.newCriteriaPrimaryNameRequired')
      addToast({ message: t('callModal.toasts.newCriteriaPrimaryTranslationError'), type: 'error' })
      return false
    }
  }

  // 5. KRITÉRIÁ HODNOTENIA — aspoň jedno
  if (form.value.criteria.length === 0) {
    activeTab.value = 'criteria'
    errors.value._criteria = t('callModal.validation.atLeastOneCriterion')
    addToast({ message: t('callModal.toasts.atLeastOneCriterionError'), type: 'error' })
    return false
  }

  return true
}

// ── Submit ─────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true

  try {
    // ── Step 1: Create locally drafted criteria, swap in real IDs ─────────
    const selectedLocalCriteria = localNewCriteria.value.filter(nc =>
      form.value.criteria.some(c => c.id === nc.id),
    )

    for (const nc of selectedLocalCriteria) {
      // Send all language translations that have a name
      const criterionTranslations = languageOptions.value
        .map(l => {
          const tr = nc.translations[l.value] ?? { name: '', description: '' }
          return {
            language_id: l.value,
            name:        tr.name.trim() || undefined,
            description: tr.description.trim() || undefined,
          }
        })
        .filter(t => t.name)

      const created: any = await api.post('/v1/admin/criteria', {
        translations: criterionTranslations,
      })

      const realId: number = created?.id ?? created?.data?.id
      if (!realId) throw new Error(t('callModal.errors.criterionIdFetchFailed', { fallback: nc.fallback }))

      const pivot = form.value.criteria.find(c => c.id === nc.id)
      if (pivot) pivot.id = realId
    }

    // ── Step 2: Build full payload ────────────────────────────────────────
    const primaryLangId = languageOptions.value[0]?.value
    const primaryTr     = form.value.translations[primaryLangId ?? 0] ?? { name: '', description: '' }

    const sanitizedFields = formFields.value.map(field => ({
      id:          field.id,
      type:        field.type,
      label:       field.label,
      name:        field.name,
      placeholder: field.placeholder || '',
      required:    !!field.required,
      help_text:   field.help_text || '',
      options:     Array.isArray(field.options) ? field.options.filter(o => o !== '') : [],
      accept:      field.accept || '',
    }))

    const payload: Record<string, any> = {
      // Primary translation (required by backend as top-level fields)
      language_id:  primaryLangId,
      name:         primaryTr.name,
      description:  primaryTr.description,

      // All remaining languages go into the translations array
      translations: languageOptions.value
        .filter(l => l.value !== primaryLangId)
        .map(l => ({
          language_id: l.value,
          name:        form.value.translations[l.value]?.name        ?? '',
          description: form.value.translations[l.value]?.description ?? '',
        })),

      program_id:             form.value.program_id,
      status_id:              form.value.status_id,
      qualification_stack_id: form.value.qualification_stack_id ?? null,
      application_start:      form.value.application_start,
      application_deadline:   form.value.application_deadline,
      project_start:          form.value.project_start,
      project_end:            form.value.project_end,
      criteria:               form.value.criteria,
      force_closed:           Boolean(form.value.force_closed),
      application_form_schema: sanitizedFields.length > 0
        ? { fields: sanitizedFields }
        : null,
    }

    let callId: number | undefined = props.call?.id
    if (callId) {
      await api.put(`/v1/admin/calls/${callId}`, payload)
    } else {
      const created: any = await api.post('/v1/admin/calls', payload)
      callId = created?.id ?? created?.data?.id
    }

    const commissionChanged = commissionForm.value.commission_id !== null
      && (
        commissionForm.value.commission_id !== (commissionSetup.value?.commission?.id ?? null)
        || commissionForm.value.company_rep_user_id !== (commissionSetup.value?.company_rep?.id ?? null)
      )

    if (callId && commissionChanged && !commissionLocked.value) {
      const commPayload: Record<string, any> = { commission_id: commissionForm.value.commission_id }
      if (isProgramB.value && commissionForm.value.company_rep_user_id) {
        commPayload.company_rep_user_id = commissionForm.value.company_rep_user_id
      }
      try {
        await api.post(`/v1/admin/calls/${callId}/setup-commission`, commPayload)
      } catch (e: any) {
        addToast({ message: e?.data?.message ?? 'Komisia sa nedala priradiť.', type: 'error' })
      }
    }

    addToast({ message: t('callModal.toasts.saveSuccess'), type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch (e: any) {
    const laravelErrors: Record<string, string[]> | undefined = e?.response?.data?.errors
    if (laravelErrors) {
      errors.value = Object.fromEntries(
        Object.entries(laravelErrors).map(([k, msgs]) => [k, msgs[0]])
      )
      if (Object.keys(errors.value).some(k => k.startsWith('application_form_schema'))) {
        activeTab.value = 'form'
        errors.value._form = t('callModal.validation.serverFormSchemaValidationFailed')
      } else if (Object.keys(errors.value).some(k => k.startsWith('criteria'))) {
        activeTab.value = 'criteria'
        errors.value._criteria = t('callModal.validation.serverCriteriaValidationFailed')
      } else {
        activeTab.value = 'basic'
      }
      addToast({ message: t('callModal.toasts.serverValidationError'), type: 'error' })
    } else {
      addToast({ message: e?.message ?? t('callModal.toasts.saveGenericError'), type: 'error' })
    }
  } finally {
    isSaving.value = false
  }
}

function dateInputClass(field: string): string {
  return [
    'w-full rounded-lg border px-3 py-2 text-sm text-navy',
    'focus:outline-none focus:ring-2 focus:ring-blue-300',
    errors.value[field] ? 'border-red-400' : 'border-gray-200',
  ].join(' ')
}
</script>