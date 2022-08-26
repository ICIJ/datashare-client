<template>
  <batch-search-filter :id="id" :label="label" :active="isActive">
    <keep-alive>
    <selectable-dropdown v-model="selectedValues" :items="items" deactivate-keys :multiple="multiple">
      <template  #item-label="{ item }">
        <span>{{item && item.label ? item.label:item}}</span>
      </template>
    </selectable-dropdown>
    </keep-alive>
  </batch-search-filter>
</template>

<script>
import BatchSearchFilter from '@/components/BatchSearchFilter'
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
    label: {
      type: String,
      required: true
    },
    values: {
      type: [Array, Object]
    },
    items: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean
    }
  },
  methods: {

  },
  computed: {
    isActive () {
      return this.values?.length > 0 || this.values?.value !== undefined
    },
    selectedValues: {
      get () {
        return this.values
      },
      set (values) {
        this.$emit('update', values)
      }
    }

  }
}
</script>
