<template>
  <div class="space-y-3">
    <div
      v-for="(row, idx) in rows"
      :key="idx"
      class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3"
    >
      <div class="flex justify-between items-center gap-2">
        <span class="text-xs font-medium text-gray-500">{{ field.label }} — {{ idx + 1 }}</span>
        <button
          type="button"
          class="text-xs font-medium text-red-600 hover:text-red-800"
          @click="removeRow(idx)"
        >
          Odstrániť
        </button>
      </div>

      <div
        v-for="sub in subFields"
        :key="sub.name"
        class="space-y-1"
      >
        <label
          v-if="sub.type !== 'checkbox'"
          class="text-sm font-medium text-gray-700"
        >
          {{ sub.label }}
          <span
            v-if="sub.required"
            class="text-danger-500"
            >*</span
          >
        </label>

        <input
          v-if="sub.type === 'text' || sub.type === 'email'"
          :type="sub.type === 'email' ? 'email' : 'text'"
          v-model="row[sub.name]"
          :placeholder="sub.placeholder"
          class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @blur="$emit('blur')"
        />

        <input
          v-else-if="sub.type === 'number'"
          type="number"
          v-model.number="row[sub.name]"
          :placeholder="sub.placeholder"
          class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @blur="$emit('blur')"
        />

        <input
          v-else-if="sub.type === 'date'"
          type="date"
          v-model="row[sub.name]"
          class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @blur="$emit('blur')"
        />

        <textarea
          v-else-if="sub.type === 'textarea'"
          v-model="row[sub.name]"
          :placeholder="sub.placeholder"
          rows="3"
          class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          @blur="$emit('blur')"
        />

        <div
          v-else-if="sub.type === 'select'"
          class="relative"
        >
          <select
            v-model="row[sub.name]"
            class="w-full px-3 py-2 rounded-md border border-gray-200 text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @blur="$emit('blur')"
          >
            <option
              value=""
              disabled
            >
              {{ sub.placeholder || 'Vyberte…' }}
            </option>
            <option
              v-for="opt in sub.options || []"
              :key="String(opt.value)"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div
          v-else-if="sub.type === 'checkbox'"
          class="flex items-center gap-2"
        >
          <input
            :id="`rep-${idx}-${sub.name}`"
            type="checkbox"
            v-model="row[sub.name]"
            class="w-4 h-4 rounded border-gray-300 text-blue-600"
            @change="$emit('blur')"
          />
          <label
            :for="`rep-${idx}-${sub.name}`"
            class="text-sm text-gray-700 cursor-pointer"
          >
            {{ sub.label }}
            <span
              v-if="sub.required"
              class="text-danger-500"
              >*</span
            >
          </label>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
      @click="addRow"
    >
      + Pridať riadok
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { FormField } from '~/stores/applications'

type RepeaterFieldDef = FormField & { fields?: FormField[] }

interface Props {
  field: RepeaterFieldDef
  modelValue?: Record<string, unknown>[] | null
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, unknown>[]): void
  (e: 'blur'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const subFields = computed(() =>
  Array.isArray(props.field.fields) ? (props.field.fields as FormField[]) : [],
)

const rows = computed({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (v) => emit('update:modelValue', v),
})

function defaultForSub(sub: FormField): unknown {
  if (sub.type === 'checkbox') {
    return false
  }
  if (sub.type === 'number') {
    return ''
  }
  return ''
}

function emptyRow(): Record<string, unknown> {
  const r: Record<string, unknown> = {}
  for (const sub of subFields.value) {
    r[sub.name] = defaultForSub(sub)
  }
  return r
}

function addRow() {
  rows.value = [...rows.value, emptyRow()]
}

function removeRow(i: number) {
  const next = [...rows.value]
  next.splice(i, 1)
  rows.value = next
}
</script>
