<template>
  <div class="project-view-edit">
    <div class="container">
      <b-overlay rounded="sm" opacity="0.6" :show="$wait.is(loaderId)">
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
    </div>
  </div>
</template>

<script>
import { get, uniqueId } from 'lodash'

import ProjectForm from '@/components/ProjectForm'

const OPERATION = Object.freeze({ DELETE: 'delete', UPDATE: 'update' })

/**
 * Project edit form
 */
export default {
  name: 'ProjectViewEdit',
  components: {
    ProjectForm
  },
  props: {
    /**
     * Project name identifier
     */
    name: {
      type: String
    }
  },
  computed: {
    project() {
      return this.$core.findProject(this.name)
    },
    loaderId() {
      return uniqueId('project-view-edit:updating:')
    }
  },
  methods: {
    async submit(project) {
      try {
        this.$wait.start(this.loaderId)
        await this.$core.api.updateProject(project)
        this.$core.setProject(project)
        this.notifySucceed(OPERATION.UPDATE)
        this.$wait.end(this.loaderId)
        return this.redirectToProject(project)
      } catch (error) {
        this.notifyFailed(error, OPERATION.UPDATE)
        this.$wait.end(this.loaderId)
      }
    },
    notifySucceed(operation) {
      const title = this.$t(`projectViewEdit.notify.${operation}.succeed`)
      const variant = 'success'
      const body = this.$t(`projectViewEdit.notify.${operation}.succeedBody`)
      this.$bvToast.toast(body, { variant, title })
    },
    notifyFailed(error, operation) {
      const title = this.$t(`projectViewEdit.notify.${operation}.failed`)
      const variant = 'danger'
      const body = get(error, 'response.data.error') ?? this.$t(`projectViewEdit.notify.${operation}.failedBody`)
      this.$bvToast.toast(body, { variant, title })
    },
    redirectToProject({ name }) {
      const params = { name }
      return this.$router.push({ name: 'project.view', params })
    },
    redirectToProjectList() {
      return this.$router.push({ name: 'project.list' })
    },
    async deleteProject(name) {
      try {
        this.$wait.start(this.loaderId)
        await this.$core.api.deleteProject(name)
        this.$wait.end(this.loaderId)
        await this.redirectToProjectList()
        await this.$core.deleteProject(name)
        this.notifySucceed(OPERATION.DELETE)
      } catch (error) {
        this.$wait.end(this.loaderId)
        this.notifyFailed(error, OPERATION.DELETE)
      }
    }
  }
}
</script>
