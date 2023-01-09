<template>
  <filter-boilerplate
    class="filter--date-range"
    ref="filter"
    v-bind="$props"
    hide-show-more
    hide-contextualize
    hide-sort
  >
    <template #items>
      <div class="m-2">
        <date-picker
          class="date-picker"
          is-range
          is-dark
          is-expanded
          color="yellow"
          v-model="selectedDate"
          show-caps
          :model-config="{ type: 'number' }"
          :attributes="attributes"
          :locale="locale"
          :key="locale"
        >
        </date-picker>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import DatePicker from 'v-calendar/lib/components/date-picker.umd'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'

import max from 'lodash/max'
import min from 'lodash/min'

/**
 * A Filter component to pick a date range.
 */
export default {
  name: 'FilterDateRange',
  extends: FilterAbstract,
  components: {
    DatePicker,
    FilterBoilerplate
  },
  computed: {
    attributes() {
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
    locale() {
      return this.$i18n.locale
    },
    selectedDate: {
      get() {
        const values = this.getFilterValuesByName(this.filter.name) || []
        if (values.length < 2) {
          return null
        }
        const start = min(values)
        const end = max(values)
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
    }
  }
}
</script>

<style lang="scss">
.filter.filter--date-range {
  .date-picker {
    --yellow-500: #{$tertiary};
    --yellow-400: #{lighten($tertiary, 5)};
    --yellow-300: #{lighten($tertiary, 10)};
    --yellow-200: #{lighten($tertiary, 15)};
    --yellow-100: #{lighten($tertiary, 20)};

    font-family: $font-family-base;
    border: 0;
    font-size: 0.8rem;
    color: inherit;
    padding: 0;
    margin: 0;
    background: transparent;

    .vc-popover-content-wrapper {
      z-index: $zindex-tooltip !important;
    }

    .vc-grid-cell {
      .vc-highlights {
        .vc-day-layer {
          .vc-highlight-base-start,
          .vc-highlight-base-middle,
          .vc-highlight-base-end {
            background-color: rgba($tertiary, 0.4);
          }

          .vc-rounded-full {
            background-color: $tertiary;
            border-color: $tertiary;
          }
        }
      }

      .vc-day-content:hover {
        background-color: rgba($tertiary, 0.1);
      }
    }
  }
}
</style>
