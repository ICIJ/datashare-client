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
      const body = this.$t('projectViewAddDocuments.notify.succeed')
      const linkLabel = this.$t('projectViewAddDocuments.notify.seeTasks')
      const { href } = this.$router.resolve({ name: 'task.analysis.list' })
      this.$toast.success(body, { href, linkLabel })
    },
    notifyCreationFailed(error) {
      const title = this.$t('projectViewAddDocuments.notify.failed')
      const body = get(error, 'response.data.error') ?? this.$t('projectViewAddDocuments.notify.failedBody')
      this.$toast.success(body, { title })
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
            <div class="col text-end">
              <b-button variant="action" class="ms-2" type="submit" :disabled="disabled">
                {{ $t('indexing.go') }}
              </b-button>
            </div>
          </template>
        </extracting-form>
      </div>
    </div>
  </div>
</template>
