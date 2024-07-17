<template>
  <div class="widget widget--entities">
    <v-wait :for="loader" transition="fade">
      <template #waiting>
        <div class="widget__spinner">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <div class="widget__content text-center" :class="{ 'card-body': widget.card }">
        <div v-if="total > 0" class="row">
          <div
            v-for="category in categories"
            :key="category"
            class="widget__content__count col-3"
            :class="{ 'widget__content__count--muted': !entities[category] }"
          >
            <fa fixed-width :icon="namedEntityIcon(category)" class="me-1" />
            <span v-html="$t(`widget.entities.${category}`, entities[category], { count: humanEntities[category] })" />
          </div>
        </div>
        <p v-else class="text-muted text-center mb-0 col-12">
          {{ $t('widget.noEntities') }}
        </p>
      </div>
    </v-wait>
  </div>
</template>

<script>
import { sum, uniqueId, values } from 'lodash'
import bodybuilder from 'bodybuilder'

import { namedEntityIcon } from '@/utils/named-entities'
import humanNumber from '@/utils/humanNumber'

/**
 * Widget to display a summary of entities
 */
export default {
  name: 'WidgetEntities',
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
        emails: 0,
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
    humanEntities() {
      return Object.entries(this.entities).reduce((human, [key, value]) => {
        human[key] = humanNumber(value)
        return human
      }, {})
    },
    categories() {
      return Object.keys(this.entities)
    },
    loader() {
      return uniqueId('loading-entities-count-')
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
    namedEntityIcon,
    async loadData() {
      this.$wait.start(this.loader)
      this.entities.emails = await this.countFor('EMAIL')
      this.entities.locations = await this.countFor('LOCATION')
      this.entities.organizations = await this.countFor('ORGANIZATION')
      this.entities.people = await this.countFor('PERSON')
      this.$wait.end(this.loader)
    },
    async countFor(category) {
      const index = this.project
      const body = this.bodybuilderFor(category).build()
      const preference = 'widget-entities'
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

  &__spinner {
    text-align: center;
    width: 100%;
    padding: $spacer;
  }

  &__content {
    &__count {
      &--muted {
        color: $text-muted;
      }
    }
  }
}
</style>
