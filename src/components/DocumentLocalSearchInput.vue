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
      type: String
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
    },
    /**
     * Disable input
     */
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      isActive: false
    }
  },
  computed: {
    shortkeysActions() {
      return {
        activateSearchBar: this.activateSearchBar,
        deactivateSearchBar: this.deactivateSearchBar,
        findPreviousOccurrence: this.previous,
        findPreviousOccurrenceAlt: this.previous,
        findNextOccurrence: this.next,
        findNextOccurrenceAlt: this.next
      }
    },
    searchLabel() {
      return `${this.searchIndex} ${this.$t('document.of')} ${this.searchOccurrences}`
    },
    searchTermIsEmpty() {
      return this.searchTerm?.length === 0
    }
  },
  watch: {
    searchTerm() {
      this.activateSearchBar()
    }
  },
  methods: {
    previous() {
      /**
       * User selected the previous occurrence of the term
       */
      this.$emit('previous', this.searchTerm)
    },
    next() {
      /**
       * User selected the next occurrence of the term
       */
      this.$emit('next', this.searchTerm)
    },
    activateSearchBar() {
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
    deactivateSearchBar() {
      /**
       * User lost focus on the search input
       */
      this.$emit('update:activated', false)
      this.$set(this, 'isActive', false)
      this.$emit('input', '')
    },
    shortkeyAction({ srcKey }) {
      if (this.shortkeysActions[srcKey]) {
        return this.shortkeysActions[srcKey]()
      }
    }
  }
}
</script>

<template>
  <div
    class="document-local-search-input form-inline px-3"
    :class="{
      'document-local-search-input--active': isActive,
      'document-local-search-input--pristine': !searchTermIsEmpty
    }"
  >
    <div class="form-group py-2 mr-2">
      <label class="sr-only">
        {{ $t('document.search') }}
      </label>
      <div class="input-group">
        <input
          ref="search"
          v-shortkey="getKeys('findInDocument')"
          type="search"
          :value="searchTerm"
          :disabled="disabled"
          :placeholder="$t('document.find')"
          class="form-control document-local-search-input__term"
          @input="$emit('input', $event.target.value)"
          @shortkey="getAction('findInDocument')"
        />
        <div v-if="!searchTermIsEmpty" class="document-local-search-input__count input-group-append w-25">
          <span v-if="loading" class="input-group-text w-100 text-center d-inline-block">
            <fa icon="circle-notch" spin></fa>
          </span>
          <span
            v-else
            class="input-group-text w-100 text-center d-inline-block px-0 text-truncate"
            :title="searchLabel"
          >
            <span>
              {{ searchLabel }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="form-group">
      <button
        class="document-local-search-input__previous btn btn-sm btn-link p-2"
        :disabled="searchOccurrences === 0 || searchTermIsEmpty"
        @click="previous"
      >
        <fa icon="angle-up"></fa>
      </button>
      <button
        class="document-local-search-input__next btn btn-sm btn-link p-2"
        :disabled="searchOccurrences === 0 || searchTermIsEmpty"
        @click="next"
      >
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
      width: 200px;

      .input-group-text {
        background: $input-bg;
        border-left: 0;
      }
    }
  }
}
</style>
