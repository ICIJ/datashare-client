<template>
  <div class="widget widget--nested d-flex flex-column">
    <div class="widget__container d-flex flex-column flex-grow-1">
      <b-row class="align-items-stretch flex-grow-1">
        <b-col v-for="(w, index) in instantiatedWidgets" :key="index" :lg="w.cols">
          <div class="widget__container__widget" :class="{ card: w.card }">
            <component :is="w.component" :widget="w" class="flex-grow-1" />
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { sortBy } from 'lodash'

/**
 * A widget to include nested widget
 */
export default {
  name: 'WidgetEmpty',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object,
      required: true
    }
  },
  computed: {
    instantiatedWidgets() {
      return sortBy(this.widgets.map(this.instantiateWidget), 'order')
    },
    widgets() {
      return this.widget.widgets ?? []
    }
  },
  methods: {
    instantiateWidget(widget) {
      return this.$store.getters['insights/instantiateWidget'](widget)
    }
  }
}
</script>

<style lang="scss" scoped>
.widget--nested {
  width: 100%;

  .widget__container {
    .row {
      margin-right: -$spacer;
      margin-left: -$spacer;
      row-gap: $spacer-xl;

      & > .col,
      & > [class*='col-'] {
        min-width: 0;
        padding-right: $spacer;
        padding-left: $spacer;
      }
    }

    &__widget {
      display: flex;
      flex-direction: row;
      min-height: calc(100% - #{$spacer-xs});
      position: relative;

      & > * {
        min-width: 0;
      }
    }
  }
}
</style>
