# SearchBar

> The general search form.

## Props

| Prop name    | Description                            | Type    | Values           | Default                                       |
| ------------ | -------------------------------------- | ------- | ---------------- | --------------------------------------------- |
| tips         | Show search suggestions.               | boolean | -                |                                               |
| animated     | Animate the focus on the search input. | boolean | -                |                                               |
| settings     | Display the shortcuts button.          | boolean | -                |                                               |
| fieldOptions | Search field configuration dictionary. | array   | -                | settings.searchFields.map(field => field.key) |
| size         | Search input size                      | string  | `sm`, `md`, `lg` | 'md'                                          |
