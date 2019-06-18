<template>
  <form class="search-bar form-row align-items-center container-fluid py-3" :id="uniqueId" @submit.prevent="submit">
    <div class="input-group col">
      <input v-model="query" type="search" :placeholder="$t('search.placeholder')" class="form-control search-bar__input">
      <div class="input-group-append">
        <button type="submit" class="btn btn-dark search-bar__submit">
          {{ $t('search.buttonlabel') }}
        </button>
      </div>
      <a class="search-bar__typeahead" href="https://icij.gitbook.io/datashare/all/search-with-operators" target="_blank">
        <span class="d-flex justify-content-between">
          <span>
            <fa icon="book" class="mr-1" />
            Tips to improve searching
          </span>
          <span class="text-muted">
            (AND, OR, ...)
          </span>
        </span>
      </a>
    </div>
    <div class="col-auto px-0 pl-2" v-if="!hideSettings">
      <search-settings placement="bottomleft" :container="uniqueId" />
    </div>
  </form>
</template>

<script>
import SearchSettings from './SearchSettings'
import uniqueId from 'lodash/uniqueId'

export default {
  name: 'SearchBar',
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
      query: this.$store.state.search.query
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
    }
  }
}
</script>

<style lang="scss">
  .search-bar {
    &__input ~ &__typeahead {
      position: absolute;
      top: 100%;
      left: 5px;
      right: 5px;
      background: mix($input-border-color, white);
      border: 1px solid $input-border-color;
      border-top: 0;
      padding: $spacer / 2 $spacer;
      font-size: 0.9rem;
      display: none;
      z-index: 100;
      border-radius: 0 0 $input-border-radius $input-border-radius;
    }

    & &__input:focus, .input-group:hover &__input  {
      border-radius: $input-border-radius 0 0 0;
      box-shadow: none;

      & ~ .search-bar__typeahead {
        display: block;
      }

      & ~ .input-group-append .search-bar__submit {
        border-bottom-right-radius: 0 !important;
      }
    }

    & .input-group > .input-group-append > &__submit.btn {
      border-top-right-radius: $input-border-radius;
      border-bottom-right-radius: $input-border-radius;
    }
  }
</style>
