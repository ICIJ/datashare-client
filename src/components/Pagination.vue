<template>
  <div v-if="isDisplayedComputed" :id="id" class="pagination">
    <router-link
      v-show="!noFirstPageLink"
      v-b-tooltip="{ id, placement, trigger: 'hover' }"
      :to="firstPageLinkParameters()"
      :class="{ disabled: isFirstOrPreviousPageUnavailable() }"
      class="pagination__link pagination__first-page px-2"
      :title="$t('pagination.firstPage')"
    >
      <fa icon="angle-double-left"></fa>
    </router-link>
    <router-link
      v-b-tooltip="{ id, placement, trigger: 'hover' }"
      :to="previousPageLinkParameters()"
      :class="{ disabled: isFirstOrPreviousPageUnavailable() }"
      class="pagination__link pagination__previous-page px-2"
      :title="$t('pagination.previousPage')"
    >
      <fa icon="angle-left"></fa>
    </router-link>
    <router-link
      v-b-tooltip="{ id, placement, trigger: 'hover' }"
      :to="nextPageLinkParameters()"
      :class="{ disabled: isNextOrLastPageUnavailable() }"
      class="pagination__link pagination__next-page px-2"
      :title="$t('pagination.nextPage')"
    >
      <fa icon="angle-right"></fa>
    </router-link>
    <router-link
      v-show="!noLastPageLink"
      v-b-tooltip="{ id, placement, trigger: 'hover' }"
      :to="lastPageLinkParameters()"
      :class="{ disabled: isNextOrLastPageUnavailable() }"
      class="pagination__link pagination__last-page px-2"
      :title="$t('pagination.lastPage')"
    >
      <fa icon="angle-double-right"></fa>
    </router-link>
  </div>
</template>

<script>
import { floor, get, max, noop, uniqueId } from 'lodash'

/**
 * Pagination links (previous, next, first and last) for the global search.
 */
export default {
  name: 'Pagination',
  props: {
    /**
     * Total number of entries.
     */
    total: {
      type: Number
    },
    /**
     * Template function to build the `to` value of each link.
     */
    getToTemplate: {
      type: Function,
      default: noop
    },
    /**
     * A function to call to determine if the paginator is displayed.
     */
    isDisplayed: {
      type: Function,
      default: noop
    },
    /**
     * Page size property in the `to` object.
     */
    sizeAttr: {
      type: String,
      default: 'size'
    },
    /**
     * Page offset property in the `to` object.
     */
    fromAttr: {
      type: String,
      default: 'from'
    },
    /**
     * Hide the link to the first page.
     */
    noFirstPageLink: {
      type: Boolean
    },
    /**
     * Hide the link to the last page.
     */
    noLastPageLink: {
      type: Boolean
    },
    /**
     * Position of the paginator to choose tooltip's placement
     * @values top, bottom
     */
    position: {
      type: String,
      default: 'top'
    }
  },
  computed: {
    isDisplayedComputed() {
      return this.isDisplayed === noop ? this.total > this.size : this.isDisplayed()
    },
    size() {
      return get(this.getToTemplate(), ['query', this.sizeAttr], 0)
    },
    from() {
      return get(this.getToTemplate(), ['query', this.fromAttr], 0)
    },
    nextFrom() {
      return this.from + this.size
    },
    gap() {
      return Number(this.total % this.size === 0)
    },
    id() {
      return uniqueId('pagination')
    },
    placement() {
      return this.position === 'top' ? 'bottomleft' : 'topleft'
    }
  },
  methods: {
    mergeWithQuery(query) {
      const to = this.getToTemplate()
      to.query = Object.assign(to.query, query)
      return to
    },
    firstPageLinkParameters() {
      return this.mergeWithQuery({
        [this.fromAttr]: 0
      })
    },
    previousPageLinkParameters() {
      return this.mergeWithQuery({
        [this.fromAttr]: max([0, this.from - this.size])
      })
    },
    nextPageLinkParameters() {
      return this.mergeWithQuery({
        [this.fromAttr]: this.nextFrom < this.total ? this.nextFrom : this.from
      })
    },
    lastPageLinkParameters() {
      return this.mergeWithQuery({
        [this.fromAttr]: this.size * (floor(this.total / this.size) - this.gap)
      })
    },
    isFirstOrPreviousPageUnavailable() {
      return this.from === 0
    },
    isNextOrLastPageUnavailable() {
      return this.from + this.size >= this.total
    }
  }
}
</script>

<style lang="scss" scoped>
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
