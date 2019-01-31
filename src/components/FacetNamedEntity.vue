<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template slot="item" slot-scope="{ item }">
      <span v-for="category in getCategories(item)" :key="category.key">
        <div class="row no-gutters">
          <div class="col-2 facet__items__item__icon py-2" :class="getCategoryClass(category.key, 'text-')">
            <font-awesome-icon :icon="getCategoryIcon(category.key)" />
          </div>
          <a class="col-auto py-2 pl-2 facet__items__item__body" href @click.prevent="toggleValue(item)">
            <div class="badge badge-pill badge-light mr-1 text-uppercase facet__items__item__body__key text-white" :class="getCategoryClass(category.key, 'bg-')" :title="capitalize(item.key)" v-b-tooltip.hover>
              {{ item.key }}
            </div>
            <div class="text-muted small facet__items__item__description">
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

<script>
import { capitalize } from '@/utils/strings'
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import ner from '@/mixins/ner'
import { EventBus } from '@/utils/event-bus.js'

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
  },
  mounted () {
    EventBus.$on('facet::hide::named-entities', () => this.$refs.facet.aggregate(250))
  }
}
</script>

<style lang="scss">
  .facet--named-entity .facet__items__category {
    font-weight: 800;
  }

  .facet--named-entity .facet__items__item {

    .row {
      flex-wrap: nowrap;
      align-items: stretch;
      align-content: stretch;
      width: 100%;
    }

    & > span:hover .facet__items__item__menu {
      visibility: visible;
    }

    &__icon {
      flex-basis: 4rem;
      flex-grow: 0;
      font-size: 2em;
      margin-bottom: 0.3em;
      border-right: 1px dashed $card-border-color !important;

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    &__body {
      flex-grow: 1;
      flex-basis: 50%;
      min-width: 0;

      &__key {
        display: inline-block;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
      }
    }

    &__description {
      font-style: italic;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__menu {
      flex-basis: 2.5em;
      flex-grow: 0;
      visibility: hidden;

      .btn-group > .btn {
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
