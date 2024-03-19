<script>
import { get } from 'lodash'

import ExtractingForm from '@/components/ExtractingForm'

/**
 * This page display a form to create a new project.
 */
export default {
  name: 'ProjectViewAddDocuments',
  components: {
    ExtractingForm
  },
  computed: {
    projectRoute() {
      return { name: 'project.document-extract' }
    },
    projectName() {
      return this.$route.params?.name
    }
  },
  methods: {
    notifyCreationSucceed() {
      const title = this.$t('projectViewAddDocuments.notify.succeed')
      const variant = 'success'
      const message = this.$t('projectViewAddDocuments.notify.succeedBody')
      const linkText = this.$t('projectViewAddDocuments.notify.seeTasks')
      const body = this.$createElement('div', {}, [
        this.$createElement('p', {}, message),
        this.$createElement('router-link', { props: { to: { name: 'task.analysis.list' } } }, linkText)
      ])
      this.$root.$bvToast.toast(body, { variant, title })
    },
    notifyCreationFailed(error) {
      const title = this.$t('projectViewAddDocuments.notify.failed')
      const variant = 'danger'
      const body = get(error, 'response.data.error') ?? this.$t('projectViewAddDocuments.notify.failedBody')
      this.$root.$bvToast.toast(body, { variant, title })
    },
    submit({ error }) {
      if (error) {
        this.notifyCreationFailed(error)
      } else {
        this.notifyCreationSucceed()
        this.$router.push('.')
      }
    }
  }
}
</script>

<template>
  <div class="project-new">
    <div class="container p-4">
      <div class="card">
        <h4 class="card-header">Add documents</h4>
        <extracting-form
          id="extracting-form"
          class="card-body"
          :project-name="projectName"
          hide-project-selector
          @submit="submit"
        >
          <template #footer="{ disabled }">
            <div class="col text-right">
              <b-button variant="primary" class="ml-2" type="submit" :disabled="disabled">
                {{ $t('indexing.go') }}
              </b-button>
            </div>
          </template>
        </extracting-form>
      </div>
    </div>
  </div>
</template>
