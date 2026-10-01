import { useState } from 'react'

function AdminLogin({ onSubmit, error, pending }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <main className="admin-login-shell">
      <form
        className="admin-login-form"
        onSubmit={(event) => onSubmit(event, email, password)}
      >
        <div className="admin-brand admin-login-brand">
          <span className="admin-brand-mark">K</span>
          <span>
            <strong>KopiKita</strong>
            <small>Admin</small>
          </span>
        </div>
        <h1>Masuk Admin</h1>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button type="submit" className="primary-btn" disabled={pending}>
          {pending ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </main>
  )
}

export default AdminLogin
