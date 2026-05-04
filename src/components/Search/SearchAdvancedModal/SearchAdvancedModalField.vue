<template>
  <div :class="['search-advanced-modal-field', { 'search-advanced-modal-field--align-top': alignTop }]">
    <div class="search-advanced-modal-field__label">
      <app-icon class="search-advanced-modal-field__label__icon">
        <component :is="icon" />
      </app-icon>
      <span class="text-secondary">
        {{ label }}
      </span>
    </div>
    <div class="search-advanced-modal-field__input">
      <slot />
    </div>
    <div
      v-if="$slots.example"
      class="search-advanced-modal-field__example"
    >
      <slot name="example" />
    </div>
  </div>
</template>

<script setup>
import { AppIcon } from '@icij/murmur-next'

defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    required: true
  },
  /**
   * Anchor the label to the top of the input column instead of vertically
   * centering it. Use when the input column contains tall multi-line content
   * (e.g. a list of checkboxes).
   */
  alignTop: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.search-advanced-modal-field {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: $spacer;
  row-gap: $spacer * 0.5;

  @include media-breakpoint-up(md) {
    grid-template-columns: 245px 1fr;
  }

  &__label {
    display: flex;
    align-items: flex-start;
    align-self: center;
    gap: $spacer * 0.5;
    color: var(--bs-secondary-color);
    font-size: $font-size-base;

    &__icon {
      color: var(--bs-tertiary-color);
      flex-shrink: 0;
      // Match the line-box of the first text line so the icon's optical
      // centre aligns with the text x-height instead of the line-box top.
      display: inline-flex;
      align-items: center;
      height: 1.5em;
      line-height: 1;
    }
  }

  &--align-top &__label {
    align-self: flex-start;
  }

  &__input,
  &__example {
    @include media-breakpoint-up(md) {
      grid-column: 2;
    }
  }
}
</style>
