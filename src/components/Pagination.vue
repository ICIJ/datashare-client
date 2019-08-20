<template>
  <div v-if="isDisplayedComputed" class="pagination">
    <router-link
      :to="firstPageLinkParameters()"
      :class="{ 'disabled' : isFirstOrPreviousPageUnavailable() }"
      class="pagination__link pagination__first-page px-2"
      v-b-tooltip.hover
      v-show="!noFirstPageLink"
      :title="$t('pagination.firstPage')">
      <fa icon="angle-double-left" />
    </router-link>
    <router-link
      :to="previousPageLinkParameters()"
      :class="{ 'disabled' : isFirstOrPreviousPageUnavailable() }"
      class="pagination__link pagination__previous-page px-2"
      v-b-tooltip.hover
      :title="$t('pagination.previousPage')">
      <fa icon="angle-left" />
    </router-link>
    <router-link
      :to="nextPageLinkParameters()"
      :class="{ 'disabled' : isNextOrLastPageUnavailable() }"
      class="pagination__link pagination__next-page px-2"
      v-b-tooltip.hover
      :title="$t('pagination.nextPage')">
      <fa icon="angle-right" />
    </router-link>
    <router-link
      :to="lastPageLinkParameters()"
      :class="{ 'disabled' : isNextOrLastPageUnavailable() }"
      class="pagination__link pagination__last-page px-2"
      v-b-tooltip.hover
      v-show="!noLastPageLink"
      :title="$t('pagination.lastPage')">
      <fa icon="angle-double-right" />
    </router-link>
  </div>
</template>

<script>
import floor from 'lodash/floor'
import get from 'lodash/get'
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
    },
    sizeAttr: {
      type: String,
      default: 'size'
    },
    fromAttr: {
      type: String,
      default: 'from'
    },
    noFirstPageLink: {
      type: Boolean
    },
    noLastPageLink: {
      type: Boolean
    }
  },
  computed: {
    isDisplayedComputed () {
      return this.isDisplayed === noop ? this.total > this.size : this.isDisplayed()
    },
    size () {
      return get(this.getToTemplate(), ['query', this.sizeAttr], 0)
    },
    from () {
      return get(this.getToTemplate(), ['query', this.fromAttr], 0)
    },
    nextFrom () {
      return this.from + this.size
    },
    gap () {
      return Number(this.total % this.size === 0)
    }
  },
  methods: {
    mergeWithQuery (query) {
      const to = this.getToTemplate()
      to.query = Object.assign(to.query, query)
      return to
    },
    firstPageLinkParameters () {
      return this.mergeWithQuery({
        [this.fromAttr]: 0
      })
    },
    previousPageLinkParameters () {
      return this.mergeWithQuery({
        [this.fromAttr]: max([0, this.from - this.size])
      })
    },
    nextPageLinkParameters () {
      return this.mergeWithQuery({
        [this.fromAttr]: this.nextFrom < this.total ? this.nextFrom : this.from
      })
    },
    lastPageLinkParameters () {
      return this.mergeWithQuery({
        [this.fromAttr]: this.size * (floor(this.total / this.size) - this.gap)
      })
    },
    isFirstOrPreviousPageUnavailable () {
      return this.from === 0
    },
    isNextOrLastPageUnavailable () {
      return this.from + this.size >= this.total
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
