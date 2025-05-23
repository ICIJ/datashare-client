<script setup>
import { computed } from 'vue'
import { TinyPagination } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DocumentCarouselNav from './DocumentCarouselNav'

const position = defineModel('position', {
  type: Number,
  default: 0
})

const emit = defineEmits(['previous', 'next'])

defineProps({
  total: {
    type: Number,
    default: 0
  },
  disabledPrevious: {
    type: Boolean
  },
  disabledNext: {
    type: Boolean
  }
})
const { t } = useI18n()

const adjustedPosition = computed({
  get() {
    return position.value + 1
  },
  set(value) {
    position.value = value - 1
  }
})
</script>

<template>
  <div class="document-carousel">
    <tiny-pagination
      v-model="adjustedPosition"
      :per-page="1"
      :total-rows="total"
      class="document-carousel__pagination mx-auto py-1"
    >
      <template #page>
        {{ t('documentCarousel.page') }}
      </template>
    </tiny-pagination>
    <div class="document-carousel__content p-3">
      <document-carousel-nav
        :icon="PhCaretLeft"
        class="document-carousel__content__nav"
        :disabled="disabledPrevious"
        :label="t('documentCarousel.previous')"
        @click="emit('previous')"
      />
      <div class="document-carousel__content__entries">
        <slot />
      </div>
      <document-carousel-nav
        :icon="PhCaretRight"
        class="document-carousel__content__nav"
        :disabled="disabledNext"
        :label="t('documentCarousel.next')"
        @click="emit('next')"
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
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    opacity: 0;
    transition: $transition-fade;

    &__nav {
      margin-top: $spacer-xxl;
    }

    &__entries {
      display: flex;
      align-items: start;
      justify-content: center;
      flex-wrap: nowrap;
      position: relative;
      overflow: hidden;

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
