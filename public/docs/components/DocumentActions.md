# DocumentActions

> A list actions to apply to a document

## Props

| Prop name         | Description                                                    | Type    | Values                                                                                                                                           | Default           |
| ----------------- | -------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| document          | The selected document                                          | object  | -                                                                                                                                                |                   |
| vertical          | Use a vertical layout                                          | boolean | -                                                                                                                                                |                   |
| tooltipsPlacement | Tooltip's placement on each action                             | string  | `auto`, `top`, `bottom`, `left`, `right`, `topleft`, `topright`, `bottomleft`, `bottomright`, `lefttop`, `leftbottom`, `righttop`, `rightbottom` | 'top'             |
| displayDownload   | Show the download button                                       | boolean | -                                                                                                                                                |                   |
| isDownloadAllowed | True if download is allowed for the document                   | boolean | -                                                                                                                                                |                   |
| starBtnClass      | Class to apply to the starring button                          | string  | -                                                                                                                                                | 'btn-link btn-sm' |
| starredBtnClass   | Class to apply to the starring button when document is starred | string  | -                                                                                                                                                | 'starred'         |
| downloadBtnClass  | Class to apply to the download button                          | string  | -                                                                                                                                                | 'btn-link btn-sm' |
| popupBtnClass     | Class to apply to the popup button                             | string  | -                                                                                                                                                | 'btn-link btn-sm' |
| starBtnLabel      | Show label for the starring button                             | boolean | -                                                                                                                                                |                   |
| downloadBtnLabel  | Show label for the download button                             | boolean | -                                                                                                                                                |                   |
| popupBtnLabel     | Show label for the popup button                                | boolean | -                                                                                                                                                |                   |
| noBtnGroup        | Disable the use of button group arround each button            | boolean | -                                                                                                                                                |                   |
