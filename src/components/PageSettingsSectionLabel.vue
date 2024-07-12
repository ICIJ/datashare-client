<template>
  <b-form-group ref="form-group">
    <template #label>
      <div class="d-flex justify-content-between">{{label}}<phosphor-icon class="d-inline-flex" :name="caretIcon" @click="toggleSection"/></div>
    </template>
    <slot v-bind="{open}"></slot>
  </b-form-group>
</template>

<script setup>
import {computed, ref} from "vue";
import {PhosphorIcon} from "@icij/murmur-next";
import PageSettingsEntry from "@/components/PageSettingsEntry.vue";
import {BFormCheckbox, BFormCheckboxGroup, BFormRadio, BFormRadioGroup} from "bootstrap-vue-next";
import PageSettingsSection from "@/components/PageSettingsSection.vue";
defineOptions({
  name:"PageSettingsSectionLabel"
})

const props = defineProps({
  label: {
    type: String,
    default: 'Settings'
  },
  show:{
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

