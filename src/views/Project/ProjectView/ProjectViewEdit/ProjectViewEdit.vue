<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhInfo from '~icons/ph/info'
import IPhListDashes from '~icons/ph/list-dashes'

import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation.vue'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry.vue'

const props = defineProps({
  name: {
    type: String
  }
})

const { t } = useI18n()
const params = computed(() => ({ name: props.name }))
</script>

<template>
  <div class="project-view-edit">
    <tab-group-navigation>
      <tab-group-navigation-entry
        :icon="IPhListDashes"
        :to="{ name: 'project.view.edit.details', params }"
      >
        {{ t('projectViewEdit.tabs.details') }}
      </tab-group-navigation-entry>
      <tab-group-navigation-entry
        :icon="IPhInfo"
        :to="{ name: 'project.view.edit.banners', params }"
      >
        {{ t('projectViewEdit.tabs.pathBanners') }}
      </tab-group-navigation-entry>
    </tab-group-navigation>
    <router-view />
  </div>
</template>
