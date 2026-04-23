<script setup>
import { ref, watch, defineProps } from 'vue'
import { apiInstance as api } from '@/api/apiInstance'
import FileTypesViewEntry from './FileTypesViewEntry.vue'
import FileTypesViewGrouped from './FileTypesViewGrouped.vue'

const props = defineProps({
  contentTypes: {
    type: Array,
    required: true
  },
  /**
   * show the children file types of each category or not
   */
  expanded: {
    type: Boolean,
    required: false,
    default: false
  }
})
const contentTypesByCategories = ref({})

watch(() => props.contentTypes, async () => {
  contentTypesByCategories.value = await api.getContentTypesGrouppedByCategories(props.contentTypes)
}, { immediate: true, deep: true })

</script>
<template>
  <template v-if="expanded">
    <file-types-view-entry
      v-for="fileType in contentTypes"
      :key="fileType"
      :file-type="fileType"
    />
  </template>
  <template v-else>
    <template
      v-for="category in Object.keys(contentTypesByCategories)"
      :key="category"
    >
      <file-types-view-grouped
        :category="category"
        :file-types="contentTypesByCategories[category]"
        :expanded="expanded"
      />
    </template>
  </template>
</template>
