# FilterPathTreeNode

> A child of the FilterPathTree component to display a node.

## Props

| Prop name       | Description       | Type    | Values | Default |
| --------------- | ----------------- | ------- | ------ | ------- |
| filter          | Filter definition | object  | -      |         |
| hideHeader      |                   | boolean | -      | false   |
| hideSearch      |                   | boolean | -      | false   |
| hideShowMore    |                   | boolean | -      | false   |
| hideExclude     |                   | boolean | -      | false   |
| asyncItems      |                   | array   | -      | null    |
| asyncTotal      |                   | number  | -      | 0       |
| asyncTotalCount |                   | number  | -      | 0       |
| node            | Node definition   | object  | -      |         |

## Events

| Event name                 | Type      | Description |
| -------------------------- | --------- | ----------- |
| add-filter-values          | undefined |
| selected-values-from-store |           |
| reset-filter-values        | undefined |
