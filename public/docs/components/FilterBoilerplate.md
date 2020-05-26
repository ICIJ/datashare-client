# FilterBoilerplate

> A base component to wrap other filter components. Not intended to be used directly.
> This was created to implement an "extendable" component with template slots because Vue.js doesn't allow to extend a component while redefining only "slots" in its templates.

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

| Event name                 | Type      | Description                                                |
| -------------------------- | --------- | ---------------------------------------------------------- |
| add-filter-values          | undefined |
| selected-values-from-store |           |
| reset-filter-values        | undefined |
| async-search               | undefined | Triggered when user starts to search in the filter values. |

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
