# Next Export API

![Build status](https://travis-ci.org/lucasconstantino/next-export-api.svg?branch=master)
[![codecov](https://codecov.io/gh/lucasconstantino/next-export-api/branch/master/graph/badge.svg)](https://codecov.io/gh/lucasconstantino/next-export-api)

## Installation

```
yarn add next-export-api
```

or

```
npm install next-export-api
```

> Ensure to install it as a production dependency, not a development one.

Add `next-export-api` to the build script. You can use `postbuild` if you are using `build` on the `package.json`:

```diff
 {
   "name": "example",
   "scripts": {
     "build": "next build && next export",
+    "postbuild": "next-export-api",
     "dev": "next dev",
     "start": "next start"
   },
   "dependencies": {
     "next": "9.5.5",
     "react": "16.14.0",
     "react-dom": "16.14.0"
   }
 }
```

Configure `netlify.toml` to define functions directory:

```toml
[build]
  command = "yarn build"
  publish = "out"
  functions = "out/api"
```

> Both `publish` and `functions` above are configurable, and will be respected by `next-export-api` command.

_Please check the [example folder](./example/)_ for a ready to deploy sample project.

## Motivation

[Over a year ago](https://nextjs.org/blog/next-9#api-routes) Next.js released version 9 with [API Routes](https://nextjs.org/docs/api-routes/introduction) support. Netlify has also long supported their vision of serverless [functions](https://www.netlify.com/products/functions/). The issue? They have very diverging APIs. Next.js even states, in a [caveats section](https://nextjs.org/docs/api-routes/introduction#caveats), it's API Routes do not work with `next export` projects - the most straightforward way of deploying Next.js projects on Netlify. However, with a bit of adaptation from generated API Routes entrypoints files, it's possible to make them capable of running on Netlify functions environment.

## Similar projects

This project is heavily inspired by...

- [`next-on-netlify`](https://github.com/netlify/next-on-netlify)
- [`next-aws-lambda`](https://github.com/serverless-nextjs/serverless-next.js)
- [`serverless-http`](https://github.com/dougmoscrop/serverless-http)

The difference to these projects is `next-export-api` focuses in allowing the use of API Routs on a Next.js [Static HTML Exported](https://nextjs.org/docs/advanced-features/static-html-export) project.

## How does it work

Similarly to `next-on-netlify`, this project takes advantage of Next.js own building system, and operates on it's generated code. As for API Routes, Next.js does generate a self-contained file for each `/pages/api` entrypoint, meaning we can _import_ those files or of the foreseen context of a Next.js server.

The process is like the following:

1. Next.js builds into the `.next` directory;
2. Next.js exports static site into (configurable) `out` directory;
3. `next-export-api` reads page manifests from the `.next` build, and...

   1. Creates one file for each API route under `out/api`

      These files are thin wrappers over Next.js original ones, only adapting for execution on AWS using well supported [`serverless-http`](https://github.com/dougmoscrop/serverless-http).

   2. Creates `_redirects` rules for each of the API routes above, mapping `/api/*` calls to `/.netlify/functions/*` as expected by Netlify
