<template>
  <div class="user-history">
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="events.length">
        <li v-for="event in searches" :key="event.id" class="user-history__list__item d-flex">
          <router-link :to="{ path: event.uri }" class="p-2 d-block d-flex col-md-11">
            <div>
              <div class="user-history__list__item__name font-weight-bold">
                {{ event.name }}
              </div>
              <div class="user-history__list__item__query ">
                <applied-search-filters-item v-for="(filter, index) in createFiltersFromURI(event.uri)" :key="index"
                  :filter="filter" :isReadOnly="true"></applied-search-filters-item>
              </div>
            </div>
          </router-link>
          <confirm-button class="user-history__list__item--delete btn btn-light ml-2 col-md-1"
              v-b-tooltip.hover
              :confirmed="() => deleteUserEvent(event)"
              :label="$t('userHistory.delete')"
              :no="$t('global.no')"
              :yes="$t('global.yes')"
              :title="$t('userHistory.delete')">
              <fa icon="trash-alt" />
              <span class="sr-only">
                {{ $t('userHistory.delete') }}
              </span>
          </confirm-button>
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

<style lang="scss">
  .user-history {
    &__list {

      &__item {

        &:nth-child(odd) {
          background: rgba(black, .05)
        }

        a:hover {
          text-decoration: none;
          background: $secondary;
          color: white;
        }
      }
    }
  }
</style>
