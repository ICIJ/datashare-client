<template>
  <facet v-bind="$props" hide-show-more ref="facet">
    <template #items>
      <v-date-picker
        class="p-2 date-picker"
        mode="range"
        v-model="selectedDate"
        show-caps
        @input="onInput"
        :attributes="attributes">
        <input
          class="form-control"
          slot-scope="{ inputProps, inputEvents, isDragging }"
          :placeholder="$t('facet.selectDateRange')"
          v-bind="inputProps"
          v-on="inputEvents">
      </v-date-picker>
    </template>
  </facet>
</template>

<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'
import max from 'lodash/max'
import min from 'lodash/min'

import Vue from 'vue'
import { setupCalendar, DatePicker } from 'v-calendar'

setupCalendar(Vue, {
  componentPrefix: 'vc'
})

export default {
  name: 'FacetDateRange',
  components: {
    'v-date-picker': DatePicker,
    Facet
  },
  mixins: [facets],
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
    }
  },
  mounted () {
    this.root.$on('reset-facet-values', this.reset)
    this.$on('selected-values-from-store', this.updateFromStore)
  },
  methods: {
    onInput () {
      if (this.selectedDate === null) {
        this.$set(this, 'selected', [])
      } else {
        this.$set(this, 'selected', [new Date(this.selectedDate.start).getTime(), new Date(this.selectedDate.end).getTime()])
      }
      this.setValue({ key: this.selected })
    },
    reset () {
      this.$set(this, 'selectedDate', null)
    },
    updateFromStore () {
      if (this.selected.length === 0) {
        this.$set(this, 'selectedDate', null)
      } else {
        this.$set(this, 'selectedDate', { start: new Date(min(this.selected)), end: new Date(max(this.selected)) })
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
