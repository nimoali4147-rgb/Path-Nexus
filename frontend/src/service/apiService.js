
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

let refreshPromise = null

function getApiUrl(path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
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

    if (!contentType.includes('application/json')) {
        throw new Error(
            `Server returned HTML or non-JSON response. HTTP ${response.status}. Check your API URL and Django server.`
        )
    }

    try {
        return JSON.parse(responseText)
    } catch {
        throw new Error('Server returned invalid JSON.')
    }
}

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refresh = localStorage.getItem('refresh')

            if (!refresh) {
                throw new Error('Session expired. Please log in again.')
            }

            const response = await fetch(
                getApiUrl('/api/auth/refresh/'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ refresh }),
                }
            )

            const data = await parseResponse(response)

            if (!response.ok || !data?.access) {
                localStorage.removeItem('access')
                localStorage.removeItem('refresh')
                localStorage.removeItem('user')

                window.location.assign('/login')

                throw new Error('Session expired. Please log in again.')
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
        headers = {},
    } = options

    async function sendRequest(token) {
        const requestHeaders = {
            Accept: 'application/json',
            ...headers,
        }

        let requestBody = body

        if (token) {
            requestHeaders.Authorization = `Bearer ${token}`
        }

        if (body instanceof FormData) {
            delete requestHeaders['Content-Type']
        } else if (
            body !== undefined &&
            body !== null &&
            typeof body !== 'string'
        ) {
            requestHeaders['Content-Type'] = 'application/json'
            requestBody = JSON.stringify(body)
        }

        return fetch(getApiUrl(path), {
            method,
            headers: requestHeaders,
            body: requestBody,
        })
    }

    let response = await sendRequest(
        localStorage.getItem('access')
    )

    if (
        response.status === 401 &&
        localStorage.getItem('refresh')
    ) {
        const newToken = await refreshAccessToken()
        response = await sendRequest(newToken)
    }

    const data = await parseResponse(response)

    if (!response.ok) {
        const message =
            data?.detail ||
            data?.message ||
            (data && typeof data === 'object'
                ? JSON.stringify(data)
                : null) ||
            `Request failed. HTTP ${response.status}.`

        throw new Error(message)
    }

    return data
}
