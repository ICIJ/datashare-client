<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template #title>
      <span class="col-2 facet__items__item__icon pl-2 pr-0" :class="getCategoryClass(facet.category, 'text-')">
        <fa :icon="getCategoryIcon(facet.category)" />
      </span>
      {{ $t('facet.' + facet.name) }}
    </template>
    <template #items="{ items }">
      <b-form-checkbox v-model="isAllSelected" @click.native="resetNamedEntityValues" class="facet__items__all">
        <div class="py-1 facet__items__item__body">
           <div class="facet__items__item__body__key facet__items__item__body__key--all text-uppercase d-inline badge badge-light">
             {{ $t('facet.all') }}
           </div>
         </div>
      </b-form-checkbox>
      <div v-for="item in items" :key="item.key" class="facet__items__item d-flex">
        <b-form-checkbox v-model="selected" @change="toggleValue(item)" class="facet__items__item__checkbox w-100 mt-0 mr-0" :value="item.key">
          <div class="py-1 facet__items__item__body">
            <div class="text-uppercase d-inline facet__items__item__body__key text-truncate badge badge-light"  :class="getCategoryClass(facet.category, 'border-')">
              {{ facet.itemLabel ? facet.itemLabel(item) : item.key }}
            </div>
            <div class="facet__items__item__body__count badge text-light ml-0" :class="getCategoryClass(facet.category, 'bg-')" v-b-tooltip :title="itemTitle(item)">
              {{ $n(item.doc_count || 0) }} | {{ item.byDocs ? $n(item.byDocs.value || 0) : 0 }}
            </div>
          </div>
        </b-form-checkbox>
        <div class="facet__items__item__menu" v-if="!isServer">
          <b-dropdown class="h-100" no-caret dropright offset="25">
            <template #button-content class="px-1">
              <fa icon="ellipsis-v" />
            </template>
            <b-dropdown-item @click="deleteNamedEntitiesByMentionNorm(item.key)">
              <fa icon="trash-alt" />
              {{ $t('facet.deleteNamedEntity') }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </template>
  </facet>
</template>

<script>
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'
import DatashareClient from '@/api/DatashareClient'
import get from 'lodash/get'

const datashare = new DatashareClient()

export default {
  name: 'FacetNamedEntity',
  components: { Facet },
  mixins: [facets, ner, utils],
  computed: {
    total () {
      return this.$store.state.search.response.total
    }
  },
  methods: {
    resetNamedEntityValues (evt) {
      if (evt && this.isAllSelected) {
        evt.preventDefault()
      } else {
        this.$store.commit('search/resetFacetValues', this.facet.name)
        this.selected = {}
        this.isAllSelected = true
        this.refreshRoute()
      }
    },
    deleteNamedEntitiesByMentionNorm (mentionNorm) {
      return datashare.deleteNamedEntitiesByMentionNorm(mentionNorm).then(() => {
        this.$root.$emit('facet::hide::named-entities')
      })
    },
    itemTitle (item) {
      const occurrencesCount = item.doc_count || 0
      const documentsCount = get(item, 'byDocs.value', 0)
      return this.$t('aggregations.mentions.item', {
        occurrences: this.$tc('aggregations.mentions.occurrence', occurrencesCount, { count: occurrencesCount }),
        documents: this.$tc('aggregations.mentions.document', documentsCount, { count: documentsCount })
      })
    }
  },
  mounted () {
    this.$root.$on('facet::hide::named-entities', () => this.$refs.facet ? this.$refs.facet.aggregate() : null)
  }
}
</script>

<style lang="scss">
  .facet--named-entity {

    label.custom-control-label::before, label.custom-control-label::after {
      top: 50%;
      transform: translateY(-50%);
    }

    .facet__items__item {

      &:hover .facet__items__item__menu {
        visibility: visible;
      }

      &__checkbox {
        max-width: calc(100% - 3rem)
      }

      &__body {
        flex-grow: 1;
        min-width: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;

        &__key {
          display: inline-block;
          overflow: hidden;
          max-width: 100%;
          min-width: 0;
          margin-right: 0;
          float: left;
          border-radius: 0.5em 0 0 0.5em;
          border: 1px solid transparent;

          &--all {
            border-radius: 0.5em;
            border: 1px solid transparent;
          }
        }

        &__count {
          border: 1px solid transparent;
          border-radius: 0 0.5em 0.5em 0;
        }
      }

      &__menu {
        flex-basis: 2.5em;
        flex-grow: 0;
        visibility: hidden;
        position: relative;

        .btn-group {
          position: absolute;
          right: 0;
          top: 0;
        }

        .btn-group > .btn {
          background-color: transparent;
          border: none;
          color: grey;
          padding: 0.2rem;
          border-radius: 50% !important;
          text-align: center;
          font-size: 0.8rem;
          width: 1.5rem;
          height: 1.5rem;
          line-height: 1;

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

      input:checked + label {
        .facet__items__item__body__key, .facet__items__item__description {
          font-weight: bold;
        }
      }
    }

    &.facet--reversed {
      input:checked + label {
        .facet__items__item__body__key, .facet__items__item__description {
          text-decoration: line-through;
        }
      }
    }
  }

</style>
