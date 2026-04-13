<script setup>
import DismissableAlert from '@/components/Dismissable/DismissableAlert.vue'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler.vue'
import { computed } from 'vue'
import { VARIANT, variantOptions } from '@/enums/variants.js'
import { AppIcon } from '@icij/murmur-next'

const props = defineProps({
  path: { type: String, default: '' },
  variant: { type: String, default: 'info' },
  note: { type: String, default: '' },
  sensitive: { type: Boolean },
})
const variantObject = computed(() => variantOptions[props.variant] ?? variantOptions[VARIANT.INFO])
</script>

<template>
  <dismissable-content-warning-toggler
    v-if="sensitive"
    class="py-2 col-8 border rounded-1 mx-auto"
    :description="note"
  />
  <dismissable-alert
    v-else
    :variant="variant"
    no-close
    no-button
    class="col-8 mx-auto rounded-1"
  >
    <template #icon>
      <app-icon
        :name="variantObject.icon"
        class="me-1"
        :class="'text-'+props.variant"
      />
    </template>
    {{ note }}
  </dismissable-alert>

</template>
