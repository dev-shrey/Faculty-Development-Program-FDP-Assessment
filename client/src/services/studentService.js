const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function requestPayload(path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Unable to connect to the API. Check that the server is running.', { cause: error })
  }

  let payload = {}
  try {
    payload = await response.json()
  } catch {
    if (response.ok) {
      throw new Error('The API returned an invalid response.')
    }
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`)
  }

  if (!payload || typeof payload !== 'object' || !Object.hasOwn(payload, 'data')) {
    throw new Error('The API returned an invalid response.')
  }

  return payload
}

function buildStudentPath(query = {}) {
  const params = new URLSearchParams()
  if (query.q?.trim()) params.set('q', query.q.trim())
  if (query.status && query.status !== 'All statuses') params.set('status', query.status)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize || query.limit) params.set('pageSize', String(query.pageSize ?? query.limit))
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return `/students${suffix}`
}

export async function fetchStudents(query = {}) {
  const payload = await requestPayload(buildStudentPath(query), { signal: query.signal })
  return payload.data
}

export async function fetchStudentPage(query = {}) {
  const payload = await requestPayload(buildStudentPath(query), { signal: query.signal })
  if (!Array.isArray(payload.data) || !payload.pagination || typeof payload.pagination !== 'object') {
    throw new Error('The API returned an invalid student page.')
  }
  return {
    records: payload.data,
    pagination: payload.pagination,
  }
}

export async function createStudent(student) {
  const payload = await requestPayload('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  })
  return payload.data
}

export async function updateStudent(studentId, student) {
  const payload = await requestPayload(`/students/${encodeURIComponent(studentId)}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  })
  return payload.data
}