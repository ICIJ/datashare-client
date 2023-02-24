<template>
  <div class="user-history d-flex flex-column">
    <div class="my-4">
      <b-table
        v-if="events.length"
        :empty-text="$t('global.emptyTextTable')"
        :fields="displayedFields"
        :items="events"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        class="user-history__list card border-top-0"
        hover
        responsive
        striped
        tbody-tr-class="user-history__list__item"
        thead-tr-class="user-history__list__head text-nowrap"
      >
        <template #head(project)="{ field }">
          <column-filter-dropdown
            id="projects"
            v-model="selectedProjects"
            :items="projects"
            :name="field.label"
            multiple
          />
        </template>
        <template #cell(modification_date)="{ item: { modificationDate } }">
          <span class="user-history__list__item__date font-weight-bold mr-2"
            >{{ humanReadableDate(modificationDate) }}
          </span>
          <span class="user-history__list__item__time d-inline-block">{{ humanReadableTime(modificationDate) }}</span>
        </template>
        <template #cell(name)="{ item: { name, uri } }">
          <div class="d-flex align-items-center justify-content-between">
            <router-link :to="{ path: uri }" class="user-history__list__item__link d-flex align-items-center">
              <document-thumbnail
                :document="eventAsDocument({ uri })"
                class="d-none d-inline-flex user-history__list__item__preview mr-3"
                crop
                lazy
                size="30"
              />
              <span class="d-inline-block text-nowrap text-truncate"> {{ name }}</span>
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
              class="d-flex"
            ></document-actions>
          </div>
        </template>
        <template #cell(project)="{ item: { uri } }">
          <router-link
            :to="{
              name: 'search',
              query: {
                q: '*',
                indices: projectName(uri)
              }
            }"
            class="user-history__list__item__project"
          >
            {{ projectName(uri) }}
          </router-link>
        </template>
      </b-table>
      <div v-else class="text-muted text-center">
        {{ $t('userHistory.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import { find, trimStart } from 'lodash'
import { pathToRegexp } from 'path-to-regexp'
import Document from '@/api/resources/Document'
import moment from 'moment/moment'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import DocumentActions from '@/components/DocumentActions'
import ColumnFilterDropdown from '@/components/ColumnFilterDropdown'
import utils from '@/mixins/utils'

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
  name: 'UserHistoryDocument',
  components: {
    DocumentThumbnail,
    DocumentActions,
    ColumnFilterDropdown
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
          serverOnly: true,
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
        let projects = param
        if (typeof param === 'string') {
          projects = param?.split(',') ?? []
        }
        return projects?.filter((p) => this.projects.includes(p)) ?? []
      },
      set(values) {
        const projects = values?.length > 0 ? values?.join(',') : null
        return this.updateParams({ projects })
      }
    },
    displayedFields() {
      return this.fields.filter((field) => (this.isServer ? true : !field.serverOnly))
    },
    documentPathRegexp() {
      const routes = this.$router.getRoutes()
      const { path } = find(routes, { name: 'document-standalone' }) || {}
      return pathToRegexp(path)
    }
  },
  mounted() {
    // No need to request starred docs once the state has already filled
    if (!this.$store.state.starred.documents.length) return this.$store.dispatch('starred/fetchIndicesStarredDocuments')
  },
  methods: {
    updateParams(queryParams) {
      const query = {
        ...this.$route.query,
        sort: sortKey[this.sortBy],
        desc: this.sortDesc,
        ...queryParams
      }

      const params = {
        name: 'document-history',
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
    humanReadableDate(date) {
      return moment(date).format('Y/MM/DD')
    },
    humanReadableTime(date) {
      return moment(date).format('HH:mm')
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
