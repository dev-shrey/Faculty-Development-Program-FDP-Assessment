import { useRef, useState } from 'react'
import { getStudentValidationErrors } from '../utils/studentValidation.js'

const statuses = ['Applied', 'Interview', 'Offered', 'Placed']

function StudentForm({ student, onClose, onSubmit, submitting = false }) {
  const submissionInProgress = useRef(false)
  const [values, setValues] = useState({
    name: student?.name ?? '',
    email: student?.email ?? '',
    course: student?.course ?? '',
    status: student?.status ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting || submissionInProgress.current) return

    const validationErrors = getStudentValidationErrors(values)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setFormError('')
      return
    }

    submissionInProgress.current = true
    setFieldErrors({})
    setFormError('')
    try {
      await onSubmit(values)
    } catch (submitError) {
      if (/email/i.test(submitError.message) && /already exists|duplicate/i.test(submitError.message)) {
        setFieldErrors({ email: submitError.message })
      } else {
        const fieldList = submitError.message.match(/valid values for:\s*(.+)$/i)?.[1]
        const serverFields = fieldList?.split(',').map((field) => field.trim()).filter((field) => (
          ['name', 'email', 'course', 'status'].includes(field)
        ))
        if (serverFields?.length) {
          setFieldErrors(Object.fromEntries(serverFields.map((field) => [field, submitError.message])))
        } else {
          setFormError(submitError.message || 'Unable to save this student. Please try again.')
        }
      }
    } finally {
      submissionInProgress.current = false
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => !submitting && event.target === event.currentTarget && onClose()}>
      <section className="student-modal" role="dialog" aria-modal="true" aria-labelledby="student-form-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">STUDENT DIRECTORY</p>
            <h2 id="student-form-title">{student ? 'Edit student' : 'Add student'}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Close form" onClick={onClose} disabled={submitting}>×</button>
        </div>
        <form className="student-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            Student name
            <input name="name" value={values.name} onChange={updateField} autoFocus required disabled={submitting} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'student-name-error' : undefined} />
            {fieldErrors.name && <span className="form-error" id="student-name-error">{fieldErrors.name}</span>}
          </label>
          <label className="form-field">
            Email address
            <input name="email" type="email" value={values.email} onChange={updateField} required disabled={submitting} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'student-email-error' : undefined} />
            {fieldErrors.email && <span className="form-error" id="student-email-error">{fieldErrors.email}</span>}
          </label>
          <label className="form-field">
            Course
            <input name="course" value={values.course} onChange={updateField} placeholder="e.g. B.Tech CSE" required disabled={submitting} aria-invalid={Boolean(fieldErrors.course)} aria-describedby={fieldErrors.course ? 'student-course-error' : undefined} />
            {fieldErrors.course && <span className="form-error" id="student-course-error">{fieldErrors.course}</span>}
          </label>
          <label className="form-field">
            Placement status
            <select name="status" value={values.status} onChange={updateField} required disabled={submitting} aria-invalid={Boolean(fieldErrors.status)} aria-describedby={fieldErrors.status ? 'student-status-error' : undefined}>
              <option value="">Select a status</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            {fieldErrors.status && <span className="form-error" id="student-status-error">{fieldErrors.status}</span>}
          </label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="form-actions">
            <button className="cancel-button" type="button" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? (student ? 'Saving...' : 'Adding...') : (student ? 'Save changes' : 'Add student')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default StudentForm