<template>
  <page-table v-model:sort="sort" v-model:order="order">
    <template #thead>
      <page-table-th
        v-for="field in columns"
        :key="field.name"
        :label="field.text"
        :icon="field.icon"
        sortable
        emphasis
        :name="field.value"
      />
    </template>
    <page-table-tr v-if="!tasks?.length">
      <td :colspan="columns.length" class="task-list__no-result text-center">
        <slot name="empty">{{ $t('task.noResults') }}</slot>
      </td>
    </page-table-tr>
    <page-table-tr v-for="(item, index) in tasks" :key="index" class="task-list__row">
      <td
        v-for="(column, i) in columns"
        :key="i"
        class="task-list__row__column"
        :class="[`task-list__row__column--${column.value}`]"
      >
        <slot :name="`cell(${column.value})`" v-bind="{ item, column }">{{ item[column.value] }}</slot>
      </td>
      <page-table-td-actions>
        <slot name="cell(action)" v-bind="{ item }"></slot>
      </page-table-td-actions>
    </page-table-tr>
  </page-table>
</template>

<script setup>
import PageTable from '@/components/PageTable/PageTable'
import PageTableTr from '@/components/PageTable/PageTableTr'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'

defineOptions({ name: 'TaskList' })

defineProps({
  /**
   * Object of tasks passed from the parent
   */
  tasks: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  }
})

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })
</script>
