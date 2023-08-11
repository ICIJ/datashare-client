<script>
import { get } from 'lodash'

import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'

/**
 * This page display a form to create a new project.
 */
export default {
  name: 'ProjectViewFindNamedEntities',
  components: {
    FindNamedEntitiesForm
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
    <div class="container p-4">
      <div class="card">
        <h4 class="card-header">Find named entities (people, locations, organisations)</h4>
        <find-named-entities-form id="find-named-entities-form p-4" class="card-body" @submit="() => {}">
          <template #footer="{ disabled }">
            <div class="col text-right">
              <b-btn variant="outline-primary" type="reset" :disabled="disabled"> Reset </b-btn>
              <b-btn variant="primary" class="ml-2" type="submit" :disabled="disabled">
                {{ $t('indexing.go') }}
              </b-btn>
            </div>
          </template>
        </find-named-entities-form>
      </div>
    </div>
  </div>
</template>
