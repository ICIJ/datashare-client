<template>
  <div>
    <div class="search-results__header">
      <div @click="firstPage" :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled', 'search-results__header__first-page', 'px-2']" v-b-tooltip.hover :title="$t('search.results.firstPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-double-left" />
      </div>
      <div @click="previousPage" :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled', 'search-results__header__previous-page', 'px-2']" v-b-tooltip.hover :title="$t('search.results.previousPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-left" />
      </div>
      <div class="search-results__header__progress">
        <div class="search-results__header__progress__pagination">
          {{ $store.state.search.from + 1 }} - {{ lastDocument }}
        </div>&nbsp;
        <div class="search-results__header__progress_number-of-results">
          {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, {total: response.get('hits.total')}) }}
        </div>
      </div>
      <div @click="nextPage" :class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__next-page', 'px-2']" v-b-tooltip.hover :title="$t('search.results.nextPage')" v-if="response.total > $store.state.search.size">
        <font-awesome-icon icon="angle-right" />
      </div>
      <div @click="lastPage" :class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__last-page', 'px-2']" v-b-tooltip.hover :title="$t('search.results.lastPage')" v-if="response.total > $store.state.search.size">
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
