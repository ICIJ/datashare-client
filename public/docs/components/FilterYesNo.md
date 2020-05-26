# FilterYesNo

> A Filter component to boolean values. Currently used for the "starred" filter but should be made generic in future versions.

## Props

| Prop name       | Description | Type    | Values | Default |
| --------------- | ----------- | ------- | ------ | ------- |
| filter          |             | object  | -      |         |
| hideHeader      |             | boolean | -      | false   |
| hideSearch      |             | boolean | -      | false   |
| hideShowMore    |             | boolean | -      | false   |
| hideExclude     |             | boolean | -      | false   |
| asyncItems      |             | array   | -      | null    |
| asyncTotal      |             | number  | -      | 0       |
| asyncTotalCount |             | number  | -      | 0       |

## Events

| Event name                 | Type      | Description |
| -------------------------- | --------- | ----------- |
| add-filter-values          | undefined |
| selected-values-from-store |           |
| reset-filter-values        | undefined |
