# TreeBreadcrumb

> A clickable path breadcrumb.

## Props

| Prop name      | Description                                                                          | Type                  | Values | Default  |
| -------------- | ------------------------------------------------------------------------------------ | --------------------- | ------ | -------- |
| v-model        | Path to use in the breadcrumb.                                                       | string                | -      |          |
| maxDirectories | Maximum number of directories to display (truncate from the begining using ellipsis) | number                | -      | 5        |
| noDatadir      | Hide Datashare's root data directory from the breadcrumb.                            | boolean               | -      |          |
| datadirIcon    | Data directory icon                                                                  | string\|object\|array | -      | 'folder' |

## Events

| Event name | Type | Description |
| ---------- | ---- | ----------- |
| input      |      |
