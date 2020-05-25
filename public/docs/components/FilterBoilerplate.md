# FilterBoilerplate

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
| async-search               | undefined |

## Slots

| Name        | Description | Bindings                                                                                                                                                                                    |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| header      |             |                                                                                                                                                                                             |
| title       |             |                                                                                                                                                                                             |
| search      |             |                                                                                                                                                                                             |
| items       |             | [<br> {<br> "name": "items"<br> },<br> {<br> "name": "options"<br> },<br> {<br> "name": "selected"<br> },<br> {<br> "name": "total-count"<br> },<br> {<br> "name": "filterQuery"<br> }<br>] |
| all         |             |                                                                                                                                                                                             |
| items-group |             | [<br> {<br> "name": "items"<br> },<br> {<br> "name": "options"<br> },<br> {<br> "name": "selected"<br> }<br>]                                                                               |
| item        |             | [<br> {<br> "name": "item"<br> },<br> {<br> "name": "label"<br> },<br> {<br> "name": "value"<br> },<br> {<br> "name": "selected"<br> }<br>]                                                 |
