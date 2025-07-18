<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import ProjectCardUpdateDate from './ProjectCardUpdateDate'
import ProjectCardDocumentsCount from './ProjectCardDocumentsCount'

import Hook from '@/components/Hook/Hook'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const toProjectSearch = computed(() => ({
  name: 'search',
  query: {
    indices: [props.project.name]
  }
}))
</script>

<template>
  <div class="project-card-footer d-flex flex-column flex-xl-row gap-3">
    <hook name="project-card-footer:before" :bind="{ project }" />
    <slot>
      <div class="d-flex flex-column lh-lg-1 mt-auto flex-grow-1 align-items-start">
        <project-card-update-date :project="project">
          <slot name="update-date" />
        </project-card-update-date>
        <project-card-documents-count :project="project">
          <slot name="documents-count" />
        </project-card-documents-count>
      </div>
      <button-icon
        :to="toProjectSearch"
        icon-left="magnifying-glass"
        variant="outline-primary"
        truncate
        class="project-card-footer__search align-self-start"
        :label="t('projectCardFooter.search')"
      />
    </slot>
    <hook name="project-card-footer:after" :bind="{ project }" />
  </div>
</template>

<style lang="scss">
.project-card-footer {
  &__insights,
  &__search {
    --bs-btn-font-weight: 500;
    --bs-btn-bg: var(--bs-white);
  }
}
</style>
