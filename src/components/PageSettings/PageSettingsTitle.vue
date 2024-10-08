<script setup>
defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <h5 class="page-settings-title">
    <slot>{{ title }}</slot>
  </h5>
</template>

<style lang="scss" scoped>
.page-settings-title {
  color: var(--bs-body-color);
  font-size: 20px;
  font-weight: 700;
  line-height: 24px;
  margin: 0;
}
</style>
