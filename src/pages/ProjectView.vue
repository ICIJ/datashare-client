<script>
import PageHeader from '@/components/PageHeader'

export default {
  name: 'ProjectView',
  components: {
    PageHeader
  },
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
          this.$router.push({ name })
        }
      }
    },
    tabRoutes() {
      return ['project.view.insights']
    }
  }
}
</script>

<template>
  <div class="project-view">
    <page-header v-model="tabIndex" :title="project" :tab.sync="tab">
      <template #tabs>
        <b-tab>
          <template #title>
            <fa icon="chart-bar" fixed-width class="mr-1" />
            Insights
          </template>
        </b-tab>
      </template>
    </page-header>
    <router-view />
  </div>
</template>
