<template>
  <form class="search-bar d-flex align-items-center container-fluid py-3" :id="uniqueId" @submit.prevent="submit">
    <div class="input-group">
      <input v-model="query" type="text" :placeholder="$t('search.placeholder')" class="form-control search-bar__input">
      <div class="input-group-append">
        <b-dropdown :text="$t('search.field.' + field)" variant="outline-light" class="search-bar__field" right v-if="hasFeature('SEARCH_FIELD')">
          <b-dropdown-item v-for="key in fieldOptions" :key="key" @click="field = key">
            {{ $t('search.field.' + key) }}
          </b-dropdown-item>
        </b-dropdown>
        <button type="submit" class="btn btn-dark search-bar__submit">
          {{ $t('search.buttonlabel') }}
        </button>
      </div>
      <a class="search-bar__typeahead" href="https://icij.gitbook.io/datashare/all/search-with-operators" target="_blank">
        <span class="d-flex justify-content-between">
          <span class="mr-1">
            <fa icon="book" class="mr-1" />
            Tips to improve searching
          </span>
          <span class="text-muted text-truncate">
            (AND, OR, ...)
          </span>
        </span>
      </a>
    </div>
    <div class="px-0 pl-2" v-if="!hideSettings">
      <search-settings placement="bottomleft" :container="uniqueId" />
    </div>
  </form>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import SearchSettings from './SearchSettings'
import features from '@/mixins/features'

export default {
  name: 'SearchBar',
  mixins: [ features ],
  props: {
    hideSettings: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SearchSettings
  },
  data () {
    return {
      query: this.$store.state.search.query,
      fieldOptions: [
        'all',
        'title',
        'author',
        'recipients',
        'content',
        'path',
        'thread_id'
      ]
    }
  },
  mounted () {
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'search/query') {
        this.query = mutation.payload
      }
    })
  },
  methods: {
    submit () {
      this.index = (this.index === '' ? this.$config.get('userIndices', [])[0] : this.index)
      // Did the route change? If not, do nothing
      if (this.$route.name === 'search' && this.$route.query.q === this.query) return false
      // Change the route after update the store with the new query
      this.$store.commit('search/query', this.query)
      this.$store.commit('search/from', 0)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
      // And emit an event for those listening...
      this.$emit('submit', this.query)
    }
  },
  computed: {
    uniqueId () {
      return uniqueId('search-bar-')
    },
    field: {
      get () {
        return this.$store.state.search.field
      },
      set (field) {
        this.$store.commit('search/field', field)
      }
    }
  }
}
</script>

<style lang="scss">
  .search-bar {

    .input-group {
      white-space: nowrap;
      flex-wrap: nowrap;
    }

    &__field {

      .btn {
        color: $text-muted;
        border: 1px solid $input-border-color;
        border-left: 0;
        box-shadow: $input-box-shadow;

      }
    }

    &__field.show .btn.dropdown-toggle,
    &__field .btn.dropdown-toggle:hover,
    &__field .btn.dropdown-toggle:active {
      background: transparent;
      box-shadow: $input-box-shadow;
      border:1px solid $input-border-color;
      border-left: 0;
    }

    &__input.form-control {
      border-right-style: dashed;

      &:focus  ~ .input-group-append .search-bar__field .btn {
        border-color: $input-focus-border-color;
      }

      &:focus, .input-group:hover &  {
        border-radius: $input-border-radius 0 0 0;
        box-shadow: none;
        border-right-color: $input-border-color;

        & ~ .search-bar__typeahead {
          display: block;
        }

        & ~ .input-group-append .search-bar__submit {
          border-bottom-right-radius: 0 !important;
        }
      }
    }

    &__typeahead {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: mix($input-border-color, white, 30%);
      border: 1px solid $input-border-color;
      border-top: 0;
      padding: $spacer / 2 $spacer;
      font-size: 0.9rem;
      display: none;
      z-index: 100;
      border-radius: 0 0 $input-border-radius $input-border-radius;
    }

    & .input-group > .input-group-append > &__submit.btn {
      border-top-right-radius: $input-border-radius;
      border-bottom-right-radius: $input-border-radius;
    }
  }
</style>
