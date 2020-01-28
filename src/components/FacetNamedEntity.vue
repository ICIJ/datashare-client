<template>
  <facet v-bind="$props" class="facet--named-entity" ref="facet">
    <template #title>
      <span class="col-2 facet__items__item__icon pl-0 pr-1" :class="getCategoryClass(facet.category, 'text-')">
        <fa :icon="getCategoryIcon(facet.category)" fixed-width />
      </span>
      {{ $t('facet.' + facet.name) }}
    </template>
    <template #item="{ item, value, label }">
      <div class="d-flex facet__items__item">
        <b-form-checkbox :value="value" class="flex-grow-1 w-100">
          <span class="d-flex">
            <span class="facet__items__item__label px-1 flex-grow-1">
              {{ label }}
            </span>
            <span class="facet__items__item__count badge badge-pill badge-light align-self-start">
              {{ $n(item.byDocs.value) }}
            </span>
          </span>
        </b-form-checkbox>
        <confirm-button v-if="$config.is('manageDocuments')" :confirmed="() => deleteNamedEntitiesByMentionNorm(value)" class="align-self-start btn btn-link btn-sm p-0 mr-2 mt-1 facet__items__item__delete" v-b-tooltip :title="$t('facet.deleteNamedEntity')">
          <fa icon="trash-alt" />
        </confirm-button>
      </div>
    </template>
  </facet>
</template>

<script>
import Api from '@/api'
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'

const datashare = new Api()

export default {
  name: 'FacetNamedEntity',
  components: { Facet },
  mixins: [facets, ner, utils],
  methods: {
    async deleteNamedEntitiesByMentionNorm (mentionNorm) {
      await datashare.deleteNamedEntitiesByMentionNorm(this.$store.state.search.index, mentionNorm)
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
        color: inherit;
      }

      &:hover .facet__items__item__count {
        display: none;
      }
    }
  }
</style>
