<template>
  <div class="linked-document-list-entry d-flex">
    <div class="col-12 text-truncate">
      <router-link-document
        :id="id"
        :index="index"
        :routing="routing"
        :title="name"
      >
        <display-content-type-icon
          :value="contentType"
          colorize
        />
        {{ name }}
      </router-link-document>
    </div>
  </div>
</template>

<script setup>
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'
import DisplayContentTypeIcon from '@/components/Display/DisplayContentTypeIcon'

defineOptions({
  name: 'LinkedDocumentListEntry'
})

defineProps({
  contentType: {
    type: String,
    default: 'file'
  },
  id: {
    type: String,
    required: true
  },
  routing: {
    type: String,
    required: true
  },
  index: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'No name provided'
  }
})
</script>
<style lang="scss" scoped>
router-link-document {
  cursor: pointer;
  color: var(--bs-link-color);

&:hover {
  color: var(--bs-link-hover-color);
}
}
</style>
