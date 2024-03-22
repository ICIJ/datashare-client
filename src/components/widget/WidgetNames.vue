<template>
  <div class="widget widget--names">
    <v-wait :for="loader" transition="fade">
      <template #waiting>
        <div class="widget__spinner">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <div class="widget__content text-center" :class="{ 'card-body': widget.card }">
        <fa icon="address-card" class="widget__content__icon" size="2x" />
        <div class="widget__content__main-figure" :title="total">
          <span v-html="$tc(`widget.names.total`, total, { humanTotal })" />
        </div>
      </div>
    </v-wait>
  </div>
</template>

<script>
import { sum, uniqueId, values } from 'lodash'
import bodybuilder from 'bodybuilder'

import humanNumber from '@/filters/humanNumber'

/**
 * Widget to display a summary of names
 */
export default {
  name: 'WidgetNames',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  data() {
    return {
      entities: {
        locations: 0,
        organizations: 0,
        people: 0
      }
    }
  },
  computed: {
    total() {
      return sum(values(this.entities))
    },
    humanTotal() {
      return humanNumber(this.total)
    },
    loader() {
      return uniqueId('loading-names-count-')
    },
    project() {
      return this.$store.state.insights.project
    }
  },
  watch: {
    project() {
      return this.loadData()
    }
  },
  created() {
    return this.loadData()
  },
  methods: {
    async loadData() {
      this.$wait.start(this.loader)
      this.entities.locations = await this.countFor('LOCATION')
      this.entities.organizations = await this.countFor('ORGANIZATION')
      this.entities.people = await this.countFor('PERSON')
      this.$wait.end(this.loader)
    },
    async countFor(category) {
      const index = this.project
      const body = this.bodybuilderFor(category).build()
      const preference = 'widget-names'
      const { count = 0 } = await this.$core.api.elasticsearch.count({ index, body, preference })
      return count
    },
    bodybuilderFor(category) {
      return bodybuilder().andQuery('match', 'type', 'NamedEntity').andQuery('match', 'category', category)
    }
  }
}
</script>

<style lang="scss" scoped>
.widget {
  min-height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &__spinner {
    text-align: center;
    width: 100%;
    padding: $spacer;
  }

  &__content {
    &__main-figure {
      display: block;
      font-size: 1.8rem;
    }
  }
}
</style>
