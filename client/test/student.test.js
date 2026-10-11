import test from 'node:test'
import assert from 'node:assert/strict'
import { sampleStudents } from '../src/data/sampleStudents.js'
import { getStudentValidationErrors, validateStudent } from '../src/utils/studentValidation.js'
import { filterStudents } from '../src/utils/studentFilters.js'
import { createStudent, fetchStudentPage, fetchStudents, updateStudent } from '../src/services/studentService.js'

test('sample preview contains the five fictional placement records', () => {
  assert.equal(sampleStudents.length, 5)
  assert.deepEqual(sampleStudents.map(({ name }) => name), [
    'Aditi Sharma', 'Rahul Verma', 'Neha Singh', 'Arjun Mehta', 'Priya Gupta',
  ])
})

test('form validation rejects missing required fields', () => {
  assert.match(validateStudent({ name: '', email: 'a@example.edu', course: 'BCA', status: 'Applied' }), /required/i)
  assert.equal(validateStudent({ name: 'Aditi Sharma', email: 'a@example.edu', course: 'BCA', status: 'Applied' }), '')
  assert.deepEqual(getStudentValidationErrors({}), {
    name: 'Student name is required.',
    email: 'Email address is required.',
    course: 'Course is required.',
    status: 'Placement status is required.',
  })
})

test('search and status filtering work together and restore results when cleared', () => {
  assert.deepEqual(filterStudents(sampleStudents, 'SHARMA', 'Applied'), [sampleStudents[0]])
  assert.deepEqual(filterStudents(sampleStudents, 'EXAMPLE.EDU', 'All statuses'), sampleStudents)
  assert.deepEqual(filterStudents(sampleStudents, '', 'Placed'), [sampleStudents[3]])
  assert.deepEqual(filterStudents(sampleStudents, '', 'All statuses'), sampleStudents)
})

test('form validation rejects malformed email values', () => {
  assert.match(validateStudent({ name: 'Aditi', email: 'not-an-email', course: 'BCA' }), /email/i)
})

test('student service reports failed responses instead of returning success data', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Database unavailable' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    await assert.rejects(fetchStudents(), /Database unavailable/)
    await assert.rejects(createStudent({ name: 'Aditi' }), /Database unavailable/)
    await assert.rejects(updateStudent('id', { name: 'Aditi' }), /Database unavailable/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('student page service serializes filters and pagination', async () => {
  const originalFetch = globalThis.fetch
  let requestedUrl = ''
  globalThis.fetch = async (url) => {
    requestedUrl = url
    return new Response(JSON.stringify({
      success: true,
      data: [sampleStudents[0]],
      pagination: { page: 2, pageSize: 5, total: 6, pages: 2 },
    }), { headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const result = await fetchStudentPage({ q: 'Aditi Sharma', status: 'Applied', page: 2, pageSize: 5 })
    assert.match(requestedUrl, /q=Aditi\+Sharma/)
    assert.match(requestedUrl, /status=Applied/)
    assert.match(requestedUrl, /page=2/)
    assert.match(requestedUrl, /pageSize=5/)
    assert.deepEqual(result, {
      records: [sampleStudents[0]],
      pagination: { page: 2, pageSize: 5, total: 6, pages: 2 },
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})