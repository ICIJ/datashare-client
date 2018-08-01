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
    <div class="card m-0 mt-4 facet-search__items" v-infinite-scroll="next" infinite-scroll-disabled="readTheEnd">
      <ul class="list-group">
        <li v-for="(item, index) in items" :key="index" class="list-group-item facet-search__items__item">
          <span class="badge badge-pill badge-light float-right facet-search__items__item__count">
            {{ item.doc_count || 0 }}
          </span>
          {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
        </li>
      </ul>
      <div v-if="items.length === 0" class="bg-light text-muted text-center p-2">
        No results
      </div>
    </div>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import uniq from 'lodash/uniq'
import infiniteScroll from 'vue-infinite-scroll'
import esClient from '@/api/esClient'

export default {
  name: 'FacetSearch',
  props: {
    facet: {
      type: Object
    },
    query: {
      type: String
    }
  },
  directives: {
    infiniteScroll
  },
  data () {
    return {
      asyncQuery: this.query,
      isReady: false,
      items: [],
      pageSize: 25,
      offset: 0,
      readTheEnd: false
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
      // Load the facet using a body build using the facet configuration
      return esClient.search({ index: process.env.VUE_APP_ES_INDEX, body: this.body }).then(data => {
        // Extract the slice we need for this page (if any)
        const all = get(data, this.resultPath, [])
        const slice = all.slice(this.offset, this.size)
        // Add the new items to the end of the items if needed
        this.items = startOver ? slice : this.items.concat(slice)
        this.isReady = true
        // Did we reach the end?
        this.readTheEnd = all.length < this.size
      })
    },
    escapeRegExp (str) {
      // eslint-disable-next-line no-useless-escape
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    },
    startOver () {
      this.isReady = false
      this.readTheEnd = false
      this.offset = 0
    },
    next () {
      this.offset += this.items.length
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
        include: `.*(${this.queryTokens.join('|')}).*`,
        order: {
          _key: 'asc'
        }
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
      overflow: auto;
    }
  }
</style>
