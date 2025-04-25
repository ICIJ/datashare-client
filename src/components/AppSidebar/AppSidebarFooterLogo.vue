<script setup>
import { computed } from 'vue'

import AppSidebarFooterLogoVersion from '@/components/AppSidebar/AppSidebarFooterLogoVersion'

const { compact } = defineProps({
  compact: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-footer-logo--compact': compact
  }
})
</script>

<template>
  <div class="app-sidebar-footer-logo" :class="classList">
    <img src="@/assets/images/logo-color-symbol.svg" alt="Datashare" class="img-fluid" />
    <app-sidebar-footer-logo-version>
      <slot name="version" v-bind="{ compact }" />
    </app-sidebar-footer-logo-version>
  </div>
</template>

<style lang="scss" scoped>
.app-sidebar-footer-logo {
  display: flex;
  flex-direction: row;
  gap: $spacer-xs;
  padding-left: $spacer-xxs;
  align-items: center;

  img {
    height: 1.5rem;
  }

  &--compact {
    flex-direction: column;
    gap: $spacer;
    padding-left: 0;
  }
}
</style>
