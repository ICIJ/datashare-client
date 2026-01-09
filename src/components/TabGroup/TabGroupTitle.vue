<script setup>
import { AppIcon } from '@icij/murmur-next'

defineProps({
  icon: {
    type: [String, Object, Array]
  },
  count: {
    type: Number,
    default: null
  }
})
</script>

<template>
  <span class="tab-group-title d-flex gap-1">
    <template v-if="icon">
      <app-icon
        :name="icon"
        class="tab-group-title__icon tab-group-title__icon--inactive"
        size="1.25em"
        aria-hidden="true"
      />
      <app-icon
        :name="icon"
        class="tab-group-title__icon tab-group-title__icon--active"
        size="1.25em"
        aria-hidden="true"
      />
    </template>
    <slot />
    <b-badge
      v-if="count !== null"
      variant="transparent"
      pill
    >
      {{ count }}
    </b-badge>
  </span>
</template>

<style lang="scss">
.tab-group-title {
  display: flex;
  align-items: center;

  .tab-group-title__icon--active {
    display: none;
  }
}
</style>
