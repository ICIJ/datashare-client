# FilterSearch

> A panel to search into a specific filter.

## Props

| Prop name       | Description                                       | Type    | Values | Default |
| --------------- | ------------------------------------------------- | ------- | ------ | ------- |
| filter          | Filter definition                                 | object  | -      |         |
| hideHeader      |                                                   | boolean | -      | false   |
| hideSearch      |                                                   | boolean | -      | false   |
| hideShowMore    |                                                   | boolean | -      | false   |
| hideExclude     |                                                   | boolean | -      | false   |
| asyncItems      |                                                   | array   | -      | null    |
| asyncTotal      |                                                   | number  | -      | 0       |
| asyncTotalCount |                                                   | number  | -      | 0       |
| query           | The initial query terms                           | string  | -      | ''      |
| selectable      | Either or not results should be selectable        | boolean | -      | true    |
| infiniteScroll  | Either or not results should be loaded on scroll  | boolean | -      | true    |
| throttle        | Throttle time in milliseconds between each search | number  | -      | 600     |

## Events

| Event name                 | Type      | Description |
| -------------------------- | --------- | ----------- |
| add-filter-values          | undefined |
| selected-values-from-store |           |
| reset-filter-values        | undefined |
