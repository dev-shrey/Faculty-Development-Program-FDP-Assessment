const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const VALID_STATUSES = new Set(['Applied', 'Interview', 'Offered', 'Placed'])

export function validateStudent(student) {
  const errors = getStudentValidationErrors(student)
  return Object.values(errors)[0] ?? ''
}

export function getStudentValidationErrors(student) {
  const name = String(student?.name ?? '').trim()
  const email = String(student?.email ?? '').trim()
  const course = String(student?.course ?? '').trim()
  const status = String(student?.status ?? '').trim()
  const errors = {}

  if (!name) {
    errors.name = 'Student name is required.'
  }

  if (!email) {
    errors.email = 'Email address is required.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!course) {
    errors.course = 'Course is required.'
  }

  if (!status) {
    errors.status = 'Placement status is required.'
  } else if (!VALID_STATUSES.has(status)) {
    errors.status = 'Choose a valid placement status.'
  }

  return errors
}