<script setup>
import { TinyPagination } from '@icij/murmur'
import { computed } from 'vue'

import DisplayNumber from '@/components/Display/DisplayNumber'

const page = defineModel('page', { type: Number, default: 1 })

const props = defineProps({
  perPage: {
    type: [Number, String],
    default: 25
  },
  totalRows: {
    type: Number,
    default: 0
  },
  compact: {
    type: Boolean,
    default: false
  },
  keypathRowRange: {
    type: String,
    default: 'rowPagination.rowRange'
  },
  keypathRowRangeCompact: {
    type: String,
    default: 'rowPagination.rowRangeCompact'
  },
  keypathRowRangeFewer: {
    type: String,
    default: 'rowPagination.rowRangeFewer'
  }
})

const hasFewerRows = computed(() => props.totalRows <= page.value * +props.perPage)
</script>

<template>
  <tiny-pagination
    :key="totalRows"
    v-model="page"
    row
    :total-rows="totalRows"
    :per-page="+perPage"
    :compact="compact"
    class="row-pagination"
    :class="{ 'row-pagination--empty': !totalRows }"
  >
    <template #number-of-rows="{ lastRangeRow: to }">
      <i18n-t
        v-if="compact"
        :keypath="keypathRowRangeCompact"
        :plural="totalRows"
      >
        <template #total>
          <display-number :value="totalRows" />
        </template>
      </i18n-t>
      <i18n-t
        v-else-if="hasFewerRows"
        :keypath="keypathRowRangeFewer"
        :plural="totalRows"
      >
        <template #total>
          <display-number :value="totalRows" />
        </template>
      </i18n-t>
      <i18n-t
        v-else
        :keypath="keypathRowRange"
        :plural="totalRows"
      >
        <template #total>
          <display-number :value="totalRows" />
        </template>
        <template #to>
          <display-number :value="to" />
        </template>
      </i18n-t>
    </template>
  </tiny-pagination>
</template>

<style lang="scss" scoped>
.row-pagination {
  &:deep(.tiny-pagination__nav .app-icon) {
    font-size: 1.25em;
  }

  // With zero rows, the (disabled) row-number input still shows a literal "0" next to the
  // "of 0 ..." label, reading as "0 of 0 users" - hide the now-meaningless input, keeping just
  // the label.
  &--empty:deep(.tiny-pagination__form__input--row) {
    display: none;
  }
}
</style>
