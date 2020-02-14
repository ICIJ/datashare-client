<template>
  <div class="widget widget--file-barometer d-flex align-items-center text-center">
    <v-wait for="counters" class="flex-grow-1" transition="fade">
      <fa icon="circle-notch" spin slot="waiting" size="2x" />
      <p :class="{ 'card-body': widget.card }">
        <fa icon="hdd" class="widget__icon" size="2x" />
        <strong class="widget__main-figure" :title="total">
          {{ total | humanNumber($t('human.number')) }} documents
        </strong>
        among which <span :title="onDisk">{{ onDisk | humanNumber($t('human.number')) }}</span> on disk
      </p>
    </v-wait>
  </div>
</template>

<script>
import elasticsearch from '@/api/elasticsearch'
import humanNumber from '@/filters/humanNumber'

export default {
  name: 'WidgetFileBarometer',
  filters: { humanNumber },
  props: {
    widget: {
      type: Object
    }
  },
  data () {
    return {
      total: null,
      onDisk: null
    }
  },
  async created () {
    this.$wait.start('counters')
    this.total = await this.countTotal()
    this.onDisk = await this.countOnDisk()
    this.$wait.end('counters')
  },
  methods: {
    async count (q) {
      const index = this.$store.state.search.index
      const { count } = await elasticsearch.count({ index, q })
      return count
    },
    countTotal () {
      const q = 'type:Document'
      return this.count(q)
    },
    countOnDisk () {
      const q = 'type:Document AND extractionLevel:0'
      return this.count(q)
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget {
    min-height: 100%;

    &__main-figure {
      font-size: 2rem;
      display: block;
    }
  }
</style>
