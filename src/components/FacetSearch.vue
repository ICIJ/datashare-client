<template>
  <div class="facet-search" v-if="facet">
    <form @submit.prevent class="facet-search__form input-group">
      <input type="search" class="form-control" id="input-facet-search" v-model="facetQuery" />
      <label class="input-group-append m-0" for="input-facet-search">
        <span class="input-group-text">
          <fa icon="search" />
        </span>
      </label>
    </form>
    <div v-show="items.length" class="mt-4 facet-search__items card" :key="infiniteId">
      <component class="border-0"
                 :is="facet.component"
                 :async-items="items"
                 :async-total-count="totalCount"
                 @add-facet-values="onAddedFacetValues"
                 hide-search
                 hide-header
                 hide-show-more
                 v-bind="{ facet }"></component>
    </div>
    <infinite-loading @infinite="next" :identifier="infiniteId" v-if="infiniteScroll" spinner="bubbles">
      <template #no-more>
        <span class="text-muted"></span>
      </template>
    </infinite-loading>
    <div v-show="!items.length && isReady" class="text-muted text-center p-2 mt-4">
      {{ $t('facet.noResults') }}
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import FacetText from '@/components/FacetText'
import FacetYesNo from '@/components/FacetYesNo'
import FacetDate from '@/components/FacetDate'
import FacetPath from '@/components/FacetPath'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import facets from '@/mixins/facets'
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import get from 'lodash/get'
import sumBy from 'lodash/sumBy'
import throttle from 'lodash/throttle'
import toLower from 'lodash/toLower'
import uniqueId from 'lodash/uniqueId'

export default {
  name: 'FacetSearch',
  mixins: [facets],
  props: {
    facet: {
      type: Object
    },
    query: {
      type: String,
      default: ''
    },
    selectable: {
      type: Boolean,
      default: true
    },
    infiniteScroll: {
      type: Boolean,
      default: true
    },
    throttle: {
      type: Number,
      default: 600
    }
  },
  components: {
    FacetText,
    FacetYesNo,
    FacetDate,
    FacetPath,
    FacetNamedEntity,
    InfiniteLoading
  },
  data () {
    return {
      facetQuery: this.query || '',
      items: [],
      infiniteId: uniqueId(),
      totalCount: 0,
      isReady: false
    }
  },
  mounted () {
    this.startOver()
    this.$root.$on('facet::hide::named-entities', () => this.startOver())
  },
  watch: {
    facetQuery () {
      this.startOverWithThrottle()
    },
    facet () {
      this.startOver()
    }
  },
  methods: {
    async search ($state) {
      if (!this.facet) return
      // Load the facet using a body build using the facet configuration
      const alternativeSearch = this.facetQuery !== '' && this.facet.alternativeSearch ? compact(this.facet.alternativeSearch(toLower(this.facetQuery))) : []
      const options = { size: this.size, include: `.*(${concat(alternativeSearch, this.queryTokens).join('|')}).*` }
      const data = await this.$store.dispatch('search/queryFacet', { name: this.facet.name, options })
      const all = get(data, this.resultPath, [])
      this.$set(this, 'items', all)
      this.$set(this, 'totalCount', sumBy(all, 'doc_count'))
      // Did we reach the end?
      if ($state && all.length < this.size) {
        $state.complete()
        this.isReady = true
      }
      // Mark this page as loaded
      if ($state) $state.loaded()
    },
    startOver () {
      this.$set(this, 'offset', 0)
      this.$set(this, 'items', [])
      this.$set(this, 'infiniteId', uniqueId())
      return this.search()
    },
    next ($state) {
      this.offset += this.pageSize
      return this.search($state)
    },
    onAddedFacetValues (component) {
      this.$root.$emit('facet::search::add-facet-values', component)
    }
  },
  computed: {
    startOverWithThrottle () {
      return this.throttle > 0 ? throttle(this.startOver, this.throttle) : this.startOver
    }
  }
}
</script>
