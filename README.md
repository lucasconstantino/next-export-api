# Next to Netlify

![Build status](https://travis-ci.org/lucasconstantino/next-to-netlify.svg?branch=master)
[![codecov](https://codecov.io/gh/lucasconstantino/next-to-netlify/branch/master/graph/badge.svg)](https://codecov.io/gh/lucasconstantino/next-to-netlify)

## Installation

```
yarn add next-to-netlify
```

or

```
npm install next-to-netlify
```

> Ensure to install it not as a development dependency, as it is partially used on runtime code.

## Motivation

[Over a year ago](https://nextjs.org/blog/next-9#api-routes) Next.js released version 9 with [API Routes](https://nextjs.org/docs/api-routes/introduction) support. Netlify has also supported their vision of serverless [functions](https://www.netlify.com/products/functions/). The issue? They have very diverging APIs. Next.js even states API Routes do not work with `next export` in a [caveats section](https://nextjs.org/docs/api-routes/introduction#caveats), and it's understandable. However, with a bit of adaptation from generated API Routes entrypoints it's possible to make it play nicely to be deployed as Netlify functions.

### API conflicts, their resolutions, and usage

#### ✅ Function signature

Next.js functions are similar to middleware frameworks handlers such as express, for those familiar: it receives a `req` object, and a `res` object. No async or return needed: `res` has the API to send responses.

Netlify, however, exposes a slightly extended version of an AWS Lambda: it's arguments are an `event` and a `context` - optionally also a callback - and the return must follow a very specific format.

This distinction is not new, and many existing projects try to reduce the gap and ensure reusability of code from one format to the other. Most notably, [`serverless-http`](https://github.com/dougmoscrop/serverless-http), which has being allowing express based applications to run on AWS.

Therefore, the first missing part for integrating Next.js API Routes and Netlify functions is to create an _adaptor_ which can handle calls from both above APIs.

Here is an usage example:

```js
import { adaptor } from 'next-to-netlify/adaptor'

export const handler = adaptor((req, res) => {
  res.status(200).send({ name: `Hello, ${req.query.name}` })
})

export default handler
```

**Warning:** notice that both `handler` and a default are exported from the file. This is necessary because while Next.js expect the handle to be exported as default, Netlify - following AWS Lambda convention - expects it to be exported as `handler`.

> I've explored ways to reduce the need of this adaptation, and a Webpack loader is possibly a solution. It could not only wrap the default exposed handler, but also re-export it as `handler`. However, it would be more prone to errors and more complex in terms of abstraction and configuration.

#### ✅ Function endpoints

Next.js has a defined convention on where to keep API Routes files, and how they become available through URL: files live under `/pages/api`, and URLs match `/api/[name-of-function]` format.

Netlify, in the other hand, expects you define the functions path in a `netlify.toml` (or via UI), and makes the functions available at `/.netlify/functions/[name-of-function]`.

This can be solved in a couple of opinionated ways:

1. Redirects config on Next.js from `/.netlify/functions/*` to `/api/*`
2. Redirects on `_redirects` file from `/api/*` to `/.netlify/functions/*`
3. Imperative use of an adapted endpoint

This module supports numbers `1` and `2` above via `next.config.js`:

```js
const withNetlify = require('next-to-netlify/config')

module.exports = withNetlify({})
```

or, with `next-compose-plugins`:

```js
const withPlugins = require('next-compose-plugins')
const netlify = require('next-to-netlify/config')
const sass = require('@zeit/next-sass')

module.exports = withPlugins([[netlify], [sass]])
```

This is all that's necessary for option `1` from before, and now any API call from the application code would have to be sent to Netlify URL pattern.

For option `3`, besides the above config, you can import the dynamic endpoint as follows:

```js
import { api } from 'next-to-netlify'

fetch(`${api}/name-of-function`) // usage
```

#### ❌ Dynamic API Routes

Thought theoretically possible, I didn't explore so far with the possibility of using Next.js [Dynamic API Routes](https://nextjs.org/docs/api-routes/dynamic-api-routes) on Netlify. It should be fine, as Next.js uses the dynamic parts as simple query params in the end.
