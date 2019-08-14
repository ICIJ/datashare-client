<template>
  <div class="route-docs-links p-3">
    <div class="card">
      <h6 class="card-header">
        User guides
      </h6>
      <div class="list-group list-group-flush small">
        <router-link :to="{ name: 'docs', params: meta }" v-for="meta in validRouteDocsMeta" class="list-group-item list-group-item-action route-docs-links__item" v-bind:key="meta.resourcePath">
          <fa icon="book" class="mr-2" />
          {{ meta.title }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import docs from '@/mixins/docs'

export default {
  name: 'RouteDocsLinks',
  mixins: [ docs ]
}
</script>

<style lang="scss">
  .route-docs-links {
    width: $app-context-sidebar-width;

    &__item.router-link-active,
    &__item.router-link-active:hover,
    &__item.router-link-active:focus {
      color: $component-active-color;
      background: $component-active-bg;
    }
  }
</style>
