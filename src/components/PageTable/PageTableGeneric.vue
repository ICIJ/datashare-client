<script setup>
import { computed, ref, toRef, toValue, useSlots, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import PageTable from '@/components/PageTable/PageTable'
import PageTableTr from '@/components/PageTable/PageTableTr'
import PageTableTrPlaceholder from '@/components/PageTable/PageTableTrPlaceholder'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'

defineOptions({ name: 'PageTableGeneric' })

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
  },
  /**
   * Style of the actions column
   */
  actionsColStyle: {
    type: [Object, Array, String]
  },
  /**
   * Loading state of the table
   */
  loading: {
    type: Boolean,
    default: false
  }
})

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

const { t } = useI18n()
const slots = useSlots()

// If a primary key is provided, use a Map with the primary key as the key.
// Otherwise, use a WeakMap which can use Object as key. This Map is
// used to ensure that the details state is persisted even if the item
// reference changes.
const DetailsMapType = props.primaryKey ? Map : WeakMap
const detailsMap = ref(new DetailsMapType())

// Initialize and sync the item details map
watch(toRef(props, 'items'), setupDetailsMap, { deep: true, immediate: true })

function setupDetailsMap() {
  // Set initial state for each item in the details map.
  props.items.forEach((item) => {
    if (!detailsMap.value.has(itemPrimaryKey(item))) {
      toggleRowDetails(item, item._showDetails ?? props.showRowDetails)
    }
  })
}

function isTableItem(value) {
  return typeof value === 'object' && value !== null
}

function itemPrimaryKey(item) {
  if (props.primaryKey && props.primaryKey in item) {
    return item[props.primaryKey]
  }
  return item
}

function rowDetailsShowing(item) {
  return isTableItem(item) && !!detailsMap.value.get(itemPrimaryKey(item))
}

function toggleRowDetails(item, toggler) {
  if (isTableItem(item)) {
    item._showDetails = toggler ?? !rowDetailsShowing(item)
    detailsMap.value.set(itemPrimaryKey(item), item._showDetails)
  }
}

function callItemBinding(item, slotName) {
  const detailsShowing = rowDetailsShowing(item)
  const toggleDetails = () => toggleRowDetails(item)
  return { item, slotName, detailsShowing, toggleDetails }
}

const hasRowDetailsSlot = computed(() => 'row-details' in slots)
</script>

<template>
  <page-table v-model:sort="sort" v-model:order="order" :loading="loading">
    <template #colgroup>
      <col v-for="field in fields" :key="field.name" :style="field.colStyle" />
      <col :style="actionsColStyle" />
    </template>

    <template #thead>
      <page-table-th
        v-for="field in fields"
        :key="field.name"
        :label="toValue(field.text)"
        :icon="field.icon"
        :style="field.thStyle"
        :sortable="!!field.sortable"
        :emphasis="!!field.emphasis"
        :name="field.sortingKey ?? field.key ?? field.value"
      >
      </page-table-th>
    </template>

    <template #waiting>
      <page-table-tr-placeholder :repeat="Math.max(3, items.length)" :properties="fields">
        <td class="text-end">
          <div class="d-inline-flex gap-3 py-2">
            <app-placeholder width="16px" height="16px" :repeat="2" />
          </div>
        </td>
      </page-table-tr-placeholder>
    </template>

    <page-table-tr v-if="!items?.length">
      <td :colspan="fields.length + 1" class="page-table-generic__no-result text-center">
        <slot name="empty">{{ t('task.noResults') }}</slot>
      </td>
    </page-table-tr>

    <template v-for="(item, index) in items" :key="primaryKey ? item[primaryKey] ?? index : index">
      <page-table-tr class="page-table-generic__row">
        <td
          v-for="(field, i) in fields"
          :key="i"
          class="page-table-generic__row__field"
          :style="field.tdStyle"
          :class="[`page-table-generic__row__field--${field.key ?? field.value}`]"
        >
          <slot
            :name="`cell(${field.key ?? field.value})`"
            v-bind="callItemBinding(item, field.key ?? field.value)"
            :field="field"
          >
            {{ item[field.key ?? field.value] }}
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
