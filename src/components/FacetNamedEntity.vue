<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template slot="title">
      {{ $t('facet.' + facet.name) }}
      <span class="col-2 facet__items__item__icon py-2" :class="getCategoryClass(facet.category, 'text-')">
        <font-awesome-icon :icon="getCategoryIcon(facet.category)" />
      </span>
    </template>
    <template slot="items" slot-scope="{ items, totalCount }">
      <b-form-checkbox v-model="isAllSelected" @click.native="resetNamedEntityValues" class="facet__items__all">
        <span v-html="getNamedEntityLabel({ key: $t('facet.all'), doc_count: totalCount, byDocs: { value: total } })"></span>
      </b-form-checkbox>
      <div v-for="item in items" :key="item.key" class="facet__items__item d-flex">
        <b-form-checkbox v-model="selected[item.key]" @change="toggleValue(item)" class="w-100">
          <span v-html="getNamedEntityLabel(item)"></span>
        </b-form-checkbox>
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
    </template>
  </facet>
</template>

<script>
import Facet from '@/components/Facet'
import facets from '@/mixins/facets'
import ner from '@/mixins/ner'
import { EventBus } from '@/utils/event-bus'
import DatashareClient from '@/api/DatashareClient'
import get from 'lodash/get'

const datashare = new DatashareClient()

export default {
  name: 'FacetNamedEntity',
  components: { Facet },
  mixins: [facets, ner],
  data () {
    return {
      selected: {}
    }
  },
  computed: {
    total () {
      return this.$store.state.search.response.total
    }
  },
  methods: {
    getNamedEntityLabel (item) {
      const label = this.facet.itemLabel ? this.facet.itemLabel(item) : item.key
      const count = get(item, 'doc_count', 0)
      const value = get(item, 'byDocs.value', 0)
      return '<div class="col-auto py-2 pl-2 facet__items__item__body">' +
        '<div class="badge badge-pill badge-light mr-1 text-uppercase facet__items__item__body__key">' +
        label +
        '</div>' +
        '<div class="text-muted small facet__items__item__description">' +
        this.$t('aggregations.mentions.item', {
          occurrences: this.$tc('aggregations.mentions.occurrence', count, { count: count }),
          documents: this.$tc('aggregations.mentions.document', value, { count: value })
        }) +
        '</div>' +
        '</div>'
    },
    resetNamedEntityValues (evt) {
      if (this.isAllSelected) {
        evt.preventDefault()
      } else {
        this.selected = {}
        this.$store.commit('search/resetFacetValues', this.facet.name)
        this.refreshRoute()
      }
    },
    deleteNamedEntitiesByMentionNorm (mentionNorm) {
      return datashare.deleteNamedEntitiesByMentionNorm(mentionNorm).then(() => {
        EventBus.$emit('facet::hide::named-entities')
      })
    }
  },
  mounted () {
    EventBus.$on('facet::hide::named-entities', () => this.$refs.facet.aggregate())
  }
}
</script>

<style lang="scss">
  .facet--named-entity .facet__items__item {

    &:hover .facet__items__item__menu {
      visibility: visible;
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
