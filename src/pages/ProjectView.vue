<script>
import { startCase } from 'lodash'

import utils from '@/mixins/utils'
import PageHeader from '@/components/PageHeader'
import ProjectThumbnail from '@/components/ProjectThumbnail'

/**
 * Project view with insights
 */
export default {
  name: 'ProjectView',
  components: {
    PageHeader,
    ProjectThumbnail
  },
  mixins: [utils],
  props: {
    /**
     * Name of the project
     */
    name: {
      type: String
    }
  },
  data() {
    return {
      tabIndex: null
    }
  },
  computed: {
    project() {
      return this.$core.findProject(this.name)
    },
    projectDisplay() {
      return this.project.label || startCase(this.project.name)
    },
    tab: {
      get() {
        return this.tabRoutes.indexOf(this.$route.name)
      },
      set(tabIndex) {
        const name = this.tabRoutes[tabIndex]
        if (name && this.$route.name !== name) {
          return this.$router.push({ name })
        }
      }
    },
    tabRoutes() {
      return [
        'project.view.insights',
        'project.view.add-documents',
        'project.view.find-named-entities',
        'project.view.edit'
      ]
    }
  },
  beforeMount() {
    if (!this.project) {
      const title = this.$t('error.notFound')
      return this.$router.push({ name: 'error', params: { title } })
    }
  }
}
</script>

<template>
  <div class="project-view">
    <page-header v-model="tabIndex" :title="projectDisplay" :description="project.description" :tab.sync="tab">
      <template #preTitle>
        <project-thumbnail :project="project" width="4em" class="mr-3 rounded" />
      </template>
      <template #tabs>
        <b-tab title-item-class=" project-view__tab project-view__tab--insights">
          <template #title>
            <fa icon="chart-bar" fixed-width class="mr-1" />
            Insights
          </template>
        </b-tab>
        <b-tab v-if="!isServer" title-item-class=" project-view__tab project-view__tab--insights">
          <template #title>
            <fa icon="file" fixed-width class="mr-1" />
            Add documents
          </template>
        </b-tab>
        <b-tab v-if="!isServer" title-item-class=" project-view__tab project-view__tab--insights">
          <template #title>
            <fa icon="user-tag" fixed-width class="mr-1" />
            Find named entities
          </template>
        </b-tab>
        <b-tab v-if="!isServer" title-item-class="ml-auto project-view__tab project-view__tab--edit">
          <template #title>
            <fa icon="pen" fixed-width class="mr-1" />
            Edit
          </template>
        </b-tab>
      </template>
    </page-header>
    <router-view />
  </div>
</template>
