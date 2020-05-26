# Pagination

> Pagination links (previous, next, first and last) for the global search.

## Props

| Prop name       | Description                                                    | Type    | Values          | Default |
| --------------- | -------------------------------------------------------------- | ------- | --------------- | ------- |
| total           | Total number of entries.                                       | number  | -               |         |
| getToTemplate   | Template function to build the `to` value of each link.        | func    | -               | noop    |
| isDisplayed     | A function to call to determine if the paginator is displayed. | func    | -               | noop    |
| sizeAttr        | Page size property in the `to` object.                         | string  | -               | 'size'  |
| fromAttr        | Page offset property in the `to` object.                       | string  | -               | 'from'  |
| noFirstPageLink | Hide the link to the first page.                               | boolean | -               |         |
| noLastPageLink  | Hide the link to the last page.                                | boolean | -               |         |
| position        | Position of the paginator to choose tooltip's placement        | string  | `top`, `bottom` | 'top'   |
