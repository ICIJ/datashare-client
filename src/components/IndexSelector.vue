<template>
  <div class="facet card facet--hide-show-more facet--hide-search" v-if="indices.length > 1">
    <div class="card-header">
      <h6 @click="toggleItems">
        <fa :icon="headerIcon" />
        {{ $t('facet.projects') }}
      </h6>
    </div>
    <slide-up-down class="list-group list-group-flush facet__items" :active="!collapseItems">
      <b-form-select :options="indices" v-model="selectedIndex" class="border-0" @change="select" />
    </slide-up-down>
  </div>
</template>

<script>
import utils from '@/mixins/utils'
import map from 'lodash/map'

export default {
  name: 'IndexSelector',
  mixins: [utils],
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
