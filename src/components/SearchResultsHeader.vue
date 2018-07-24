<template>
  <div>
    <div class="search-results__header" v-if="position == 'top'">
      <div class="search-results__header__size">
        <div class="search-results__header__size__select pr-2 d-inline-block">
          <select v-model="selectedSize" @change="changeSize" class="border-0">
            <option v-for="size in sizes" :key="size">
              {{ size }}
            </option>
          </select>
        </div>
        <label class="mb-0">{{ $t('search.results.perPage') }}</label>
      </div>
      <div class="search-results__header__sort">
        <label class="mb-0">{{ $t('search.results.sort.sort') }}</label>
        <div class="search-results__header__sort__select pr-2 d-inline-block">
          <select v-model="selectedSort" @change="changeSort" class="border-0">
            <option v-for="sort in sorts" :key="sort" :value="sort">
              {{ $t('search.results.sort.' + sort) }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="search-results__header">
      <div @click="firstPage" :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled', 'search-results__header__first-page', 'px-2']" data-toggle="tooltip" :title="$t('search.results.firstPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-double-left" />
      </div>
      <div @click="previousPage" :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled', 'search-results__header__previous-page', 'px-2']" data-toggle="tooltip" :title="$t('search.results.previousPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-left" />
      </div>
      <div class="search-results__header__progress">
        <div class="search-results__header__progress__pagination">
          {{ $store.state.search.from + 1 }} - {{ lastDocument }}
        </div>
        <div class="search-results__header__progress_number-of-results">
          {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, {total: response.get('hits.total')}) }}
        </div>
      </div>
      <div @click="nextPage" :class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__next-page', 'px-2']" data-toggle="tooltip" :title="$t('search.results.nextPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-right" />
      </div>
      <div @click="lastPage" :class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__last-page', 'px-2']" data-toggle="tooltip" :title="$t('search.results.lastPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-double-right" />
      </div>
    </div>
  </div>
</template>

<script>
import min from 'lodash/min'

export default {
  name: 'SearchResultsHeader',
  props: ['response', 'position'],
  data () {
    return {
      sizes: [10, 25, 50, 100],
      selectedSize: this.$store.state.search.size,
      sorts: ['relevance', 'dateNewest', 'dateOldest', 'sizeLargest', 'sizeSmallest'],
      selectedSort: this.$store.state.search.sort
    }
  },
  computed: {
    lastDocument () {
      return min([this.response.total, this.$store.state.search.from + this.$store.state.search.size])
    }
  },
  mounted () {
    // Force page to scroll top at each load
    // Specially for pagination
    document.body.scrollTop = document.documentElement.scrollTop = 0
  },
  methods: {
    changeSize () {
      // Store new search size into store
      this.$store.commit('search/size', this.selectedSize)
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    },
    changeSort () {
      // Store new search size into store
      this.$store.commit('search/sort', this.selectedSort)
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    },
    firstPage () {
      if (this.isFirstOrPreviousPageAvailable()) {
        this.$store.dispatch('search/firstPage')
      }
    },
    previousPage () {
      if (this.isFirstOrPreviousPageAvailable()) {
        this.$store.dispatch('search/previousPage')
      }
    },
    nextPage () {
      if (this.isNextOrLastPageAvailable()) {
        this.$store.dispatch('search/nextPage')
      }
    },
    lastPage () {
      if (this.isNextOrLastPageAvailable()) {
        this.$store.dispatch('search/lastPage')
      }
    },
    isFirstOrPreviousPageAvailable () {
      return this.$store.state.search.from !== 0
    },
    isNextOrLastPageAvailable () {
      return this.$store.state.search.from + this.$store.state.search.size < this.$store.state.search.response.total
    }
  }
}
</script>

<style lang="scss" scoped>

.search-results__header__size,
.search-results__header__sort {
  margin: auto;
  position: relative;

  .search-results__header__size__select,
  .search-results__header__sort__select {
    border-bottom: .12em solid transparent;

    &:after {
      content: '';
      height: 0;
      padding: 0;
      pointer-events: none;
      position: absolute;
      width: 0;
    }

    &:hover {
      border-bottom: .12em solid theme-color('icij');
    }

    select {
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      background-color: transparent;
      color: $text-muted;
    }
  }

  .search-results__header__size__select {
    &:after {
      border-left: .25em solid transparent;
      border-right: .25em solid transparent;
      border-top: 0.375em solid theme-color('icij');
      right: 4.1em;
      top: 0.5em;
    }
  }

  .search-results__header__sort__select {
    &:after {
      border-left: .25em solid transparent;
      border-right: .25em solid transparent;
      border-top: 0.375em solid theme-color('icij');
      right: 0;
      top: 0.5em;
    }
  }
}

</style>
