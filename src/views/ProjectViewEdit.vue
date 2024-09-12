<script setup>
import { computed } from 'vue'
import { get, uniqueId } from 'lodash'
import { useI18n } from 'vue-i18n'

import PageContainer from '@/components/PageContainer/PageContainer'
import ProjectForm from '@/components/Project/ProjectForm'
import { useCore } from '@/composables/core'

const OPERATION = Object.freeze({ DELETE: 'delete', UPDATE: 'update' })

const props = defineProps({
  name: {
    type: String
  }
})

const { core, toast, wait } = useCore()
const { t } = useI18n()

const project = computed(() => core.findProject(props.name))

const loaderId = uniqueId('project-view-edit:updating:')

async function submit(project) {
  try {
    wait.start(loaderId.value)
    await core.api.updateProject(project)
    core.setProject(project)
    notifySucceed(OPERATION.UPDATE)
    wait.end(loaderId.value)
    return redirectToProject(project)
  } catch (error) {
    notifyFailed(error, OPERATION.UPDATE)
    wait.end(loaderId.value)
  }
}

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
  return core.router.push({ name: 'project.view.insights', params })
}

function redirectToProjectList() {
  return core.router.push({ name: 'project.list' })
}

async function deleteProject(name) {
  try {
    wait.start(loaderId.value)
    await core.api.deleteProject(name)
    wait.end(loaderId.value)
    await redirectToProjectList()
    await core.deleteProject(name)
    notifySucceed(OPERATION.DELETE)
  } catch (error) {
    wait.end(loaderId.value)
    notifyFailed(error, OPERATION.DELETE)
  }
}
</script>

<template>
  <div class="project-view-edit">
    <page-container fluid>
      <b-overlay rounded="sm" opacity="0.6" :show="$wait.is('creating')">
        <project-form
          class="my-4"
          edit
          card
          :disabled="$wait.is(loaderId)"
          show-delete-button
          :values="project"
          @submit="submit"
          @delete="deleteProject"
        >
          <template #submit-text>
            {{ $t('projectViewEdit.submit') }}
          </template>
        </project-form>
      </b-overlay>
    </page-container>
  </div>
</template>
