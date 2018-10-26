<template>
  <div class="facet-search">
    <form @submit.prevent class="facet-search__form input-group">
      <input type="search" class="form-control" id="input-facet-search" v-model="facetQuery" />
      <label class="input-group-append m-0" for="input-facet-search">
        <span class="input-group-text">
          <font-awesome-icon icon="search" />
        </span>
      </label>
    </form>
    <div v-show="items.length" class="mt-4 facet-search__items card" v-infinite-scroll="next" infinite-scroll-disabled="reachTheEnd">
      <component class="border-0" :is="facet.constructor.name" :async-items="items" hide-search hide-header hide-show-more v-bind="{ facet }"></component>
    </div>
    <div v-show="!items.length" class="text-muted text-center p-2 mt-4">
      No results
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import infiniteScroll from 'vue-infinite-scroll'
import PQueue from 'p-queue'

import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'
import FacetPath from '@/components/FacetPath'
import { EventBus } from '@/utils/event-bus.js'
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
    }
  },
  directives: {
    infiniteScroll
  },
  components: {
    FacetNamedEntity,
    FacetText,
    FacetPath
  },
  data () {
    return {
      facetQuery: this.query,
      isReady: false,
      items: [],
      reachTheEnd: false,
      queue: new PQueue({concurrency: 1})
    }
  },
  mounted () {
    this.search()
    EventBus.$on('facet::hide::named-entities', () => this.search())
  },
  watch: {
    facetQuery () {
      this.searchWithThrottle()
    }
  },
  methods: {
    search (startOver = true) {
      // Start the search over
      if (startOver) this.startOver()
      // We queue the promises to ensure they are executed in the right order
      return this.queue.add(() => {
        // Load the facet using a body build using the facet configuration
        let options = {size: this.size, include: `.*(${this.queryTokens.join('|')}).*`}
        return this.$store.dispatch('search/queryFacet', {name: this.facet.name, options: options}).then(data => {
          // Extract the slice we need for this page (if any)
          const all = get(data, this.resultPath, [])
          const slice = all.slice(this.items.length, this.items.length + this.pageSize)
          // Add the new items to the end of the items if needed
          this.items = startOver ? all : this.items.concat(slice)
          // Did we reach the end?
          this.reachTheEnd = all.length < this.size
          // Ready when this is the last promise in the queue
          this.isReady = this.queue.pending === 1
        })
      })
    },
    startOver () {
      this.isReady = false
      this.reachTheEnd = false
      this.offset = 0
    },
    next () {
      this.offset += this.pageSize
      return this.search(false)
    }
  },
  computed: {
    searchWithThrottle () {
      return throttle(this.search, 400)
    }
  }
}
</script>

<style lang="scss">
  .facet-search {
    &__items {
      max-height: 50vh;
      overflow: hidden auto;
    }
  }
</style>
