<template>
  <facet v-bind="$props" hide-show-more ref="facet">
    <template #items>
      <v-date-picker
        class="p-2 date-picker"
        mode="range"
        v-model="selectedDate"
        show-caps
        @input="onInput"
        :attributes="attributes"
        show-popover="false">
        <b-form-input
          slot-scope="{ inputValue, updateValue }"
          v-model="inputValue"
          :placeholder="$t('facet.selectDateRange')"
          @input="updateValue($event, { formatInput: true, hidePopover: false })"
          @change="updateValue($event, { formatInput: true, hidePopover: false })"
          @keyup.esc="updateValue(selectedDate, { formatInput: true, hidePopover: true })"></b-form-input>
      </v-date-picker>
    </template>
  </facet>
</template>

<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'
import get from 'lodash/get'
import max from 'lodash/max'
import min from 'lodash/min'
import sumBy from 'lodash/sumBy'

import { setupCalendar, DatePicker } from 'v-calendar'
import 'v-calendar/lib/v-calendar.min.css'

setupCalendar({ firstDayOfWeek: 2 })

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
    this.$store.dispatch('search/queryFacet', { name: this.facet.name, options: { size: 1000 } }).then(r => {
      this.totalCount = sumBy(get(r, this.resultPath, []), 'doc_count')
    })
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
}
</style>
