<script>
import facets from '@/mixins/facets'
import ner from '@/mixins/ner'
import Facet from '@/components/Facet'

export default {
  name: 'FacetNamedEntity',
  components: { Facet },
  mixins: [facets, ner]
}
</script>

<template>
  <facet :facet="facet" class="facet--named-entity" ref="facet">
    <template slot="item" slot-scope="{ item }">
      <span v-for="category in item.byCategories.buckets" :key="category.key">
        <router-link :to="{ name: 'search', query: { q: item.key }}" class="px-3 row">
          <div class="col-3 facet__items__item__icon py-2" :class="getCategoryClass(category.key, 'text-')">
            <font-awesome-icon :icon="getCategoryIcon(category.key)" />
          </div>
          <div class="col-9 py-2">
            <div class="badge badge-pill badge-primary mr-1 text-uppercase facet__items__item__key text-white" :class="getCategoryClass(category.key, 'bg-')" :title="item.key" v-b-tooltip.hover>
              {{ item.key }}
            </div>
            <div class="text-secondary small facet__items__item__description">
              {{
                $t('aggregations.mentions.item', {
                  occurrences: $tc('aggregations.mentions.occurrence', category.doc_count, { count: category.doc_count }),
                  documents: $tc('aggregations.mentions.document', category.byDocs.value, { count: category.byDocs.value })
                })
              }}
            </div>
          </div>
        </router-link>
      </span>
    </template>
  </facet>
</template>

<style lang="scss">
  .facet--named-entity .facet__items__item {

    .facet__items__item__icon {
      font-size: 2em;
      position: relative;
      border-right: 1px dashed $card-border-color !important;

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .facet__items__item__key {
      white-space: nowrap;
      display: inline-block;
      overflow: hidden;
      max-width: 100%;
      text-overflow: ellipsis;
    }

    .facet__items__item__description {
      font-style: italic;
    }
  }
</style>
