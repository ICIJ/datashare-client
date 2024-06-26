<script>
import shortkeys from '@/mixins/shortkeys'
import { getShortkeyOS } from '@/utils/utils'

/**
 * A simple component to display a next/previous pair of buttons to navigate
 * between items (including keyboard shortcut).
 */
export default {
  name: 'QuickItemNav',
  mixins: [shortkeys],
  model: {
    prop: 'index',
    event: 'change'
  },
  props: {
    /**
     * The index of the current item.
     */
    index: {
      type: Number,
      default: 0
    },
    /**
     * The total number of items in the list.
     */
    totalItems: {
      type: Number,
      default: 0
    },
    /**
     * Name of the scope for the shortkey settings.
     */
    shortkeyScope: {
      type: String,
      default: 'QuickItemNav'
    },
    /**
     * Enable the "next" button explicitely (regardless of the current `index`).
     */
    hasNextItem: {
      type: Boolean,
      default: null
    },
    /**
     * Enable the "preview" button explicitely (regardless of the current `index`).
     */
    hasPreviousItem: {
      type: Boolean,
      default: null
    }
  },
  computed: {
    isPreviousButtonEnable() {
      if (this.hasPreviousItem !== null) {
        return !!this.hasPreviousItem
      }
      return this.index > 0
    },
    isNextButtonEnable() {
      if (this.hasNextItem !== null) {
        return !!this.hasNextItem
      }
      return this.index < this.totalItems - 1
    },
    isMac() {
      return getShortkeyOS() === 'mac'
    },
    osTooltipKey() {
      return this.isMac ? 'tooltipMac' : 'tooltipOthers'
    },
    previousTooltip() {
      return this.$t(`quickItemNav.previous.${this.osTooltipKey}`)
    },
    nextTooltip() {
      return this.$t(`quickItemNav.next.${this.osTooltipKey}`)
    }
  },
  methods: {
    goToPreviousItem() {
      /**
       * Triggered when user click on the `previous` button.
       */
      const previousIndex = Math.max(0, this.index - 1)
      this.$emit('change', previousIndex)
      this.$emit('previous', previousIndex)
    },
    goToNextItem() {
      /**
       * Triggered when user click on the `next` button.
       */
      const nextIndex = Math.min(this.totalItems - 1, this.index + 1)
      this.$emit('change', nextIndex)
      this.$emit('next', nextIndex)
    }
  }
}
</script>

<template>
  <span class="quick-items-nav">
    <button
      id="previous-item-button"
      v-shortkey="getKeys('goToPreviousItem')"
      class="btn btn-sm btn-link text-white py-0 quick-items-nav__previous"
      :disabled="!isPreviousButtonEnable"
      @click="goToPreviousItem"
      @shortkey="getAction('goToPreviousItem')"
    >
      <fa icon="angle-left" class="me-1"></fa>
      <span class="d-sm-none d-md-inline">
        {{ $t('quickItemNav.previous.label') }}
      </span>
    </button>
    <b-tooltip target="previous-item-button" triggers="hover">
      <span v-html="previousTooltip"></span>
    </b-tooltip>
    <button
      id="next-item-button"
      v-shortkey="getKeys('goToNextItem')"
      class="btn btn-sm btn-link text-white py-0 quick-items-nav__next"
      :disabled="!isNextButtonEnable"
      @click="goToNextItem"
      @shortkey="getAction('goToNextItem')"
    >
      <span class="d-sm-none d-md-inline">
        {{ $t('quickItemNav.next.label') }}
      </span>
      <fa icon="angle-right" class="ms-1"></fa>
    </button>
    <b-tooltip target="next-item-button" triggers="hover">
      <span v-html="nextTooltip"></span>
    </b-tooltip>
  </span>
</template>
