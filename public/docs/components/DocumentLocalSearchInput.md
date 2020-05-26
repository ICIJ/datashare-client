# DocumentLocalSearchInput

> A form to search for terms inside the current document.

## Props

| Prop name              | Description                                                   | Type    | Values | Default |
| ---------------------- | ------------------------------------------------------------- | ------- | ------ | ------- |
| v-model                | An object containing a property `label` to use as search term | object  | -      |         |
| searchIndex            | The position of the current occurence of the term             | number  | -      | 0       |
| searchOccurrences      | The list of all occurencies                                   | number  | -      | 0       |
| searchWorkerInProgress | True if a worker is currently searching for the term          | boolean | -      |         |

## Events

| Event name       | Type      | Description                                      |
| ---------------- | --------- | ------------------------------------------------ |
| input            | undefined |
| start            | undefined | User started to search a term                    |
| previous         | undefined | User selected the previous occurence of the term |
| next             | undefined | User selected the next occurence of the term     |
| update:activated | undefined | User lost focus on the search input              |
