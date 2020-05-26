# Hook

> Create a Hook slot. Hooks are registred on-the-fly by plugins to insert arbitrary components.

## Props

| Prop name | Description                                                | Type   | Values | Default  |
| --------- | ---------------------------------------------------------- | ------ | ------ | -------- |
| name      | Name of the hook (targetted by plugins).                   | string | -      |          |
| tag       | Specify the HTML tag to render instead of the default tag. | string | -      | 'span'   |
| bind      | Properties to pass to each hooks.                          | object | -      | () => {} |
