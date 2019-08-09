<template>
  <span class="search-settings">
    <button type="button" class="btn btn-link text-dark" :class="{ ['btn-' + size]: true }" id="toggleSettings" :title="$t('search.settings.title')" v-b-tooltip.hover.bottomleft>
      <fa icon="cog" />
      <span class="sr-only">
        {{ $t('search.settings.title') }}
      </span>
    </button>
    <b-popover target="toggleSettings" triggers="click" :placement="placement" :container="container">
      <template #title>
        <fa icon="cog" />
        {{ $t('search.settings.title') }}
      </template>
      <div class="search-settings__popover">
        <div class="row py-2">
          <label class="col-8" for="input-page-size">
            {{ $t('search.settings.results_per_page') }}
          </label>
          <div class="col-4 text-right">
            <select v-model="selectedSize" @change="changeSize" class="custom-select custom-select-sm" id="input-page-size">
              <option v-for="size in sizes" :key="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>
        <div class="row py-2">
          <label class="col-8" for="input-sort">
            {{ $t('search.settings.sort_by') }}
          </label>
          <div class="col-4 text-right">
            <select v-model="selectedSort" @change="changeSort" class="custom-select custom-select-sm" id="input-sort">
              <option v-for="sort in sorts" :key="sort" :value="sort">
                {{ $t('search.results.sort.' + sort) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </b-popover>
  </span>
</template>

<script>
import bPopover from 'bootstrap-vue/es/components/popover/popover'

export default {
  name: 'SearchSettings',
  components: { bPopover },
  data () {
    return {
      sizes: [10, 25, 50, 100],
      selectedSize: this.$store.state.search.size,
      sorts: [
        'relevance',
        'dateNewest',
        'dateOldest',
        'creationDateNewest',
        'creationDateOldest',
        'sizeLargest',
        'sizeSmallest',
        'path',
        'pathReverse'
      ],
      selectedSort: this.$store.state.search.sort,
      // https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties
      container: ''
    }
  },
  props: {
    placement: {
      type: String,
      default: 'auto'
    },
    size: {
      type: String,
      default: 'lg'
    }
  },
  methods: {
    changeSize () {
      // Store new search size into store
      this.$store.commit('search/size', this.selectedSize)
      this.$root.$emit('bv::hide::popover')
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    },
    changeSort () {
      // Store new search size into store
      this.$store.commit('search/sort', this.selectedSort)
      this.$root.$emit('bv::hide::popover')
      // Change the route
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    }
  }
}
</script>

<style lang="scss">
  .search-settings {
    &__popover {
      width: 390px;
      max-width: 90vw;
    }
  }
</style>
