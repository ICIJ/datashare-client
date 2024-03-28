<template>
  <column-filter
    :id="id"
    :name="name"
    :active="isActive"
    :counter="counter"
    class="column-filter-dropdown"
    @toggle="apply"
  >
  <keep-alive>
    <slot name="dropdown">
      <selectable-dropdown
          v-model="selectedValues"
          :items="items"
          :eq="eq"
          :multiple="multiple"
          :serializer="serializer"
          deactivate-keys
          class="shadow-none border-0"
        >
          <template #item-label="{ item }">
            <slot name="label" :item="item">
              {{ labelItem(item) }}
            </slot>
          </template>
        </selectable-dropdown>
        <div v-if="!immediate" class="d-grid p-2">
          <button type="button" class="btn btn-primary btn-sm" @click="apply()">
            {{ $t('columnFilterDropdown.apply') }}
          </button>
        </div>
      </slot>
    </keep-alive>
  </column-filter>
</template>

<script>
import { eq, identity } from 'lodash'

import ColumnFilter from '@/components/ColumnFilter'

export default {
  name: 'ColumnFilterDropdown',
  components: { ColumnFilter },
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
    modelValue: {
      type: [Array, Object],
      default: null
    },
    items: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean
    },
    counter: {
      type: Number,
      default: null
    },
    serializer: {
      type: Function,
      default: identity
    },
    immediate: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      selectedValues: this.modelValue
    }
  },
  computed: {
    isActive() {
      return this.modelValue?.length > 0 || !!this.modelValue.value
    }
  },
  watch: {
    modelValue: {
      handler(value) {
        this.selectedValues = value
      },
      deep: true,
      immediate: true
    },
    selectedValues: {
      handler(value) {
        if (this.immediate) {
          this.$emit('update:modelValue', value)
        }
      },
      deep: true
    }
  },
  methods: {
    labelItem(item) {
      return item && item.label ? item.label : item
    },
    apply(show = false) {
      if (!show && !this.immediate) {
        this.$emit('update:modelValue', this.selectedValues)
      }
    }
  }
}
</script>
