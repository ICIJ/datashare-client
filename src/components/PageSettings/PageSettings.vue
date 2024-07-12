<template>
  <div class="page-settings">
    <page-settings-title>{{title}}</page-settings-title>
    <slot>
    </slot>
  </div>
</template>

<script setup>
import PageSettingsTitle from "@/components/PageSettings/PageSettingsTitle.vue";

const props = defineProps({
  title: {
    type: String,
    required:true
  }
})

</script>

<style scoped lang="scss">
.page-settings {
  & &-title{
    padding-bottom: 1em;
  }
}

</style>
