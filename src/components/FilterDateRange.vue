<template>
  <filter-boilerplate v-bind="$props" hide-show-more ref="filter">
    <template #items>
      <div class="m-2">
        <vc-date-picker
          class="date-picker"
          mode="range"
          v-model="selectedDate"
          show-caps
          @input="onInput"
          :attributes="attributes"
          :locale="locale"
          :key="locale">
          <input
            class="form-control"
            slot-scope="{ inputProps, inputEvents }"
            :placeholder="$t('filter.selectDateRange')"
            v-bind="inputProps"
            v-on="inputEvents">
        </vc-date-picker>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import filters from '@/mixins/filters'
import FilterBoilerplate from '@/components/FilterBoilerplate'
import max from 'lodash/max'
import min from 'lodash/min'

export default {
  name: 'FilterDateRange',
  components: {
    FilterBoilerplate
  },
  mixins: [filters],
  data () {
    return {
      totalCount: 0,
      selectedDate: null
    }
  },
  computed: {
    attributes () {
      return [
        {
          key: 'today',
          contentStyle: {
            fontWeight: '700',
            fontSize: '.9 rem'
          },
          dates: new Date()
        }
      ]
    },
    locale () {
      return this.$i18n.locale
    }
  },
  mounted () {
    this.root.$on('reset-filter-values', this.reset)
    this.$on('selected-values-from-store', this.updateFromStore)
    this.updateFromStore()
  },
  methods: {
    onInput () {
      if (this.selectedDate === null) {
        this.$set(this, 'selected', [])
      } else {
        const start = Date.parse(this.selectedDate.start) - this.selectedDate.start.getTimezoneOffset() * 60 * 1000
        const end = Date.parse(this.selectedDate.end) - this.selectedDate.end.getTimezoneOffset() * 60 * 1000 + 24 * 60 * 60 * 1000 - 1
        this.$set(this, 'selected', [start, end])
      }
      this.setValue({ key: this.selected })
    },
    reset () {
      this.$set(this, 'selectedDate', null)
    },
    updateFromStore () {
      if (this.selected.length === 2) {
        this.$set(this, 'selectedDate', {
          start: new Date(parseInt(min(this.selected))),
          end: new Date(parseInt(max(this.selected)))
        })
      } else {
        this.$set(this, 'selectedDate', null)
      }
    }
  }
}
</script>

<style lang="scss">
.date-picker {
  font-size: 0.8rem;
  color: inherit;
  padding: 0;

  .vc-popover-content-wrapper {
    z-index: $zindex-tooltip !important;
  }

  .vc-grid-cell {
    .vc-highlights {
      .vc-day-layer {
        .vc-highlight-base-start,
        .vc-highlight-base-middle,
        .vc-highlight-base-end {
          background-color: rgba($tertiary, .4);
        }

        .vc-rounded-full {
          background-color: $tertiary;
          border-color: $tertiary;
        }
      }
    }

    .vc-day-content:hover {
      background-color: rgba($tertiary, .1);
    }
  }
}
</style>
