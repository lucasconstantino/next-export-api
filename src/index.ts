export { adaptor } from './adaptor'

/**
 * Either "/.netlify/functions" or "/api", based on current environment.
 */
const api = process.env.NETLIFY ? '/.netlify/functions' : '/api'

export { api }
