// A page whose top edge sits exactly on the toolbox edge rounds either way between the
// observer's root and the element box, so it would flicker between two pages.
const BELOW_TOOLBOX_OFFSET = 4

/**
 * The observer root margin that starts just under the sticky toolbox. Rounded so a sub-pixel drift
 * in the toolbox height yields the same margin and does not rebuild the observer.
 *
 * @param {number} height - The toolbox height in pixels.
 * @returns {string}
 */
export function belowToolboxMargin(height) {
  const top = Math.round(height) + BELOW_TOOLBOX_OFFSET
  return `${-top}px 0px 0px 0px`
}
