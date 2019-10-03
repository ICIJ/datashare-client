<template>
  <div class="route-docs-links p-3">
    <h4 class="text-light py-1">
      User guides
    </h4>
    <div class="card">
      <div class="list-group list-group-flush small">
        <div v-for="meta in validRouteDocsMeta" v-bind:key="meta.resourcePath" class="route-docs-links__item" :class="{ 'route-docs-links__item--active': isActive(meta) }">
          <router-link :to="{ name: 'docs', params: meta }" class="list-group-item list-group-item-action route-docs-links__item__link">
            <fa icon="book" class="mr-2" />
            {{ meta.title }}
          </router-link>
          <slide-up-down :active="!!meta.headings.length && isActive(meta)">
            <ul class="list-unstyled route-docs-links__item__outline">
              <li v-for="(heading, index) in meta.headings" v-bind:key="index">
                <a href="#" v-scroll-to="`#${heading.id}`" class="route-docs-links__item__outline__heading" :class="{ 'route-docs-links__item__outline__heading--last': index === meta.headings.length -1}">
                  <div class="text-truncate" v-html="heading.text">
                  </div>
                </a>
              </li>
            </ul>
          </slide-up-down>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import docs from '@/mixins/docs'

export default {
  name: 'RouteDocsLinks',
  mixins: [ docs ],
  methods: {
    isActive (meta = null) {
      return meta && get(this, '$route.params.slug', null) === meta.slug
    }
  }
}
</script>

<style lang="scss">
  .route-docs-links {
    width: 100%;

    &__item {
      padding-bottom: 0;

      &__link.router-link-active,
      &__link.router-link-active:hover,
      &__link.router-link-active:focus,
      &__outline {
        color: $component-active-color;
        background: $component-active-bg;
        border: 0;
        outline: none;
      }

      &__link {
        z-index: 50;
        position: relative;
      }

      &__outline {
        margin: 0;
        z-index: 100;
        position: relative;
        padding-bottom: $list-group-item-padding-y;

        &__heading {
          padding: $list-group-item-padding-y * 0.2 $list-group-item-padding-x * 0.2;
          margin-left: calc(#{$list-group-item-padding-x} + 1.2rem);
          margin-right: $list-group-item-padding-x;
          position: relative;
          display: block;

          &, &:hover {
            color: inherit;
            text-decoration: none;
          }

          &:before {
            content: "├─";
            font-family: $font-family-monospace;
            font-size: 1.5rem;
            position: absolute;
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            width: $list-group-item-padding-x;
            overflow: hidden;
            height: 1.5rem;
            line-height: 1.5rem;
            color: mix($component-active-color, $component-active-bg)
          }

          &--last:before {
            content: "└─"
          }
        }
      }
    }
  }
</style>
