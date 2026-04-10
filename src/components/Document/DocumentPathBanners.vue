<template>
  <div
    v-if="nonEmptyPathBanners.length"
    class="document-path-banners d-flex flex-column gap-3"
  >
    <b-alert
      v-for="({ note, variant }, i) in nonEmptyPathBanners"
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
const nonEmptyPathBanners = computed(() => pathBanners.value.filter(({ note }) => !isEmpty(note)))
const documentPathBannersStore = useDocumentPathBannersStore()

onBeforeMount(async () => {
  const { project, path } = props.document
  pathBanners.value = await documentPathBannersStore.fetchPathBannersByPath({ project, path })
})
</script>
