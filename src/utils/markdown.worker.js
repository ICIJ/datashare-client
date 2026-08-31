import { renderMarkdown } from '@/utils/markdown'

// `base` always comes from the caller: in a worker, `self.location` is the
// worker script URL, not the page the document is shown on.
self.onmessage = async ({ data: { id, source, base } }) => {
  try {
    const html = await renderMarkdown(source, { base })
    self.postMessage({ id, html })
  }
  catch (error) {
    self.postMessage({ id, error: error.message })
  }
}
