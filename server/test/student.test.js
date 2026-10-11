import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import Student from '../src/models/Student.js'
import { buildStudentQuery } from '../src/utils/studentQuery.js'
import { getStudentWriteError } from '../src/utils/studentErrors.js'
import { assessmentStudents } from '../src/data/assessmentStudents.js'

test('assessment seed records are unique and valid for the Student schema', async () => {
  const normalizedEmails = assessmentStudents.map(({ email }) => email.trim().toLowerCase())
  assert.equal(assessmentStudents.length, 25)
  assert.equal(new Set(normalizedEmails).size, assessmentStudents.length)

  for (const record of assessmentStudents) {
    await new Student(record).validate()
  }
})

test('student schema requires the core fields and timestamps', async () => {
  const student = new Student({})
  await assert.rejects(student.validate(), (error) => {
    assert.ok(error.errors.name)
    assert.ok(error.errors.email)
    assert.ok(error.errors.course)
    assert.ok(error.errors.status)
    return true
  })
  assert.equal(Student.schema.options.timestamps, true)
})

test('student schema restricts placement status and declares unique normalized email', async () => {
  const student = new Student({
    name: 'Aditi Sharma',
    email: ' ADITI@EXAMPLE.EDU ',
    course: 'B.Tech CSE',
    status: 'Pending',
  })
  await assert.rejects(student.validate(), (error) => Boolean(error.errors.status))
  assert.equal(student.email, 'aditi@example.edu')
  assert.equal(Student.schema.path('email').options.unique, true)
  await assert.rejects(new Student({
    name: 'Aditi Sharma',
    email: 'invalid-email',
    course: 'B.Tech CSE',
    status: 'Applied',
  }).validate(), (error) => Boolean(error.errors.email))
})

test('duplicate email database errors map to HTTP 409', () => {
  assert.deepEqual(getStudentWriteError({ code: 11000 }, mongoose), {
    status: 409,
    message: 'A student with this email already exists',
  })
})

test('student validation and cast errors return client-safe responses', async () => {
  const invalidStudent = new Student({})
  await assert.rejects(invalidStudent.validate(), (error) => {
    assert.deepEqual(getStudentWriteError(error, mongoose), {
      status: 400,
      message: 'Please provide valid values for: name, email, course, status',
    })
    return true
  })
  assert.deepEqual(getStudentWriteError(
    new mongoose.Error.CastError('ObjectId', 'invalid', '_id'),
    mongoose
  ), {
    status: 400,
    message: 'One or more student values are invalid',
  })
})

test('list query applies search, status, and pagination', () => {
  assert.deepEqual(buildStudentQuery({ q: 'aditi', status: 'Applied', page: '2', pageSize: '5' }), {
    filter: { status: 'Applied', search: 'aditi' },
    page: 2,
    pageSize: 5,
  })
  assert.deepEqual(buildStudentQuery({ search: 'aditi', limit: '5' }), {
    filter: { search: 'aditi' },
    page: 1,
    pageSize: 5,
  })
})

test('list query rejects invalid status and pagination values', () => {
  assert.throws(() => buildStudentQuery({ status: 'Pending' }), /valid placement status/i)
  assert.throws(() => buildStudentQuery({ page: '0' }), /between 1/i)
  assert.throws(() => buildStudentQuery({ limit: '101' }), /between 1 and 100/i)
  assert.throws(() => buildStudentQuery({ page: ['1'] }), /single value/i)
})