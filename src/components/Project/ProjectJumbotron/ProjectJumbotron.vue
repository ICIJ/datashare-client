<script setup>
import { computed } from 'vue'
import { useModalController } from 'bootstrap-vue-next'
import { PhosphorIcon } from '@icij/murmur-next'

import ProjectJumbotronPin from './ProjectJumbotronPin'

import { useBreakpoints } from '@/composables/breakpoints'
import { SIZE } from '@/enums/sizes'
import ButtonIcon from '@/components/Button/ButtonIcon'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import ProjectLabel from '@/components/Project/ProjectLabel'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

const { breakpointDown } = useBreakpoints()
const modalController = useModalController()

const pinned = defineModel('pinned', {
  type: Boolean,
  default: false
})

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  lastIndexingDate: {
    type: [String, Date, Number],
    default: null
  }
})

modalController.show({ component: ProjectLabel, props: { project: props.project } })

const toEdit = computed(() => ({
  name: 'project.view.edit',
  params: {
    name: props.project.name
  }
}))

const compact = computed(() => {
  return breakpointDown.value[SIZE.MD]
})

const creationDate = computed(() => {
  return props.project.creationDate
})

const updateDate = computed(() => {
  return props.lastIndexingDate ?? props.project.updateDate
})
</script>

<template>
  <section class="project-jumbotron">
    <div class="project-jumbotron__header d-md-flex align-items-center justify-content-between flex-truncate gap-3">
      <h3 class="project-jumbotron__header__title">
        <project-label :project="project" :hide-thumbnail="!compact" />
      </h3>
      <button-icon
        class="ms-auto"
        icon-left="pencil-simple"
        variant="outline-secondary"
        :to="toEdit"
        :label="$t('projectJumbotron.edit')"
      />
      <project-jumbotron-pin v-model:pinned="pinned" />
    </div>
    <div class="project-jumbotron__content d-flex gap-3 align-items-start">
      <project-thumbnail v-if="!compact" :project="project" width="100px" rounded class="flex-shrink-0" />
      <div>
        <p v-if="project.description" class="project-jumbotron__content__description m-0">{{ project.description }}</p>
        <footer class="project-jumbotron__content__footer d-md-flex gap-3">
          <div class="d-flex flex-wrap gap-3 text-secondary py-3">
            <span v-if="creationDate" class="text-nowrap">
              <phosphor-icon name="calendar-blank" />
              {{ $t('projectJumbotron.creationDate') }}
              <display-datetime :value="creationDate" />
            </span>
            <span v-if="updateDate" class="text-nowrap">
              <phosphor-icon name="calendar-check" />
              {{ $t('projectJumbotron.updateDate') }}
              <display-datetime :value="updateDate" />
            </span>
          </div>
        </footer>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.project-jumbotron {
  &__header {
    margin-bottom: $spacer-lg;

    &__title {
      padding: 0;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
}
</style>
