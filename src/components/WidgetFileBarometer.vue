<template>
  <div class="widget widget--file-barometer d-flex align-items-center text-center">
    <v-wait for="counters" class="flex-grow-1" transition="fade">
      <fa icon="circle-notch" spin slot="waiting" size="2x" />
      <p :class="{ 'card-body': widget.card }">
        <fa icon="hdd" class="widget__icon" size="2x" />
        <strong class="widget__main-figure" :title="total">
          {{ $tc('widget.barometer.document', total, { total: humanNumber(total, $t('human.number')) }) }}
        </strong>
        {{ $t('widget.barometer.amongWhich') }}
        <span :title="onDisk">{{ onDisk | humanNumber($t('human.number')) }}</span>
        {{ $t('widget.barometer.onDisk') }}
      </p>
    </v-wait>
  </div>
</template>

<script>
import { waitFor } from 'vue-wait'

import elasticsearch from '@/api/elasticsearch'
import humanNumber from '@/filters/humanNumber'

/**
 * Widget to display the number of indexed files on the insights page.
 */
export default {
  name: 'WidgetFileBarometer',
  filters: { humanNumber },
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
      onDisk: null,
      total: null
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
      const project = this.$store.state.insights.project
      const body = { query: { query_string: { query } } }
      const res = await elasticsearch.search({ index: project, body, size: 0 })
      return res?.hits?.total || 0
    },
    countTotal () {
      const q = 'type:Document'
      return this.count(q)
    },
    countOnDisk () {
      const q = 'type:Document AND extractionLevel:0'
      return this.count(q)
    },
    loadData: waitFor('counters', async function () {
      this.total = await this.countTotal()
      this.onDisk = await this.countOnDisk()
    }),
    humanNumber
  }
}
</script>

<style lang="scss" scoped>
  .widget {
    min-height: 100%;

    &__main-figure {
      font-size: 1.8rem;
      display: block;
    }
  }
</style>
