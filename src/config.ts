// import path from 'path'
import type { Configuration } from 'webpack'

type NextContext = {
  dir: string
  isServer: boolean
  config: {
    pageExtensions: string[]
  }
}

type NextConfig = {
  env: NodeJS.ProcessEnv
  rewrites: (
    ...args: any[]
  ) => Promise<{ source: string; destination: string }[]>
  webpack?: (config: Configuration, context: NextContext) => Configuration
}

const rewrite = {
  source: '/.netlify/functions/:path*',
  destination: '/api/:path*',
}

const withNetlify = (nextConfig?: NextConfig) => {
  const netlifyConfig = {
    /**
     * Expose Netlify detection to Next.js build.
     */
    env: { ...nextConfig?.env, NETLIFY: process.env.NETLIFY },

    /**
     * Redirect, on Next.js, calls to Netlify functions to API endpoints.
     *
     * If using `import { api } from 'next-to-netlify'`, this isn't necessary.
     */
    rewrites: async (...args: unknown[]) =>
      nextConfig?.rewrites
        ? [rewrite, ...(await nextConfig?.rewrites(...args))]
        : [rewrite],

    /**
     * Attach loader to inject "handler" export to API routes, as expected by Netlify.
     *
     * This solution doesn't currently work.
     */
    // webpack: (config: Configuration, context: NextContext) => {
    //   const include = [
    //     path.resolve(context.dir, 'pages/api'),
    //     path.resolve(context.dir, 'src/pages/api'),
    //   ]

    //   const test = new RegExp(
    //     `.(${context.config.pageExtensions.join('|')})$`,
    //     'gi'
    //   )

    //   config.module?.rules.push({
    //     test,
    //     include,
    //     loader: path.resolve(__dirname, './loader.js'),
    //   })

    //   return typeof nextConfig?.webpack === 'function'
    //     ? nextConfig.webpack(config, context)
    //     : config
    // },
  }

  return Object.assign({}, nextConfig, netlifyConfig)
}

export = withNetlify
