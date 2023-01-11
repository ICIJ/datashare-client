<template>
  <filter-boilerplate v-bind="$props" ref="filter" class="filter--named-entity" no-item-translation>
    <template #title>
      <span class="col-2 filter__items__item__icon pl-0 pr-1" :class="getCategoryClass(filter.category, 'text-')">
        <fa :icon="getCategoryIcon(filter.category)" fixed-width></fa>
      </span>
      {{ $t(`filter.${filter.name}`) }}
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
