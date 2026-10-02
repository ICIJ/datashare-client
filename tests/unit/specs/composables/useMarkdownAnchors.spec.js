import { useMarkdownAnchors } from '@/composables/useMarkdownAnchors'

describe('useMarkdownAnchors', () => {
  let container

  function render(html) {
    container.innerHTML = html
    const { scrollToAnchor } = useMarkdownAnchors(container)
    container.addEventListener('click', scrollToAnchor)
  }

  function clickFirstLink() {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    container.querySelector('a').dispatchEvent(event)
    return event
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('scrolls to the element the fragment names instead of navigating', async () => {
    render('<h1 id="my-section">My Section</h1><a href="#my-section">jump</a>')
    const heading = container.querySelector('h1')
    heading.scrollIntoView = vi.fn()

    const event = clickFirstLink()

    // The router keeps its state in the URL hash, so following the fragment
    // would drop the reader out of the document.
    expect(event.defaultPrevented).toBe(true)
    expect(heading.scrollIntoView).toHaveBeenCalled()
  })

  it('decodes a percent-encoded fragment to find the id it names', async () => {
    render('<h1 id="héllo">héllo</h1><a href="#h%C3%A9llo">jump</a>')
    const heading = container.querySelector('h1')
    heading.scrollIntoView = vi.fn()

    clickFirstLink()

    expect(heading.scrollIntoView).toHaveBeenCalled()
  })

  it('holds the click on a fragment whose escapes cannot be decoded', async () => {
    render('<h1 id="%C3">raw</h1><a href="#%C3">broken</a>')
    const heading = container.querySelector('h1')
    heading.scrollIntoView = vi.fn()

    // `decodeURIComponent('%C3')` throws, which would leave the click
    // prevented and the reader with an uncaught error instead of a scroll.
    const event = clickFirstLink()

    expect(event.defaultPrevented).toBe(true)
    expect(heading.scrollIntoView).toHaveBeenCalled()
  })

  it('leaves a click on anything but a fragment link alone', async () => {
    render('<a href="https://example.org" target="_blank">out</a>')

    const event = clickFirstLink()

    expect(event.defaultPrevented).toBe(false)
  })

  it('holds the click when the fragment names nothing in the document', async () => {
    render('<a href="#absent">jump</a>')

    const event = clickFirstLink()

    expect(event.defaultPrevented).toBe(true)
  })
})
