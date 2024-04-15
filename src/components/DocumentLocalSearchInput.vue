<script>
import shortkeys from '@/mixins/shortkeys'
import utils from '@/mixins/utils'

/**
 * A form to search for terms inside the current document.
 */
export default {
  name: 'DocumentLocalSearchInput',
  mixins: [shortkeys, utils],
  props: {
    /**
     * An object containing a property `label` to use as search term
     * @model
     */
    modelValue: {
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
  emits: ['update:modelValue', 'update:activated', 'previous', 'next'],
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
      return !this.modelValue || this.modelValue?.length === 0
    },
    searchTermIsPresent() {
      return !this.searchTermIsEmpty
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
      this.$emit('previous', this.modelValue)
    },
    next() {
      /**
       * User selected the next occurrence of the term
       */
      this.$emit('next', this.modelValue)
    },
    activateSearchBar() {
      /**
       * User set focus on the search input
       */
      this.$emit('update:activated', true)
      this.isActive = true
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
      this.isActive = false
      this.$emit('update:modelValue', '')
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
    class="document-local-search-input px-3"
    :class="{
      'document-local-search-input--active': isActive,
      'document-local-search-input--pristine': searchTermIsPresent
    }"
  >
    <div class="form-group py-2 me-2">
      <label class="sr-only">
        {{ $t('document.search') }}
      </label>
      <div class="input-group">
        <input
          ref="search"
          v-shortkey="getKeys('findInDocument')"
          type="search"
          :value="modelValue"
          :disabled="disabled"
          :placeholder="$t('document.find')"
          class="form-control document-local-search-input__term"
          @input="$emit('update:modelValue', $event.target.value)"
          @shortkey="getAction('findInDocument')"
        />
        <span
          v-if="searchTermIsPresent"
          class="document-local-search-input__count input-group-text text-center d-inline-block"
        >
          <span v-if="loading">
            <fa icon="circle-notch" spin></fa>
          </span>
          <span v-else class="px-2 text-truncate" :title="searchLabel">
            <span>
              {{ searchLabel }}
            </span>
          </span>
        </span>
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
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  white-space: nowrap;
  flex-wrap: nowrap;
  white-space: nowrap;

  .input-group {
    width: 200px;

    .input-group-text {
      background: $input-bg;
      border-left: 0;
    }
  }

  &--pristine.form-inline .input-group &__term {
    border-radius: 1.5em 0 0 1.5em;
  }

  &__term {
    border-radius: 1.5em;
  }

  &__count {
    border-radius: 0 1.5em 1.5em 0;
  }
}
</style>
