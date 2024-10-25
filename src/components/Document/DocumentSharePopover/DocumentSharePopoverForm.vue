<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AdvancedLinkForm } from '@icij/murmur-next'

const { document } = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  }
})

const router = useRouter()

const link = computed(() => {
  const route = router.resolve({ name: 'document-standalone', params: document.routerParams })
  const { protocol, host, pathname } = window.location
  return [protocol, '//', host, pathname, route.href].join('')
})
</script>

<template>
  <advanced-link-form no-fade :title="document.title" variant="action" :value="1" :link="link" />
</template>

<style lang="scss" scoped>
.advanced-link-form {
  &:deep(p) {
    font-size: $font-size-sm;
  }

  &:deep(.nav-tabs) {
    --bs-nav-link-color: var(--bs-secondary-text-emphasis);
    --bs-nav-tabs-link-active-color: var(--bs-body-color);
    --bs-nav-tabs-link-active-bg: transparent;
    --bs-nav-tabs-link-active-border-color: var(--bs-primary);
    --bs-nav-link-padding-y: 10px;
    --bs-nav-link-padding-x: 0.5rem;
    --bs-nav-link-hover-color: var(--bs-body-color);
    --bs-nav-tabs-link-hover-border-color: var(--bs-primary);

    gap: 1rem;

    .nav-link {
      border-bottom: 2px solid transparent;

      &.active,
      &:hover {
        border-bottom-color: var(--bs-primary);
      }

      &.active {
        font-weight: 500;
      }
    }
  }
}
</style>
