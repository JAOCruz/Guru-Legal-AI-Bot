const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',  body: JSON.stringify(body) }),
  del:    (path)       => request(path, { method: 'DELETE' }),
  upload: (path, form) => {
    const token = getToken()
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(`${BASE}${path}`, { method: 'POST', headers, body: form })
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { const e = new Error(data.error || `Upload failed: ${res.status}`); e.status = res.status; throw e }
        return data
      })
  },
}
