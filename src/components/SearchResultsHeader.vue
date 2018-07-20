<template>
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
    <div class="search-results__header__size">
      <div class="search-results__header__size__select">
        <select v-model="selectedSize" @change="changeSize">
          <option v-for="size in sizes" v-bind:key="size">
            {{ size }}
          </option>
        </select>
      </div>
      <label>{{ $t('search.results.perPage') }}</label>
    </div>
    <div @click="nextPage" :class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__next-page', 'px-2']" data-toggle="tooltip" :title="$t('search.results.nextPage')" v-if="response.total > $store.state.search.size">
      <font-awesome-icon icon="angle-right" />
    </div>
    <div @click="lastPage" :class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__last-page', 'px-2']" data-toggle="tooltip" :title="$t('search.results.lastPage')" v-if="response.total > $store.state.search.size">
      <font-awesome-icon icon="angle-double-right" />
    </div>
  </div>
</template>

<script>
import min from 'lodash/min'

export default {
  name: 'SearchResultsHeader',
  props: ['response'],
  data () {
    return {
      sizes: [10, 25, 50, 100],
      selectedSize: this.$store.state.search.size
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

.search-results__header__size {
  position: relative;

  .search-results__header__size__select {
    display: inline-block;

    &:after {
      position: absolute;
      top: 0.5em;
      right: 4em;
      width: 0;
      height: 0;
      padding: 0;
      content: '';
      border-left: .25em solid transparent;
      border-right: .25em solid transparent;
      border-top: 0.375em solid theme-color('icij');
      pointer-events: none;
    }

    select {
      background-color: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: $text-muted;
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;

      &:hover {
        border-bottom: 2px solid theme-color('icij');
      }
    }
  }
}

</style>
