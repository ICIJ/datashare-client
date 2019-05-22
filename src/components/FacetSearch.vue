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
    <div v-show="items.length" class="mt-4 facet-search__items card">
      <component class="border-0"
                 :is="facet.component"
                 :async-items="items"
                 @add-facet-values="onAddedFacetValues"
                 hide-search hide-header hide-show-more v-bind="{ facet }"></component>
    </div>
    <infinite-loading @infinite="next" :identifier="infiniteId" v-if="infiniteScroll">
      <span slot="no-more" class="text-muted"></span>
      <span slot="spinner"></span>
    </infinite-loading>
    <div v-show="!items.length" class="text-muted text-center p-2 mt-4">
      {{ $t('facet.noResults') }}
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import uniqueId from 'lodash/uniqueId'

import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'
import FacetPath from '@/components/FacetPath'
import { EventBus } from '@/utils/event-bus'
import facets from '@/mixins/facets'

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
    }
  },
  components: {
    FacetNamedEntity,
    FacetText,
    FacetPath,
    InfiniteLoading
  },
  data () {
    return {
      facetQuery: this.query || '',
      items: [],
      infiniteId: uniqueId()
    }
  },
  mounted () {
    this.startOver()
    EventBus.$on('facet::hide::named-entities', () => this.startOver())
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
      const options = { size: this.size, include: `.*(${this.queryTokens.join('|')}).*` }
      const data = await this.$store.dispatch('search/queryFacet', { name: this.facet.name, options: options })
      // Extract the slice we need for this page (if any)
      const all = get(data, this.resultPath, [])
      const slice = all.slice(this.items.length, this.items.length + this.pageSize)
      // Add the new items to the end of the items if needed
      this.items = this.items.concat(slice)
      // Did we reach the end?
      if ($state && all.length < this.size) $state.complete()
      // Mark this page as loaded
      if ($state) $state.loaded()
    },
    async startOver () {
      this.offset = 0
      this.items = []
      this.infiniteId = uniqueId()
      await this.search()
    },
    async next ($state) {
      this.offset += this.pageSize
      await this.search($state)
    },
    onAddedFacetValues (component) {
      EventBus.$emit('facet::search::add-facet-values', component)
    }
  },
  computed: {
    startOverWithThrottle () {
      return throttle(this.startOver, 600)
    }
  }
}
</script>
