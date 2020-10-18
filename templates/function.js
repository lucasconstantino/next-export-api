const { adaptor } = require('next-export-api')
const { default: handler } = require('%next-api-route%')

module.exports.handler = adaptor(handler)
