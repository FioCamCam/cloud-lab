
import { useEffect, useState } from 'react'

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [editingId, setEditingId] = useState(null)

  const loadStudents = () => {
    setLoading(true)
    setError('')

    fetch('/api/students')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách sinh viên')
        }

        return response.json()
      })
      .then((data) => {
        setStudents(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const resetForm = () => {
    setStudentId('')
    setName('')
    setEmail('')
    setEditingId(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const isEditing = editingId !== null
    const url = isEditing
      ? `/api/students/${editingId}`
      : '/api/students'

    const method = isEditing ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId,
        name,
        email
      })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            (isEditing
              ? 'Không thể cập nhật sinh viên'
              : 'Không thể thêm sinh viên')
          )
        }

        return data
      })
      .then(() => {
        alert(
          isEditing
            ? 'Cập nhật sinh viên thành công!'
            : 'Thêm sinh viên thành công!'
        )

        resetForm()
        loadStudents()
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  const handleEdit = (student) => {
    setEditingId(student._id)
    setStudentId(student.studentId || '')
    setName(student.name || '')
    setEmail(student.email || '')
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa sinh viên này không?'
    )

    if (!confirmDelete) {
      return
    }

    fetch(`/api/students/${id}`, {
      method: 'DELETE'
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'Không thể xóa sinh viên'
          )
        }

        return data
      })
      .then(() => {
        alert('Xóa sinh viên thành công!')
        loadStudents()
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  return (
    <div>
      <h1>Quản lý sinh viên - Version 2.0</h1>

      <h2>{editingId !== null ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>MSSV: </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Nhập MSSV"
            required
          />
        </div>

        <br />

        <div>
          <label>Họ tên: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập họ tên"
            required
          />
        </div>

        <br />

        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            required
          />
        </div>

        <br />

        <button type="submit">
          {editingId !== null ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}
        </button>

        {editingId !== null && (
          <button type="button" onClick={handleCancelEdit}>
            Hủy
          </button>
        )}
      </form>

      <hr />

      <h2>Danh sách sinh viên</h2>

      {loading && <p>Đang tải dữ liệu...</p>}

      {error && (
        <p style={{ color: 'red' }}>
          {error}
          {' '}
          <button onClick={loadStudents}>Thử lại</button>
        </p>
      )}

      {!loading && !error && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <button onClick={() => handleEdit(student)}>
                    Sửa
                  </button>

                  {' '}

                  <button onClick={() => handleDelete(student._id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr>
                <td colSpan="4">Chưa có sinh viên nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
