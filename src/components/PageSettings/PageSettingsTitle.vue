<script setup>
defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <h3 class="page-settings-title">
    <slot>{{ title }}</slot>
  </h3>
</template>

<style lang="scss" scoped>
.page-settings-title {
  font-weight: bold;
}
</style>
