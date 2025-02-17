<template>
  <div class="batch-search-results-details card">
    <div class="card-body d-flex align-items-center">
      <h5 class="m-0 flex-grow-1">{{ batchSearch.name }}</h5>
      <batch-search-actions :batch-search="batchSearch" />
    </div>
    <div class="card-footer p-0 overflow-hidden">
      <p v-if="hasDescription" class="batch-search-results-details__info__description m-0 p-3 border-bottom">
        {{ batchSearch.description }}
      </p>
      <dl class="batch-search-results-details__info">
        <div v-if="showProjects">
          <dt>{{ $t('batchSearch.projects') }}</dt>
          <dd class="batch-search-results-details__info__projects">
            <span
              v-for="name in batchSearch.projects"
              :key="name"
              class="batch-search-results-details__info__projects__link"
            >
              <project-link :project="name" class="btn btn-sm btn-light p-1 me-1 mb-1" />
            </span>
          </dd>
        </div>
        <div v-if="isServer && isMyBatchSearch" class="batch-search-results-details__info__published">
          <dt>{{ $t('batchSearch.published') }}</dt>
          <dd><b-form-checkbox :checked="batchSearch.published" switch @change="changePublished" /></dd>
        </div>
        <div>
          <dt>{{ $t('batchSearch.state') }}</dt>
          <dd>
            <batch-search-status :batch-search="batchSearch" />
          </dd>
        </div>
        <div>
          <dt>{{ $t('batchSearch.date') }}</dt>
          <dd>{{ localeLongDate(batchSearch.date) }}</dd>
        </div>
        <div>
          <dt>{{ $t('batchSearch.nbResults') }}</dt>
          <dd :title="batchSearch.nbResults">{{ humanNumber(batchSearch.nbResults) }}</dd>
        </div>
        <div>
          <dt>{{ $t('batchSearch.queries') }}</dt>
          <dd :title="batchSearch.nbQueries">{{ humanNumber(batchSearch.nbQueries) }}</dd>
        </div>
        <div v-if="batchSearch.phraseMatches">
          <dt>{{ $t('batchSearch.phraseMatch') }}</dt>
          <dd>{{ $t('global.yes') }}</dd>
        </div>
        <div v-if="batchSearch.fuzziness > 0">
          <dt>{{ fuzzinessLabel }}</dt>
          <dd>{{ batchSearch.fuzziness }}</dd>
        </div>
        <div v-if="batchSearch.fileTypes.length">
          <dt>
            {{ $t('batchSearch.fileTypes') }}
          </dt>
          <dd>
            <ul class="list-unstyled list-group list-group-horizontal mt-1">
              <li v-for="fileType in batchSearch.fileTypes" :key="fileType" class="me-2">
                <content-type-badge :value="fileType" />
              </li>
            </ul>
          </dd>
        </div>
        <div v-if="batchSearch.paths.length">
          <dt>
            {{ $t('batchSearch.path') }}
          </dt>
          <dd>
            <ul class="list-unstyled list-group list-group-horizontal">
              <li v-for="path in batchSearch.paths" :key="path" class="me-2">
                <b-badge variant="dark">
                  {{ path }}
                </b-badge>
              </li>
            </ul>
          </dd>
        </div>
        <div v-if="isServer">
          <dt>
            {{ $t('batchSearch.author') }}
          </dt>
          <dd>
            <user-display :username="batchSearch.user.id" />
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

import BatchSearchActions from '@/components/BatchSearchActions'
import BatchSearchStatus from '@/components/BatchSearchStatus'
import ContentTypeBadge from '@/components/ContentTypeBadge'
import UserDisplay from '@/components/UserDisplay'
import ProjectLink from '@/components/ProjectLink'
import humanNumber from '@/utils/humanNumber'
import { humanLongDate } from '@/utils/humanDate'
import utils from '@/mixins/utils'

/**
 * This page will list all the results of a batch search.
 */
export default {
  name: 'BatchSearchResultsDetails',
  components: {
    BatchSearchActions,
    ContentTypeBadge,
    ProjectLink,
    BatchSearchStatus,
    UserDisplay
  },
  mixins: [utils],
  props: {
    batchSearch: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      documentInModalPageIndex: null,
      isMyBatchSearch: false,
      queries: []
    }
  },
  computed: {
    showProjects() {
      return this.isServer || this.$core.projects.length > 1
    },
    hasDescription() {
      return this.batchSearch?.description?.trim().length > 0
    },
    fuzzinessLabel() {
      if (this.batchSearch.phraseMatches) {
        return this.$t('batchSearch.proximitySearches')
      }
      return this.$t('batchSearch.fuzziness')
    }
  },
  created() {
    this.setIsMyBatchSearch()
  },
  methods: {
    humanNumber,
    async setIsMyBatchSearch() {
      const username = await this.$core.auth.getUsername()
      this.isMyBatchSearch = username === get(this, 'batchSearch.user.id')
    },
    changePublished(published) {
      this.$emit('update:published', published)
    },
    localeLongDate(date) {
      return humanLongDate(date, this.$i18n.locale)
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-search-results-details {
  &__info {
    display: grid;
    overflow: hidden;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 0px;
    margin: 0 -1px -1px;
    border-left: 1px solid $border-color;

    & > div {
      padding: $spacer $spacer $spacer;
      border: 1px solid $border-color;
      border-left: 0;
      border-top: 0;

      dt {
        text-overflow: ellipsis;
        font-weight: normal;
        color: $text-muted;
      }

      dd {
        font-size: 1rem;
        font-weight: bolder;
      }
    }
  }

  &__queries {
    &:deep(.table-responsive) {
      margin: 0;
    }

    &:deep(table) {
      margin: 0;

      thead tr {
        border-top: 0;

        th {
          border-top: 0;
          white-space: nowrap;

          &[aria-sort]:hover {
            background-color: $lighter;
          }
        }
      }
    }

    &__query__link {
      &:visited {
        color: mix(#609, white, 50%);
      }

      &__path {
        display: block;
        max-width: 30vw;
      }
    }
  }
}
</style>
