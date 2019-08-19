<template>
  <div v-if="isDisplayedComputed" class="pagination">
    <router-link
      :to="firstPageLinkParameters()"
      :class="[isFirstOrPreviousPageAvailable('first') ? '' : 'disabled']"
      class="pagination__link pagination__first-page px-2"
      v-b-tooltip.hover
      :title="$t('pagination.firstPage')">
      <fa icon="angle-double-left" />
    </router-link>
    <router-link
      :to="previousPageLinkParameters()"
      :class="[isFirstOrPreviousPageAvailable('previous') ? '' : 'disabled']"
      class="pagination__link pagination__previous-page px-2"
      v-b-tooltip.hover
      :title="$t('pagination.previousPage')">
      <fa icon="angle-left" />
    </router-link>
    <router-link
      :to="nextPageLinkParameters()"
      :class="[isNextOrLastPageAvailable() ? '' : 'disabled']"
      class="pagination__link pagination__next-page px-2"
      v-b-tooltip.hover
      :title="$t('pagination.nextPage')">
      <fa icon="angle-right" />
    </router-link>
    <router-link
      :to="lastPageLinkParameters()"
      :class="[isNextOrLastPageAvailable() ? '' : 'disabled']"
      class="pagination__link pagination__last-page px-2"
      v-b-tooltip.hover
      :title="$t('pagination.lastPage')">
      <fa icon="angle-double-right" />
    </router-link>
  </div>
</template>

<script>
import floor from 'lodash/floor'
import max from 'lodash/max'
import noop from 'lodash/noop'

export default {
  name: 'Pagination',
  props: {
    total: {
      type: Number
    },
    getToTemplate: {
      type: Function,
      default: noop
    },
    isDisplayed: {
      type: Function,
      default: noop
    }
  },
  computed: {
    isDisplayedComputed () {
      return this.isDisplayed === noop ? this.total > this.getToTemplate().query.size : this.isDisplayed()
    }
  },
  methods: {
    firstPageLinkParameters () {
      let to = this.getToTemplate()
      to.query.from = 0
      return to
    },
    previousPageLinkParameters () {
      let to = this.getToTemplate()
      to.query.from = max([0, to.query.from - to.query.size])
      return to
    },
    nextPageLinkParameters () {
      let to = this.getToTemplate()
      const nextFrom = to.query.from + to.query.size
      to.query.from = nextFrom < this.total ? nextFrom : to.query.from
      return to
    },
    lastPageLinkParameters () {
      let to = this.getToTemplate()
      const gap = (this.total % to.query.size === 0) ? 1 : 0
      to.query.from = to.query.size * (floor(this.total / to.query.size) - gap)
      return to
    },
    isFirstOrPreviousPageAvailable (arg) {
      const to = this.getToTemplate()
      return to.query.from !== 0
    },
    isNextOrLastPageAvailable () {
      const to = this.getToTemplate()
      return to.query.from + to.query.size < this.total
    }
  }
}
</script>

<style lang="scss">
  .pagination {

    &__link,
    &__link:hover {
      color: $text-muted;
      font-size: 1.1em;

      &.disabled {
        color: $gray-500;
        cursor: inherit;
      }
    }
  }

</style>
