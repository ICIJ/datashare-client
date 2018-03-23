<script>
import Response from '@/api/Response'

export default {
  name: 'FacetNamedEntity',
  props: ['facet'],
  data () {
    return {
      response: Response.none()
    }
  },
  created () {
    this.aggregate()
  },
  computed: {
    mentions () {
      return this.response.get('aggregations.mentions', {})
    }
  },
  methods: {
    aggregate () {
      if (this.facet) {
        return this.$store.dispatch('aggregation/query', this.facet).then(r => {
          this.response = r
        })
      }
    }
  }
}
</script>

<template>
  <div class="facet-named-entity card card-default">
    <div class="card-header">
      {{ $t('aggregations.inthedocs') }}
    </div>
    <form class="card-body py-2">
      <div class="input-group">
        <input class="form-control form-control-sm" type="search" :placeholder="$t('aggregations.placeholder')" />
        <div class="input-group-append">
          <button type="submit" class="btn btn-icij">
            <font-awesome-icon icon="search" />
            <span class="sr-only">{{ $t('search.buttonlabel') }}</span>
          </button>
        </div>
      </div>
    </form>
    <div class="list-group list-group-flush facet-named-entity__mentions">
      <router-link class="list-group-item facet-named-entity__mentions__item" v-for="item in mentions.buckets" :key="item.key" :to="{ name: 'search', query: { q: item.key }}" >
        <span class="badge badge-pill badge-primary mr-1 text-uppercase facet-named-entity__mentions__item__key">
          {{ item.key }}
        </span>
        <span class="text-secondary small facet-named-entity__mentions__item__description">
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
        {{ $t('aggregations.more') }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .facet-named-entity {
    &__mentions {
      max-height: 15rem;
      overflow: auto;
    }
  }
</style>
