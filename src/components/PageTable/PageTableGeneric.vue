<script setup>
import { computed, ref, toRef, useSlots, watch } from 'vue'

import PageTable from '@/components/PageTable/PageTable'
import PageTableTr from '@/components/PageTable/PageTableTr'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'

defineOptions({ name: 'GenericTable' })

const props = defineProps({
  /**
   * Object of items passed from the parent
   */
  items: {
    type: Array,
    default: () => []
  },
  /**
   * Array of fields to display in the table
   */
  fields: {
    type: Array,
    default: () => []
  },
  /**
   * Show row details by default
   */
  showRowDetails: {
    type: Boolean,
    default: false
  },
  /**
   * Primary key of the items (can be used to track changes)
   */
  primaryKey: {
    type: String
  }
})

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

const slots = useSlots()

const detailsMap = ref(new WeakMap())

// Initialize and sync the item details map
watch(
  toRef(props, 'items'),
  (items) => {
    items.filter(isTableItem).forEach((item) => {
      detailsMap.value.set(item, item._showDetails ?? props.showRowDetails)
    })
  },
  { deep: true, immediate: true }
)

function isTableItem(value) {
  return typeof value === 'object' && value !== null
}

function rowDetailsShowing(item) {
  return isTableItem(item) && !!detailsMap.value.get(item)
}

function toggleRowDetails(item, toggler) {
  if (isTableItem(item)) {
    item._showDetails = toggler ?? !rowDetailsShowing(item)
  }
}

function callItemBinding(item, slotName) {
  return {
    item,
    slotName,
    detailsShowing: rowDetailsShowing(item),
    toggleDetails: () => toggleRowDetails(item)
  }
}

const hasRowDetailsSlot = computed(() => 'row-details' in slots)
</script>

<template>
  <page-table v-model:sort="sort" v-model:order="order">
    <template #colgroup>
      <col v-for="field in fields" :key="field.name" :style="field.colStyle" />
    </template>

    <template #thead>
      <page-table-th
        v-for="field in fields"
        :key="field.name"
        :label="field.text"
        :icon="field.icon"
        :style="field.thStyle"
        :sortable="!!field.sortable"
        :emphasis="!!field.emphasis"
        :name="field.value"
      />
    </template>

    <page-table-tr v-if="!items?.length">
      <td :colspan="fields.length" class="page-table-generic__no-result text-center">
        <slot name="empty">{{ $t('task.noResults') }}</slot>
      </td>
    </page-table-tr>

    <template v-for="(item, index) in items" :key="primaryKey ? item[primaryKey] ?? index : index">
      <page-table-tr class="page-table-generic__row">
        <td
          v-for="(field, i) in fields"
          :key="i"
          class="page-table-generic__row__field"
          :style="field.tdStyle"
          :class="[`page-table-generic__row__field--${field.value}`]"
        >
          <slot :name="`cell(${field.value})`" v-bind="callItemBinding(item, field.value)" :field="field">
            {{ item[field.value] }}
          </slot>
        </td>
        <page-table-td-actions>
          <slot name="row-actions" v-bind="callItemBinding(item, 'row-actions')" />
        </page-table-td-actions>
      </page-table-tr>

      <template v-if="hasRowDetailsSlot && rowDetailsShowing(item)">
        <tr class="d-none" aria-hidden="true" role="presentation" />
        <page-table-tr class="page-table-generic__row-details">
          <td :colspan="fields.length + 1">
            <slot name="row-details" v-bind="callItemBinding(item, 'row-details')" />
          </td>
        </page-table-tr>
      </template>
    </template>
  </page-table>
</template>

<style lang="scss" scoped>
// Add hover effect to the row details and its corresponding row
.table > tbody > tr:hover + tr + tr.page-table-generic__row-details,
.table > tbody > tr:has(+ tr + tr.page-table-generic__row-details:hover) > * {
  --bs-table-color-state: var(--bs-table-striped-color);
  --bs-table-bg-state: var(--bs-table-hover-bg);
}
</style>
