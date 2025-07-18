<template>
  <b-table-simple small class="table-editable">
    <b-thead>
      <b-tr>
        <b-th>#</b-th>
        <b-th><span class="mx-3">Query</span></b-th>
        <b-th></b-th>
      </b-tr>
    </b-thead>

    <b-tbody class="overflow-y-auto h-auto">
      <b-tr v-for="(item, index) in items" :key="index" class="">
        <b-td class="table-editable__index text">{{ index + 1 }}</b-td>
        <b-td>
          <row-editable
            v-model:focused="item.focused"
            :model-value="item.name"
            @keyup.up="focusPreviousItem(index)"
            @keyup.down="focusNextItem(index)"
            @update:model-value="updateCellValue(index, $event)"
            @keydown.enter="onEnter($event, index)"
            @keydown.tab.exact="addItem(index)"
            @focusout.prevent="addItem(index)"
          />
        </b-td>
        <b-td class="table-editable__action">
          <button-icon
            v-if="item.name?.length > 0"
            icon-left="trash"
            variant="outline-secondary"
            square
            hide-label
            size="sm"
            @click="removeItem(index)"
            @keydown.tab.exact.prevent="focusNextItem(index)"
            @keydown.enter.prevent="removeItem(index)"
            @keydown.tab.shift.exact.prevent="focusCurrentItem(index)"
          />
        </b-td>
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script setup>
import { reactive } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

import RowEditable from './RowEditable.vue'

const items = defineModel('items', {
  type: Array,
  default: () => reactive([{ name: '', focused: false }])
})
defineProps({
  maxHeight: {
    type: Number,
    default: 150
  }
})

function onEnter(_, index) {
  if (!items.value[index].name) {
    return
  }
  addItem(index)
  focusNextItem(index)
}

function focusPreviousItem(index) {
  if (items.value.length === index || index < 1) {
    return
  }
  items.value[index - 1].focused = true
}
function focusNextItem(index) {
  if (items.value.length - 1 === index) {
    return
  }
  items.value[index + 1].focused = true
}
function focusCurrentItem(index) {
  items.value[index].focused = true
}
const addItem = (index) => {
  if (index === items.value.length - 1 && items.value[index]?.name.length) {
    items.value.push({ name: '' })
  }
}

const removeItem = (index) => {
  items.value.splice(index, 1)
}

function updateCellValue(index, val) {
  items.value[index].name = val
}
</script>
<style scoped lang="scss">
.table-editable {
  &__index,
  &__action {
    width: 50px;
    vertical-align: middle;
  }
}
</style>
