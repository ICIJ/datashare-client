<template>
  <div class="facet card facet--hide-show-more facet--hide-search" v-if="indices.length > 1">
    <div class="card-header">
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ $t('facet.projects') }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet__items" v-if="!collapseItems">
      <b-form-select :options="indices" v-model="selectedIndex" class="border-0" @change="select" />
    </div>
  </div>
</template>

<script>
import facets from '@/mixins/facets'
import map from 'lodash/map'

export default {
  name: 'IndexSelector',
  mixins: [facets],
  data () {
    return {
      indices: [],
      collapseItems: false
    }
  },
  computed: {
    selectedIndex: {
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
    this.indices = map(this.$config.get('userIndices', []), index => { return { value: index, text: index } })
  },
  methods: {
    select (value) {
      this.$store.commit('search/index', value)
      this.$store.dispatch('search/reset')
      this.refreshRoute()
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    }
  }
}

</script>
