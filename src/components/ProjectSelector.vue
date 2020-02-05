<template>
  <div class="filter card filter--hide-show-more filter--hide-search" v-if="$config.is('multipleProjects')">
    <div class="card-header px-2">
      <h6 @click="toggleItems" class="pt-0">
        <span class="filter__items__item__icon pl-0 pr-1">
          <fa icon="book" fixed-width />
        </span>
        <fa :icon="headerIcon" class="float-right"/>
        {{ $t('filter.projects') }}
      </h6>
    </div>
    <slide-up-down class="list-group list-group-flush filter__items" :active="!collapseItems">
      <div class="p-2">
        <b-form-select :options="indices" v-model="selectedIndex" class="border-0" @change="select" />
      </div>
    </slide-up-down>
  </div>
</template>

<script>
import filters from '@/mixins/filters'
import map from 'lodash/map'

export default {
  name: 'ProjectSelector',
  mixins: [filters],
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
      return this.collapseItems ? 'plus' : 'minus'
    }
  },
  async created () {
    this.$set(this, 'indices', map(this.$config.get('userProjects', []), value => { return { value, text: value } }))
    await this.$store.dispatch('search/getStarredDocuments')
    await this.$store.dispatch('search/getIsDownloadAllowed')
  },
  methods: {
    async select (value) {
      this.$store.commit('search/index', value)
      await this.$store.dispatch('search/reset')
      this.$root.$emit('filter::search::reset-filters')
      await this.$store.dispatch('search/getStarredDocuments')
      await this.$store.dispatch('search/getIsDownloadAllowed')
      this.refreshRoute()
    },
    toggleItems () {
      this.collapseItems = !this.collapseItems
    }
  }
}

</script>
