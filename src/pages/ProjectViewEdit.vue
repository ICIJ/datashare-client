<template>
  <div class="project-view-edit">
    <div class="container">
      <b-overlay rounded="sm" opacity="0.6" :show="$wait.is(loaderId)">
        <project-form class="my-4" edit card :disabled="$wait.is(loaderId)" :values="project" @submit="submit">
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
  methods: {
    async submit(project) {
      try {
        this.$wait.start(this.loaderId)
        await this.$core.api.updateProject(project)
        await this.$core.setProject(project)
        this.notifyUpdateSucceed()
        this.$wait.end(this.loaderId)
        return this.redirectToProject(project)
      } catch (error) {
        this.notifyUpdateFailed(error)
        this.$wait.end(this.loaderId)
      } 
    },
    notifyUpdateSucceed() {
      const title = this.$t('projectViewEdit.notify.succeed')
      const variant = 'success'
      const body = this.$t('projectViewEdit.notify.succeedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    },
    notifyUpdateFailed(error) {
      const title = this.$t('projectViewEdit.notify.failed')
      const variant = 'danger'
      const body = get(error, 'response.data.error') ?? this.$t('projectViewEdit.notify.failedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    },
    redirectToProject({ name }) {
      const params = { name }
      return this.$router.push({ name: 'project.view', params })
    }
  },
  computed: {  
    project() {
      return this.$core.findProject(this.name)
    },
    loaderId() {
      return uniqueId('project-view-edit:updating:')
    }
  }
}
</script>
