import { FALLS_BOUNDS } from './ruinsBackdrop.js'
import { ancientTreeBounds } from './ancientTrees.js'
// Include the canopy and trunk, not just the tree's centre, when reserving riverbanks.
export function treeClearOfWater(x, y, radius) {
  const { left, right, top, bottom } = ancientTreeBounds(x, y, radius)
  const overlaps = (l, t, r, b) => left < r && right > l && top < b && bottom > t
  // Conservative bounds include the slightly rotated Lake of Whispers shoreline.
  return !overlaps(1225, 995, 1595, 1225)
    && !overlaps(FALLS_BOUNDS.left, FALLS_BOUNDS.top, FALLS_BOUNDS.right, FALLS_BOUNDS.bottom)
    && !overlaps(1750, -100, 1890, 2200)
    && !overlaps(420, 1410, 1750, 1548)
}
