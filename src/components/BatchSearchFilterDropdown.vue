<template>
  <batch-search-filter :id="id" class="batch-search-filter-dropdown" :name="name" :active="isActive">
    <keep-alive>
      <selectable-dropdown
        v-model="selectedValues"
        :items="items"
        deactivate-keys
        :multiple="multiple"
        class="shadow-none border-0"
      >
        <template #item-label="{ item }">
          <slot name="label" :item="item">{{ labelItem(item) }}</slot>
        </template>
      </selectable-dropdown>
    </keep-alive>
  </batch-search-filter>
</template>

<script>
import BatchSearchFilter from '@/components/BatchSearchFilter'
import { isEqual } from 'lodash'

export default {
  name: 'BatchSearchFilterDropdown',
  components: { BatchSearchFilter },
  model: {
    prop: 'values',
    event: 'update'
  },
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    values: {
      type: [Array, Object],
      default: null
    },
    items: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean
    }
  },
  computed: {
    isActive() {
      return this.values?.length > 0 || this.values?.value !== undefined
    },
    selectedValues: {
      get() {
        return this.values
      },
      set(values) {
        if (!isEqual(values, this.values)) {
          this.$emit('update', values)
        }
      }
    }
  },
  methods: {
    labelItem(item) {
      return item && item.label ? item.label : item
    }
  }
}
</script>
