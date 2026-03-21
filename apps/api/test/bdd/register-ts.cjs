'use strict'
const path = require('node:path')
const { register } = require('tsx/cjs/api')
register()

try {
  const dotenv = require('dotenv')
  // Um único load: cwd deve ser apps/api ao correr `npm run test:bdd`
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
} catch {
  /* sem dotenv */
}
