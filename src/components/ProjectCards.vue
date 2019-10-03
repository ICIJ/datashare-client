<template>
  <div class="project-cards container-fluid p-0">
    <div class="row">
      <div class="col-4 mb-4"  v-for="(index, i) in indices" :key="i">
        <router-link :to="{ name: 'search', query: { index, q: '*' } }" class="project-cards__item d-flex justify-content-start text-nowrap">
          <div class="project-cards__item__header py-2 px-3 bg-white text-secondary">
            <fa icon="book" />
          </div>
          <div class="project-cards__item__body py-2 px-3 font-weight-bold">
            {{ index.split('-').map(capitalize).join(' ') }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .project-cards {

    &__item {
      display: block;
      color: white;
      background: $primary;
      border: darken($primary, 10%) 1px solid;

      &:hover {
        background: darken($primary, 5);
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
