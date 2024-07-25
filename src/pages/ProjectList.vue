<template>
  <div class="project-list">
    <page-header :title="$t('projectList.title')" icon="database">
      <b-button v-if="!isServer" class="ms-auto my-1 text-nowrap" variant="action" :to="{ name: 'project.new' }">
        <fa class="me-1" icon="plus" />
        {{ $t('projectList.newProject') }}
      </b-button>
      <template #body>
        <div class="container py-4">
          <b-table striped :items="projects" :fields="fields" responsive class="card">
            <template #cell(thumbnail)="{ item: project }">
              <router-link :to="{ name: 'project.view.insights', params: { name: project.name } }" class="fw-bold">
                <project-thumbnail :project="project" class="rounded" width="3rem" />
              </router-link>
            </template>
            <template #cell(label)="{ item: project }">
              <router-link :to="{ name: 'project.view.insights', params: { name: project.name } }" class="fw-bold">
                {{ project.label || project.name }}
              </router-link>
              <p class="text-muted m-0">{{ project.description }}</p>
            </template>
          </b-table>
        </div>
      </template>
    </page-header>
  </div>
</template>

<script>
import { humanShortDate } from '@/utils/humanDate'
import PageHeader from '@/components/PageHeader'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import utils from '@/mixins/utils'

export default {
  name: 'ProjectList',
  components: {
    PageHeader,
    ProjectThumbnail
  },
  mixins: [utils],
  data() {
    return {
      fields: [
        {
          key: 'thumbnail',
          label: '',
          class: 'align-middle',
          thStyle: { width: '2rem' }
        },
        {
          key: 'label',
          label: this.$t('projectList.fields.label'),
          sortable: true,
          class: 'align-middle',
          thStyle: { width: '100%' }
        },
        {
          key: 'updateDate',
          label: this.$t('projectList.fields.updateDate'),
          sortable: true,
          class: 'text-nowrap align-middle',
          formatter: (updateDate) => {
            return updateDate ? humanShortDate(updateDate, this.$i18n.locale) : ''
          }
        }
      ]
    }
  },
  computed: {
    projects() {
      return this.$core.projects
    }
  }
}
</script>
