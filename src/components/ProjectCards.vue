<template>
  <div class="project-cards d-flex flex-wrap justify-content-start">
    <router-link :to="{ name: 'search', query: { index, q: '*' } }" class="project-cards__item d-flex" v-for="(index, i) in indices" :key="i">
      <div class="project-cards__item__header py-2 px-3 bg-white text-secondary">
        <fa icon="database" />
      </div>
      <div class="project-cards__item__body py-2 px-3 font-weight-bold">
        {{ index.split('-').map(capitalize).join(' ') }}
      </div>
    </router-link>
  </div>
</template>

<style lang="scss">
  .project-cards {
    margin-top: $spacer;
    margin-left: -$spacer;

    &__item {
      width: 100% / 3%;
      min-width: 200px;
      color: white;
      background: $primary;
      border: darken($primary, 10%) 1px solid;
      margin: 0 0 $spacer $spacer;

      &:hover {
          background: lighten($primary, 5);
          color: white;
      }
    }
  }
</style>

<script>
import capitalize from 'lodash/capitalize'

export default {
  data () {
    return {
      indices: []
    }
  },
  methods: { capitalize },
  created () {
    this.indices = this.$config.get('userIndices', [])
  }
}
</script>
