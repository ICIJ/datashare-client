<script>
import facets from '@/mixins/facets'
import ner from '@/mixins/ner'
import Facet from '@/components/Facet'

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
    }
  }
}
</script>

<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template slot="item" slot-scope="{ item }">
      <span v-for="category in getCategories(item)" :key="category.key">
        <div class="px-3 row">
          <div class="col-3 facet__items__item__icon py-2" :class="getCategoryClass(category.key, 'text-')">
            <font-awesome-icon :icon="getCategoryIcon(category.key)" />
          </div>
          <a class="col-8 py-2" href @click.prevent="toggleValue(item)">
            <div class="badge badge-pill badge-light mr-1 text-uppercase facet__items__item__key text-white" :class="getCategoryClass(category.key, 'bg-')" :title="item.key" v-b-tooltip.hover>
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
          <div class="col-1 px-1 facet__items__item__menu">
            <b-dropdown id="ddown1" class="h-100" no-caret btn-group dropright offset="25">
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
  .facet--named-entity .facet__items__item {

    .facet__items__item__icon {
      max-width: 4rem;
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
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .facet__items__item__menu {
      button {
        background-color: transparent;
        border: none;
        color: grey;
        padding: 10px;

        &:focus {
          box-shadow: none;
        }
        &:active {
          background-color: transparent;
          border: none;
          box-shadow: none;
          color: grey;
        }
        &:focus:active {
          box-shadow: none;
        }
      }

      .dropdown-menu {
        margin-top: -200%;
      }
    }
  }
</style>
