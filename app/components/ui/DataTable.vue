<template>
  <div>
    <!-- Header slot (filters, search) -->
    <slot name="header" />

    <!-- Table wrapper -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
              :class="{ 'cursor-pointer select-none hover:text-gray-700': col.sortable }"
              @click="col.sortable && toggleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <template v-if="col.sortable">
                  <ArrowUp
                    v-if="sortBy === col.key && sortDir === 'asc'"
                    class="w-3.5 h-3.5"
                  />
                  <ArrowDown
                    v-else-if="sortBy === col.key && sortDir === 'desc'"
                    class="w-3.5 h-3.5"
                  />
                  <ArrowUpDown
                    v-else
                    class="w-3.5 h-3.5 text-gray-300"
                  />
                </template>
              </div>
            </th>
            <th
              v-if="$slots['row-actions']"
              class="px-4 py-3"
            />
          </tr>
        </thead>
        <tbody>
          <!-- Loading state -->
          <template v-if="loading">
            <tr
              v-for="i in 5"
              :key="'skeleton-' + i"
              class="border-b border-gray-100"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3"
              >
                <UiSkeleton variant="text" />
              </td>
              <td
                v-if="$slots['row-actions']"
                class="px-4 py-3"
              >
                <UiSkeleton
                  variant="text"
                  width="4rem"
                />
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length + ($slots['row-actions'] ? 1 : 0)">
              <slot name="empty">
                <UiEmptyState
                  :icon="emptyIcon"
                  :title="emptyTitle"
                  :description="emptyDescription"
                />
              </slot>
            </td>
          </tr>

          <!-- Data rows -->
          <template v-else>
            <tr
              v-for="row in rows"
              :key="row[rowKey]"
              :class="[
                'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                striped && 'even:bg-gray-50',
                hasRowClick && 'cursor-pointer',
              ]"
              @click="emit('row-click', row)"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3"
              >
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="row[col.key]"
                >
                  {{ row[col.key] }}
                </slot>
              </td>
              <td
                v-if="$slots['row-actions']"
                class="px-4 py-3"
              >
                <slot
                  name="row-actions"
                  :row="row"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="paginated && totalPages > 1"
      class="flex justify-center mt-4"
    >
      <UiPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="emit('update:currentPage', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    columns: Array<{ key: string; label: string; sortable?: boolean }>
    rows: Array<Record<string, any>>
    rowKey?: string
    sortBy?: string
    sortDir?: 'asc' | 'desc'
    loading?: boolean
    emptyTitle?: string
    emptyDescription?: string
    emptyIcon?: Component
    paginated?: boolean
    currentPage?: number
    totalPages?: number
    striped?: boolean
  }>(),
  {
    rowKey: 'id',
    sortBy: undefined,
    sortDir: 'asc',
    loading: false,
    emptyTitle: 'Žiadne záznamy',
    emptyDescription: undefined,
    emptyIcon: () => Inbox,
    paginated: false,
    currentPage: 1,
    totalPages: 1,
    striped: false,
  },
)

const emit = defineEmits<{
  'update:sortBy': [value: string]
  'update:sortDir': [value: 'asc' | 'desc']
  'update:currentPage': [value: number]
  'row-click': [row: Record<string, any>]
}>()

const attrs = useAttrs()

const hasRowClick = computed(() => {
  return !!attrs.onRowClick
})

function toggleSort(key: string) {
  if (props.sortBy === key) {
    emit('update:sortDir', props.sortDir === 'asc' ? 'desc' : 'asc')
  } else {
    emit('update:sortBy', key)
    emit('update:sortDir', 'asc')
  }
}
</script>
