
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

let refreshPromise = null

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refresh = localStorage.getItem('refresh')

            if (!refresh) {
                throw new Error('Session expired. Please log in again.')
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            })

            const data = await response.json()

            if (!response.ok || !data.access) {
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
    const { method = 'GET', body, headers = {} } = options

    async function sendRequest(token) {
        const requestHeaders = { ...headers }

        if (token) {
            requestHeaders.Authorization = `Bearer ${token}`
        }

        let requestBody = body

        if (body instanceof FormData) {
            delete requestHeaders['Content-Type']
        } else if (body !== undefined && body !== null &&
            typeof body !== 'string') {
            requestHeaders['Content-Type'] = 'application/json'
            requestBody = JSON.stringify(body)
        }

        return fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: requestHeaders,
            body: requestBody,
        })
    }

    let response = await sendRequest(localStorage.getItem('access'))

    if (response.status === 401 && localStorage.getItem('refresh')) {
        const newToken = await refreshAccessToken()
        response = await sendRequest(newToken)
    }

    if (response.status === 204) return null

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(
            data.detail || JSON.stringify(data) || 'Request failed.'
        )
    }

    return data
}
