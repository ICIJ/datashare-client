<template>
  <b-td class="page-table-td-actions">
    <div class="d-flex">
      <slot />
    </div>
  </b-td>
</template>

<style lang="scss">
.page-table-td-actions > * {
  visibility: hidden;
}

.page-table-tr--active > .page-table-td-actions > *,
.page-table-tr:hover > .page-table-td-actions > * {
  visibility: visible;
}
</style>
