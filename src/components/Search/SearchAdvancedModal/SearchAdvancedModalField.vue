<template>
  <div class="search-advanced-modal-field">
    <div class="search-advanced-modal-field__label">
      <component
        :is="icon"
        :size="20"
        class="text-secondary"
      />
      <span class="text-secondary">
        {{ label }}
      </span>
    </div>
    <div class="search-advanced-modal-field__input">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.search-advanced-modal-field {
  display: flex;
  gap: $spacer;
  align-items: flex-start;

  &__label {
    display: flex;
    align-items: center;
    gap: $spacer * 0.5;
    min-width: 368px;
    flex-shrink: 0;
    font-size: $font-size-base;
    color: var(--bs-secondary-color);
  }

  &__input {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacer;
  }
}
</style>
