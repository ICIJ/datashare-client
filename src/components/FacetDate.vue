<template>
  <facet v-bind="$props" ref="facet">
    <template #top v-if="hasFeature('DATERANGE_PICKER')">
      <v-date-picker mode="range" v-model='selectedDate' show-caps ></v-date-picker>
    </template>
    <template #all>
      <span v-html="getItemLabel({ key: 'all', key_as_string: 'all', doc_count: totalCount })"></span>
    </template>
  </facet>
</template>

<script>
import facets from '@/mixins/facets'
import features from '@/mixins/features'
import Facet from '@/components/Facet'
import get from 'lodash/get'
import sumBy from 'lodash/sumBy'

import { setupCalendar, DatePicker } from 'v-calendar'
import 'v-calendar/lib/v-calendar.min.css'

setupCalendar({ firstDayOfWeek: 2 })

export default {
  name: 'FacetDate',
  components: {
    'v-date-picker': DatePicker,
    Facet
  },
  mixins: [facets, features],
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
  }
}
</script>
