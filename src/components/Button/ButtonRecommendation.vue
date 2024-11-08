<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import DisplayUser from '@/components/Display/DisplayUser'

defineProps({
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <button-icon class="button-recommendation" variant="outline-secondary" :label="label">
    <display-user :value="label" avatar-height="1em" />
  </button-icon>
</template>

<style lang="scss" scoped>
.button-recommendation {
  --bs-btn-color: var(--bs-link-color);
  --bs-btn-border-color: var(--bs-btn-active-border-color);

  cursor: default;
  border-style: dashed;
}
</style>
