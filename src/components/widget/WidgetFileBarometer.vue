<template>
  <div class="widget widget--file-barometer d-flex align-items-center text-center">
    <v-wait for="barometer counters" class="flex-grow-1" transition="fade">
      <fa slot="waiting" icon="circle-notch" spin size="2x" />
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
  data() {
    return {
      onDisk: null,
      total: null
    }
  },
  async created() {
    await this.loadData()
  },
  mounted() {
    this.$store.subscribe(async ({ type }) => {
      // The project changed
      if (type === 'insights/project') {
        await this.loadData()
      }
    })
  },
  methods: {
    async count(query) {
      const index = this.$store.state.insights.project
      const body = { track_total_hits: true, query: { query_string: { query } } }
      const preference = 'widget-file-barometer'
      const res = await elasticsearch.search({ index, body, preference, size: 0 })
      return res?.hits?.total?.value || 0
    },
    countTotal() {
      const q = 'type:Document'
      return this.count(q)
    },
    countOnDisk() {
      const q = 'type:Document AND extractionLevel:0'
      return this.count(q)
    },
    loadData: waitFor('barometer counters', async function () {
      const total = await this.countTotal()
      this.$set(this, 'total', total)
      const onDisk = await this.countOnDisk()
      this.$set(this, 'onDisk', onDisk)
    }),
    humanNumber
  }
}
</script>

<style lang="scss" scoped>
.widget {
  min-height: 100%;

  &__main-figure {
    display: block;
    font-size: 1.8rem;
  }
}
</style>
