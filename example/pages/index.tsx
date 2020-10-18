import { useState, useCallback } from 'react'

/**
 * Generic requester factory.
 */
const useRequester = (requester: (name: string) => Promise<Response>) => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')

  const submit = useCallback(async (name: string) => {
    setLoading(true)

    await requester(name)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(`Request failed with ${res.status}`)
        }

        return res.text()
      })
      .then(setResponse)
      .catch((err) => {
        console.error(err)
        setResponse('Failed!')
      })

    setLoading(false)
  }, [])

  return { response, loading, submit }
}

const requests = {
  get: (name: string) => fetch(`/api/get?name=${name}`),
  post: (name: string) =>
    fetch(`/api/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  nested: (name: string) => fetch(`/api/nested/get?name=${name}`),
}

const Home = () => {
  const [name, setName] = useState('')

  const apis = {
    get: useRequester(requests.get),
    post: useRequester(requests.post),
    nested: useRequester(requests.nested),
  }

  return (
    <div>
      <style global jsx>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 3rem 4rem;
          background-color: #222;
          color: white;
          font-family: sans-serif;
        }

        a {
          color: inherit;
        }

        a:focus,
        a:hover {
          opacity: 0.8;
        }

        h1 {
          font-weight: normal;
        }

        table {
          width: 32rem;
          max-width: 100%;
          text-align: center;
        }

        input,
        button {
          padding: 0.5em;
          width: 100%;
          border: 1px solid white;
        }

        button {
          color: inherit;
          background: transparent;
          cursor: pointer;
          transition: all 250ms;
        }

        button:focus,
        button:hover {
          background: white;
          color: #222;
        }

        button:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>

      <header>
        <h1>
          <a
            href="https://github.com/lucasconstantino/next-to-netlify"
            target="_blank"
          >
            next-to-netlify
          </a>{' '}
          example
        </h1>
      </header>

      <main>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </th>
              <th>Response</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <button
                  disabled={apis.get.loading || !name}
                  onClick={() => apis.get.submit(name)}
                >
                  Submit using <code>GET</code>
                </button>
              </td>
              <td>
                <code>{apis.get.response}</code>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  disabled={apis.post.loading || !name}
                  onClick={() => apis.post.submit(name)}
                >
                  Submit using <code>POST</code>
                </button>
              </td>
              <td>
                <code>{apis.post.response}</code>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  disabled={apis.nested.loading || !name}
                  onClick={() => apis.nested.submit(name)}
                >
                  Submit to nested API Route
                </button>
              </td>
              <td>
                <code>{apis.nested.response}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  )
}

export default Home
