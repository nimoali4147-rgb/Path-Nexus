const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

let refreshPromise = null

function getApiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const responseText = await response.text()

  if (!responseText.trim()) {
    return null
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `The server returned a non-JSON response (HTTP ${response.status}). Check the API URL and backend logs.`
    )
  }

  try {
    return JSON.parse(responseText)
  } catch {
    throw new Error('The server returned invalid JSON.')
  }
}

function clearSession() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = localStorage.getItem('refresh')

      if (!refresh) {
        clearSession()
        window.location.assign('/login')
        return null
      }

      const response = await fetch(getApiUrl('/api/auth/refresh/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh }),
      })

      const data = await parseResponse(response)

      if (!response.ok || !data?.access) {
        clearSession()
        window.location.assign('/login')
        return null
      }

      localStorage.setItem('access', data.access)

      if (data.refresh) {
        localStorage.setItem('refresh', data.refresh)
      }

      return data.access
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export async function apiJson(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers: suppliedHeaders = {},
    auth = true,
    ...fetchOptions
  } = options

  async function sendRequest(token) {
    const headers = new Headers(suppliedHeaders)

    headers.set('Accept', 'application/json')


    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    } else {
      headers.delete('Authorization')
    }

    let requestBody = body

    if (body instanceof FormData) {
      // The browser must set the multipart boundary itself.
      headers.delete('Content-Type')
    } else if (body !== undefined && body !== null) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      if (typeof body !== 'string') {
        requestBody = JSON.stringify(body)
      }
    }

    return fetch(getApiUrl(path), {
      ...fetchOptions,
      method,
      headers,
      body: requestBody,
    })
  }

  let response = await sendRequest(
    auth ? localStorage.getItem('access') : null
  )

  if (auth && response.status === 401 && localStorage.getItem('refresh')) {
    const newAccessToken = await refreshAccessToken()

    if (newAccessToken) {
      response = await sendRequest(newAccessToken)
    }
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    const fieldError = data && typeof data === 'object'
      ? Object.values(data).flat().find((value) => typeof value === 'string')
      : null

    throw new Error(
      data?.detail ||
      data?.message ||
      data?.error ||
      fieldError ||
      `Request failed (HTTP ${response.status}).`
    )
  }

  return data
}
