<script setup>
import { computed, useSlots, provide } from 'vue'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

const props = defineProps({
  selectMode: {
    type: Boolean
  }
})

const slots = useSlots()

const hasColgroup = computed(() => !!slots.colgroup)
const hasThead = computed(() => !!slots.thead)
const hasTbody = computed(() => !!slots.default)
const hasTfoot = computed(() => !!slots.tfoot)

const classList = computed(() => {
  return {
    'page-table--select-mode': props.selectMode
  }
})

// `sort` model getter and setter
const sortBy = (value = null) => {
  if (value) {
    sort.value = value
  }
  return sort.value
}

provide('sortBy', sortBy)

// `order` model getter and setter
const orderBy = (value = null) => {
  if (value) {
    order.value = value
  }
  return order.value
}

provide('orderBy', orderBy)
</script>

<template>
  <b-table-simple responsive borderless striped class="page-table" :class="classList">
    <colgroup v-if="hasColgroup">
      <slot v-bind="{ selectMode, sortBy, orderBy }" name="colgroup" />
    </colgroup>
    <thead v-if="hasThead">
      <tr>
        <th class="page-table__select"></th>
        <slot v-bind="{ selectMode, sortBy, orderBy }" name="thead" />
      </tr>
    </thead>
    <tbody v-if="hasTbody">
      <slot v-bind="{ selectMode, sortBy, orderBy }" />
    </tbody>
    <tfoot v-if="hasTfoot">
      <slot v-bind="{ selectMode, sortBy, orderBy }" name="tfoot" />
    </tfoot>
  </b-table-simple>
</template>

<style lang="scss" scoped>
.page-table {
  vertical-align: middle;
  font-size: math.div(14, 16) * 1rem;

  &__select {
    width: 2rem;
    display: none;
  }

  &--select-mode {
    .page-table__select,
    &:deep(.page-table-tr__select) {
      display: table-cell;
    }
  }

  @for $n from 1 to 15 {
    &:has(.page-table-th:nth-of-type(#{$n}).page-table-th--emphasis) {
      &:deep(td:nth-of-type(#{$n})) {
        font-size: $font-size-base;
        color: var(--bs-body-font-size);
        min-width: 100px;
      }

      &:deep(.page-table-tr--active td:nth-of-type(#{$n})) a {
        font-weight: 500;
      }
    }
  }
}
</style>
