import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import request from 'supertest'
import { ApiBddWorld } from '../support/world'

Given('que gero credenciais de teste únicas', function (this: ApiBddWorld) {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  this.testUsername = `bdd_${suffix}`
  this.testPassword = 'senha_bdd_segura_8'
})

When('registo esse utilizador com displayName {string} e email de teste', async function (this: ApiBddWorld, displayName: string) {
  assert.ok(this.testUsername && this.testPassword)
  const email = `${this.testUsername}@bdd.example.com`
  const res = await request(this.server)
    .post('/api/v1/auth/register')
    .send({
      displayName,
      username: this.testUsername,
      password: this.testPassword,
      email,
    })
    .set('Content-Type', 'application/json')
  this.lastStatus = res.status
  this.lastBody = res.body
})

When('faço login com esse utilizador', async function (this: ApiBddWorld) {
  assert.ok(this.testUsername && this.testPassword)
  const res = await request(this.server)
    .post('/api/v1/auth/login')
    .send({
      username: this.testUsername,
      password: this.testPassword,
    })
    .set('Content-Type', 'application/json')
  this.lastStatus = res.status
  this.lastBody = res.body
})

Then('guardo o accessToken da resposta', function (this: ApiBddWorld) {
  assert.ok(this.lastBody !== null && typeof this.lastBody === 'object')
  const token = (this.lastBody as { accessToken?: string }).accessToken
  assert.ok(typeof token === 'string' && token.length > 0)
  this.accessToken = token
})

When('faço um GET para {string} com autorização Bearer', async function (this: ApiBddWorld, path: string) {
  assert.ok(this.accessToken)
  const res = await request(this.server).get(path).set('Authorization', `Bearer ${this.accessToken}`)
  this.lastStatus = res.status
  this.lastBody = res.body
})

Then('o campo {string} do corpo deve ser o username de teste', function (this: ApiBddWorld, key: string) {
  assert.ok(this.testUsername)
  assert.ok(this.lastBody !== null && typeof this.lastBody === 'object')
  assert.strictEqual((this.lastBody as Record<string, unknown>)[key], this.testUsername)
})
