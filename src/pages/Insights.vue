<template>
  <div class="insights">
    <div class="bg-secondary text-white insights__toolbox position-sticky sticky-top">
      <div class="container py-2 d-flex align-items-center">
        <div class="pr-2">
          Select a project
        </div>
        <div>
          <project-selector v-model="project" size="sm" />
        </div>
      </div>
    </div>
    <div class="container insights__container">
      <b-row class="align-items-stretch">
        <b-col v-for="(widget, index) in widgets" :md="widget.cols" :key="index">
          <div class="insights__container__widget" :class="{ card: widget.card }">
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

export default {
  components: {
    ProjectSelector
  },
  computed: {
    ...mapGetters('insights', { widgets: 'instantiatedWidgets' }),
    project: {
      get: function () {
        return this.$store.state.search.index
      },
      set: function (value) {
        this.$store.commit('search/index', value)
      }
    }
  }
}
</script>

<style lang="scss">
  .insights {

    &__container {
      margin-top: $grid-gutter-width;

      &__widget {
        position: relative;
        min-height: calc(100% - #{$grid-gutter-width});
        margin-bottom: $grid-gutter-width;
        display: flex;
        flex-direction: row;
      }
    }
  }
</style>
