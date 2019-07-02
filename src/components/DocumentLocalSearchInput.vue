<script>
import { getOS } from '@/utils/utils'
import utils from '@/mixins/utils'

export default {
  name: 'DocumentLocalSearchInput',
  mixins: [ utils ],
  model: {
    prop: 'searchTerm',
    event: 'input'
  },
  props: {
    document: {
      type: Object
    },
    searchTerm: {
      type: String,
      default: ''
    },
    searchIndex: {
      type: Number,
      default: 0
    },
    searchOccurrences: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      isActive: false
    }
  },
  watch: {
    searchTerm () {
      this.activateSearchBar()
    }
  },
  methods: {
    start () {
      this.$emit('start', this.searchTerm)
    },
    previous () {
      this.$emit('previous', this.searchTerm)
    },
    next () {
      this.$emit('next', this.searchTerm)
    },
    activateSearchBar () {
      this.$emit('update:activated', true)
      this.$set(this, 'isActive', true)
      this.$nextTick(() => {
        if (this.$refs.search) {
          this.$refs.search.focus()
        }
      })
    },
    deactivateSearchBar () {
      this.$emit('update:activated', false)
      this.$set(this, 'isActive', false)
    },
    shortkeyAction ({ srcKey }) {
      if (this.shortkeysActions[srcKey]) {
        return this.shortkeysActions[srcKey]()
      }
    }
  },
  computed: {
    shortkeysByOs () {
      return {
        mac: {
          activateSearchBar: ['meta', 'f'],
          deactivateSearchBar: ['esc'],
          findPreviousOccurrence: ['shift', 'enter'],
          findPreviousOccurrenceAlt: ['shift', 'f3'],
          findNextOccurrence: ['enter'],
          findNextOccurrenceAlt: ['f3']
        },
        default: {
          activateSearchBar: ['ctrl', 'f'],
          deactivateSearchBar: ['esc'],
          findPreviousOccurrence: ['shift', 'enter'],
          findPreviousOccurrenceAlt: ['shift', 'f3'],
          findNextOccurrence: ['enter'],
          findNextOccurrenceAlt: ['f3']
        }
      }
    },
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
    shortkeys () {
      return this.shortkeysByOs[getOS()] || this.shortkeysByOs.default
    }
  }
}
</script>

<template>
  <div class="document-local-search-input form-inline px-3" :class="{ 'document-local-search-input--active': isActive }">
    <div class="form-group py-2 mr-2">
      <label class="sr-only">{{ $t('document.search') }}</label>
      <div class="input-group">
        <input :value="searchTerm" @input="$emit('input', $event.target.value)" :placeholder="$t('document.find')" ref="search" class="form-control document-local-search-input__term" v-shortkey="shortkeys" @shortkey="shortkeyAction" />
        <div class="document-local-search-input__count input-group-append" v-if="this.searchTerm.length > 0">
          <span class="input-group-text">{{ searchIndex  }} {{ $t('document.of') }} {{ searchOccurrences }}</span>
        </div>
      </div>
    </div>
    <div class="form-group">
      <button class="document-local-search-input__previous btn btn-sm p-2" @click="previous" :disabled="searchOccurrences === 0 || this.searchTerm.length === 0">
        <fa icon="angle-up" />
      </button>
      <button class="document-local-search-input__next btn btn-sm p-2" @click="next" :disabled="searchOccurrences === 0 || this.searchTerm.length === 0">
        <fa icon="angle-down" />
      </button>
    </div>
  </div>
</template>

<style lang="scss">
  .document-local-search-input {
    justify-content: flex-end;
    white-space: nowrap;

    &.form-inline {
      white-space: nowrap;
      flex-wrap: nowrap;

      .input-group {
        width: 300px;

        .input-group-text {
          border-left: 0;
          background: $input-bg;
        }
      }
    }
  }
</style>
