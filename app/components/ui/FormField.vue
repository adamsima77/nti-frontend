<template>
  <div>
    <label class="block text-xs font-semibold text-slate-500 mb-1.5">
      {{ computedLabel }}
      <span v-if="hint" class="font-normal text-slate-400">({{ hint }})</span>
    </label>
    <div
      class="flex items-center border rounded-xl bg-white transition-all duration-200"
      :class="{
        'border-slate-200': !isTouched,
        'border-green-400 bg-green-50 ring-2 ring-green-100': isTouched && isFieldValid,
        'border-red-400 bg-red-50 ring-2 ring-red-100': isTouched && !isFieldValid,
      }"
    >
      <input
        :type="computedType"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :maxlength="maxlength"
        class="flex-1 px-3.5 py-2.5 text-sm text-slate-800 bg-transparent rounded-xl focus:outline-none"
        :class="{ 'font-mono': mono }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value); $emit('touch', fieldName)"
        @blur="$emit('blur')"
      />
      <span
        v-if="isTouched"
        class="pr-3 text-sm font-bold w-7 text-right"
        :class="isFieldValid ? 'text-green-500' : 'text-red-500'"
      >
        {{ isFieldValid ? '✓' : '✗' }}
      </span>
    </div>
    <p v-if="error && isTouched && !isFieldValid" class="text-xs text-red-500 mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FieldObject {
  name: string
  type?: string
  label?: string
  required?: boolean
}

const props = defineProps<{
  modelValue: string | number | null
  field: string | FieldObject // Prijíma string zo starých formulárov ALEBO objekt z nových
  label?: string
  hint?: string
  placeholder?: string
  type?: string
  maxlength?: number
  mono?: boolean
  error?: string
  touched?: Record<string, boolean> // Voliteľné kvôli zachovaniu spätnej kompatibility
  isValid?: (field: string) => boolean // Voliteľné kvôli zachovaniu spätnej kompatibility
}>()

defineEmits(['update:modelValue', 'touch', 'blur'])

// 1. Zistíme čistý názov poľa pre prácu s reaktívnymi objektmi chýb
const fieldName = computed(() => {
  return typeof props.field === 'object' ? props.field.name : props.field
})

// 2. Bezpečne vytiahneme Label (prioritu má priama prop, potom hodnota z objektu)
const computedLabel = computed(() => {
  if (props.label) return props.label
  return typeof props.field === 'object' ? props.field.label : ''
})

// 3. KRITICKÝ BOD: Správna detekcia typu vstupu (aby 'time' nezostal interpretovaný ako 'text')
const computedType = computed(() => {
  if (props.type) return props.type
  return typeof props.field === 'object' ? (props.field.type ?? 'text') : 'text'
})

// 4. Detekcia "touched" stavu pre zobrazenie validačných farieb
const isTouched = computed(() => {
  if (!props.touched) {
    return !!props.error // Ak formulár nepoužíva globálny touched objekt, spoliehame sa na prítomnosť chyby
  }
  return props.touched[fieldName.value] ?? !!props.error
})

// 5. Overenie validity konkrétneho poľa
const isFieldValid = computed(() => {
  if (!props.isValid) {
    return !props.error // Ak pole nemá funkciu isValid, považuje sa za správne vtedy, keď nevráti error reťazec
  }
  return props.isValid(fieldName.value)
})
</script>