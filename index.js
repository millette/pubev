'use strict'

// core
const fs = require('fs')

// npm
const dotenv = require('dotenv')

const envConfig = dotenv.parse(fs.readFileSync('.env'))
let k
for (k in envConfig) { process.env[k] = envConfig[k] }

// self
const yo = require('./src/yo')
const fo = require('./src/fo')

const run = () => fo()
  .then(() => console.log('OK1'))
  .then(yo)

if (require.main === module) {
  run()
    .then(() => console.log('OK2'))
    .catch(console.error)
} else {
  module.exports = run
}
