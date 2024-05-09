import * as zod from 'zod'

import { zodExtensions } from './atoms'

const z = {
  ...zod,
  ...zodExtensions,
}

export { z }
export default z
