<script>
import { get } from 'lodash'

import ExtractingForm from '@/components/ExtractingForm'

/**
 * This page display a form to create a new project.
 */
export default {
  name: 'ProjectDocumentExtract',
  components: {
    ExtractingForm
  },
  computed: {
    projectRoute() {
      return { name: 'project.document-extract' }
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
    <div class="container">
      <extracting-form id="extracting-form" class="my-4 px-3" />
    </div>
  </div>
</template>
