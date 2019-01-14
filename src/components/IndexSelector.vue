<template>
  <div class="facet card facet--hide-show-more facet--hide-search">
    <div class="card-header">
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ $t('facet.projects') }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet__items" v-if="!collapseItems">
      <b-form-select :options="options" v-model="selected" class="border-0" @change="select" />
    </div>
  </div>
</template>

<script>
import DatashareClient from '@/api/DatashareClient'
import map from 'lodash/map'
import union from 'lodash/union'

export default {
  name: 'IndexSelector',
  data () {
    return {
      options: [],
      collapseItems: false
    }
  },
  computed: {
    selected: {
      get: function () {
        return this.$store.state.search.index
      },
      set: function (value) {
        this.$store.commit('search/index', value)
      }
    },
    headerIcon () {
      return this.collapseItems ? 'caret-right' : 'caret-down'
    }
  },
  created () {
    const ds = new DatashareClient()
    ds.getIndices().then(res => {
      res.json().then(indices => {
        this.options = union([{ value: process.env.VUE_APP_ES_INDEX, text: process.env.VUE_APP_ES_INDEX }],
          map(indices, index => { return { value: index, text: index } }))
      })
    })
  },
  methods: {
    async select (value) {
      await this.$store.commit('search/index', value)
      await this.$store.dispatch('search/query')
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    }
  }
}

</script>
