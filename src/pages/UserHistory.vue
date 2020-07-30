<template>
  <div class="user-history">
    <page-header icon="clock" :title="$t('userHistory.heading')" :description="documents.length ? $t('userHistory.description') : $t('userHistory.empty')">
      <confirm-button class="btn btn-primary" :confirmed="clear" v-if="documents.length">
        <fa icon="trash-alt" class="mr-1" />
        {{ $t('userHistory.clear') }}
      </confirm-button>
    </page-header>
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="documents.length">
        <li v-for="(document, i) in documents" :key="i" class="user-history__list__item">
          <router-link :to="{ name: 'document', params: document.routerParams }" class="p-2 d-block d-flex">
            <document-thumbnail :document="document" size="40" crop lazy class="mr-2 user-history__list__item__preview" />
            <div>
              <div class="font-weight-bold">
                <document-sliced-name :document="document" />
              </div>
              <div class="user-history__list__item__location ml-auto small">
                <fa icon="folder" class="mr-1" />
                {{ document.location }}
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import reverse from 'lodash/reverse'
import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import PageHeader from '@/components/PageHeader'

export default {
  components: {
    DocumentSlicedName,
    DocumentThumbnail,
    PageHeader
  },
  computed: {
    documents () {
      return reverse(this.$store.getters['userHistory/getDocuments']().slice(-100))
    }
  },
  methods: {
    clear () {
      this.$store.commit('userHistory/clear')
    }
  }
}
</script>

<style lang="scss">
  .user-history {
    background: $body-bg;
    color: $body-color;
    overflow: auto;
    position: relative;

    &__header {
      z-index: 100;
      background: inherit;
      position: sticky;
      top:0;
    }

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

        &__location {
          color: $text-muted;
        }

        & &__preview.document-thumbnail--crop {
          width: 40px;
          min-width: 40px;
          height: 40px;
        }
      }
    }
  }
</style>
