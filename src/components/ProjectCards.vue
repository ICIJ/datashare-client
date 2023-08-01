<template>
  <div class="project-cards container-fluid p-0">
    <div class="row">
      <div v-for="project in projects" :key="project.name" class="col-12 col-md-6 mb-4">
        <b-card class="project-cards__project-card">
          <template #default>
            <div class="row no-gutters">
              <div class="col-2">
                <project-thumbnail class="rounded" :project="project" />
              </div>
              <div class="col pl-3 flex-column justify-content-between">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="mb-0">
                    <router-link :to="{ name: 'project.view.insights', params: { name: project.name } }">
                      {{ project.label }}
                    </router-link>
                  </h4>
                  <fa icon="thumbtack" fixed-width class="mr-1 project-cards__project-card__thumbtack" />
                </div>
                <p class="text-truncate text-truncate--2 d-flex flex-grow-1 mb-2">
                  {{ project.description }}
                </p>
                <p class="mb-2">
                  <router-link :to="{ name: 'search', query: { indices: project.name } }">
                    <fa icon="file-lines" fixed-width />
                    {{
                      $tc('projectCards.documentsCount', getDocumentsCountByProject(project), {
                        count: humanNumber(getDocumentsCountByProject(project))
                      })
                    }}
                  </router-link>
                  —
                  <router-link :to="{ name: 'project.view.insights', params: { name: project.name } }">
                    {{ $t('projectCards.landing') }}
                  </router-link>
                </p>
              </div>
            </div>
          </template>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import { startCase } from 'lodash'

import humanNumber from '../filters/humanNumber'

import ProjectThumbnail from '@/components/ProjectThumbnail.vue'
import elasticsearch from '@/api/elasticsearch'

/**
 * List all the projects with cards linking to the search.
 */
export default {
  components: { ProjectThumbnail },
  data() {
    return {
      documentsByProject: {}
    }
  },
  computed: {
    projects() {
      return this.$core.projects
    },
    projectIds() {
      return this.$core.projectIds.join(',')
    }
  },
  async created() {
    return this.fetchDocumentsCountByProject()
  },
  methods: {
    async fetchDocumentsCountByProject() {
      const nbDocByProject = await elasticsearch.countByProject(this.projectIds, { match: { type: 'Document' } })
      this.documentsByProject = nbDocByProject?.aggregations?.index?.buckets?.reduce((res, agg) => {
        res[agg.key] = agg.doc_count
        return res
      }, {})
    },
    getDocumentsCountByProject({ name }) {
      return this.documentsByProject[name] ?? 0
    },
    humanNumber,
    isActive(project) {
      return this.$store.state.search.indices.includes(project.name)
    },
    startCase,
    async countDocsProject(name) {
      const result = await this.$core.api.getProjectNbDoc(name)
      const count = result.aggregations?.index?.buckets?.[0]?.doc_count
      return count
    }
  }
}
</script>

<style lang="scss" scoped>
.project-cards {
  &__project-card {
    color: black;
    .text-truncate.text-truncate--2 {
      display: -webkit-box !important;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      white-space: normal;
    }
    &__thumbtack {
      display: none;
      transform: rotate(45deg);
    }
  }
  &__item {
    background: $primary;
    border: darken($primary, 10%) 1px solid;
    border-radius: $border-radius-sm;
    color: white;
    display: block;

    &:hover {
      background: darken($primary, 5);
      color: white;
    }

    &--active {
      box-shadow: 0 0 0 2px $warning;
    }
  }
}
</style>
