<template>
  <div class="project-insights">
    <div class="container project-insights__container">
      <b-row class="align-items-stretch">
        <b-col v-for="(widget, index) in instantiatedWidgets" :key="index" :md="widget.cols">
          <div class="project-insights__container__widget" :class="{ card: widget.card }">
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
  props: {
    name: {
      type: String
    }
  },
  computed: {
    ...mapGetters('insights', ['instantiatedWidgets'])
  },
  watch: {
    name(name) {
      this.$store.commit('insights/project', this.name)
    }
  },
  beforeMount() {
    this.$store.commit('insights/project', this.name)
  }
}
</script>

<style lang="scss" scoped>
.project-insights {
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
