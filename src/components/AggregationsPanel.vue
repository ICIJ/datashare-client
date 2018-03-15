<template>
  <div class="aggregations-panel card card-default">
    <div class="card-header">
      In the documents
    </div>
    <form class="card-body py-2">
      <div class="input-group">
        <input class="form-control form-control-sm" type="search" placeholder="Search for people, companies, etc" />
        <div class="input-group-append">
          <button type="submit" class="btn btn-icij">
            <font-awesome-icon icon="search" />
            <span class="sr-only">{{ $t('search.buttonlabel') }}</span>
          </button>
        </div>
      </div>
    </form>
    <div class="list-group list-group-flush aggregations-panel__mentions">
      <router-link class="list-group-item aggregations-panel__mentions__item" v-for="item in mentions.buckets" :key="item.key" :to="{ name: 'search', query: { query: item.key }}" >
        <span class="badge badge-pill badge-primary mr-1 text-uppercase aggregations-panel__mentions__item__key">
          {{ item.key }}
        </span>
        <span class="text-secondary small aggregations-panel__mentions__item__description">
          {{
            $t('aggregations.mentions.item', {
              occurrences: $tc('aggregations.mentions.occurrence', item.doc_count, { count: item.doc_count }),
              documents: $tc('aggregations.mentions.document', item.docs.value, { count: item.docs.value })
            })
          }}
        </span>
      </router-link>
    </div>
    <div class="card-footer">
      <router-link class="btn btn-primary btn-block" to="/">
        Explore more
      </router-link>
    </div>
  </div>
</template>

<script>
import client from '@/api/client'
import Response from '@/api/Response'
// Vendors
import bodybuilder from 'bodybuilder'

export default {
  name: 'AggregationsPanel',
  data () {
    return {
      response: null
    }
  },
  created () {
    this.aggregate()
  },
  computed: {
    mentions () {
      return this.loaded ? this.response.aggregations.mentions : {}
    },
    loaded () {
      return !!this.response
    }
  },
  methods: {
    aggregate: function () {
      return client.search({
        index: process.env.CONFIG.es_index,
        type: 'doc',
        size: 0,
        body: bodybuilder()
          .query('term', 'type', 'NamedEntity')
          .aggregation('terms', 'mentionNorm', 'mentions', {'size': 15, order: [{docs: 'desc'}, {_count: 'desc'}]}, sub => {
            return sub.aggregation('cardinality', 'join#Document', 'docs')
          })
          .build()
      }).then(raw => {
        this.response = new Response(raw)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .aggregations-panel {
    &__mentions {
      max-height: 15rem;
      overflow: auto;
    }
  }
</style>
