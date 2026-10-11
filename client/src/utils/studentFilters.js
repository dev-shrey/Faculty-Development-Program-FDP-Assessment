export function filterStudents(students, search, status) {
  const normalizedSearch = String(search ?? '').trim().toLowerCase()

  return students.filter((student) => {
    const matchesSearch = !normalizedSearch ||
      String(student.name ?? '').toLowerCase().includes(normalizedSearch) ||
      String(student.email ?? '').toLowerCase().includes(normalizedSearch)

    const matchesStatus = !status || status === 'All statuses' || student.status === status

    return matchesSearch && matchesStatus
  })
}