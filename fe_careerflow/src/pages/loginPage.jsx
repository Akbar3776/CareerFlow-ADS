import { useState } from 'react'
import { Link } from 'react-router-dom'

// SVG Icons inline (no extra library needed)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  const validate = () => {
    const e = {}
    if (!form.email.trim())    e.email    = 'Email atau username wajib diisi.'
    if (!form.password.trim()) e.password = 'Kata sandi wajib diisi.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    // TODO: hubungkan ke backend autentikasi
    setTimeout(() => setLoading(false), 1500)
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <>
      {/* Navbar */}
      <nav className="cf-navbar">
        <span className="cf-navbar__logo">CareerFlow</span>
      </nav>

      <div className="cf-auth-wrapper">
        <div className="cf-auth-card">

          {/* ---- LEFT PANEL ---- */}
          <div className="cf-auth-left">
            <div className="cf-auth-left__image-slot">
              {/*
                TARUH GAMBAR KAMU DI SINI:
                <img src="/src/assets/login-illustration.png" alt="CareerFlow" />
              */}
            </div>
            <div className="cf-auth-left__text">
              <h2>Empowering Your Career Journey</h2>
              <p>
                Join thousands of professionals who have accelerated
                their careers with CareerFlow's premium opportunities
                and resources.
              </p>
            </div>
          </div>

          {/* ---- RIGHT PANEL ---- */}
          <div className="cf-auth-right">
            <h1 className="cf-auth-right__title">Selamat Datang di<br />CareerFlow</h1>
            <p className="cf-auth-right__subtitle">Masuk untuk melanjutkan perjalanan karier Anda.</p>

            <form className="cf-form" onSubmit={handleSubmit} noValidate>

              {/* Email / Username */}
              <div className="cf-field">
                <label>Email atau Username</label>
                <div className="cf-field__input-wrap">
                  <span className="cf-field__icon"><IconUser /></span>
                  <input
                    type="text"
                    placeholder="Masukkan email Anda"
                    value={form.email}
                    onChange={handleChange('email')}
                    className={errors.email ? 'has-error' : ''}
                  />
                </div>
                {errors.email && <span className="cf-field__error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="cf-field">
                <label>Kata Sandi</label>
                <div className="cf-field__input-wrap">
                  <span className="cf-field__icon"><IconLock /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi"
                    value={form.password}
                    onChange={handleChange('password')}
                    className={`has-right-icon${errors.password ? ' has-error' : ''}`}
                  />
                  <span className="cf-field__eye" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <IconEyeOff /> : <IconEye />}
                  </span>
                </div>
                {errors.password && <span className="cf-field__error">{errors.password}</span>}
              </div>

              {/* Remember + Forgot */}
              <div className="cf-form__meta">
                <label className="cf-checkbox">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span>Ingat Saya</span>
                </label>
                <Link to="/forgot-password" className="cf-forgot-link">Lupa Kata Sandi?</Link>
              </div>

              {/* Submit */}
              <button type="submit" className="cf-btn-primary" disabled={loading}>
                {loading ? 'Memproses...' : <><span>Masuk</span><span className="cf-btn-arrow">→</span></>}
              </button>
            </form>

            <p className="cf-auth-footer">
              Belum punya akun?{' '}
              <Link to="/signup" className="cf-link">Daftar Sekarang</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
