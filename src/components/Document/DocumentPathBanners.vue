<template>
  <div
    v-if="nonSensitivePathBanners.length"
    class="document-path-banners d-flex flex-column gap-3"
  >
    <b-alert
      v-for="({ note, variant }, i) in nonSensitivePathBanners"
      :key="i"
      class="m-0"
      no-fade
      :variant="variant || 'warning'"
      show
    >
      {{ note }}
    </b-alert>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash'
import { computed, ref, onBeforeMount } from 'vue'

import { useDocumentPathBannersStore } from '@/store/modules'

const props = defineProps({ document: Object })
const pathBanners = ref([])
const nonSensitivePathBanners = computed(() => pathBanners.value.filter(({ note, blurSensitiveMedia }) => !isEmpty(note) && !blurSensitiveMedia))
const documentPathBannersStore = useDocumentPathBannersStore()

onBeforeMount(async () => {
  const { project, path } = props.document
  pathBanners.value = await documentPathBannersStore.fetchPathBannersByPath({ project, path })
})
</script>
