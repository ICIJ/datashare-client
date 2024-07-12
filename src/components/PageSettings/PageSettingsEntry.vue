<template>
  <span class="page-settings-entry d-inline-flex"><phosphor-icon v-if="icon" :name="icon" class="me-2"/>{{ text }}</span>
</template>

<script setup>
import {PhosphorIcon} from "@icij/murmur-next";
const props = defineProps({
  icon: {
    type: String,
  },
  text: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: false
  }
})

</script>

<style lang="scss">
.page-settings-entry{
  :checked + label {
    font-weight: bold
  }
}
</style>
