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
      return this.widgets.map(this.instantiateWidget).toSorted((a, b) => a.order - b.order)
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
      margin-right: -$spacer-xxs;
      margin-left: -$spacer-xxs;
      margin-bottom: -$spacer-xs;

      & > .col,
      & > [class*='col-'] {
        min-width: 0;
        padding-right: $spacer-xxs;
        padding-left: $spacer-xxs;
      }
    }

    &__widget {
      display: flex;
      flex-direction: row;
      margin-bottom: $spacer-xs;
      min-height: calc(100% - #{$spacer-xs});
      position: relative;

      & > * {
        min-width: 0;
      }
    }
  }
}
</style>
