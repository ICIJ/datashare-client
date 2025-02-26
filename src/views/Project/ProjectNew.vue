<script setup>
import { get } from 'lodash'
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/PageHeader/PageHeader'
import PageContainer from '@/components/PageContainer/PageContainer'
import ProjectForm from '@/components/Project/ProjectForm'
import { useCore } from '@/composables/core'

const { core, toast, wait } = useCore()
const { t } = useI18n()

async function submit(project) {
  try {
    wait.start('creating')
    await core.api.createProject(project)
    await core.setProject(project)
    notifyCreationSucceed()
    redirectToProject(project)
  } catch (error) {
    notifyCreationFailed(error)
  } finally {
    wait.end('creating')
  }
}

function notifyCreationSucceed() {
  const title = t('projectNew.notify.succeed')
  const body = t('projectNew.notify.succeedBody')
  toast.success(body, { title })
}

function notifyCreationFailed(error) {
  const title = t('projectNew.notify.failed')
  const body = get(error, 'response.data.error') ?? t('projectNew.notify.failedBody')
  toast.danger(body, { title })
}

function redirectToProject({ name }) {
  const params = { name }
  core.router.push({ name: 'project.view.overview.insights', params })
}
</script>

<template>
  <page-container fluid top class="project-new">
    <page-header no-toggle-settings />
    <b-overlay rounded="sm" opacity="0.6" :show="$wait.is('creating')">
      <project-form class="mb-4" card :disabled="$wait.is('creating')" @submit="submit" />
    </b-overlay>
  </page-container>
</template>
