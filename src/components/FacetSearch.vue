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
    <div v-show="items.length" class="card m-0 mt-4 facet-search__items" v-infinite-scroll="next" infinite-scroll-disabled="reachTheEnd">
      <ul class="list-group">
        <li v-for="(item, index) in items" :key="index" class="list-group-item facet-search__items__item p-0" :class="{ 'facet-search__items__item--active': hasValue(item) }">
          <a v-if="selectable" href @click.prevent="toggleValue(item)" class="p-3 d-block">
            <span class="badge badge-pill badge-light float-right facet-search__items__item__count">
              {{ item.doc_count || 0 }}
            </span>
            {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
          </a>
          <span v-else class="p-3 d-block">
            <span class="badge badge-pill badge-light float-right facet-search__items__item__count">
              {{ item.doc_count || 0 }}
            </span>
            {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
          </span>
        </li>
      </ul>
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

export default {
  name: 'FacetSearch',
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
    addValue (item) {
      this.$store.commit('search/addFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    removeValue (item) {
      this.$store.commit('search/removeFacetValue', this.facet.itemParam(item))
      this.refreshRoute()
    },
    toggleValue (item) {
      this.hasValue(item) ? this.removeValue(item) : this.addValue(item)
    },
    hasValue (item) {
      return this.$store.getters['search/hasFacetValue'](this.facet.itemParam(item))
    },
    refreshRoute () {
      this.$router.push({
        name: 'search',
        query: this.$store.getters['search/toRouteQuery']
      })
    },
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
      overflow: auto;

      &__item {
        position: relative;

        &--active {

          &:before {
            content: "";
            background: theme-color('primary');
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 3px;
            box-shadow: 0 0 10px 0 theme-color('primary');
          }

          .facet-text--reversed & {
            text-decoration: line-through;

            &:before {
              background: $body-color;
              box-shadow: 0 0 10px 0 $body-color;
            }
          }
        }
      }
    }
  }
</style>
