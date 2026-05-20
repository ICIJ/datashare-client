<script setup>
import { computed, markRaw } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import IPhPersonSimpleBike from '~icons/ph/person-simple-bike'
import IPhPersonSimpleRun from '~icons/ph/person-simple-run'
import IPhPersonSimpleWalk from '~icons/ph/person-simple-walk'
import IPhPersonSimpleHike from '~icons/ph/person-simple-hike'
import IPhPersonSimpleSwim from '~icons/ph/person-simple-swim'
import IPhPersonSimpleTaiChi from '~icons/ph/person-simple-tai-chi'
import IPhUserSquare from '~icons/ph/user-square'

import { usePolicies } from '@/composables/usePolicies.js'
import { ROLE } from '@/enums/roles.js'

const ROLE_ICON = {
  [ROLE.INSTANCE_ADMIN]: markRaw(IPhPersonSimpleBike),
  [ROLE.DOMAIN_ADMIN]:   markRaw(IPhPersonSimpleRun),
  [ROLE.PROJECT_ADMIN]:  markRaw(IPhPersonSimpleWalk),
  [ROLE.PROJECT_EDITOR]: markRaw(IPhPersonSimpleHike),
  [ROLE.PROJECT_MEMBER]: markRaw(IPhPersonSimpleSwim),
  [ROLE.PROJECT_VISITOR]: markRaw(IPhPersonSimpleTaiChi),
}

const ROLE_COLOR = {
  [ROLE.INSTANCE_ADMIN]: '#DC3545',
  [ROLE.DOMAIN_ADMIN]:   '#00BB84',
  [ROLE.PROJECT_ADMIN]:  '#FF6699',
  [ROLE.PROJECT_EDITOR]: '#FFB53E',
  [ROLE.PROJECT_MEMBER]: '#45C4FF',
  [ROLE.PROJECT_VISITOR]: '#6F6F6F',
}

const FALLBACK_ICON = markRaw(IPhUserSquare)

const props = defineProps({
  value: {
    type: String
  },
  noIcon: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: String,
    default: null
  }
})

const { formatRole } = usePolicies()
const { t } = useI18n()
const role = computed(() => formatRole(t, props.value))
const icon = computed(() => ROLE_ICON[props.value] ?? FALLBACK_ICON)
const iconStyle = computed(() => ({ color: ROLE_COLOR[props.value] ?? 'inherit' }))

defineExpose({ icon, iconStyle })
</script>

<template>
  <span class="display-role d-inline-flex gap-1">
    <app-icon
      v-if="!noIcon"
      :name="icon"
      :size="iconSize"
      :style="iconStyle"
    />
    {{ role }}
  </span>
</template>
