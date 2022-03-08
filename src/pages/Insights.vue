<template>
  <div class="insights">
    <div class="bg-secondary text-white insights__toolbox position-sticky sticky-top mb-4" v-if="isServer">
      <div class="container py-2 d-flex align-items-center">
        <div class="pr-2">
          {{ $t('insights.selectProject') }}
        </div>
        <div>
          <project-selector v-model="project" size="md" class="insights__toolbox__project-selector" />
        </div>
      </div>
    </div>
    <div class="container insights__container">
      <b-row class="align-items-stretch">
        <b-col v-for="(widget, index) in instantiatedWidgets" :md="widget.cols" :key="index">
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
import utils from '@/mixins/utils'

export default {
  components: {
    ProjectSelector
  },
  mixins: [utils],
  computed: {
    ...mapGetters('insights', ['instantiatedWidgets']),
    project: {
      get: function () {
        return this.$store.state.insights.project
      },
      set: function (value) {
        this.$store.commit('insights/project', value)
      }
    }
  },
  beforeMount () {
    this.$store.commit('insights/project', this.$store.state.search.indices[0])
  }
}
</script>

<style lang="scss" scoped>
  .insights {

    &__container {
      margin-top: $spacer;

      &__widget {
        display: flex;
        flex-direction: row;
        margin-bottom: $grid-gutter-width;
        min-height: calc(100% - #{$grid-gutter-width});
        position: relative;
      }
    }
  }
</style>
