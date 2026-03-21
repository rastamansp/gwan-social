import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import request from 'supertest'
import { ApiBddWorld } from '../support/world'

function getProp(obj: unknown, path: string): unknown {
  if (obj === null || typeof obj !== 'object') return undefined
  return (obj as Record<string, unknown>)[path]
}

When('faço um GET para {string}', async function (this: ApiBddWorld, path: string) {
  const res = await request(this.server).get(path)
  this.lastStatus = res.status
  this.lastBody = res.body
})

Then('o código de estado HTTP deve ser {int}', function (this: ApiBddWorld, expected: number) {
  assert.strictEqual(this.lastStatus, expected, `esperado ${expected}, obtido ${this.lastStatus}`)
})

Then('o corpo JSON deve ter a propriedade {string}', function (this: ApiBddWorld, key: string) {
  assert.ok(this.lastBody !== null && typeof this.lastBody === 'object', 'corpo não é objeto')
  assert.ok(key in (this.lastBody as object), `falta propriedade "${key}"`)
})

Then('o campo {string} deve ser {int}', function (this: ApiBddWorld, key: string, value: number) {
  const v = getProp(this.lastBody, key)
  assert.strictEqual(v, value, `campo ${key}`)
})

Then('o campo {string} deve ser verdadeiro', function (this: ApiBddWorld, key: string) {
  assert.strictEqual(getProp(this.lastBody, key), true)
})

Then('o campo {string} deve ser falso', function (this: ApiBddWorld, key: string) {
  assert.strictEqual(getProp(this.lastBody, key), false)
})

Then('o campo {string} deve ser uma string não vazia', function (this: ApiBddWorld, key: string) {
  const v = getProp(this.lastBody, key)
  assert.ok(typeof v === 'string' && v.length > 0, `campo ${key}`)
})

Then('a lista {string} deve existir e ter pelo menos {int} elemento(s)', function (this: ApiBddWorld, key: string, min: number) {
  const v = getProp(this.lastBody, key)
  assert.ok(Array.isArray(v), `${key} deve ser array`)
  assert.ok(v.length >= min, `esperado >= ${min} itens`)
})

Then('a lista {string} deve existir', function (this: ApiBddWorld, key: string) {
  const v = getProp(this.lastBody, key)
  assert.ok(Array.isArray(v), `${key} deve ser array`)
})

Then('o campo {string} deve existir', function (this: ApiBddWorld, key: string) {
  assert.ok(this.lastBody !== null && typeof this.lastBody === 'object')
  assert.ok(key in (this.lastBody as object))
})
