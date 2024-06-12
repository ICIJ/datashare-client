<template>
  <div class="user-history-saved-search-list">
    <div class="mt-4">
      <ul v-if="events.length" class="list-unstyled user-history-saved-search-list__list card mb-4">
        <li
          v-for="(event, eventIdx) in searches"
          :key="event.id"
          class="user-history-saved-search-list__list__item d-inline-flex justify-content-between"
        >
          <router-link :to="{ path: event.uri }" class="p-3 flex-grow-1 d-block">
            <span class="user-history-saved-search-list__list__item__name fw-bold mb-1">
              {{ event.name }}
            </span>
            <div class="user-history-saved-search-list__list__item__query">
              <applied-search-filters-item
                v-for="(filter, index) in filtersItems(event)"
                :key="index"
                read-only
                :filter="filter"
              />
            </div>
          </router-link>
          <div
            class="d-flex justify-content-between align-items-end align-items-md-center d-flex flex-column flex-md-row m-3"
          >
            <span class="user-history-saved-search-list__list__item__date text-muted text-nowrap me-3">
              <span class="fw-bold me-2">
                {{ getDate(event.creationDate) }}
              </span>
              {{ getTime(event.creationDate) }}
            </span>
            <div class="user-history-saved-search-list__list__item__actions mx-3">
              <b-button
                class="user-history-saved-search-list__list__item__actions__rename me-1"
                size="md"
                variant="outline-primary"
                @click.prevent="openRenameModal({ ...event, idx: eventIdx })"
              >
                <fa icon="pen" fixed-width size="1x" />
                {{ $t('userHistory.renameSavedSearchShort') }}
              </b-button>
              <confirm-button
                class="btn btn-outline-danger text-nowrap"
                placement="top"
                :confirmed="() => deleteUserEvent(event)"
                :label="$t('userHistory.confirmDelete')"
                :no="$t('global.no')"
                :yes="$t('global.yes')"
              >
                <fa icon="trash-can" />
                {{ $t('userHistory.delete') }}
              </confirm-button>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="text-muted text-center">
        {{ $t('userHistory.empty') }}
      </div>
    </div>
    <keep-alive>
      <b-modal
        ref="user-history-save-search-form"
        v-model="showRenameModal"
        body-class="p-0"
        hide-footer
        lazy
        size="md"
        :title="$t('userHistory.renameSavedSearch')"
      >
        <user-history-save-search-form
          :event="currentEvent"
          @submit:rename="updateEvent"
          @submit="showRenameModal = false"
        />
      </b-modal>
    </keep-alive>
  </div>
</template>

<script>
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'
import UserHistorySaveSearchForm from '@/components/UserHistorySaveSearchForm'
import { humanTime } from '@/utils/humanTime'
import { humanDate } from '@/utils/humanDate'

export default {
  name: 'UserHistorySavedSearchList',
  components: {
    AppliedSearchFiltersItem,
    UserHistorySaveSearchForm
  },
  filters: {
    humanDate,
    humanTime
  },
  props: {
    events: {
      type: Array
    }
  },
  data() {
    return {
      showRenameModal: false,
      searches: this.events,
      currentEvent: null
    }
  },
  watch: {
    events(events) {
      this.searches = events
    }
  },
  methods: {
    getDate(date) {
      return humanDate(date, this.$i18n.locale)
    },
    getTime(time) {
      return humanTime(time, this.$i18n.locale)
    },
    filtersItems({ uri }) {
      return this.createFiltersFromURI(uri)
    },
    isIgnoredFilter({ name, value }) {
      const ignored = ['from', 'size', 'sort', 'field']
      return ignored.includes(name) || (name === 'q' && ['', '*'].includes(value))
    },
    createFiltersFromURI(uri) {
      const urlSearchParams = new URLSearchParams(uri.split('?').slice(1).pop())
      const filters = []
      for (let [name, value] of urlSearchParams.entries()) {
        if (this.isIgnoredFilter({ name, value })) {
          continue
        }
        // Filter value is a Date
        if (name.includes('Date')) {
          const ts = parseInt(value)
          value = new Date(ts).toISOString().substr(0, 10).replace(/T/, ' ').replace(/\..+/, '')
        }
        // Change 'indices' key to 'projects'
        if (name.includes('indices')) {
          name = 'projects'
        }
        const negation = name.startsWith('f[-')
        filters.push({ name, value, label: value, negation })
      }
      return filters
    },
    async deleteUserEvent(event) {
      try {
        await this.$core.api.deleteUserHistoryEvent(event.id)
        this.$bvToast.toast(this.$t('userHistory.deleted'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('userHistory.deleteError'), { noCloseButton: true, variant: 'danger' })
      } finally {
        const searches = this.searches.filter((e) => !(e === event))
        this.searches = searches
      }
    },
    openRenameModal(event) {
      this.currentEvent = event
      this.showRenameModal = true
    },
    updateEvent({ event }) {
      this.searches[this.currentEvent.idx] = { ...this.currentEvent, name: event.name }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-history-saved-search-list {
  &__list {
    &__item {
      &__name--rename {
        vertical-align: bottom;
      }
      a:hover {
        text-decoration: none;
        color: $table-hover-color;
        background-color: $table-hover-bg;
      }

      &:nth-child(odd) {
        background: $table-accent-bg;
      }

      &:not(:last-of-type) {
        border-bottom: 1px solid $border-color;
      }
    }
  }
}
</style>
