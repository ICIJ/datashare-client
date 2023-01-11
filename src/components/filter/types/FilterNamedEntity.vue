<template>
  <filter-boilerplate v-bind="$props" ref="filter" class="filter--named-entity">
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
            <span class="filter__items__item__count badge badge-pill badge-light align-self-start">
              {{ $n(item.doc_count) }}
            </span>
          </span>
        </b-form-checkbox>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import ner from '@/mixins/ner'

/**
 * A Filter component to list named entities for a specific type.
 */
export default {
  name: 'FilterNamedEntity',
  components: {
    FilterBoilerplate
  },
  extends: FilterAbstract,
  mixins: [ner]
}
</script>
