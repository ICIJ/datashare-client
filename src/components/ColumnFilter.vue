<template>
  <div class="column-filter d-flex align-items-baseline">
    <span class="column-filter__label">
      {{ name }}
    </span>
    <b-button :id="btnId" class="column-filter__toggle ms-1" :class="btnClassName" radius variant="outline" @click.stop>
      <fa icon="filter" />
      <slot name="badge" :active="active" :counter="counter">
        <column-filter-badge :active="active" :counter="counter" />
      </slot>
    </b-button>
    <teleport to="body">
      <b-popover v-model="showPopover" :target="btnId" placement="bottom" click lazy>
        <slot></slot>
      </b-popover>
    </teleport>
  </div>
</template>

<script>
import ColumnFilterBadge from '@/components/ColumnFilterBadge'

export default {
  name: 'ColumnFilter',
  components: {
    ColumnFilterBadge
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
    active: {
      type: Boolean,
      default: false
    },
    counter: {
      type: Number,
      default: null
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
}
</style>
