<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-navy">Exporty</h1>
      <p class="text-gray-500 mt-1">Export dat z platformy do suborov</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="item in exportItems"
        :key="item.label"
        class="bg-white rounded-lg border border-gray-200 p-6 flex flex-col"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <component
              :is="item.icon"
              class="w-5 h-5 text-blue-600"
            />
          </div>
          <div>
            <h3 class="font-semibold text-navy">{{ item.label }}</h3>
            <p class="text-xs text-gray-400">{{ item.count }} zaznamov</p>
          </div>
        </div>

        <div class="mt-auto flex items-center gap-3">
          <UiSelect
            v-model="item.format"
            :options="formatOptions"
            class="flex-1"
          />
          <UiButton
            size="sm"
            @click="handleExport(item.label)"
          >
            <Download class="w-4 h-4" />
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Users, Megaphone, ClipboardCheck, Download } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  // middleware: ['auth'], // TODO: re-enable when backend is available
})

useHead({ title: 'Exporty — Admin | NTI' })

const { addToast } = useToast()

const formatOptions = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'XLSX' },
]

const exportItems = reactive([
  { label: 'Prihlasky', icon: FileText, count: 24, format: 'csv' },
  { label: 'Pouzivatelia', icon: Users, count: 142, format: 'csv' },
  { label: 'Vyzvy', icon: Megaphone, count: 4, format: 'csv' },
  { label: 'Hodnotenia', icon: ClipboardCheck, count: 36, format: 'csv' },
])

function handleExport(label: string) {
  addToast({ message: `Export "${label}" sa generuje...`, type: 'info' })
}
</script>
