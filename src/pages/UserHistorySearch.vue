<template>
  <div class="user-history">
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="events.length">
        <li v-for="event in events" :key="event.id" class="user-history__list__item">
          <router-link :to="{ path: event.uri }" class="p-2 d-block d-flex">
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
        </li>
      </ul>
      <div class="text-muted text-center" v-else>
        {{  $t('userHistory.empty') }}
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
  methods: {
    createFiltersFromURI (uri) {
      const filters = []
      const notUsed = ['from', 'size', 'sort', 'field']
      const fields = new URLSearchParams(uri)
      for (const obj of Array.from(fields.entries()).filter(entry => !notUsed.includes(entry[0]))) {
        const key = obj[0]
        let val = obj[1]
        if (key === 'f[creationDate]') {
          val = new Date(parseInt(val)).toISOString().replace(/T/, ' ').replace(/\..+/, '')
        }
        if (val === '') {
          val = '*'
        }
        filters.push({ name: key, label: val, value: val })
      }
      return filters
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

        &__query {
          color: $text-muted;
          width: 800px;
          min-width: 800px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
