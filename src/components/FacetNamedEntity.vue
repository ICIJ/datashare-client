<script>
import { capitalize } from '@/utils/strings'
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import ner from '@/mixins/ner'

export default {
  name: 'FacetNamedEntity',
  components: { Facet },
  mixins: [facets, ner],
  methods: {
    getCategories (item) {
      if (item.byCategories) {
        return item.byCategories.buckets
      }
      return [
        {
          key: 'ban',
          doc_count: 0,
          byDocs: { value: 0 }
        }
      ]
    },
    capitalize: capitalize
  }
}
</script>

<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template slot="item" slot-scope="{ item }">
      <span v-for="category in getCategories(item)" :key="category.key">
        <div class="row no-gutters">
          <div class="col-2 facet__items__item__icon py-2" :class="getCategoryClass(category.key, 'text-')">
            <font-awesome-icon :icon="getCategoryIcon(category.key)" />
          </div>
          <a class="col py-2 pl-2" href @click.prevent="toggleValue(item)">
            <div class="badge badge-pill badge-light mr-1 text-uppercase facet__items__item__key text-white" :class="getCategoryClass(category.key, 'bg-')" :title="capitalize(item.key)" v-b-tooltip.hover>
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
          </a>
          <div class="col facet__items__item__menu">
            <b-dropdown class="h-100 my-2" no-caret dropright offset="25">
              <template slot="button-content" class="px-1">
                <font-awesome-icon icon="ellipsis-v" />
              </template>
              <b-dropdown-item @click="deleteNamedEntitiesByMentionNorm(item.key)">
                <font-awesome-icon icon="trash-alt" />
                 {{ $t('facet.deleteNamedEntity') }}
               </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </span>
    </template>
  </facet>
</template>

<style lang="scss">
  .facet--named-entity .facet__items__category {
    font-weight: 800;
  }

  .facet--named-entity .facet__items__item {

    .row {
      flex-wrap: nowrap;
    }

    &__icon {
      max-width: 4rem;
      font-size: 2em;
      margin-bottom: 0.3em;
    }

    &__key {
      display: inline-block;
      overflow: hidden;
      max-width: 100%;
      text-overflow: ellipsis;
    }

    &__description {
      font-style: italic;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__menu {
      max-width: 2.5em;

      .btn-group > .btn {
        display: none;
        background-color: transparent;
        border: none;
        color: grey;
        padding: 0;
        height: 2em;
        line-height: 2em;
        width: 2em;
        border-radius: 50% !important;
        text-align: center;

        &:focus, &:focus:active, &:active {
          background-color: theme-color('light');
          border: none;
          color: grey;
          padding: 0.3em;
        }
      }

      .dropdown-menu {
        margin-top: -2em;
      }
    }
  }

</style>
