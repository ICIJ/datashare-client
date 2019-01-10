<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'
import DatashareClient from '@/api/DatashareClient'
import map from 'lodash/map'
import union from 'lodash/union'

export default {
  name: 'FacetIndex',
  components: { Facet },
  mixins: [facets],
  data () {
    return {
      options: [],
      selected: null
    }
  },
  created () {
    const ds = new DatashareClient()
    ds.getIndices().then(res => {
      res.json().then(indices => {
        // this.root.isReady = true
        this.options = union([{ value: process.env.VUE_APP_ES_INDEX, text: process.env.VUE_APP_ES_INDEX }], map(indices, index => { return { value: index, text: index } }))
        this.selected = process.env.VUE_APP_ES_INDEX
      })
    })
  }
}

</script>

<template>
  <facet v-bind="$props" ref="facet">
    <template slot="items" slot-scope="{ items }">
      <div>
        <b-form-select :options="options" v-model="selected" class="border-0" />
      </div>
    </template>
  </facet>
</template>
