<template>
  <form class="search-bar py-3 container-fluid" :id="uniqueId" @submit.prevent="submit">
    <div class="d-flex align-items-center">
      <div class="input-group">
        <input v-model="query" type="text" :placeholder="$t('search.placeholder')" class="form-control search-bar__input">
        <div class="input-group-append">
          <a v-if="!tips" class="search-bar__tips-addon input-group-text pl-1" :class="{ 'search-bar__tips-addon--active': showTips }" :href="operatorLinks" target="_blank" title="Tips to improve searching" v-b-tooltip>
            <fa icon="question-circle" />
          </a>
          <b-dropdown :text="$t('search.field.' + field)" variant="outline-light" class="search-bar__field" right>
            <b-dropdown-item v-for="key in fieldOptions" :key="key" @click="field = key">
              {{ $t('search.field.' + key) }}
            </b-dropdown-item>
          </b-dropdown>
          <button type="submit" class="btn btn-dark search-bar__submit">
            {{ $t('search.buttonlabel') }}
          </button>
        </div>
      </div>
      <div class="px-0 pl-2" v-if="settings">
        <search-settings placement="bottomleft" :container="uniqueId" />
      </div>
    </div>
    <slide-up-down :active="showTips" v-if="tips">
      <a class="search-bar__tips" :href="operatorLinks" target="_blank">
        <span>
          <span class="mr-1">
            <fa icon="book" class="mr-1" />
            Tips to improve searching
          </span>
          <span class="text-muted text-truncate">
            (AND, OR, ...)
          </span>
        </span>
      </a>
    </slide-up-down>
  </form>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import SearchSettings from './SearchSettings'
import settings from '@/utils/settings'

export default {
  name: 'SearchBar',
  props: {
    tips: {
      type: Boolean
    },
    settings: {
      type: Boolean
    },
    fieldOptions: {
      type: Array,
      default () {
        return settings.searchFields.map(field => field.key)
      }
    }
  },
  components: {
    SearchSettings
  },
  data () {
    return {
      showTips: false,
      query: this.$store.state.search.query,
      field: this.$store.state.search.field,
      operatorLinks: settings.documentationLinks.operators.default
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
      // Change the route after update the store with the new query
      this.$store.commit('search/field', this.field)
      this.$store.commit('search/query', this.query)
      this.$store.commit('search/from', 0)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQueryWithStamp'] })
      // And emit an event for those listening...
      this.$emit('submit', this.query)
    }
  },
  computed: {
    uniqueId () {
      return uniqueId('search-bar-')
    }
  },
  watch: {
    query () {
      this.showTips = this.query !== ''
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

    &__input.form-control {
      border-right: 0;

      &:focus ~ .input-group-append .search-bar__field .btn,
      &:focus ~ .input-group-append .search-bar__tips-addon {
        border-top-color: $input-focus-border-color;
        border-bottom-color: $input-focus-border-color;
      }

      &:focus  {
        box-shadow: none;
      }
    }

    &__field {
      border-left: dashed 1px  $input-border-color;

      .btn {
        color: $text-muted;
        border: 1px solid $input-border-color;
        border-left: 0;
        box-shadow: $input-box-shadow;
      }
    }

    &__tips-addon.input-group-text {
      color: $text-muted;
      border-left: 0;
      border-right: 0;
      box-shadow: $input-box-shadow;
      background: white;
      transition: $input-transition, color .15s ease-in-out;
      color: transparent;
    }

    &__tips-addon--active.input-group-text {
      color: $link-color;
    }

    &__field.show .btn.dropdown-toggle,
    &__field .btn.dropdown-toggle:hover,
    &__field .btn.dropdown-toggle:active {
      background: transparent;
      box-shadow: $input-box-shadow;
      border:1px solid $input-border-color;
      border-left: 0;
    }

    &__tips {
      display: block;
      padding: $spacer / 2 0 0;
      font-size: 0.9rem;
      z-index: 100;
      border-radius: 0 0 $input-border-radius $input-border-radius;
    }

    & .input-group > .input-group-append > &__submit.btn {
      border-top-right-radius: $input-border-radius;
      border-bottom-right-radius: $input-border-radius;
    }
  }
</style>
