<script>
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
  mixins:[utils],
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
      return ['project.view.insights', 'project.view.edit']
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
    <page-header
      v-model="tabIndex"
      :title="project.label || project.name"
      :description="project.description"
      :tab.sync="tab"
    >
      <template #preTitle>
        <project-thumbnail :project="project" width="4em" class="mr-3 rounded shaddow" />
      </template>
      <template #tabs>
        <b-tab title-item-class=" project-view__tab project-view__tab--insights">
          <template #title>
            <fa icon="chart-bar" fixed-width class="mr-1" />
            Insights
          </template>
        </b-tab>
        <b-tab title-item-class="ml-auto project-view__tab project-view__tab--edit" v-if="!isServer">
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
