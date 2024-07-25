export default {
  title: 'Layout/Colors',
  render: () => ({
    template: `
      <div class="container">
        <h1>Colors</h1>
        <p>Datashare is supported by an extensive color system based on <a href="https://getbootstrap.com/docs/5.3/customize/color/">Bootstrap</a> that themes our styles and components.</p>
        <div class="table-responsive">
          <table class="table table-swatches">
            <thead>
              <tr>
                <th style="width: 340px;">Description</th>
                <th style="width: 200px;" class="ps-0">Swatch</th>
                <th>Variables</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="2">
                  <strong>Body —</strong> Default foreground (color) and background, including components.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-body-color);">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-body-color</code>, <code>--bs-body-color-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2 border" style="background-color: var(--bs-body-bg);">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-body-bg</code>, <code>--bs-body-bg-rgb</code>
                </td>
              </tr>

              <tr>
                <td>
                  <strong>Emphasis —</strong> For higher contrast text. Not applicable for backgrounds.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-emphasis-color);">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-emphasis-color</code>, <code>--bs-emphasis-color-rgb</code>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Border —</strong> For component borders, dividers, and rules. Use <code>--bs-border-color-translucent</code> to blend with backgrounds with an <code>rgba()</code> value.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-border-color);">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-border-color</code>, <code>--bs-border-color-rgb</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Primary —</strong> Main theme color, used for hyperlinks, focus styles, and component and form active states.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-primary">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-primary</code>, <code>--bs-primary-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-primary-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-primary-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-primary-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-primary-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-primary-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-primary-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Action —</strong> Second theme <code>color</code> option used for action button and hyperlinks.
                </td>
                 <td class="ps-0">
                  <div class="p-3 rounded-2 bg-action">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-action</code>, <code>--bs-action-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-action-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-action-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-action-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-action-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-action-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-action-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Secondary —</strong> Use the <code>color</code> option for lighter text. Use the <code>bg</code>
                  option for dividers and to indicate disabled component states.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-secondary-color);">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-secondary-color</code>, <code>--bs-secondary-color-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-secondary-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-secondary-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-secondary-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-secondary-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-secondary-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-secondary-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Tertiary —</strong> Third theme <code>color</code> for lighter text. Use the <code>bg</code>
                  option to style backgrounds for hover states, accents, and wells.
                </td>
                 <td class="ps-0">
                  <div class="p-3 rounded-2 bg-tertiary">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-tertiary</code>, <code>--bs-tertiary-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-tertiary-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-tertiary-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-tertiary-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-tertiary-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-tertiary-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-tertiary-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Success —</strong> Theme color used for positive or successful actions and information.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-success">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-success</code>, <code>--bs-success-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-success-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-success-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-success-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-success-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-success-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-success-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Danger —</strong> Theme color used for errors and dangerous actions.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-danger">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-danger</code>, <code>--bs-danger-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-danger-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-danger-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-danger-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-danger-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-danger-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-danger-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Warning —</strong> Theme color used for non-destructive warning messages.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-warning">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-warning</code>, <code>--bs-warning-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-warning-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-warning-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-warning-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-warning-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-warning-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-warning-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Info —</strong> Theme color used for neutral and informative content.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-info">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-info</code>, <code>--bs-info-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-info-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-info-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-info-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-info-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-info-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-info-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Light —</strong> Additional theme option for less contrasting colors.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-tertiary">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-light</code>, <code>--bs-light-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-tertiary-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-light-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-tertiary-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-light-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-tertiary-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-light-text-emphasis</code>
                </td>
              </tr>

              <tr>
                <td rowspan="4">
                  <strong>Dark —</strong> Additional theme option for higher contrasting colors.
                </td>
                <td class="ps-0">
                  <div class="p-3 rounded-2 bg-dark">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-dark</code>, <code>--bs-dark-rgb</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="background-color: var(--bs-dark-bg-subtle)">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-dark-bg-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="p-3 rounded-2" style="border: 5px var(--bs-dark-border-subtle) solid">&nbsp;</div>
                </td>
                <td>
                  <code>--bs-dark-border-subtle</code>
                </td>
              </tr>
              <tr>
                <td class="ps-0">
                  <div class="py-3 fw-bold h5" style="color: var(--bs-dark-text-emphasis)">Text</div>
                </td>
                <td>
                  <code>--bs-dark-text-emphasis</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `
  })
}

export const Default = {}
