<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  icon: {
    type: String
  },
  count: {
    type: Number,
    default: null
  }
})
</script>

<template>
  <span class="tab-title d-flex gap-1">
    <template v-if="icon">
      <phosphor-icon :name="icon" class="tab-title__icon tab-title__icon--inactive" size="1.25em" aria-hidden="true" />
      <phosphor-icon
        :name="icon"
        class="tab-title__icon tab-title__icon--active"
        weight="bold"
        size="1.25em"
        aria-hidden="true"
      />
    </template>
    <slot />
    <b-badge v-if="count !== null" variant="transparent" pill>
      {{ count }}
    </b-badge>
  </span>
</template>
<style lang="scss">
.tab-title {
  display: flex;
  align-items: center;

  .tab-title__icon--active {
    display: none;
  }
}
</style>
