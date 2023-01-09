<template>
  <filter-boilerplate v-bind="$props" class="filter--named-entity" ref="filter">
    <template #title>
      <span class="col-2 filter__items__item__icon pl-0 pr-1" :class="getCategoryClass(filter.category, 'text-')">
        <fa :icon="getCategoryIcon(filter.category)" fixed-width></fa>
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
            <span
              class="filter__items__item__count badge badge-pill badge-light align-self-start"
              :class="{ hideOnHover: $config.is('manageDocuments') }"
            >
              {{ $n(item.doc_count) }}
            </span>
          </span>
        </b-form-checkbox>
        <confirm-button
          class="align-self-start btn btn-link btn-sm p-0 mr-2 mt-1 filter__items__item__delete"
          v-if="$config.is('manageDocuments')"
          :confirmed="() => deleteNamedEntitiesByMentionNorm(value)"
          :label="$t('filter.deleteNamedEntity')"
          :yes="$t('global.yes')"
          :no="$t('global.no')"
        >
          <fa icon="trash-alt"></fa>
        </confirm-button>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import ner from '@/mixins/ner'
import utils from '@/mixins/utils'

/**
 * A Filter component to list named entities for a specific type.
 */
export default {
  name: 'FilterNamedEntity',
  extends: FilterAbstract,
  components: {
    FilterBoilerplate
  },
  mixins: [ner, utils],
  methods: {
    async deleteNamedEntitiesByMentionNorm(mentionNorm) {
      const promises = []
      for (const index in this.$store.state.search.indices) {
        promises.push(this.$core.api.deleteNamedEntitiesByMentionNorm(index, mentionNorm))
      }
      await Promise.all(promises)
      this.$root.$emit('filter::hide::named-entities')
      await this.root?.aggregate()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter--named-entity {
  .filter__items__item {
    &__delete:not([aria-describedby]) {
      display: none;
    }

    &:hover .filter__items__item__delete {
      color: inherit;
      display: block;
    }

    &:hover .hideOnHover {
      display: none;
    }
  }
}
</style>
