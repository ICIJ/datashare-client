<template>
  <facet v-bind="$props" hide-show-more ref="facet">
    <template #items>
      <v-date-picker mode="range" v-model='selectedDate' show-caps @input="onInput"></v-date-picker>
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
  mounted () {
    this.$store.dispatch('search/queryFacet', { name: this.facet.name, options: { size: 1000 } }).then(r => {
      this.totalCount = sumBy(get(r, this.resultPath, []), 'doc_count')
    })
  },
  updated () {
    if (this.selected.length === 0) {
      this.$set(this, 'selectedDate', null)
    } else {
      this.$set(this, 'selectedDate', { start: new Date(Number(min(this.selected))), end: new Date(Number(max(this.selected))) })
    }
  },
  methods: {
    onInput () {
      if (this.selectedDate === null) {
        this.$set(this, 'selected', [])
      } else {
        this.$set(this, 'selected', [new Date(this.selectedDate.start).getTime(), new Date(this.selectedDate.end).getTime()])
      }
      this.setValue({ key: this.selected })
    }
  }
}
</script>
