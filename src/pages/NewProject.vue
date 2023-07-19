<script>
import { get } from 'lodash'

import PageHeader from '@/components/PageHeader'
import ProjectForm from '@/components/ProjectForm'

/**
 * This page display a form to create a new project.
 */
export default {
  name: 'NewProject',
  components: {
    PageHeader,
    ProjectForm
  },
  methods: {
    async submit(project) {
      try {
        this.$wait.start('creating')
        await this.$core.api.createProject(project)
        this.notifyCreationSucceed()
        this.$router.push({ name: 'landing' })
      } catch (error) {
        this.notifyCreationFailed(error)
      } finally {
        this.$wait.end('creating')
      }
    },
    notifyCreationSucceed() {
      const title = this.$t('newProject.notify.succeed')
      const variant = 'success'
      const body = this.$t('newProject.notify.succeedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    },
    notifyCreationFailed(error) {
      const title = this.$t('newProject.notify.failed')
      const variant = 'danger'
      const body = get(error, 'response.data.error') ?? this.$t('newProject.notify.failedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    }
  }
}
</script>

<template>
  <div class="new-project">
    <page-header icon="database" :title="$t('newProject.title')" :description="$t('newProject.description')" />
    <div class="container">
      <b-overlay rounded="sm" opacity="0.6" :show="$wait.is('creating')">
        <project-form class="my-4" card :disabled="$wait.is('creating')" @submit="submit">
          <template #submit-text>
            {{ $t('newProject.submit') }}
          </template>
        </project-form>
      </b-overlay>
    </div>
  </div>
</template>
