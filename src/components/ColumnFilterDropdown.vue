<template>
  <column-filter :id="id" class="column-filter-dropdown" :name="name" :active="isActive">
    <keep-alive>
      <selectable-dropdown
        v-model="selectedValues"
        :items="items"
        deactivate-keys
        :multiple="multiple"
        :eq="eq"
        class="shadow-none border-0"
      >
        <template #item-label="{ item }">
          <slot name="label" :item="item">{{ labelItem(item) }}</slot>
        </template>
      </selectable-dropdown>
    </keep-alive>
  </column-filter>
</template>

<script>
import { isEqual } from 'lodash'
import eq from 'lodash/eq'

import ColumnFilter from '@/components/ColumnFilter'

export default {
  name: 'ColumnFilterDropdown',
  components: { ColumnFilter },
  model: {
    prop: 'values',
    event: 'update'
  },
  props: {
    id: {
      type: String,
      required: true
    },
    eq: {
      type: Function,
      default: eq
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
      return this.values?.length > 0 || !!this.values?.value
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
