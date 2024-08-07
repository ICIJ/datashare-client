<script setup>
import DisplayTags from '@/components/Display/DisplayTags'
import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'
defineOptions({ name: 'DisplayTagsSearchParameter' })

defineProps({
  value: {
    type: [Array, String]
  },
  noXIcon: {
    type: Boolean
  }
})
const emit = defineEmits(['remove-value'])
function removeValue(content) {
  emit('remove-value', content)
}
</script>

<template>
  <display-tags :value="value">
    <template #content="{ content }">
      <search-parameter
        icon="tag"
        filter="tag"
        :term="content"
        :no-x-icon="noXIcon"
        class="ms-1 text-action-emphasis"
        @click:x="removeValue(content)"
      />
    </template>
  </display-tags>
</template>
