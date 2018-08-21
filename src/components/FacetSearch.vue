<template>
  <div class="facet-search">
    <form @submit.prevent class="facet-search__form input-group">
      <input type="search" class="form-control" id="input-facet-search" v-model="asyncQuery" />
      <label class="input-group-append m-0" for="input-facet-search">
        <span class="input-group-text">
          <font-awesome-icon icon="search" />
        </span>
      </label>
    </form>
    <div v-show="items.length" class="mt-4 facet-search__items card" v-infinite-scroll="next" infinite-scroll-disabled="reachTheEnd">
      <component class="border-0" :is="facet.type" :async-items="items" hide-search hide-header hide-show-more v-bind="{ facet }"></component>
    </div>
    <div v-show="!items.length" class="text-muted text-center p-2 mt-4">
      No results
    </div>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import uniq from 'lodash/uniq'
import infiniteScroll from 'vue-infinite-scroll'
import PQueue from 'p-queue'

import esClient from '@/api/esClient'

import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'
import FacetPath from '@/components/FacetPath'

export default {
  name: 'FacetSearch',
  mixins: [],
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
      asyncQuery: this.query,
      isReady: false,
      items: [],
      pageSize: 25,
      offset: 0,
      reachTheEnd: false,
      queue: new PQueue({concurrency: 1})
    }
  },
  mounted () {
    this.search()
  },
  watch: {
    asyncQuery () {
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
        return esClient.search({ index: process.env.VUE_APP_ES_INDEX, body: this.body }).then(data => {
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
    escapeRegExp (str) {
      // eslint-disable-next-line no-useless-escape
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
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
    resultPath () {
      return `aggregations.${this.facet.key}.buckets`
    },
    size () {
      return this.offset + this.pageSize
    },
    queryTokens () {
      return uniq([
        // Regular query
        this.asyncQuery,
        // Uppercase and lowercase versions
        this.asyncQuery.toLowerCase(),
        this.asyncQuery.toUpperCase(),
        // Capitalize (first letter in Uppercase)
        this.asyncQuery.charAt(0).toUpperCase() + this.asyncQuery.slice(1)
      // And escape the string for use in REGEX
      ].map(this.escapeRegExp))
    },
    body () {
      return this.facet.body(bodybuilder().size(0), {
        size: this.size,
        include: `.*(${this.queryTokens.join('|')}).*`
      }).build()
    },
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
