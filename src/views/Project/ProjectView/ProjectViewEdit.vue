<script setup>
import { computed } from 'vue'
import { get } from 'lodash'
import { useI18n } from 'vue-i18n'

import AppOverlay from '@/components/AppOverlay/AppOverlay'
import ProjectForm from '@/components/Project/ProjectForm'
import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'

const OPERATION = Object.freeze({ UPDATE: 'update' })

const props = defineProps({
  name: {
    type: String
  }
})

const { core, toast } = useCore()
const { waitFor, isLoading } = useWait()
const { t } = useI18n()

const project = computed(() => core.findProject(props.name))

const submit = waitFor(async (project) => {
  try {
    await core.api.updateProject(project)
    core.setProject(project)
    notifySucceed(OPERATION.UPDATE)
    return redirectToProject(project)
  } catch (error) {
    notifyFailed(error, OPERATION.UPDATE)
  }
})

function notifySucceed(operation) {
  const body = t(`projectViewEdit.notify.${operation}.succeedBody`)
  toast.success(body)
}

function notifyFailed(error, operation) {
  const body = get(error, 'response.data.error') ?? t(`projectViewEdit.notify.${operation}.failedBody`)
  toast.error(body)
}

function redirectToProject({ name }) {
  const params = { name }
  return core.router.push({ name: 'project.view.overview.insights', params })
}
</script>

<template>
  <div class="project-view-edit">
    <app-overlay rounded="sm" :show="isLoading">
      <project-form edit card :disabled="isLoading" :values="project" @submit="submit">
        <template #submit-text>
          {{ t('projectViewEdit.submit') }}
        </template>
      </project-form>
    </app-overlay>
  </div>
</template>
