import { breakpointSizeArgType } from '~storybook/utils'
import BatchSearchErrorModal from '@/components/BatchSearch/BatchSearchErrorModal'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'
export default {
  components: { BatchSearchErrorModal },
  title: 'Components/BatchSearch/BatchSearchErrorModal',
  tags: ['autodocs'],
  component: BatchSearchErrorModal,
  argTypes: {
    size: breakpointSizeArgType
  },
  args: {
    modelValue: false,
    inputValue: 'test'
  },
  render(args) {
    return {
      components: {
        BatchSearchErrorModal,
        ImageModeSource
      },
      template: `
        <button class="btn btn-action" @click="args.modelValue = !args.modelValue">
          Toggle modal
        </button>
        <batch-search-error-modal v-bind="args" :model-value="args.modelValue" @update:modelValue="args.modelValue = $event" >
          {{ args.default }}
        </batch-search-error-modal>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {
  args: {
    title: 'There is an error on the following query',
    query: 'AND ada',
    okTitle: 'Ok',
    errorTitle: 'The error is',
    errorMessage:
      "SearchException: query='\"error' message='org.icij.datashare.batch.SearchException: co.elastic.clients.json.JsonpMappingException: Error deserializing co.elastic.clients.elasticsearch._types.query_dsl.QueryStringQuery: jakarta.json.stream.JsonParsingException: Unexpected char 101 at (line no=1, column no=83, offset=82) (JSON path: bool.must[1].bool.should[0].query_string.query) (line no=1, column no=84, offset=83)'",
    description: `The system encountered a problem. It can be a syntax error that you made in your CSV or another error. Please refer to <a href="/">this help page</a> where most common errors are described.`
  }
}
export const JSONErrorMessage = {
  args: {
    title: 'There is an error on the following query',
    query: 'AND ada',
    errorTitle: 'The error is',
    okTitle: 'Ok',
    errorMessage: `{"error": {"buttonDownloadDocuments": {"label": "Download documents"},"buttonToggleBatchMode": {"labelBatchMode": "Toggle batch mode","labelSingleFlow": "Toggle single flow"},"buttonSaveSearch": {"label": "Save","labelSaving": "Saving","labelSaved": "Search saved"}}}`,
    description: `The system encountered a problem. It can be a syntax error that you made in your CSV or another error. Please refer to <a href="/">this help page</a> where most common errors are described.`
  }
}
