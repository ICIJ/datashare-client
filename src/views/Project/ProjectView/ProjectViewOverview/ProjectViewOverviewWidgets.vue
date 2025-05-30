<script setup>
import { computed, watch, onBeforeMount, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import appBuilding from '@/assets/images/illustrations/app-building.svg'
import appBuildingDark from '@/assets/images/illustrations/app-building-dark.svg'
import EmptyState from '@/components/EmptyState/EmptyState'
import { useMode } from '@/composables/useMode'
import { useInsightsStore } from '@/store/modules'

const props = defineProps({
  name: {
    type: String
  },
  section: {
    type: String,
    default: null
  }
})

const { t } = useI18n()
const insightsStore = useInsightsStore()
const { modeName } = useMode()

const widgets = computed(() => {
  return insightsStore.instantiatedWidgets.filter(({ modes, section }) => {
    return section === props.section && (!modes || modes.includes(modeName.value))
  })
})

watch(toRef(props, 'name'), insightsStore.setProject)
onBeforeMount(() => insightsStore.setProject(props.name))
</script>

<template>
  <div class="project-view-overview-widgets">
    <div v-if="widgets.length" class="project-view-overview-widgets__container">
      <b-row class="align-items-stretch">
        <b-col v-for="(widget, index) in widgets" :key="index" :lg="widget.cols">
          <div class="project-view-overview-widgets__container__widget" :class="{ card: widget.card }">
            <suspense>
              <component :is="widget.component" :widget="widget" :project="name" class="flex-grow-1" />
            </suspense>
          </div>
        </b-col>
      </b-row>
    </div>
    <slot v-else name="empty">
      <empty-state :label="t('global.building')" :image="appBuilding" :image-dark="appBuildingDark" />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.project-view-overview-widgets {
  &__container {
    margin: $spacer-xl auto 0;

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
