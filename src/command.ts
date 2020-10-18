#!/usr/bin/env node

import path from 'path'
import { promises as fs } from 'fs'
import findUp from 'find-up'
import { parse } from 'toml'
import { Signale } from 'signale'

type Config = { publish?: string; functions?: string }
type NetlifyToml = { build?: Config }
type PromisedResult<T> = T extends PromiseLike<infer U> ? U : T

const noLabel = { label: '' }
const options = { types: { info: noLabel, success: noLabel } } as any
const log = new Signale(options).scope('Next Export API')

const defaults = { functions: 'out/api' }

/**
 * Simple faulty version of an async path exists check.
 */
const exists = (filepath: string) =>
  fs
    .stat(filepath)
    .then(() => true)
    .catch(() => false)

/**
 * Load Netlify config from netlify.toml file.
 */
const getNetlifyConfig = async (): Promise<NetlifyToml> => {
  const toml = await findUp('netlify.toml')
  return toml ? parse(await fs.readFile(toml, 'utf-8')) : { build: defaults }
}

/**
 * Find out _redirects file location.
 */
const getRedirectsPath = async (cwd: string, { build }: NetlifyToml) =>
  path.resolve(cwd, build?.publish ?? 'out', '_redirects')

/**
 * Find output functions dir based on netlify.toml or a default.
 */
const getFunctionOutPath = async (cwd: string, { build }: NetlifyToml) => {
  // find the output directory for the functions.
  const functions =
    build?.functions ?? build?.publish
      ? `${build?.publish}/api`
      : defaults.functions

  return path.resolve(cwd, functions)
}

/**
 * Resolve all relevant paths.
 */
const getPaths = async () => {
  const cwd = process.cwd()

  // templates
  const templates = path.resolve(__dirname, '../templates')

  // build
  const server = path.resolve(cwd, '.next/server/')
  const pagesManifest = path.resolve(server, 'pages-manifest.json')

  const toml = await getNetlifyConfig()

  // output
  const redirects = await getRedirectsPath(cwd, toml)
  const functions = await getFunctionOutPath(cwd, toml)

  return { cwd, server, pagesManifest, redirects, functions, templates }
}

type Paths = PromisedResult<ReturnType<typeof getPaths>>

/**
 * Get all API routes as built by Next.js
 */
const getAPIRoutes = async (paths: Paths) => {
  const routes: [string, string][] = []
  const manifest = await import(paths.pagesManifest)

  for (const [endpoint, filepath] of Object.entries(manifest.default)) {
    if (endpoint.startsWith('/api/')) {
      routes.push([
        endpoint,
        // Function file paths are used relative to the output function directory.
        path.relative(
          paths.functions,
          path.resolve(paths.server, filepath as string)
        ),
      ])
    }
  }

  return routes
}

const run = async () => {
  log.info('Initiating Next Export API')

  const paths = await getPaths()
  log.info('Resolved paths')

  const template = await fs.readFile(
    path.resolve(paths.templates, 'function.js'),
    'utf-8'
  )

  // Avoid any conflicts if function output directory already exists.
  if (await exists(paths.functions)) {
    throw new Error(
      `Function output directory "${paths.functions}" already exists`
    )
  }

  // prepare output dir.
  await fs.mkdir(paths.functions, { recursive: true })

  log.info(`Created output dir: "${path.relative(paths.cwd, paths.functions)}"`)

  const redirects = (await exists(paths.redirects))
    ? [await fs.readFile(paths.redirects, 'utf-8')]
    : []

  const apiRoutes = await getAPIRoutes(paths)
  log.info(`Resolved ${apiRoutes.length} API routes:`)

  if (apiRoutes.length) {
    redirects.push('# Next Export API redirects')
  }

  for (const [url, relative] of apiRoutes) {
    const filename = url.replace(/\//g, '__')
    const destination = path.resolve(paths.functions, `${filename}.js`)

    // create netlify function file.
    const content = template.replace('%next-api-route%', relative)
    await fs.writeFile(destination, content)

    // add redirect rule
    redirects.push(`${url} /.netlify/functions/${filename} 200`)

    log.success(`- Created ${url} route`)
  }

  await fs.writeFile(paths.redirects, redirects.join('\n'), 'utf-8')
  log.success('Created redirects')
}

run().catch(log.fatal)
