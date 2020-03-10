<template>
  <filter-boilerplate v-bind="$props" class="filter--named-entity" ref="filter">
    <template #title>
      <span class="col-2 filter__items__item__icon pl-0 pr-1" :class="getCategoryClass(filter.category, 'text-')">
        <fa :icon="getCategoryIcon(filter.category)" fixed-width />
      </span>
      {{ $t(`filter.${filter.name}`) }}
    </template>
    <template #item="{ item, value }">
      <div class="d-flex filter__items__item">
        <b-form-checkbox :value="value" class="flex-grow-1 w-100">
          <span class="d-flex">
            <span class="filter__items__item__label px-1 flex-grow-1">
              {{ value }}
            </span>
            <span class="filter__items__item__count badge badge-pill badge-light align-self-start" :class="{ hideOnHover : $config.is('manageDocuments') }">
              {{ $n(item.byDocs.value) }}
            </span>
          </span>
        </b-form-checkbox>
        <confirm-button v-if="$config.is('manageDocuments')" :confirmed="() => deleteNamedEntitiesByMentionNorm(value)" class="align-self-start btn btn-link btn-sm p-0 mr-2 mt-1 filter__items__item__delete" v-b-tooltip :title="$t('filter.deleteNamedEntity')">
          <fa icon="trash-alt" />
        </confirm-button>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import Api from '@/api'
import filters from '@/mixins/filters'
import FilterBoilerplate from '@/components/FilterBoilerplate'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'

const api = new Api()

export default {
  name: 'FilterNamedEntity',
  components: { FilterBoilerplate },
  mixins: [filters, ner, utils],
  methods: {
    async deleteNamedEntitiesByMentionNorm (mentionNorm) {
      await api.deleteNamedEntitiesByMentionNorm(this.$store.state.search.index, mentionNorm)
      this.$root.$emit('filter::hide::named-entities')
      if (this.$refs.filter) {
        this.$refs.filter.aggregate()
      }
    }
  }
}
</script>

<style lang="scss">
  .filter--named-entity {

    .filter__items__item {

      &__delete:not([aria-describedby]) {
        display: none;
      }

      &:hover .filter__items__item__delete {
        display: block;
        color: inherit;
      }

      &:hover .hideOnHover {
        display: none;
      }
    }
  }
</style>
