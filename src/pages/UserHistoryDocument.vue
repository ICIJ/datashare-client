<template>
  <div class="user-history">
    <div class="my-4">
      <b-table
        v-if="events.length"
        :items="events"
        :fields="displayedFields"
        :empty-text="$t('global.emptyTextTable')"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        striped
        hover
        responsive
        class="bg-white border-bottom m-0 user-history__list"
        thead-tr-class="text-nowrap"
        tbody-tr-class="user-history__list__item"
      >
        <template #cell(modificationDate)="{ item: { modificationDate } }">
          <span class="user-history__list__item__date font-weight-bold mr-2"
            >{{ humanReadableDate(modificationDate) }}
          </span>
          <span class="user-history__list__item__time d-inline-block">{{ humanReadableTime(modificationDate) }}</span>
        </template>
        <template #cell(name)="{ item: { name, uri } }">
          <router-link :to="{ path: uri }" class="user-history__list__item__link d-flex align-items-center"
            ><document-thumbnail
              :document="eventAsDocument({ uri })"
              size="30"
              crop
              lazy
              class="d-inline-flex user-history__list__item__preview mr-3"
            />
            {{ name }}
          </router-link>
          <document-actions
            class="d-flex"
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
          ></document-actions>
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
import DocumentActions from '@/components/DocumentActions.vue'
import utils from '@/mixins/utils'

/**
 * List user's visited documents history
 */

const LAST_VISITED = 'lastVisited'
const MODIFICATION_DATE = 'modificationDate'
const DOCUMENT_NAME = 'documentName'
const NAME = 'name'
const PROJECT = 'project'

const sortKey = {
  [LAST_VISITED]: MODIFICATION_DATE,
  [DOCUMENT_NAME]: NAME,
  [MODIFICATION_DATE]: LAST_VISITED,
  [NAME]: DOCUMENT_NAME,
  [PROJECT]: PROJECT
}
export default {
  name: 'UserHistoryDocument',
  components: {
    DocumentThumbnail,
    DocumentActions
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
          key: NAME,
          label: 'Document name',
          sortable: true,
          tdClass: 'd-flex align-items-center  justify-content-between pr-1'
        },
        {
          key: PROJECT,
          tdClass: 'align-middle ',
          label: 'Project',
          sortable: true,
          serverOnly: true
        },
        {
          key: MODIFICATION_DATE,
          label: 'Last visited',
          tdClass: 'align-middle  ',
          sortable: true,
          thStyle: 'width:11em;'
        }
      ]
    }
  },
  computed: {
    sortBy: {
      get() {
        const sortQuery = this.$route?.query?.sort
        const useDefaultSort = typeof sortQuery === 'undefined' || !sortKey[sortQuery]
        const sortBy = useDefaultSort ? MODIFICATION_DATE : sortKey[sortQuery]
        return sortBy
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
          if (typeof descQuery === 'string') {
            return descQuery === 'true'
          }
          return descQuery
        }
        return useDefault
      },
      set(sortDesc) {
        this.updateParams({ desc: sortDesc })
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
      const query = { ...this.$route.query, sort: sortKey[this.sortBy], desc: this.sortDesc, ...queryParams }

      const params = { name: 'document-history', query }
      this.$router.push(params)
    },
    eventAsDocument({ uri }) {
      // Ensure the URI starts with a / and doesn't contain query params
      const path = `/${trimStart(uri.split('?').shift(0), '/')}`
      const [, _index, _id, _routing] = this.documentPathRegexp.exec(path) || []
      return new Document({ _index, _id, _routing })
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
    }
  }
}
</style>
