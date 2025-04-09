<template>
  <div class="widget widget--nested d-flex flex-column">
    <div class="widget__container d-flex flex-column flex-grow-1">
      <b-row class="align-items-stretch flex-grow-1">
        <b-col v-for="(w, index) in instantiatedWidgets" :key="index" :xl="w.cols">
          <div class="widget__container__widget" :class="{ card: w.card }">
            <suspense>
              <component :is="w.component" :project="project" :widget="w" class="flex-grow-1" />
            </suspense>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { sortBy } from 'lodash'

import { useInsightsStore } from '@/store/modules'

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
    },
    /**
     * The project name.
     */
    project: {
      type: String,
      required: true
    }
  },
  computed: {
    instantiatedWidgets() {
      return sortBy(this.widgets.map(this.instantiateWidget), 'order')
    },
    instantiateWidget() {
      return useInsightsStore().instantiateWidget
    },
    widgets() {
      return this.widget.widgets ?? []
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
