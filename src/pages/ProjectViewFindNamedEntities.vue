<script>
import { get } from 'lodash'

import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'

/**
 * This page displays a form to create a new project.
 */
export default {
  name: 'ProjectViewFindNamedEntities',
  components: {
    FindNamedEntitiesForm
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
    async submit({ error }) {
      if (error) {
        this.notifyCreationFailed(error)
      } else {
        this.notifyCreationSucceed()
        this.$router.push('.')
      }
    },
    notifyCreationSucceed() {
      const body = this.$t('projectViewFindNamedEntities.notify.succeed')
      const linkLabel = this.$t('projectViewFindNamedEntities.notify.seeTasks')
      const { href } = this.$router.resolve({ name: 'task.analysis.list' })
      this.$toast.success(body, { href, linkLabel })
    },
    notifyCreationFailed(error) {
      const title = this.$t('projectViewFindNamedEntities.notify.failed')
      const body = get(error, 'response.data.error') ?? this.$t('projectViewFindNamedEntities.notify.failedBody')
      this.$toast.error(body, { title })
    }
  }
}
</script>

<template>
  <div class="project-new">
    <div class="container p-4">
      <div class="card">
        <h4 class="card-header" @click="notifyCreationSucceed">
          Find named entities (people, locations, organisations)
        </h4>
        <find-named-entities-form
          id="find-named-entities-form p-4"
          class="card-body"
          :project-name="projectName"
          hide-project-selector
          @submit="submit"
        >
          <template #footer="{ disabled }">
            <div class="col text-end">
              <b-button variant="primary" class="ms-2" type="submit" :disabled="disabled">
                {{ $t('indexing.go') }}
              </b-button>
            </div>
          </template>
        </find-named-entities-form>
      </div>
    </div>
  </div>
</template>
