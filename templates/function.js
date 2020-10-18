const { adaptor } = require('next-to-netlify')
const { default: handler } = require('%next-api-route%')

module.exports.handler = adaptor(handler)
