# RouterLinkPopup

> A router-link that opens link in a popup.

## Props

| Prop name | Description                                                                                                                                                                                                                                                                                                    | Type           | Values | Default    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------ | ---------- |
| to        | The router-link `to` property: "denotes the target route of the link.<br>When clicked, the value of the to prop will be passed to router.push() internally, so the value can be either a string or a location descriptor object".                                                                              | object\|string | -      |            |
| target    | A string specifying the name of the browsing context into which to load the specified resource.<br>If the name doesn't indicate an existing context, a new window is created and is given the name specified by windowName.                                                                                    | string         | -      | 'external' |
| features  | A String containing a comma-separated list of window features given with their corresponding values in the form "name=value".<br>These features include options such as the window's default size and position, whether or not to include toolbar, and so forth.<br>There must be no whitespace in the string. | string         | -      | null       |

## Slots

| Name    | Description              | Bindings |
| ------- | ------------------------ | -------- |
| default | Main content of the link |          |
