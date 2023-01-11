<template>
  <div class="user-history">
    <div class="mt-4">
      <ul v-if="events.length" class="list-unstyled user-history__list card mb-4">
        <li v-for="event in searches" :key="event.id" class="user-history__list__item">
          <div class="user-history__list__item__delete float-right m-4">
            <confirm-button
              class="btn btn-outline-danger"
              placement="leftbottom"
              :confirmed="() => deleteUserEvent(event)"
              :label="$t('userHistory.confirmDelete')"
              :no="$t('global.no')"
              :yes="$t('global.yes')"
            >
              <fa icon="trash-alt" />
              {{ $t('userHistory.delete') }}
            </confirm-button>
          </div>
          <router-link :to="{ path: event.uri }" class="p-3 d-block">
            <div class="user-history__list__item__name font-weight-bold mb-1">
              {{ event.name }}
            </div>
            <div class="user-history__list__item__query">
              <applied-search-filters-item
                v-for="(filter, index) in filtersItems(event)"
                :key="index"
                read-only
                :filter="filter"
              />
            </div>
          </router-link>
        </li>
      </ul>
      <div v-else class="text-muted text-center">
        {{ $t('userHistory.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import AppliedSearchFiltersItem from '@/components/AppliedSearchFiltersItem'

export default {
  name: 'UserHistorySearch',
  components: {
    AppliedSearchFiltersItem
  },
  props: {
    events: {
      type: Array
    }
  },
  data() {
    return {
      searches: this.events
    }
  },
  methods: {
    filtersItems({ uri }) {
      return this.createFiltersFromURI(uri)
    },
    isIgnoredFilter({ name, value }) {
      const ignored = ['from', 'size', 'sort', 'field']
      return ignored.includes(name) || (name === 'q' && ['', '*'].includes(value))
    },
    createFiltersFromURI(uri) {
      const urlSearchParams = new URLSearchParams(uri.split('?').slice(1).pop())
      const params = Object.fromEntries(urlSearchParams.entries())
      // Reduce params list into an array
      return Object.keys(params).reduce((filters, name) => {
        let value = params[name]
        // Skip ignored param
        if (this.isIgnoredFilter({ name, value })) {
          return filters
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
        // Finally, add the filter to the list of displayed filters
        filters.push({ name, value, label: value })
        return filters
      }, [])
    },
    async deleteUserEvent(event) {
      try {
        await this.$core.api.deleteUserEvent(event.id)
        this.$root.$bvToast.toast(this.$t('userHistory.deleted'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('userHistory.notDeleted'), { noCloseButton: true, variant: 'warning' })
      } finally {
        const searches = this.searches.filter((e) => !(e === event))
        this.$set(this, 'searches', searches)
      }
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
