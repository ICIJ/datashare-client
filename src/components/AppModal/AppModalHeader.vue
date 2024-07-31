<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  title: {
    type: String
  },
  image: {
    type: String
  },
  imageAlt: {
    type: String
  },
  imageWidth: {
    type: String,
    default: '60px'
  }
})
</script>

<template>
  <div class="app-modal-header w-100">
    <slot name="header-close">
      <button-icon
        icon-left="x"
        hide-label
        hide-tooltip
        tooltip-placement="right"
        variant="outline-secondary"
        class="app-modal-header__close ms-auto border-0"
        :label="$t('appModalHeader.close')"
        @click="$emit('close')"
      />
    </slot>
    <slot name="image">
      <img v-if="image" class="app-modal-header__image" :width="imageWidth" :src="image" :alt="imageAlt" />
    </slot>
    <slot>
      <h3 class="app-modal-header__title text-center mt-2 flex-grow-1">{{ title }}</h3>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.app-modal-header {
  position: relative;
  min-height: 2.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 $spacer-xxl;

  &__title {
    font-weight: 500;
    font-size: 1em;
    color: var(--bs-emphasis-color);
  }

  &__close {
    position: absolute;
    right: 0;
    top: 0;
  }

  &__image {
    max-width: 100%;
  }
}
</style>
