<script>
import shortkeys from '@/mixins/shortkeys'
import utils from '@/mixins/utils'

/**
 * A form to search for terms inside the current document.
 */
export default {
  name: 'DocumentLocalSearchInput',
  mixins: [shortkeys, utils],
  model: {
    prop: 'searchTerm',
    event: 'input'
  },
  props: {
    /**
     * An object containing a property `label` to use as search term
     * @model
     */
    searchTerm: {
      type: Object
    },
    /**
     * The position of the current occurrence of the term
     * @default 0
     */
    searchIndex: {
      type: Number,
      default: 0
    },
    /**
     * The total number of occurrences found in the document
     * @default 0
     */
    searchOccurrences: {
      type: Number,
      default: 0
    },
    /**
     * Switch to loading state
     */
    loading: {
      type: Boolean
    }
  },
  data () {
    return {
      isActive: false
    }
  },
  computed: {
    shortkeysActions () {
      return {
        activateSearchBar: this.activateSearchBar,
        deactivateSearchBar: this.deactivateSearchBar,
        findPreviousOccurrence: this.previous,
        findPreviousOccurrenceAlt: this.previous,
        findNextOccurrence: this.next,
        findNextOccurrenceAlt: this.next
      }
    },
    searchLabel () {
      return `${this.searchIndex} ${this.$t('document.of')} ${this.searchOccurrences}`
    }
  },
  watch: {
    searchTerm () {
      this.activateSearchBar()
    }
  },
  methods: {
    start () {
      /**
       * User started to search a term
       */
      this.$emit('start', this.searchTerm)
    },
    previous () {
      /**
       * User selected the previous occurrence of the term
       */
      this.$emit('previous', this.searchTerm)
    },
    next () {
      /**
       * User selected the next occurrence of the term
       */
      this.$emit('next', this.searchTerm)
    },
    activateSearchBar () {
      /**
       * User set focus on the search input
       */
      this.$emit('update:activated', true)
      this.$set(this, 'isActive', true)
      this.$nextTick(() => {
        if (this.$refs.search) {
          this.$refs.search.focus()
        }
      })
    },
    deactivateSearchBar () {
      /**
       * User lost focus on the search input
       */
      this.$emit('update:activated', false)
      this.$set(this, 'isActive', false)
      this.$emit('input', '')
    },
    shortkeyAction ({ srcKey }) {
      if (this.shortkeysActions[srcKey]) {
        return this.shortkeysActions[srcKey]()
      }
    }
  }
}
</script>

<template>
  <div class="document-local-search-input form-inline px-3" :class="{ 'document-local-search-input--active': isActive, 'document-local-search-input--pristine': searchTerm.label.length > 0 }">
    <div class="form-group py-2 mr-2">
      <label class="sr-only">
        {{ $t('document.search') }}
      </label>
      <div class="input-group">
        <input type="search" :value="searchTerm.label" @input="$emit('input', { label: $event.target.value })" :placeholder="$t('document.find')" ref="search" class="form-control document-local-search-input__term" v-shortkey="getKeys('findInDocument')" @shortkey="getAction('findInDocument')" />
        <div class="document-local-search-input__count input-group-append w-25" v-if="searchTerm.label.length > 0">
          <span v-if="loading" class="input-group-text w-100 text-center d-inline-block">
            <fa icon="circle-notch" spin></fa>
          </span>
          <span v-else class="input-group-text w-100 text-center d-inline-block px-0 text-truncate" :title="searchLabel">
            <span>
              {{ searchLabel }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="form-group">
      <button class="document-local-search-input__previous btn btn-sm p-2" @click="previous" :disabled="searchOccurrences === 0 || searchTerm.label.length === 0">
        <fa icon="angle-up"></fa>
      </button>
      <button class="document-local-search-input__next btn btn-sm p-2" @click="next" :disabled="searchOccurrences === 0 || searchTerm.label.length === 0">
        <fa icon="angle-down"></fa>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .document-local-search-input {
    justify-content: flex-end;
    white-space: nowrap;

    &--pristine.form-inline .input-group &__term {
      border-radius: 1.5em 0 0 1.5em;
    }

    &.form-inline &__term {
      border-radius: 1.5em;
    }

    &__count .input-group-text {
      border-radius: 0 1.5em 1.5em 0;
    }

    &.form-inline {
      flex-wrap: nowrap;
      white-space: nowrap;

      .input-group {
        width: 300px;

        .input-group-text {
          background: $input-bg;
          border-left: 0;
        }
      }
    }
  }
</style>
