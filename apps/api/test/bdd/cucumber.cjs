'use strict'
const path = require('node:path')

const apiRoot = path.join(__dirname, '..', '..')
const bddRoot = __dirname

/** @type {import('@cucumber/cucumber/lib/configuration/types').IProfiles} */
module.exports = {
  default: {
    paths: [path.join(apiRoot, 'test', 'bdd', 'features', '*.feature')],
    requireModule: [path.join(bddRoot, 'register-ts.cjs')],
    require: [
      path.join(bddRoot, 'support', 'world.ts'),
      path.join(bddRoot, 'support', 'hooks.ts'),
      path.join(bddRoot, 'step-definitions', 'http.steps.ts'),
      path.join(bddRoot, 'step-definitions', 'auth.steps.ts'),
    ],
    format: ['progress'],
    formatOptions: { snippetInterface: 'async-await' },
  },
}
