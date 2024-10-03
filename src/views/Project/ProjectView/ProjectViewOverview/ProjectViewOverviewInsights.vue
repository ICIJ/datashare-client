<template>
  <div class="project-view-overview-insights">
    <div class="project-view-overview-insights__container">
      <b-row class="align-items-stretch">
        <b-col v-for="(widget, index) in instantiatedWidgets" :key="index" :lg="widget.cols">
          <div class="project-view-overview-insights__container__widget" :class="{ card: widget.card }">
            <component :is="widget.component" :widget="widget" class="flex-grow-1" />
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ProjectSelector from '@/components/ProjectSelector'
import utils from '@/mixins/utils'

export default {
  name: 'ProjectViewInsights',
  components: {
    ProjectSelector
  },
  mixins: [utils],
  props: {
    name: {
      type: String
    }
  },
  computed: {
    ...mapGetters('insights', ['instantiatedWidgets'])
  },
  watch: {
    name() {
      this.$store.commit('insights/project', this.name)
    }
  },
  beforeMount() {
    this.$store.commit('insights/project', this.name)
  }
}
</script>

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
