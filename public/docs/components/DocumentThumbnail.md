# DocumentThumbnail

> The document's thumbnail (using the preview) server

## Props

| Prop name | Description                                         | Type           | Values                       | Default |
| --------- | --------------------------------------------------- | -------------- | ---------------------------- | ------- |
| document  | The selected document                               | object         | -                            |         |
| page      | The page to display                                 | number         | -                            | 0       |
| size      | Size of the thumbnail                               | number\|string | `xs`, `sm`, `md`, `lg`, `xl` | 'sm'    |
| crop      | Crop the image to have fixed squared size           | boolean        | -                            |         |
| lazy      | Load the thumbnail only when it enters the viewport | boolean        | -                            |         |
