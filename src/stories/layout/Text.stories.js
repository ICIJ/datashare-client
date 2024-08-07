export default {
  title: 'Layout/Text',
  render: (args) => ({
    setup() {
      return { args }
    },
    template: `
      <div class="container">
        <h3>Fonts</h3>
        <h4>Inter</h4>
        <p>This is the base font we use everywhere by default.</p>
        <table class="table">
          <thead>
            <tr>
              <th>Value</th>
              <th>Common weight name</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr>
              <td><code>300</code></td>
              <td style="font-weight: 300">Light</td>
            </tr>
            <tr>
              <td><code>400</code></td>
              <td style="font-weight: 400">Normal</td>
            </tr>
            <tr>
              <td><code>500</code></td>
              <td style="font-weight: 500">Regular</td>
            </tr>
            <tr>
              <td><code>700</code></td>
              <td style="font-weight: 700">Bold</td>
            </tr>
          </tbody>
        </table>
        <h4>Medel</h4>
        <p>This is the special font we use in Datashare's logo. It can be used through the <code>.text-special</code> class.</p>
        <table class="table">
          <thead>
            <tr>
              <th>Value</th>
              <th>Common weight name</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr>
              <td><code>500</code></td>
              <td style="font-weight: 500" class="text-special">Regular</td>
            </tr>
            <tr>
              <td><code>700</code></td>
              <td style="font-weight: 700" class="text-special">Bold</td>
            </tr>
          </tbody>
        </table>
        <h3>Headings</h3>
        <p>All HTML headings, <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>, are available.</p>
        <table class="table">
          <thead>
            <tr>
              <th>Heading</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr>
              <td><code>&lt;h1&gt;&lt;/h1&gt;</code></td>
              <td><span class="h1">h1. Datashare heading</span></td>
            </tr>
            <tr>
              <td><code>&lt;h2&gt;&lt;/h2&gt;</code></td>
              <td><span class="h2">h2. Datashare heading</span></td>
            </tr>
            <tr>
              <td><code>&lt;h3&gt;&lt;/h3&gt;</code></td>
              <td><span class="h3">h3. Datashare heading</span></td>
            </tr>
            <tr>
              <td><code>&lt;h4&gt;&lt;/h4&gt;</code></td>
              <td><span class="h4">h4. Datashare heading</span></td>
            </tr>
            <tr>
              <td><code>&lt;h5&gt;&lt;/h5&gt;</code></td>
              <td><span class="h5">h5. Datashare heading</span></td>
            </tr>
            <tr>
              <td><code>&lt;h6&gt;&lt;/h6&gt;</code></td>
              <td><span class="h6">h6. Datashare heading</span></td>
            </tr>
          </tbody>
        </table>
        <h3>Inline text elements</h3>
        <p>Styling for common inline HTML5 elements.</p>
        <div class="card card-body">
          <p>You can use the mark tag to <mark>highlight</mark> text.</p>
          <p><del>This line of text is meant to be treated as deleted text.</del></p>
          <p><s>This line of text is meant to be treated as no longer accurate.</s></p>
          <p><ins>This line of text is meant to be treated as an addition to the document.</ins></p>
          <p><u>This line of text will render as underlined.</u></p>
          <p><small>This line of text is meant to be treated as fine print.</small></p>
          <p><strong>This line rendered as bold text.</strong></p>
          <p><em>This line rendered as italicized text.</em></p>
        </div>
      </div>
    `
  })
}

export const Default = {}
