<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppWait from '@/components/AppWait/AppWait'
import AppModal from '@/components/AppModal/AppModal'
import DisplayNumber from '@/components/Display/DisplayNumber'
import ProjectLabel from '@/components/Project/ProjectLabel'
import { useProjectMetrics } from '@/composables/useProjectMetrics'
import { useWait } from '@/composables/useWait'
import { useCore } from '@/composables/useCore'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const emit = defineEmits(['success', 'error'])

const documentsCount = ref(0)
const tagsCount = ref(0)
const recommendationsCount = ref(0)

const { waitFor, loaderId } = useWait()
const { core, toast } = useCore()
const { fetchDocumentsCount, fetchTagsCount, fetchRecommendationsCount } = useProjectMetrics(props.project)

async function confirmDeletion() {
  try {
    await core.api.removeProject(props.project.name)
    await core.removeProject(props.project.name)
    toast.success(t('projectDeletionModal.notify.succeed'))
    emit('success')
  }
  catch {
    toast.error(t('projectDeletionModal.notify.failed'))
    emit('error')
  }
}

const hasSomething = computed(() => documentsCount.value + tagsCount.value + recommendationsCount.value > 0)
const isDefaultProject = computed(() => props.project.name === core.defaultProject)

onBeforeMount(
  waitFor(async () => {
    documentsCount.value = await fetchDocumentsCount()
    tagsCount.value = await fetchTagsCount()
    recommendationsCount.value = await fetchRecommendationsCount()
  })
)
</script>

<template>
  <app-modal
    :image="image"
    :image-dark="imageDark"
    @ok="confirmDeletion"
  >
    <template #title>
      <i18n-t keypath="projectDeletionModal.title">
        <template #project>
          <project-label
            :project="project"
            hide-thumbnail
          />
        </template>
      </i18n-t>
    </template>
    <app-wait :for="loaderId">
      <i18n-t
        v-if="hasSomething"
        keypath="projectDeletionModal.body.all"
      >
        <template #documents>
          <i18n-t
            keypath="projectDeletionModal.body.documents"
            tag="span"
            :plural="documentsCount"
          >
            <template #count>
              <display-number :value="documentsCount" />
            </template>
          </i18n-t>
        </template>
        <template #tags>
          <i18n-t
            keypath="projectDeletionModal.body.tags"
            tag="span"
            :plural="tagsCount"
          >
            <template #count>
              <display-number :value="tagsCount" />
            </template>
          </i18n-t>
        </template>
        <template #recommendations>
          <i18n-t
            keypath="projectDeletionModal.body.recommendations"
            tag="span"
            :plural="recommendationsCount"
          >
            <template #count>
              <display-number :value="recommendationsCount" />
            </template>
          </i18n-t>
        </template>
        <template
          v-if="isDefaultProject"
          #default
        >
          <i18n-t keypath="projectDeletionModal.body.default" />
        </template>
      </i18n-t>
      <i18n-t
        v-else-if="isDefaultProject"
        keypath="projectDeletionModal.body.default"
      />
    </app-wait>
  </app-modal>
</template>
