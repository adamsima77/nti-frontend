<template>
  <UiModal
    :model-value="modelValue"
    :title="isEditing ? 'Upraviť výzvu' : 'Nová výzva'"
    size="xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="metaLoading" class="flex justify-center py-16">
      <UiLoader />
    </div>

    <template v-else>
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
          @click="activeTab = tab.key"
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

      <div v-show="activeTab === 'basic'" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">
              Program <span class="text-red-400">*</span>
            </label>
            <UiSelect v-model="form.program_id" :options="visibleProgramOptions" placeholder="Vybrať program" />
            <p v-if="errors.program_id" class="text-xs text-red-500 mt-1">{{ errors.program_id }}</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Stav</label>
            <UiSelect v-model="form.status_id" :options="statusOptions" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">
            Jazyk záznamu <span class="text-red-400">*</span>
          </label>
          <UiSelect v-model="form.language_id" :options="languageOptions" placeholder="Vybrať jazyk" />
          <p v-if="errors.language_id" class="text-xs text-red-500 mt-1">{{ errors.language_id }}</p>
        </div>

        <UiFormField
          v-model="form.name"
          label="Názov výzvy"
          field="name"
          placeholder="Napr. Jarný inkubátor 2026"
          :touched="touched"
          :is-valid="isValid"
          :error="errors.name"
        />

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">
            Popis <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Stručný popis výzvy and jej zamerania..."
            class="w-full rounded-lg border px-3 py-2 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 resize-none"
            :class="errors.description ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-300'"
          />
          <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description }}</p>
        </div>

        <hr class="border-gray-100" />

        <div>
          <p class="text-xs font-semibold text-slate-500 mb-3">Termíny podávania prihlášok</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">Začiatok <span class="text-red-400">*</span></label>
              <input v-model="form.application_start" type="date" :class="dateInputClass('application_start')" />
              <p v-if="errors.application_start" class="text-xs text-red-500 mt-1">{{ errors.application_start }}</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">Uzávierka <span class="text-red-400">*</span></label>
              <input v-model="form.application_deadline" type="date" :class="dateInputClass('application_deadline')" />
              <p v-if="errors.application_deadline" class="text-xs text-red-500 mt-1">{{ errors.application_deadline }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-slate-500 mb-3">Termíny realizácie projektu</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">Začiatok projektu <span class="text-red-400">*</span></label>
              <input v-model="form.project_start" type="date" :class="dateInputClass('project_start')" />
              <p v-if="errors.project_start" class="text-xs text-red-500 mt-1">{{ errors.project_start }}</p>
            </div>
            <div>
              <label class="block text-xs text-slate-500 mb-1.5">Koniec projektu <span class="text-red-400">*</span></label>
              <input v-model="form.project_end" type="date" :class="dateInputClass('project_end')" />
              <p v-if="errors.project_end" class="text-xs text-red-500 mt-1">{{ errors.project_end }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'form'" class="space-y-4">
        <p class="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 leading-relaxed">
          Navrhnite polia, ktoré budú uchádzači vypĺňať pri podaní prihlášky.
          Pri <strong>Program A</strong> sú predvyplnené polia pre 6 povinných dokumentov.
        </p>

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
                {{ field.label || `Pole ${idx + 1}` }}
              </span>
              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
                {{ FIELD_TYPE_CONFIG[field.type].label }}
              </span>
              <span v-if="field.required" class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-500 flex-shrink-0">
                povinné
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
                  <label class="block text-xs text-slate-500 mb-1">Názov poľa <span class="text-red-400">*</span></label>
                  <input v-model="field.label" type="text" placeholder="Napr. Popis projektu" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" @input="onLabelInput(field)" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Typ poľa</label>
                  <select v-model="field.type" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white" @change="onTypeChange(field)">
                    <option v-for="(cfg, key) in FIELD_TYPE_CONFIG" :key="key" :value="key">{{ cfg.label }}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">Identifikátor <span class="text-gray-400 font-normal">(automatický)</span></label>
                  <input v-model="field.name" type="text" placeholder="napr. project_name" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div v-if="field.type !== 'file' && field.type !== 'checkbox' && field.type !== 'radio'">
                  <label class="block text-xs text-slate-500 mb-1">Vzorový text (placeholder)</label>
                  <input v-model="field.placeholder" type="text" placeholder="Napr. Zadajte názov..." class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div v-if="field.type === 'file'">
                  <label class="block text-xs text-slate-500 mb-1">Povolené formáty</label>
                  <input v-model="field.accept" type="text" placeholder=".pdf,.doc,.docx" class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-1">Pomocný text</label>
                <input v-model="field.help_text" type="text" placeholder="Krátky opis, čo má uchádzač vyplniť..." class="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>

              <div v-if="['select', 'radio', 'checkbox'].includes(field.type)">
                <label class="block text-xs text-slate-500 mb-1.5">Možnosti výberu</label>
                <div class="space-y-1.5">
                  <div v-for="(opt, oi) in field.options" :key="oi" class="flex items-center gap-2">
                    <input :value="opt" type="text" placeholder="Možnosť..." class="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue-300" @input="field.options[oi] = ($event.target as HTMLInputElement).value" />
                    <button class="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" @click="field.options.splice(oi, 1)"><X class="w-3.5 h-3.5" /></button>
                  </div>
                  <button class="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1" @click="field.options.push('')">
                    <Plus class="w-3 h-3" /> Pridať možnosť
                  </button>
                </div>
              </div>

              <label class="flex items-center gap-2 cursor-pointer w-fit">
                <input v-model="field.required" type="checkbox" class="accent-blue-600 w-3.5 h-3.5" />
                <span class="text-xs text-slate-600">Povinné pole</span>
              </label>
            </div>
          </div>

          <div v-if="formFields.length === 0" class="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText class="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p class="text-sm text-gray-400">Formulár je prázdny</p>
            <p class="text-xs text-gray-300 mt-1">Pridajte polia pomocou tlačidla nižšie</p>
          </div>
        </div>

        <div class="relative">
          <button class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-all" @click="showFieldPicker = !showFieldPicker">
            <Plus class="w-4 h-4" />
            Pridať pole
            <ChevronDown class="w-3.5 h-3.5 ml-1 transition-transform" :class="showFieldPicker && 'rotate-180'" />
          </button>
          <div v-if="showFieldPicker" class="absolute top-full left-0 mt-1.5 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-3 gap-1 w-72">
            <button v-for="(cfg, key) in FIELD_TYPE_CONFIG" :key="key" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors" @click="addField(key as FieldType); showFieldPicker = false">
              <component :is="cfg.icon" class="w-4 h-4 flex-shrink-0" :class="cfg.color" />
              <span class="text-xs text-slate-700">{{ cfg.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'criteria'" class="space-y-4">
        <p class="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 leading-relaxed">
          Vyberte hodnotiace kritériá komisie a nastavte ich <strong>váhu (1–10)</strong>.
          Kritériá s príznakom <em>akademický signál</em> sú informatívne — nespôsobujú automatické zamietnutie (§7.2).
        </p>

        <div class="flex items-center justify-between">
          <label class="block text-xs font-semibold text-slate-500">
            Dostupné kritériá <span class="text-red-400">* (Vyberte aspoň jedno)</span>
          </label>
        </div>

        <div v-if="criteriaLoading" class="py-8 flex justify-center"><UiLoader size="sm" /></div>

        <div v-else-if="availableCriteria.length === 0" class="text-center py-8 text-sm text-gray-400">
          Žiadne kritériá nie sú k dispozícii.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="criterion in availableCriteria"
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
                <p class="text-sm font-semibold text-navy leading-snug">{{ criterion.name }}</p>
                <p v-if="criterion.description" class="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {{ criterion.description }}
                </p>
              </div>

              <div
                v-if="isCriterionSelected(criterion.id)"
                class="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium"
                @click.stop
              >
                <span class="text-slate-400 text-[11px]">Váha</span>
                <span
                  class="px-2 py-0.5 rounded-full text-white text-[11px] font-bold"
                  :class="weightColor(getCriterion(criterion.id)!.weight)"
                >
                  {{ getCriterion(criterion.id)!.weight }}
                </span>
              </div>
            </div>

            <div
              v-if="isCriterionSelected(criterion.id)"
              class="border-t border-blue-100 px-4 pb-3.5 pt-3 space-y-3"
            >
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold text-slate-500">
                    Váha kritéria
                  </label>
                  <span class="text-xs text-slate-400">
                    {{ WEIGHT_LABELS[getCriterion(criterion.id)!.weight - 1] }}
                  </span>
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
                    :title="`Váha ${w} — ${WEIGHT_LABELS[w - 1]}`"
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
                  Akademický signál
                  <span class="text-slate-400 ml-1">(informatívny, neodmieta prihlášku)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="form.criteria.length > 0" class="flex items-center gap-4 text-xs text-slate-500 pt-1">
          <span>
            Vybrané: <strong class="text-slate-700">{{ form.criteria.length }}</strong>
            {{ criteriaCountLabel }}
          </span>
          <span v-if="academicSignalCount > 0" class="text-amber-600">
            <strong>{{ academicSignalCount }}</strong> akademický{{ academicSignalCount === 1 ? '' : 'é' }} signál{{ academicSignalCount === 1 ? '' : 'y' }}
          </span>
          <span class="ml-auto text-slate-400">
            Priemerná váha: <strong class="text-slate-600">{{ averageWeight }}</strong>
          </span>
        </div>
      </div>
    </template>

    <template #actions>
      <UiButton variant="ghost" @click="emit('update:modelValue', false)">Zrušiť</UiButton>
      <UiButton :disabled="isSaving || metaLoading" @click="handleSubmit">
        {{ isSaving ? 'Ukladám…' : 'Uložiť' }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Type, AlignLeft, Hash, Mail, ChevronDown, ChevronUp,
  Circle, CheckSquare, Calendar, Paperclip,
  Plus, Trash2, GripVertical, X, Pencil, FileText, Check,
} from 'lucide-vue-next'

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

interface Criterion {
  id: number
  name: string
  description?: string
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

interface CallRaw {
  id?: number
  name?: string
  description?: string
  program_id?: number
  status_id?: number
  application_start?: string
  application_deadline?: string
  project_start?: string
  project_end?: string
  status?: { id: number; name: string }
  callTranslations?: CallTranslation[]
  call_criteria?: {
    id: number
    name?: string
    description?: string
    pivot?: { weight: number; is_academic_signal: boolean }
  }[]
  application_form_schema?: { fields?: FormField[] }
  form_schema?: { fields?: FormField[] }
  program?: {
    id: number
    name: string
  }
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

// ── Constants ──────────────────────────────────────────────────────────────

const FIELD_TYPE_CONFIG: Record<FieldType, { label: string; icon: any; color: string }> = {
  text:     { label: 'Krátky text',  icon: Type,        color: 'text-blue-500' },
  textarea: { label: 'Dlhý text',    icon: AlignLeft,   color: 'text-indigo-500' },
  number:   { label: 'Číslo',        icon: Hash,        color: 'text-violet-500' },
  email:    { label: 'E-mail',        icon: Mail,        color: 'text-sky-500' },
  select:   { label: 'Výber jedného', icon: ChevronDown, color: 'text-amber-500' },
  radio:    { label: 'Prepínač',     icon: Circle,      color: 'text-orange-500' },
  checkbox: { label: 'Zaškrtávačky', icon: CheckSquare, color: 'text-emerald-500' },
  date:     { label: 'Dátum',        icon: Calendar,    color: 'text-rose-500' },
  file:     { label: 'Príloha',      icon: Paperclip,   color: 'text-teal-500' },
}

const WEIGHT_LABELS = [
  'Veľmi nízka', 'Nízka', 'Podpriemerná', 'Mierne nízka', 'Stredná',
  'Mierne vysoká', 'Nadpriemerná', 'Vysoká', 'Veľmi vysoká', 'Kritická',
]

const PROGRAM_A_DEFAULTS: FormField[] = [
  { id: 'doc_executive_summary',      type: 'file', label: 'Executive Summary',      name: 'executive_summary',      required: true, help_text: 'Stručný opis problému, riešenia, trhu a prínosu', placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
  { id: 'doc_technical_architecture', type: 'file', label: 'Technická architektúra', name: 'technical_architecture', required: true, help_text: 'Opis riešenia, technológií, modulov a prevádzky',      placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
  { id: 'doc_roadmap',                type: 'file', label: 'Roadmapa',               name: 'roadmap',                required: true, help_text: 'Míľniky, plán realizácie a harmonogram',              placeholder: '', options: [], accept: '.pdf,.doc,.docx,.xlsx' },
  { id: 'doc_budget',                 type: 'file', label: 'Rozpočet',               name: 'budget',                 required: true, help_text: 'Plán čerpania grantu a očakávané náklady',            placeholder: '', options: [], accept: '.pdf,.doc,.docx,.xlsx' },
  { id: 'doc_risk_analysis',          type: 'file', label: 'Riziková analýza',       name: 'risk_analysis',          required: true, help_text: 'Identifikácia rizík, dopadov a mitigácií',            placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
  { id: 'doc_monetization_model',     type: 'file', label: 'Monetizačný model',      name: 'monetization_model',     required: true, help_text: 'Spôsob vytvárania hodnoty a príjmov produktu',       placeholder: '', options: [], accept: '.pdf,.doc,.docx' },
]

// ── Tabs ───────────────────────────────────────────────────────────────────

const activeTab = ref<'basic' | 'form' | 'criteria'>('basic')

const TABS = computed(() => [
  { key: 'basic',    label: 'Základné info',        badge: undefined },
  { key: 'form',     label: 'Formulár prihlášky',   badge: formFields.value.length },
  { key: 'criteria', label: 'Kritériá hodnotenia',  badge: form.value.criteria.length },
])

// ── API / toasts ───────────────────────────────────────────────────────────

const api = useApi()
const { addToast } = useToast()

// ── Options ────────────────────────────────────────────────────────────────

const programOptions    = ref<{ value: number; label: string }[]>([])
const statusOptions     = ref<{ value: number; label: string }[]>([])
const languageOptions   = ref<{ value: number; label: string }[]>([])
const availableCriteria = ref<Criterion[]>([])

const metaLoading     = ref(false)
const criteriaLoading = ref(false)
const isSaving        = ref(false)

// Dynamicky odfiltruje možnosti na základe stavu (vytvorenie vs editácia)
const visibleProgramOptions = computed(() => {
  if (isEditing.value) {
    return programOptions.value
  }
  return programOptions.value.filter(option => 
    option.label.toLowerCase().trim() === 'program a'
  )
})

// ── Form ───────────────────────────────────────────────────────────────────

const isEditing = computed(() => !!props.call?.id)

const emptyForm = () => ({
  program_id:           null as number | null,
  status_id:            null as number | null,
  language_id:          null as number | null,
  name:                 '',
  description:          '',
  application_start:    '',
  application_deadline: '',
  project_start:        '',
  project_end:          '',
  criteria:             [] as CriterionPivot[],
})

const form    = ref(emptyForm())
const errors  = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

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

// ── Criteria helpers ───────────────────────────────────────────────────────

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
  if (n === 1) return 'kritérium'
  if (n < 5)   return 'kritériá'
  return 'kritérií'
})

// ── Meta fetchers ──────────────────────────────────────────────────────────

async function fetchMeta() {
  metaLoading.value = true
  try {
    const [programs, statuses, languages] = await Promise.all([
      api.get('/program-types') as Promise<any>,
      api.get('/call-statuses') as Promise<any>,
      api.get('/languages')     as Promise<any>,
    ])
    const list = (r: any): any[] => Array.isArray(r) ? r : r?.data ?? []

    programOptions.value  = list(programs).map((p: any) => ({ value: p.id, label: p.typeOfProgram?.name ?? p.name ?? `#${p.id}` }))
    statusOptions.value   = list(statuses).map((s: any) => ({ value: s.id, label: s.name }))
    languageOptions.value = list(languages).map((l: any) => ({ value: l.id, label: l.name }))
  } catch {
    addToast({ message: 'Nepodarilo sa načítať metadáta.', type: 'error' })
  } finally {
    metaLoading.value = false
  }
}

async function fetchCriteria() {
  criteriaLoading.value = true
  try {
    const res: any = await api.get('/v1/admin/criteria')
    const list: any[] = Array.isArray(res) ? res : res?.data ?? []
    availableCriteria.value = list.map((c: any) => ({
      id:          c.id,
      name:        c.name ?? c.criterionTranslations?.[0]?.name ?? `Kritérium #${c.id}`,
      description: c.description ?? c.criterionTranslations?.[0]?.description ?? null,
    }))
  } catch { /* non-fatal */ } finally {
    criteriaLoading.value = false
  }
}

// ── Watch: modal open/close ────────────────────────────────────────────────

watch(() => props.modelValue, async (open) => {
  if (!open) return

  activeTab.value       = 'basic'
  editingFieldIdx.value = null
  showFieldPicker.value = false
  errors.value          = {}
  touched.value         = {}
  isFormDirty.value     = false

  await Promise.all([fetchMeta(), fetchCriteria()])

  const defaultStatusId =
    statusOptions.value.find(s => s.label.toLowerCase().includes('koncept'))?.value
    ?? statusOptions.value[0]?.value ?? null

  const defaultLanguageId =
    languageOptions.value.find(l => l.label.toLowerCase().startsWith('sk') || l.label.toLowerCase().includes('slovenčina'))?.value
    ?? languageOptions.value[0]?.value ?? null

  if (props.call?.id) {
    const c = props.call
    const primaryTr = c.callTranslations?.[0] ?? null

    form.value = {
      program_id:           c.program_id ?? c.program?.id ?? null,
      status_id:            c.status_id  ?? c.status?.id  ?? null,
      language_id:          primaryTr?.language_id ?? defaultLanguageId,
      name:                 primaryTr?.name        ?? c.name        ?? '',
      description:          primaryTr?.description ?? c.description ?? '',
      application_start:    c.application_start?.slice(0, 10)    ?? '',
      application_deadline: c.application_deadline?.slice(0, 10) ?? '',
      project_start:        c.project_start?.slice(0, 10)        ?? '',
      project_end:          c.project_end?.slice(0, 10)          ?? '',
      criteria: (c.call_criteria ?? []).map(cr => ({
        id:                 cr.id,
        weight:             cr.pivot?.weight             ?? 5,
        is_academic_signal: cr.pivot?.is_academic_signal ?? false,
      })),
    }

    const rawFields = c.application_form_schema?.fields ?? c.form_schema?.fields ?? []
    formFields.value = rawFields.length > 0 ? JSON.parse(JSON.stringify(rawFields)) : []
  } else {
    form.value = { ...emptyForm(), status_id: defaultStatusId, language_id: defaultLanguageId }
    formFields.value = JSON.parse(JSON.stringify(PROGRAM_A_DEFAULTS))

    if (visibleProgramOptions.value.length === 1) {
      form.value.program_id = visibleProgramOptions.value[0].value
    }
  }
})

watch(() => form.value.program_id, (newId) => {
  if (isEditing.value || !newId || isFormDirty.value || formFields.value.length > PROGRAM_A_DEFAULTS.length) return
  const selected  = programOptions.value.find(p => p.value === newId)
  const isProgramA = selected?.label?.toLowerCase() === 'program a'
  if (isProgramA) {
    formFields.value = JSON.parse(JSON.stringify(PROGRAM_A_DEFAULTS))
  }
})

// ── Validation ─────────────────────────────────────────────────────────────

function isValid(field: string) { return !errors.value[field] }

function validate(): boolean {
  errors.value = {}

  // 1. ZÁKLADNÉ INFO (Záložka: 'basic')
  if (!form.value.program_id)   errors.value.program_id   = 'Vyberte program.'
  if (!form.value.language_id)  errors.value.language_id  = 'Vyberte jazyk záznamu.'
  if (!form.value.name.trim())  errors.value.name         = 'Názov výzvy je povinný.'
  if (!form.value.description.trim()) errors.value.description = 'Popis výzvy je povinný.'
  
  if (!form.value.application_start)    errors.value.application_start    = 'Povinné.'
  if (!form.value.application_deadline) errors.value.application_deadline = 'Povinné.'
  if (!form.value.project_start)        errors.value.project_start        = 'Povinné.'
  if (!form.value.project_end)          errors.value.project_end          = 'Povinné.'

  if (form.value.application_start && form.value.application_deadline &&
      form.value.application_deadline < form.value.application_start) {
    errors.value.application_deadline = 'Uzávierka musí byť po začiatku.'
  }

  if (form.value.project_start && form.value.project_end &&
      form.value.project_end < form.value.project_start) {
    errors.value.project_end = 'Koniec projektu musí byť po jeho začiatku.'
  }

  // Ak chýbajú dáta na prvej záložke, okamžite prepneme a vyhodíme toast
  if (Object.keys(errors.value).length > 0) {
    activeTab.value = 'basic'
    addToast({ message: 'Skontrolujte povinné polia v základných informáciách (Názov, Popis, Termíny...).', type: 'error' })
    return false
  }

  // 2. FORMULÁR PRIHLÁŠKY (Záložka: 'form')
  for (const field of formFields.value) {
    if (!field.label.trim()) {
      activeTab.value = 'form'
      errors.value._form = 'Všetky polia musia mať vyplnený názov.'
      addToast({ message: 'Chyba formulára: Všetky polia musia mať vyplnený názov.', type: 'error' })
      return false
    }
    if (!field.name.trim() || !/^[a-z][a-z0-9_]*$/.test(field.name)) {
      activeTab.value = 'form'
      errors.value._form = `Pole „${field.label}" má neplatný identifikátor.`
      addToast({ message: `Chyba identifikátora: Názov poľa „${field.label}“ vyžaduje malé písmená bez diakritiky (a-z, _).`, type: 'error' })
      return false
    }
  }

  const names = formFields.value.map(f => f.name)
  if (names.length !== new Set(names).size) {
    activeTab.value = 'form'
    errors.value._form = 'Formulár obsahuje duplicitné identifikátory polí.'
    addToast({ message: 'Chyba formulára: Detegovali sa duplicitné identifikátory polí (ID). Každé pole must mať unikátny názov.', type: 'error' })
    return false
  }

  // 3. KRITÉRIÁ HODNOTENIA (Záložka: 'criteria')
  if (form.value.criteria.length === 0) {
    activeTab.value = 'criteria'
    errors.value._criteria = 'Musíte vybrať aspoň jedno hodnotiace kritérium.'
    addToast({ message: 'Chyba kritérií: Vyberte aspoň jedno hodnotiace kritérium pre hodnotiacu komisiu.', type: 'error' })
    return false
  }
  
  return true
}

// ── Submit ─────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true

  try {
    const sanitizedFields = formFields.value.map(field => ({
      id: field.id,
      type: field.type,
      label: field.label,
      name: field.name,
      placeholder: field.placeholder || '',
      required: !!field.required,
      help_text: field.help_text || '',
      options: Array.isArray(field.options) ? field.options.filter(o => o !== '') : [],
      accept: field.accept || ''
    }))

    const payload: Record<string, any> = {
      program_id:           form.value.program_id,
      status_id:            form.value.status_id,
      language_id:          form.value.language_id,
      name:                 form.value.name,
      description:          form.value.description,
      application_start:    form.value.application_start,
      application_deadline: form.value.application_deadline,
      project_start:        form.value.project_start,
      project_end:          form.value.project_end,
      criteria:             form.value.criteria,
      application_form_schema: sanitizedFields.length > 0
        ? { fields: sanitizedFields }
        : null,
    }

    if (isEditing.value) {
      await api.put(`/v1/admin/calls/${props.call!.id}`, payload)
    } else {
      await api.post('/v1/admin/calls', payload)
    }

    addToast({ message: 'Výzva bola úspešne uložená.', type: 'success' })
    emit('saved')
    emit('update:modelValue', false)
  } catch (e: any) {
    const laravelErrors: Record<string, string[]> | undefined = e?.response?.data?.errors
    if (laravelErrors) {
      errors.value = Object.fromEntries(
        Object.entries(laravelErrors).map(([k, msgs]) => [k, msgs[0]])
      )
      activeTab.value = 'basic'
      addToast({ message: 'Nepodarilo sa uložiť výzvu kvôli chybám validácie na serveri.', type: 'error' })
    } else {
      addToast({ message: 'Nepodarilo sa uložiť výzvu.', type: 'error' })
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