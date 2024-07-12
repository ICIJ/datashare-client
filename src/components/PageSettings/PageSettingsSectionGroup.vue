<template>

  <b-form-group class="page-settings-group">
    <template #label>
      <div class="page-settings-group__label d-flex"
           aria-controls="page-settings-group-collapse"
           :aria-expanded="open ? 'true' : 'false'"
           @click="toggleSection"><phosphor-icon class="d-inline-flex me-2" :name="caretIcon" />{{label}}</div>
    </template>
    <b-collapse id="page-settings-group-collapse" v-model="open" >
      <slot v-bind="{open}"></slot>
    </b-collapse>
  </b-form-group>
</template>

<script setup>
import {computed, ref} from "vue";
import {PhosphorIcon} from "@icij/murmur-next";
defineOptions({
  name:"PageSettingsSectionGroup"
})

const props = defineProps({
  label: {
    type: String,
    default: 'Settings'
  },
  open:{
    type:Boolean,
    default:true
  }
})
const open = defineModel({
  type:Boolean,
  default:true
})

const caretIcon = computed(()=> open.value?'caret-up':'caret-down')

function toggleSection(){
  open.value = !open.value
}

</script>
<style lang="scss">
.page-settings-group{
  &__label {
    cursor: pointer;
  }
}
</style>

