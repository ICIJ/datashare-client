<template>
  <app-wait
    :for="loaderId"
    transition="fade"
  >
    <template #waiting>
      <div class="m-5 text-center h-100">
        <app-spinner size="2em" />
      </div>
    </template>
    <div class="widget widget--entities d-flex h-100 w-100">
      <template v-if="total || isServer">
        <div class="row flex-grow-1">
          <div
            v-for="category in categories"
            :key="category"
            class="col-6 col-xl"
          >
            <widget-barometer
              :icon="getCategoryIcon(category)"
              :variant="getCategoryVariant(category)"
              :border-variant="getCategoryVariant(category)"
              :value="entities[category]"
              :label="t(`widgetEntities.${category}`, entities[category])"
            />
          </div>
        </div>
      </template>
      <div
        v-else
        class="text-center w-100 align-self-center"
      >
        <p>{{ t('widget.noEntitiesFindSome') }}</p>
        <button-icon
          :to="{ name: 'task.entities.new', query: { project } }"
          icon-left="plus"
          variant="outline-action"
          :label="t('widget.findEntities')"
        />
      </div>
    </div>
  </app-wait>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { sum, values } from 'lodash'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import { toRef } from 'vue'

import WidgetBarometer from './WidgetBarometer'

import { useWait } from '@/composables/useWait'
import { useInsightsStore } from '@/store/modules'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import AppWait from '@/components/AppWait/AppWait'
import { MODE_NAME } from '@/mode'
import { getCategoryIcon, getCategoryVariant } from '@/utils/entity'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

/**
 * Widget to display a summary of entities
 */
export default {
  name: 'WidgetEntities',
  components: {
    AppSpinner,
    AppWait,
    ButtonIcon,
    WidgetBarometer
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  setup() {
    const { t } = useI18n()
    const wait = useWait()
    const insightsStore = useInsightsStore()
    const project = toRef(insightsStore, 'project')
    return { wait, t, project }
  },
  data() {
    return {
      entities: {
        email: 0,
        location: 0,
        organization: 0,
        person: 0
      }
    }
  },
  computed: {
    total() {
      return sum(values(this.entities))
    },
    categories() {
      return Object.keys(this.entities)
    },
    loaderId() {
      return this.wait.loaderId
    },
    isServer() {
      return this.$config?.get('mode') === MODE_NAME.SERVER
    }
  },
  watch: {
    project: {
      immediate: true,
      handler() {
        this.loadData()
      }
    }
  },
  methods: {
    getCategoryIcon,
    getCategoryVariant,
    async loadData() {
      this.wait.start(this.loaderId)
      const [email, location, organization, person] = await Promise.all([
        this.handleCountForPromise(ENTITY_CATEGORY.EMAIL),
        this.handleCountForPromise(ENTITY_CATEGORY.LOCATION),
        this.handleCountForPromise(ENTITY_CATEGORY.ORGANIZATION),
        this.handleCountForPromise(ENTITY_CATEGORY.PERSON)
      ])
      this.entities = { person, location, organization, email }
      this.wait.end(this.loaderId)
    },
    handleCountForPromise(category) {
      return this.countFor(category).catch((error) => {
        console.error(`Failed to count ${category}:`, error)
        return 0
      })
    },
    async countFor(category) {
      const index = this.project
      const body = this.bodybuilderFor(category).build()
      const preference = `widget-entities-${category}`
      const { count = 0 } = await this.$core.api.elasticsearch.count({ index, body, preference })
      return count
    },
    bodybuilderFor(category) {
      return bodybuilder()
        .andQuery('match', 'type', 'NamedEntity')
        .andQuery('match', 'category', category.toUpperCase())
    }
  }
}
</script>

<style lang="scss" scoped>
.widget {
  &--entities .row {
    --bs-gutter-x: #{$spacer-xl};
    --bs-gutter-y: #{$spacer-xl};
  }
}
</style>
