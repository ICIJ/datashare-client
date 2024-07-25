<template>
  <div class="project-cards container-fluid p-0">
    <div class="row">
      <div v-for="project in projects" :key="project.name" class="d-flex col-12 col-md-6 mb-4">
        <div class="project-cards__item card card-body" :class="{ 'project-cards__item--active': isActive(project) }">
          <div class="row no-gutters h-100">
            <div class="col-2">
              <project-thumbnail class="rounded" :project="project" />
            </div>
            <div class="col ps-3 d-flex flex-column justify-content-between">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="project-cards__item__heading mb-0">
                  <router-link :to="{ name: 'project.view.insights', params: { name: project.name } }">
                    {{ project.label || startCase(project.name) }}
                  </router-link>
                </h4>
                <fa icon="thumbtack" fixed-width class="me-1 project-cards__item__thumbtack" />
              </div>
              <p class="text-truncate text-truncate--2 d-flex flex-grow-1 mb-2">
                {{ project.description }}
              </p>
              <p class="mb-3">
                <fa icon="file-lines" fixed-width />
                {{
                  $t('projectCards.documentsCount', getDocumentsCountByProject(project), {
                    count: humanNumber(getDocumentsCountByProject(project))
                  })
                }}
                —
                <router-link :to="{ name: 'project.view.insights', params: { name: project.name } }">
                  {{ $t('projectCards.about') }}
                </router-link>
              </p>
              <p class="mb-0">
                <b-button variant="outline-primary" :to="{ name: 'search', query: { indices: project.name } }">
                  <fa icon="magnifying-glass" fixed-width class="me-1" /> {{ $t('projectCards.search') }}
                </b-button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { startCase } from 'lodash'

import humanNumber from '@/utils/humanNumber'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

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
      const nbDocByProject = await this.$core.api.elasticsearch.countByProject(this.projectIds, {
        match: { type: 'Document' }
      })
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
    startCase
  }
}
</script>

<style lang="scss" scoped>
.project-cards {
  &__item {
    color: black;
    position: relative;

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

    &--active {
      box-shadow: 0 0 0 2px $action;

      &:after {
        content: '';
        position: absolute;
        right: -1px;
        top: -1px;
        border: 1rem solid $action;
        border-left-color: transparent;
        border-bottom-color: transparent;
      }
    }
  }
}
</style>
