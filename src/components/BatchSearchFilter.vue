<template>
  <div>
    <span>
        {{ label }}
    </span>
    <b-btn :id="btnId"
           :class="btnClassName"
           radius
           variant="outline">
      <fa icon="filter"/>
    </b-btn>
    <batch-search-filter-badge v-if="active"/>
    <b-popover custom-class="popover-body-p-0"
               lazy
               :target="btnId"
               triggers="focus">
      <slot></slot>
    </b-popover>
  </div>
</template>

<script>
import { uniqueId } from 'lodash'
import BatchSearchFilterBadge from '@/components/BatchSearchFilterBadge'

export default {
  name: 'BatchSearchFilter',
  components: {
    BatchSearchFilterBadge
  },
  model: {
    prop: 'selectedValues',
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
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    btnClassName () {
      return `batch-search-filter__toggle--${this.id}`
    },
    btnId () {
      return uniqueId(this.btnClassName)
    }
  }
}
</script>
