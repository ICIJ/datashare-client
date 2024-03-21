<script>
import { get } from 'lodash'

import PageHeader from '@/components/PageHeader'
import ProjectForm from '@/components/ProjectForm'

/**
 * This page display a form to create a new project.
 */
export default {
  name: 'ProjectNew',
  components: {
    PageHeader,
    ProjectForm
  },
  computed: {
    projectRoute() {
      return { name: 'project.list' }
    }
  },
  methods: {
    async submit(project) {
      try {
        this.$wait.start('creating')
        await this.$core.api.createProject(project)
        await this.$core.setProject(project)
        this.notifyCreationSucceed()
        this.redirectToProject(project)
      } catch (error) {
        this.notifyCreationFailed(error)
      } finally {
        this.$wait.end('creating')
      }
    },
    notifyCreationSucceed() {
      const title = this.$t('projectNew.notify.succeed')
      const variant = 'success'
      const body = this.$t('projectNew.notify.succeedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    },
    notifyCreationFailed(error) {
      const title = this.$t('projectNew.notify.failed')
      const variant = 'danger'
      const body = get(error, 'response.data.error') ?? this.$t('projectNew.notify.failedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    },
    redirectToProject({ name }) {
      const params = { name }
      return this.$router.push({ name: 'project.view', params })
    }
  }
}
</script>

<template>
  <div class="project-new">
    <page-header icon="database" :title="$t('projectNew.title')" :description="$t('projectNew.description')" />
    <div class="container">
      <div class="mx-1 mb-2 mt-3">
        <router-link :to="projectRoute">
          <fa icon="angle-left" class="me-1" fixed-width />
          {{ $t('projectList.title') }}
        </router-link>
      </div>
      <b-overlay rounded="sm" opacity="0.6" :show="$wait.is('creating')">
        <project-form class="mb-4" card :disabled="$wait.is('creating')" @submit="submit">
          <template #submit-text>
            {{ $t('projectNew.submit') }}
          </template>
        </project-form>
      </b-overlay>
    </div>
  </div>
</template>
