<template>
  <div class="batch-search h-100">
    <div class="row no-gutters">
      <div class="col batch-search__form">
        <batch-search-form />
      </div>
      <div class="batch-search__items col">
        <div class="batch-search__items__explaination">
          <div class="container">
            <h3>
              {{ $t('batchSearch.title') }}
            </h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </div>
        <b-table striped hover responsive :fields="fields" :items="items" thead-tr-class="text-nowrap" tbody-tr-class="batch-search__items__item">
          <template #name="row">
            <router-link :to="{ name: 'batch-search.results', params: { index: row.item.project.id, uuid: row.item.uuid } }" class="batch-search__items__item__link">
              {{ row.item.name }}
            </router-link>
          </template>
          <template #queries="row">
            {{ row.item.queries.length }} queries
          </template>
          <template #state="row">
            {{ capitalize(row.item.state) }}
          </template>
          <template #date="row">
            {{ moment(row.item.date).format('LLL') }}
          </template>
        </b-table>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import capitalize from 'lodash/capitalize'

import utils from '@/mixins/utils'
import BatchSearchForm from './BatchSearchForm'

export default {
  name: 'BatchSearches',
  mixins: [ utils ],
  components: { BatchSearchForm },
  data () {
    return {
      fields: [
        {
          key: 'project.name',
          label: this.$t('batchSearch.projectName'),
          sortable: true
        },
        {
          key: 'name',
          label: this.$t('batchSearch.searchName')
        },
        {
          key: 'description',
          label: this.$t('batchSearch.description'),
          sortable: false
        },
        {
          key: 'queries',
          label: this.$t('batchSearch.queries'),
          sortable: false
        },
        {
          key: 'state',
          label: this.$t('batchSearch.state'),
          sortable: true
        },
        {
          key: 'date',
          label: this.$t('batchSearch.date'),
          sortable: true
        }
      ]
    }
  },
  computed: {
    ...mapState('batchSearch', { items: 'batchSearches' })
  },
  created () {
    return this.$store.dispatch('batchSearch/getBatchSearches')
  },
  methods: {
    moment,
    capitalize
  }
}
</script>

<style lang="scss">
  .batch-search {

    .row {
      min-height: calc(100vh - var(--app-nav-height) - var(--app-footer-height));
      margin: 0;
    }

     & &__form {
       min-width: 1;
       flex:0 0 440px;

       .card {
         border: 2px solid $tertiary;
         box-shadow: 0 0 10px 0 rgba($dark, .2);
       }
    }

    &__items {
      position: relative;
      margin-top: $spacer;
      border-radius: $card-border-radius 0 0 0;
      background: white;
      overflow: hidden;

      &__explaination {
        padding: $spacer * 3 0;
      }

      .batch-search-results {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        overflow: auto;
        max-width: 660px;
        background: white;
        padding: $spacer 0;
        border-radius: $card-border-radius 0 0 0;
        box-shadow: 0 0 10px 0 rgba($dark, .2);
      }
    }
  }
</style>
