<template>
  <div class="widget widget--duplicates">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0"></h4>
    </div>
    <div class="p-4">
      <v-wait for="duplicate-counters" transition="fade">
        <fa icon="circle-notch" spin slot="waiting" size="2x" class="m-auto d-block"></fa>
        <div>
          <stacked-bar-chart :data="data" :x-axis-tick-format="humanNumber" :bar-colors="colors" :keys="keys" :groups="groups"></stacked-bar-chart>
          <p class="small text-muted">
            {{ $t('widget.duplicates.duplicated') }}
          </p>
        </div>
      </v-wait>
    </div>
  </div>
</template>

<script>
import { waitFor } from 'vue-wait'

import elasticsearch from '@/api/elasticsearch'
import humanNumber from '@/filters/humanNumber'

/**
 * A widget for the insights page indicating the proportion of duplicates in the data.
 */
export default {
  name: 'WidgetDuplicate',
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
      data: [],
      colors: ['#193D87', '#6081c4'],
      keys: ['duplicates', 'documents'],
      groups: ['Duplicates*', 'Documents']
    }
  },
  async created () {
    await this.loadData()
  },
  mounted () {
    this.$store.subscribe(async ({ type }) => {
      // The project changed
      if (type === 'insights/project') {
        await this.loadData()
      }
    })
  },
  methods: {
    async count (query) {
      const index = this.$store.state.insights.project
      const body = { query: { query_string: { query } } }
      const res = await elasticsearch.search({ index, body, size: 0 })
      return res?.hits?.total || 0
    },
    countTotal () {
      const q = 'type:Document'
      return this.count(q)
    },
    countDuplicates () {
      const q = 'type:Duplicate'
      return this.count(q)
    },
    loadData: waitFor('duplicate-counters', async function () {
      const documents = await this.countTotal()
      const duplicates = await this.countDuplicates()
      this.$set(this, 'data', [
        { documents, duplicates }
      ])
    }),
    humanNumber
  }
}
</script>

<style lang="scss" scoped>
  .widget--duplicates {
    width: 100%;

    .stacked-bar-chart__groups__item__label {
      display: none;
    }
  }
</style>
