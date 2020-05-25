# RouterLinkPopup

## Props

| Prop name | Description | Type   | Values | Default                                                                                                                                                                                                                                                                                          |
| --------- | ----------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| to        |             | object | -      |                                                                                                                                                                                                                                                                                                  |
| target    |             | string | -      | 'external'                                                                                                                                                                                                                                                                                       |
| features  |             | string | -      | function() {<br> const width = 880<br> const height = window.outerHeight \* 0.8<br> const left = (screen.width / 2) - (width / 2)<br> const top = (screen.height / 2) - (height / 2)<br> return `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`<br>} |

## Slots

| Name    | Description              | Bindings |
| ------- | ------------------------ | -------- |
| default | Main content of the link |          |
