type Loader = {
  addDependency: (name: string) => void
}

export default function (this: Loader, source: string) {
  this.addDependency('next-to-netlify/lib/adaptor')

  return `
    ${source}

    // re-export handler for Netlify/AWS consumption
    module.exports.handler = require('next-to-netlify/lib/adaptor').default(module.exports.default || module.exports)
  `
}
