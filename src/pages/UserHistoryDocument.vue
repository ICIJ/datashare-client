<template>
  <div class="user-history">
    <div class="mt-4">
      <b-table
        v-if="events.length"
        :items="events"
        :fields="fields"
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
          <span class="user-history__list__item__date font-weight-bold"
            >{{ humanReadableDate(modificationDate) }}
          </span>
          <span class="user-history__list__item__time d-inline-block" style="width: 3em">{{
            humanReadableTime(modificationDate)
          }}</span>
        </template>
        <template #cell(name)="{ item: { name, uri, id } }">
          <router-link :to="{ path: uri }" class="user-history__list__item__link d-flex align-items-center"
            ><document-thumbnail
              :document="eventAsDocument({ uri })"
              size="30"
              crop
              lazy
              class="user-history__list__item__preview mr-3"
            />
            {{ name }}
          </router-link>
          <router-link-popup :to="{ path: uri }" class="user-history__list__item__external-link ml-2">
            <fa :id="`external-link-${id}`" icon="external-link-alt" fixed-width style="padding-top: 1px" />
          </router-link-popup>
          <haptic-copy :text="baseUrl + uri"
            ><fa :id="`copy-link-${id}`" icon="clipboard" fixed-width class="p-0"
          /></haptic-copy>
          <b-tooltip :target="`copy-link-${id}`"> Copy link </b-tooltip>
          <b-tooltip :target="`external-link-${id}`">
            {{ $t('document.externalWindow') }}
          </b-tooltip>
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
import RouterLinkPopup from '@/components/RouterLinkPopup.vue'
import settings from '@/utils/settings'

/**
 * List user's visited documents history
 */

const LAST_VISITED = 'lastVisited'
const MODIFICATION_DATE = 'modificationDate'
const DOCUMENT_NAME = 'documentName'
const NAME = 'name'

const sortKey = {
  [LAST_VISITED]: MODIFICATION_DATE,
  [DOCUMENT_NAME]: NAME,
  [MODIFICATION_DATE]: LAST_VISITED,
  [NAME]: DOCUMENT_NAME
}
export default {
  name: 'UserHistoryDocument',
  components: {
    DocumentThumbnail,
    RouterLinkPopup
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
          tdClass: 'align-middle text-right ',
          sortable: true,
          thStyle: 'width:11em;'
        },
        {
          key: NAME,
          label: 'Document name',
          sortable: true,
          tdClass: 'd-flex align-items-center pr-1'
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
        return typeof descQuery === 'undefined' ? true : Boolean(descQuery)
      },
      set(sortDesc) {
        this.updateParams({ desc: sortDesc })
      }
    },
    documentPathRegexp() {
      const routes = this.$router.getRoutes()
      const { path } = find(routes, { name: 'document-standalone' }) || {}
      return pathToRegexp(path)
    },
    baseUrl() {
      return `${window.location.origin}/#`
    }
  },
  methods: {
    updateParams(queryParams) {
      const page = this.$route.query?.page ?? 1
      const size = this.$route.query?.perPage ?? settings.userHistory.size
      const from = this.$route.query?.from ?? (page - 1) * size
      const query = { page, from, size, sort: sortKey[this.sortBy], desc: this.sortDesc, ...queryParams }

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
      return moment(date).format('HH:MM')
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
