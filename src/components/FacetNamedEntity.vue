<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template #title>
      <span class="col-2 facet__items__item__icon pl-0 pr-1" :class="getCategoryClass(facet.category, 'text-')">
        <fa :icon="getCategoryIcon(facet.category)" />
      </span>
      {{ $t('facet.' + facet.name) }}
    </template>
    <template #item="{ item, value, label }">
      <div class="d-flex facet__items__item">
        <b-form-checkbox :value="value" class="flex-grow-1">
          <span class="d-flex">
            <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
              {{ label }}
            </span>
            <span class="facet__items__item__count badge badge-pill badge-light float-right mt-1">
              {{ $n(item.byDocs.value) }}
            </span>
          </span>
        </b-form-checkbox>
        <confirm-button v-if="$config.is('manageDocuments')" :confirmed="() => deleteNamedEntitiesByMentionNorm(value)" class="align-self-center btn btn-link btn-sm text-white p-0 mr-2 mt-2 facet__items__item__delete" v-b-tooltip :title="$t('facet.deleteNamedEntity')">
          <fa icon="trash-alt" />
        </confirm-button>
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
    async deleteNamedEntitiesByMentionNorm (mentionNorm) {
      await datashare.deleteNamedEntitiesByMentionNorm(mentionNorm)
      this.$root.$emit('facet::hide::named-entities')
      if (this.$refs.facet) {
        this.$refs.facet.aggregate()
      }
    }
  }
}
</script>

<style lang="scss">
  .facet--named-entity {

    .facet__items__item {

      &__delete:not([aria-describedby]) {
        display: none;
      }

      &:hover .facet__items__item__delete {
        display: block;
      }

      &:hover .facet__items__item__count {
        display: none;
      }
    }
  }

</style>
