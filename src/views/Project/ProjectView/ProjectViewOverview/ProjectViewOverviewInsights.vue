<script setup>
import { computed, watch, onBeforeMount, toRef } from 'vue'

import { useMode } from '@/composables/mode'
import { useInsightsStore } from '@/store/modules/insights'

const props = defineProps({ name:  String })
const insightsStore = useInsightsStore()
const { mode } = useMode()

const widgets = computed(() => {
  return insightsStore.instantiatedWidgets.filter(({ modes }) => {
    return !modes || modes.includes(mode.value)
  })
})

watch(toRef(props, 'name'), insightsStore.setProject)
onBeforeMount(() => insightsStore.setProject(props.name))
</script>

<template>
  <div class="project-view-overview-insights">
    <div class="project-view-overview-insights__container">
      <b-row class="align-items-stretch">
        <b-col v-for="(widget, index) in widgets" :key="index" :lg="widget.cols">
          <div class="project-view-overview-insights__container__widget" :class="{ card: widget.card }">
            <component :is="widget.component" :widget="widget" :project="name" class="flex-grow-1" />
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-view-overview-insights {
  &__container {
    margin: $spacer-xl auto;

    .row {
      margin-right: 0;
      margin-left: 0;

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
      margin-bottom: $spacer-xl;
      min-height: calc(100% - #{$spacer-xl});
      position: relative;

      &.card {
        border: 0;
      }

      & > * {
        min-width: 0;
      }
    }
  }
}
</style>
