<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import ProjectJumbotronPin from './ProjectJumbotronPin'

import { useBreakpoints } from '@/composables/useBreakpoints'
import { useProjectDeletionModal } from '@/composables/useProjectDeletionModal'
import { SIZE } from '@/enums/sizes'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import Hook from '@/components/Hook/Hook'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import ProjectLabel from '@/components/Project/ProjectLabel'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import ModeServerOnly from '@/components/Mode/ModeServerOnly.vue'
import DisplayRoles from '@/components/Display/DisplayRoles.vue'
import RestrictedOnly from '@/components/Mode/RestrictedOnly.vue'

const { breakpointDown } = useBreakpoints()
const router = useRouter()

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

const { t } = useI18n()
const { show: showProjectDeletionModal } = useProjectDeletionModal(props.project)

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

const promptProjectDeletion = async () => {
  const { trigger } = await showProjectDeletionModal()
  // Only redirect if the user confirmed the deletion
  // thought the "ok" button.
  if (trigger === 'ok') {
    router.push({ name: 'project.list' })
  }
}

</script>

<template>
  <section class="project-jumbotron">
    <hook
      name="project-jumbotron:before"
      :bind="{ project }"
    />
    <div class="project-jumbotron__header d-md-flex align-items-center justify-content-between flex-truncate gap-1">
      <h3 class="project-jumbotron__header__title mb-3 mb-md-0">
        <hook
          name="project-jumbotron-label:before"
          :bind="{ project }"
        />
        <project-label
          :project="project"
          :hide-thumbnail="!compact"
        />
        <hook
          name="project-jumbotron-label:after"
          :bind="{ project }"
        />
      </h3>
      <RestrictedOnly
        admin
        :project="project"
      >
        <button-row-action-delete
          class="ms-auto"
          size="md"
          :hide-label="false"
          :square="false"
          :label="t('projectJumbotron.delete')"
          @click="promptProjectDeletion"
        />
        <button-row-action-edit
          size="md"
          :hide-label="false"
          :square="false"
          :to="toEdit"
          :label="t('projectJumbotron.edit')"
        />
      </RestrictedOnly>
      <project-jumbotron-pin v-model:pinned="pinned" />
    </div>
    <div class="project-jumbotron__content d-flex gap-3 align-items-start">
      <hook
        name="project-jumbotron-content:before"
        :bind="{ project }"
      />
      <project-thumbnail
        v-if="!compact"
        :project="project"
        width="100px"
        rounded
        class="flex-shrink-0"
      />
      <div class="d-flex flex-column gap-3 align-self-stretch">
        <p
          v-if="project.description"
          class="project-jumbotron__content__description m-0"
        >
          {{ project.description }}
        </p>
        <footer class="project-jumbotron__content__footer d-md-flex gap-3 mt-auto ">
          <hook
            name="project-jumbotron-content-footer:before"
            :bind="{ project }"
          />
          <div class="d-flex flex-wrap gap-3 text-body-secondary">
            <span
              v-if="creationDate"
              class="text-nowrap"
            >
              <app-icon><i-ph-calendar-blank /></app-icon>
              {{ t('projectJumbotron.creationDate') }}
              <display-datetime :value="creationDate" />
            </span>
            <span
              v-if="updateDate"
              class="text-nowrap"
            >
              <app-icon>
                <i-ph-calendar-check />
              </app-icon>
              {{ t('projectJumbotron.updateDate') }}
              <display-datetime :value="updateDate" />
            </span>
            <mode-server-only>
              <display-roles
                :project="project"
                class="text-body-secondary"
              />
            </mode-server-only>
          </div>

          <hook
            name="project-jumbotron-content-footer:after"
            :bind="{ project }"
          />
        </footer>
      </div>
      <hook
        name="project-jumbotron-content:after"
        :bind="{ project }"
      />
    </div>
    <hook
      name="project-jumbotron:after"
      :bind="{ project }"
    />
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
