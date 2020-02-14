<template>
  <div class="widget widget--file-barometer d-flex align-items-center text-center">
    <p class="p-3 flex-grow-1">
      <fa icon="hdd" class="widget__icon" />
      <strong class="widget__main-figure" :title="total">
        {{ total | humanNumber($t('human.number')) }} documents
      </strong>
      among which <span :title="onDisk">{{ onDisk | humanNumber($t('human.number')) }}</span> on disk
    </p>
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
  async mounted () {
    const q = 'type:Document'
    this.total = await this.count(q)
    this.onDisk = await this.count(`${q} AND extractionLevel:0`)
  },
  methods: {
    async count (q) {
      const index = this.$store.state.search.index
      const { count } = await elasticsearch.count({ index, q })
      return count
    }
  }
}
</script>

<style lang="scss" scoped>
  .widget {
    min-height: 100%;

    &__icon {
      font-size: 2rem;
    }

    &__main-figure {
      font-size: 2rem;
      display: block;
    }
  }
</style>
