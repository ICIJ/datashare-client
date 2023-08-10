<template>
  <div class="project-list">
    <page-header :title="$t('projectList.title')" icon="database">
      <b-btn v-if="!isServer" class="ml-auto my-1 text-nowrap" variant="primary" :to="{ name: 'project.new' }">
        <fa class="mr-1" icon="plus" />
        {{ $t('projectList.newProject') }}
      </b-btn>
    </page-header>
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
import { humanShortDate } from '@/filters/humanDate'
import PageHeader from '@/components/PageHeader'
import ProjectThumbnail from '@/components/ProjectThumbnail'
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
