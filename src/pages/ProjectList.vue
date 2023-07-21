<template>
  <div class="project-list">
    <page-header title="Projects" icon="database" />
    <div class="container py-4">
      <b-table striped :items="projects" :fields="fields" outlined class="bg-white">
        <template #table-colgroup>
          <col style="width: 2rem" />
          <col style="width: 100%" />
          <col />
        </template>
        <template #cell(thumbnail)="{ item: project }">
          <router-link :to="{ name: 'project.view', params: project }" class="font-weight-bold">
            <project-thumbnail :project="project" class="rounded" width="3rem" />
          </router-link>
        </template>
        <template #cell(label)="{ item: project }">
          <router-link :to="{ name: 'project.view', params: project }" class="font-weight-bold">
            {{ project.label || project.name }}
          </router-link>
          <p class="text-muted m-0">{{ project.description }}</p>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

import PageHeader from '@/components/PageHeader'
import ProjectThumbnail from '@/components/ProjectThumbnail'

export default {
  name: 'ProjectList',
  components: {
    PageHeader,
    ProjectThumbnail
  },
  data() {
    return {
      fields: [
        {
          key: 'thumbnail',
          label: '',
          class: 'align-middle'
        },
        {
          key: 'label',
          label: this.$t('projectList.fields.label'),
          sortable: true,
          class: 'align-middle'
        },
        {
          key: 'updateDate',
          label: this.$t('projectList.fields.updateDate'),
          sortable: true,
          class: 'text-nowrap align-middle',
          formatter: (updateDate) => {
            return moment(updateDate).locale(this.$i18n.locale).format('LL')
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
