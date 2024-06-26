<template>
  <div class="column-filter d-flex align-items-middle">
    {{ name }}
    <sorting-arrow v-if="sortable && sortBy" :sort-by="sortBy" :field-key="id" />
    <b-button :id="btnId" class="column-filter__toggle" :class="btnClassName" radius variant="outline" @click.stop>
      <fa style="padding-bottom: 1px" fixed-width icon="filter" />
      <slot name="badge" :active="active" :counter="counter">
        <column-filter-badge :active="active" :counter="counter" />
      </slot>
    </b-button>
    <teleport to="body">
      <b-popover
        v-model="showPopover"
        custom-class="column-filter__popover popover-body-p-0"
        :target="btnId"
        placement="bottom"
        click
        lazy
      >
        <slot></slot>
      </b-popover>
    </teleport>
  </div>
</template>

<script>
import ColumnFilterBadge from '@/components/ColumnFilterBadge'
import SortingArrow from '@/components/SortingArrow'

export default {
  name: 'ColumnFilter',
  components: {
    ColumnFilterBadge,
    SortingArrow
  },
  inject: ['sortBy'],
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    counter: {
      type: Number,
      default: null
    },
    sortable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['show', 'hide', 'toggle'],
  data() {
    return {
      showPopover: false
    }
  },
  computed: {
    btnClassName() {
      return `column-filter__toggle--${this.id}`
    },
    btnId() {
      return `${this.btnClassName}-id`
    }
  },
  watch: {
    showPopover(toggle) {
      this.$emit(toggle ? 'show' : 'hide')
      this.$emit('toggle', toggle)
    }
  }
}
</script>

<style lang="scss" scoped>
.column-filter {
  &__toggle {
    position: relative;
    padding: 0 0.2em;
    margin: 0;
    line-height: 1.3em;
  }

  &__popover {
    color: $body-color;
  }
}
</style>
