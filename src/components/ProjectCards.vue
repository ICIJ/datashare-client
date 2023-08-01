<template>
  <div class="project-cards container-fluid p-0">
    <div class="row">
      <div v-for="project in projects" :key="project.name" class="col-12 col-md-6 mb-4">
        <b-card class="project-cards__project-card">
          <template #default>
            <div class="row no-gutters">
              <div class="col-2">
                <project-thumbnail class="rounded shadow" :project="project" />
              </div>
              <div class="col pl-3 flex-column justify-content-between">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="mb-0">
                    <router-link :to="{ name: 'project.view', params: { name: project.name } }">
                      {{ project.label }}</router-link
                    >
                  </h4>
                  <fa icon="thumbtack" fixed-width class="mr-1 project-cards__project-card__thumbtack" />
                </div>
                <p class="text-truncate text-truncate--2 d-flex flex-grow-1 mb-2">
                  {{ project.description }} Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem
                  ipsum
                </p>
                <p class="mb-2">
                  <fa icon="file-lines" fixed-width class="mr-1" />{{ humanNumber(1200) }} documents —
                  <router-link :to="{ name: 'project.view', params: { name: project.name } }"> About</router-link>
                </p>
                <b-btn variant="outline-primary my-1" :to="{ name: 'search', query: { indices: project.name } }"
                  ><fa icon="search" fixed-width class="mr-1" />Search</b-btn
                >
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

/**
 * List all the projects with cards linking to the search.
 */
export default {
  components: { ProjectThumbnail },
  computed: {
    projects() {
      return this.$core.projects
    }
  },
  methods: {
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
  &__project-card {
    color: black;
    .text-truncate.text-truncate--2 {
      display: -webkit-box !important;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      white-space: normal;
    }
    &__thumbtack {
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
