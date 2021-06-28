<template>
  <div class="widget widget--entities">
    <v-wait :for="loader" transition="fade">
      <div slot="waiting" class="widget__spinner" >
        <fa icon="circle-notch" spin size="2x"/>
      </div>
      <div class="widget__content row text-center" :class="{ 'card-body': widget.card }">
        <div v-for="category in categories" :key="category" class="widget__content__count col-3" :class="{ 'widget__content__count--muted': !entities[category] }">
          <fa fixed-width :icon="category | namedEntityIcon" class="mr-1" />
          <span v-html="$tc(`widget.entities.${category}`, entities[category], { count: humanEntities[category] })" />
        </div>
      </div>
    </v-wait>
  </div>
</template>

<script>
import { sum, uniqueId, values } from 'lodash'
import bodybuilder from 'bodybuilder'

import { namedEntityIcon } from '@/utils/named-entities'
import elasticsearch from '@/api/elasticsearch'
import humanNumber from '@/filters/humanNumber'

/**
 * Widget to display a summary of entities
 */
export default {
  name: 'WidgetEntities',
  filters: {
    namedEntityIcon
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  data () {
    return {
      entities: {
        emails: 0,
        locations: 0,
        organizations: 0,
        people: 0
      }
    }
  },
  created () {
    return this.loadData()
  },
  watch: {
    project () {
      return this.loadData()
    }
  },
  computed: {
    total () {
      return sum(values(this.entities))
    },
    humanEntities () {
      return Object.entries(this.entities).reduce((human, [key, value]) => {
        human[key] = humanNumber(value)
        return human
      }, {})
    },
    categories () {
      return Object.keys(this.entities)
    },
    loader () {
      return uniqueId('loading-entities-count-')
    },
    project () {
      return this.$store.state.insights.project
    }
  },
  methods: {
    async loadData () {
      this.$wait.start(this.loader)
      this.entities.emails = await this.countFor('EMAIL')
      this.entities.locations = await this.countFor('LOCATION')
      this.entities.organizations = await this.countFor('ORGANIZATION')
      this.entities.people = await this.countFor('PERSON')
      this.$wait.end(this.loader)
    },
    async countFor (category) {
      const index = this.project
      const body = this.bodybuilderFor(category).build()
      const preference = 'widget-entities'
      const { count = 0 } = await elasticsearch.count({ index, body, preference })
      return count
    },
    bodybuilderFor (category) {
      return bodybuilder()
        .andQuery('match', 'type', 'NamedEntity')
        .andQuery('match', 'category', category)
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget {
    min-height: 100%;
    position: relative;

    &__spinner {
      text-align: center;
      width: 100%;
      padding: $spacer;
    }

    &__content {

      &__count {

        &--muted {
          color: $text-muted
        }
      }
    }
  }
</style>
