<template>
  <div class="user-history">
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="events.length">
        <li v-for="event in searches" :key="event.id" class="user-history__list__item">
          <div class="user-history__list__item__delete float-right m-4">
            <confirm-button
                class="btn btn-outline-danger"
                placement="leftbottom"
                :confirmed="() => deleteUserEvent(event)"
                :label="$t('userHistory.confirmDelete')"
                :no="$t('global.no')"
                :yes="$t('global.yes')">
                <fa icon="trash-alt" />
                {{ $t('userHistory.delete') }}
            </confirm-button>
          </div>
          <router-link :to="{ path: event.uri }" class="p-3 d-block">
            <div class="user-history__list__item__name font-weight-bold">
              {{ event.name }}
            </div>
            <div class="user-history__list__item__query ">
              <applied-search-filters-item v-for="(filter, index) in filtersItems(event)"
                                           read-only
                                          :key="index"
                                          :filter="filter" />
            </div>
          </router-link>
        </li>
      </ul>
      <div class="text-muted text-center" v-else>
        {{  $t('userHistory.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import Api from '@/api'
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
  data () {
    return {
      searches: this.events
    }
  },
  computed: {
    api () {
      return new Api()
    }
  },
  methods: {
    filtersItems (event) {
      const items = this.createFiltersFromURI(event.uri)
      return items
    },
    createFiltersFromURI (uri) {
      const filters = []
      const notUsed = ['from', 'size', 'sort', 'field']
      const fields = new URLSearchParams(uri)
      for (const obj of Array.from(fields.entries()).filter(entry => !notUsed.includes(entry[0]))) {
        const key = obj[0]
        let val = obj[1]
        if (key.includes('Date')) {
          val = new Date(parseInt(val)).toISOString().substr(0, 10).replace(/T/, ' ').replace(/\..+/, '')
        }
        if (val === '') {
          val = '*'
        }
        filters.push({ name: key, label: val, value: val })
      }
      return filters
    },
    async deleteUserEvent (event) {
      try {
        await this.api.deleteUserEvent(event.id)
        this.$root.$bvToast.toast(this.$t('userHistory.deleted'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('userHistory.notDeleted'), { noCloseButton: true, variant: 'warning' })
      } finally {
        const searches = this.searches.filter(e => !(e === event))
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
      }
    }
  }
</style>
