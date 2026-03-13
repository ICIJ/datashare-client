<script setup>
import { ref, watch } from 'vue'
import { apiInstance as api } from '@/api/apiInstance'
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
  <template
    v-for="category in Object.keys(contentTypesByCategories)"
    :key="category"
  >
    {{ category }} : <div v-if="expanded">
      : {{ contentTypesByCategories[category] }}
    </div>
  </template>
</template>
