<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  hideLabel: {
    type: Boolean
  }
})
</script>

<template>
  <button-icon icon-left="star" :label="$t('searchResultsActions.star')" :hide-label="hideLabel" hide-tooltip />
</template>
