<template>
  <div class="user-history-document-list">
    <div class="my-4">
      <b-table
        v-if="events.length"
        v-model:sort-by="sortBy"
        :empty-text="$t('global.emptyTextTable')"
        :fields="fields"
        :items="events"
        class="user-history-document-list__list card"
        hover
        responsive
        striped
        tbody-tr-class="user-history-document-list__list__item"
        thead-tr-class="user-history-document-list__list__head text-nowrap"
      >
        <template #head(project)="{ field }">
          <column-filter-dropdown
            id="projects"
            v-model="selectedProjects"
            multiple
            :eq="sameProject"
            :items="projects"
            :name="field.label"
          />
        </template>
        <template #cell(modification_date)="{ item: { modificationDate } }">
          <span class="user-history-document-list__list__item__date fw-bold me-2">
            {{ getDate(modificationDate) }}
          </span>
          <span class="user-history-document-list__list__item__time d-inline-block">
            {{ getTime(modificationDate) }}
          </span>
        </template>
        <template #cell(name)="{ item: { name, uri } }">
          <div class="d-flex align-items-center justify-content-between">
            <router-link
              :to="{ path: uri }"
              class="user-history-document-list__list__item__link d-flex align-items-center"
            >
              <document-thumbnail
                :document="eventAsDocument({ uri })"
                class="user-history-document-list__list__item__preview d-inline-flex me-3"
                crop
                lazy
                size="30"
              />
              <span class="d-inline-block w-100 text-nowrap text-truncate">{{ name }}</span>
            </router-link>
          </div>
        </template>
        <template #cell(project)="{ item: { uri } }">
          <project-link class="user-history-document-list__list__item__project" :project="projectName(uri)" />
        </template>
      </b-table>
      <div v-else class="text-muted text-center">
        {{ $t('userHistory.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import { castArray, compact, find, property, trimStart } from 'lodash'
import { match } from 'path-to-regexp'

import Document from '@/api/resources/Document'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import ProjectLink from '@/components/Project/ProjectLink'
import utils from '@/mixins/utils'
import { useStarredStore } from '@/store/modules/starred'
import { humanTime } from '@/utils/humanTime'
import { humanDate } from '@/utils/humanDate'

/**
 * List user's visited documents history
 */

const MODIFICATION_DATE = 'modification_date'
const NAME = 'name'
const PROJECT = 'project'

const sortKey = {
  [MODIFICATION_DATE]: MODIFICATION_DATE,
  [NAME]: NAME,
  [PROJECT]: PROJECT
}
export default {
  name: 'UserHistoryDocumentList',
  components: {
    DocumentThumbnail,
    ColumnFilterDropdown,
    ProjectLink
  },
  mixins: [utils],
  provide() {
    return {
      sortBy: this.sortKey
    }
  },
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fields: [
        {
          key: MODIFICATION_DATE,
          label: 'Last visited',
          tdClass: 'align-middle  ',
          sortable: true,
          thStyle: 'min-width:8em;width: 11em;'
        },
        {
          key: NAME,
          label: 'Document name',
          sortable: true,
          thStyle: 'min-width:375px'
        },
        {
          key: PROJECT,
          tdClass: 'align-middle',
          label: 'Project',
          thStyle: 'min-width:10em;width: 12em;'
        }
      ]
    }
  },
  computed: {
    sortKey() {
      const sortQuery = this.$route?.query?.sort
      const useDefaultSort = typeof sortQuery === 'undefined' || !sortKey[sortQuery]
      return useDefaultSort ? MODIFICATION_DATE : sortKey[sortQuery]
    },
    sortBy: {
      get() {
        return [{ key: this.sortKey, order: this.order }]
      },
      set(sortBy) {
        const [{ key: sort, order }] = sortBy
        if (order) {
          return this.updateParams({ sort, order })
        }
        return this.updateParams({ sort, order: 'asc' })
      }
    },
    order() {
      const orderQuery = this.$route?.query?.order
      return typeof orderQuery === 'string' ? orderQuery : 'desc'
    },
    projects() {
      return this.$core.projects || []
    },
    selectedProjects: {
      get() {
        const param = this.$route?.query?.projects
        const projects = castArray(typeof param === 'string' ? param?.split(',') : [])
        return compact(projects.map((name) => find(this.projects, { name })))
      },
      set(values) {
        const projects = values?.length > 0 ? values?.map(property('name')).join(',') : null
        return this.updateParams({ projects })
      }
    },
    matchDocumentPath() {
      return match('/ds/:index/:id{/:routing}')
    }
  },
  async created() {
    const starredStore = useStarredStore()
    // No need to request starred docs once the state has already been filled
    if (!starredStore.documents?.length) {
      try {
        await starredStore.fetchIndicesStarredDocuments(this.$core.projectIds)
      } catch(error) {
        console.warning('Unable to fetch starred documents', error)
      }
    }
  },
  methods: {
    getDate(date) {
      return humanDate(date, this.$i18n.locale)
    },
    getTime(time) {
      return humanTime(time, this.$i18n.locale)
    },
    sameProject(a, b) {
      return a.name === b.name
    },
    updateParams(queryParams) {
      const query = {
        ...this.$route.query,
        sort: this.sortKey,
        order: this.order,
        ...queryParams
      }

      const params = {
        name: 'user-history.document.list',
        query
      }

      this.$router.push(params)
    },
    eventAsDocument({ uri }) {
      // Ensure the URI starts with a / and doesn't contain query params
      const path = `/${trimStart(uri.split('?').shift(0), '/')}`
      const { params } = this.matchDocumentPath(path)
      const { index: _index, id: _id, routing: _routing } = params || {}
      return new Document({ _index, _id, _routing })
    },
    projectName(uri) {
      return uri.split('/')[2]
    },
    docId(uri) {
      return uri.split('/')[3]
    }
  }
}
</script>

<style lang="scss" scoped>
.user-history {
  &__list {
    &__item {
      a:hover {
        text-decoration: none;
        color: $table-hover-color;
        background-color: $table-hover-bg;
      }

      & &__preview.document-thumbnail--crop {
        width: 40px;
        min-width: 40px;
        height: 40px;
      }

      a > div {
        min-width: 0;
      }
      &__link {
        min-width: 100px;
        max-width: 700px;
      }
    }
  }
}
</style>
