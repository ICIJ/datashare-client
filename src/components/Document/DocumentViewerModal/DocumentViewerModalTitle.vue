<script setup>
import { computed } from 'vue'

const { document } = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const to = computed(() => ({ name: 'document-standalone', params: document.routerParams }))
</script>

<template>
  <router-link class="document-viewer-modal-title" :to="to" target="_blank">
    {{ document.title }}
    <phosphor-icon :name="PhArrowSquareOut" class="ml-1 document-viewer-modal-title__icon" />
  </router-link>
</template>

<style scoped lang="scss">
.document-viewer-modal-title {
  text-align: left;
  display: block;
  width: 100%;
  word-break: break-all;

  &__icon {
    visibility: hidden;
  }

  &:hover &__icon {
    visibility: visible;
  }
}
</style>
