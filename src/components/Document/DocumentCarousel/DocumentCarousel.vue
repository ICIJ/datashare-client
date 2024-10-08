<script setup>
import { TinyPagination } from '@icij/murmur-next'

import DocumentCarouselNav from './DocumentCarouselNav'

defineProps({
  page: {
    type: Number,
    default: 1
  },
  totalRows: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:page'])
</script>

<template>
  <div class="document-carousel">
    <tiny-pagination
      row
      class="mx-auto py-1"
      :per-page="1"
      :total-rows="totalRows"
      :model-value="page"
      @update:modelValue="emit('update:page', $event)"
    />
    <div class="document-carousel__content p-3">
      <document-carousel-nav
        icon="caret-left"
        :label="$t('documentCarousel.previous')"
        @click="emit('update:page', page - 1)"
      />
      <div class="document-carousel__content__entries">
        <slot />
      </div>
      <document-carousel-nav
        icon="caret-right"
        :label="$t('documentCarousel.next')"
        @click="emit('update:page', page + 1)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background: var(--bs-tertiary-bg-subtle);
  }

  &:hover &__content {
    visibility: visible;
    opacity: 1;
    pointer-events: all;
  }

  &__content {
    pointer-events: none;
    display: flex;
    position: absolute;
    background: inherit;
    top: 100%;
    left: 0;
    right: 0;
    visibility: hidden;
    align-items: center;
    justify-content: center;
    width: 100%;
    opacity: 0;
    transition: $transition-fade;

    &__entries {
      display: flex;
      align-items: start;
      justify-content: center;
      flex-wrap: nowrap;

      &::-webkit-scrollbar {
        display: none;
      }

      &:deep(.document-carousel-entry) {
        padding-inline: $spacer-xxs;
        margin-inline: $spacer-xxs;
      }
    }
  }
}
</style>
