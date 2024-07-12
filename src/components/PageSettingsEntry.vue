<template>
      <span class="page-settings-entry"><phosphor-icon v-if="icon" :name="icon"/>{{ text }}</span>
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
:checked + label {
  font-weight: 700;
}
</style>
