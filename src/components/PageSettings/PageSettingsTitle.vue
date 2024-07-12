<script setup>
const props = defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <h2 class="page-settings-title">
    <slot>{{ title }}</slot>
  </h2>
</template>

<style lang="scss" scoped>
.page-settings-title {
  font-weight: bold;
}
</style>
