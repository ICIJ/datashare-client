<script setup>
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import IPhPath from '~icons/ph/path'

defineProps({
  icon: {
    type: [String, Object, Array],
    default: () => IPhPath
  },
  noLabel: {
    type: Boolean,
    default: false
  },
  labelClass: {
    type: [String, Array, Object]
  }
})
const { t } = useI18n()
</script>

<template>
  <div class="search-breadcrumb-form-list d-flex flex-column gap-3">
    <div
      v-if="!noLabel"
      class="fw-medium text-action-emphasis text-nowrap"
      :class="labelClass"
    >
      <app-icon
        :name="icon"
        class="me-2"
      />
      <slot name="label">
        {{ t('searchBreadcrumbFormList.label') }}
      </slot>
    </div>
    <div class="search-breadcrumb-form-list__entries d-flex flex-wrap row-gap-2 column-gap-2 align-items-baseline">
      <slot />
    </div>
  </div>
</template>
