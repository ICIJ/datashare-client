<template>
  <filter-boilerplate
    ref="filter"
    class="filter--date-range"
    v-bind="$props"
    hide-show-more
    hide-contextualize
    hide-sort
  >
    <template #items>
      <div class="m-2">
        <date-picker
          ref="calendar"
          :key="locale"
          v-model="selectedDate"
          class="date-picker d-flex flex-grow-1"
          :popover="{ visibility: 'focus' }"
          is-range
          is-dark
          color="yellow"
          :model-config="{ type: 'number' }"
          :attributes="attributes"
          :locale="locale"
          :update-on-input="false"
          @dayclick="updateFocus"
        >
          <template #default="{ inputValue, inputEvents }">
            <div class="filter--date-range__inputs d-inline-flex justify-content-between align-items-center">
              <input
                ref="dateStart"
                :title="$t('filter.dateRange.from', { dateFormat: placeholderMask })"
                :alt="$t('filter.dateRange.startingDate')"
                :placeholder="placeholderMask"
                :value="inputValue.start"
                class="filter--date-range__inputs__start"
                v-on="inputEvents.start"
              />
              <fa icon="arrow-right" fixed-width />
              <input
                ref="dateEnd"
                :title="$t('filter.dateRange.to', { dateFormat: placeholderMask })"
                :alt="$t('filter.dateRange.endingDate')"
                :placeholder="placeholderMask"
                :value="inputValue.end"
                class="filter--date-range__inputs__end"
                v-on="inputEvents.end"
              />
            </div>
          </template>
        </date-picker>
        <v-wait :for="loader">loading</v-wait>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import bodybuilder from 'bodybuilder'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
import max from 'lodash/max'
import min from 'lodash/min'
import get from 'lodash/get'
import uniqueId from 'lodash/uniqueId'
import { mapState } from 'vuex'

import elasticsearch from '@/api/elasticsearch'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import FilterDate from '@/store/filters/FilterDate'
import { assertCatchClause } from '@babel/types'

/**
 * A Filter component to pick a date range.
 */
export default {
  name: 'FilterDateRange',
  components: {
    DatePicker,
    FilterBoilerplate
  },
  extends: FilterAbstract,
  data() {
    return {
      placeholderMask: '',
      electedInterval: 'month',
      data: []
    }
  },
  computed: {
    ...mapState('search', ['indices']),
    attributes() {
      return [
        {
          key: 'today',
          highlight: {
            style: {
              backgroundColor: 'var(--yellow-900)',
              opacity: '0.3',
              borderRadius: 'var(--rounded-full)'
            }
          },
          dates: new Date()
        }
      ]
    },
    locale() {
      return this.$i18n.locale
    },
    selectedDate: {
      get() {
        console.log('this.filter.name', this.filter.name)
        console.log('getFilterValuesByName', this.getFilterValuesByName(this.filter.name))
        const values = this.getFilterValuesByName(this.filter.name) || []
        if (values.length < 2) {
          return null
        }
        const start = parseInt(min(values))
        const end = parseInt(max(values))
        return { start, end }
      },
      set(range) {
        if (range === null) {
          return this.setFilterValue(this.filter, { key: [] })
        }
        let start = Number.isInteger(range.start) ? new Date(range.start) : range.start
        let end = Number.isInteger(range.end) ? new Date(range.end) : range.end
        start = start - start.getTimezoneOffset() * 60 * 1000
        end = end - end.getTimezoneOffset() * 60 * 1000 + 24 * 60
        this.setFilterValue(this.filter, { key: [start, end] })
        this.refreshRouteAndSearch()
      }
    },
    loader() {
      return uniqueId('loading-creation-date-histogram')
    }
  },
  watch: {
    async locale() {
      await this.$nextTick()
      this.updatePlaceholder()
    }
  },
  async mounted() {
    this.updatePlaceholder()
    await this.loadData()
  },
  methods: {
    updatePlaceholder() {
      if (this.$refs.calendar && this.placeholderMask !== this.$refs.calendar.$locale?.masks?.L) {
        this.placeholderMask = this.$refs.calendar.$locale?.masks?.L
      }
    },
    async updateFocus(e) {
      await this.$nextTick()
      const start = this.$refs.dateStart
      const end = this.$refs.dateEnd
      if (start.value?.trim().length && start.value === end.value) {
        end.focus()
      }
    },
    aggDateHistogramOptions() {
      return {
        ...FilterDate.getIntervalOptions(this.selectedInterval),
        order: { _key: 'asc' },
        min_doc_count: 1
      }
    },
    bodybuilderBase({ size = 1000, from = 0 } = {}) {
      const field = 'metadata.tika_metadata_dcterms_created'
      return bodybuilder()
        .size(0)
        .andQuery('match', 'type', 'Document')
        .agg(
          'date_histogram',
          field,
          'agg_by_creation_date',
          (sub) => {
            return sub.agg('bucket_sort', { size, from }, 'bucket_sort_truncate')
          },
          this.aggDateHistogramOptions()
        )
    },
    async loadData() {
      this.$wait.start(this.loader)
      const body = this.bodybuilderBase().build()
      console.log(body)
      const preference = 'widget-documents-by-creation-date'

      console.log('before search')
      const res = await elasticsearch.search({ index: this.indices, size: 0, body, preference })

      console.log('res')
      const aggregation = get(res, 'aggregations.agg_by_creation_date.buckets', [])
      console.log(aggregation)
      const data = aggregation.reduce((acc, { key_as_string, doc_count }) => {
        return [...acc, ...Array.from({ length: doc_count }, () => key_as_string)]
      }, [])
      this.$set(this, 'data', data)
      this.$wait.end(this.loader)
    }
  }
}
</script>

<style lang="scss">
.filter.filter--date-range {
  .filter--date-range__inputs {
    flex: 0 1 100%;
    input {
      width: 45%;
    }
  }
}
</style>
