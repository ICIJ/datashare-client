<template>
  <div class="user-history-document-list">
    <div class="my-4">
      <b-table
        v-if="events.length"
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        :empty-text="$t('global.emptyTextTable')"
        :fields="fields"
        :items="events"
        class="user-history-document-list__list card"
        hover
        responsive
        striped
        tbody-tr-class="user-history-document-list__list__item"
        thead-tr-class="user-history-document-list__list__head text-nowrap">
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
              class="user-history-document-list__list__item__link d-flex align-items-center">
              <document-thumbnail
                :document="eventAsDocument({ uri })"
                class="user-history-document-list__list__item__preview d-inline-flex me-3"
                crop
                lazy
                size="30"
              />
              <span class="d-inline-block w-100 text-nowrap text-truncate"> {{ name }}</span>
            </router-link>
            <document-actions
              :document="{
                id: docId(uri),
                route: uri,
                index: projectName(uri),
                routerParams: {
                  id: docId(uri),
                  index: projectName(uri),
                  routing: docId(uri)
                }
              }"
              class="user-history-document-list__list__item__actions d-flex"
            />
          </div>
        </template>
        <template #cell(project)="{ item: { uri } }">
          <project-link :project="projectName(uri)" />
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
import { pathToRegexp } from 'path-to-regexp'

import Document from '@/api/resources/Document'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import DocumentActions from '@/components/DocumentActions'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import ProjectLink from '@/components/ProjectLink'
import utils from '@/mixins/utils'
import { humanTime } from '@/filters/humanTime'
import { humanDate } from '@/filters/humanDate'

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
    DocumentActions,
    ColumnFilterDropdown,
    ProjectLink
  },
  mixins: [utils],
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      foo: [],
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
    sortBy: {
      get() {
        const sortQuery = this.$route?.query?.sort
        const useDefaultSort = typeof sortQuery === 'undefined' || !sortKey[sortQuery]
        return useDefaultSort ? MODIFICATION_DATE : sortKey[sortQuery]
      },
      set(sortBy) {
        this.updateParams({ sort: sortKey[sortBy] })
      }
    },
    sortDesc: {
      get() {
        const descQuery = this.$route?.query?.desc
        const useDefault = typeof descQuery === 'undefined'
        if (!useDefault) {
          return typeof descQuery === 'string' ? descQuery === 'true' : descQuery
        }
        return useDefault
      },
      set(sortDesc) {
        this.updateParams({ desc: sortDesc })
      }
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
    documentPathRegexp() {
      const routes = this.$router.getRoutes()
      const { path } = find(routes, { name: 'document-standalone' }) || {}
      return pathToRegexp(path)
    }
  },
  mounted() {
    // No need to request starred docs once the state has already filled
    const starredDocs = this.$store?.state?.starred?.documents
    if (starredDocs && !starredDocs.length) {
      return this.$store.dispatch('starred/fetchIndicesStarredDocuments')
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
        sort: sortKey[this.sortBy],
        desc: this.sortDesc,
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
      const [, _index, _id, _routing] = this.documentPathRegexp.exec(path) || []
      return new Document({
        _index,
        _id,
        _routing
      })
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
