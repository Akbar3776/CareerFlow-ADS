import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import countryList from 'react-select-country-list'
import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

const COUNTRIES = [
  'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Philippines',
  'Vietnam', 'Japan', 'South Korea', 'China', 'India', 'Australia',
  'United States', 'United Kingdom', 'Germany', 'France', 'Netherlands',
  'Canada', 'Brazil', 'Saudi Arabia', 'United Arab Emirates',
]

const SALARY_PERIOD = ['per month', 'per week', 'not listed']

export default function AdminJobFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    company: '',
    logoUrl: '',
    applyUrl: '',
    salary: '',
    salaryPeriod: 'per month',
    city: '',
    country: 'Indonesia',
    startDate: '',
    endDate: '',
    type: 'internship',
    about: '',
    responsibilities: '',
  })

  const [logoPreview, setLogoPreview] = useState(null)
  const [titleHistory] = useState(['Product Designer', 'Data Analyst', 'Software Engineer', 'Business Development Manager'])
  const [companyHistory] = useState(['PT Antam Tbk', 'PT Shopee International Indonesia', 'PT Kapal Api Global'])
  const [showTitleSug, setShowTitleSug] = useState(false)
  const [showCompanySug, setShowCompanySug] = useState(false)
  const [countryQuery, setCountryQuery] = useState('Indonesia')
  const [showCountrySug, setShowCountrySug] = useState(false)
  const [periodOpen, setPeriodOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
    setForm(prev => ({ ...prev, logoUrl: url }))
  }

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: kirim ke backend
    console.log('Submit:', form)
    navigate('/admin/dashboard')
  }

  const countryOptions = useMemo(() => countryList().getData(), [])

  return (
    <div className="ajf-wrapper">
      <Navbar
        user={{ name: 'Andi Nasution', role: 'Admin' }}
        profileOpen={false}
        setProfileOpen={() => {}}
      />

      <div className="ajf-container">
        {/* Breadcrumb */}
        <div className="ajf-breadcrumb">
          <span className="ajf-breadcrumb__link" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span className="ajf-breadcrumb__sep">›</span>
          <span className="ajf-breadcrumb__current">
            {isEdit ? 'Edit Job' : 'Add Job'}
          </span>
        </div>

        <div className="ajf-header">
          <h1 className="ajf-header__title">{isEdit ? 'Edit Job Listing' : 'Add Job Listing'}</h1>
          <p className="ajf-header__sub">Isi detail lowongan yang akan ditampilkan ke pengguna.</p>
        </div>

        <form className="ajf-form" onSubmit={handleSubmit}>

          {/* ---- SECTION: Role Information ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Role Information</h3>
              <p className="ajf-section__desc">Masukkan judul posisi dan perusahaan.</p>
            </div>
            <div className="ajf-section__right">

              {/* Job Title */}
              <div className="ajf-field">
                <label className="ajf-field__label">Job Title</label>
                <div className="ajf-field__autocomplete">
                  <input
                    className="ajf-field__input"
                    type="text"
                    placeholder="e.g. Product Designer"
                    value={form.title}
                    onChange={e => {
                      handleChange('title')(e)
                      setShowTitleSug(e.target.value.length > 0)
                    }}
                    onFocus={() => setShowTitleSug(form.title.length > 0)}
                    onBlur={() => setTimeout(() => setShowTitleSug(false), 150)}
                  />
                  {showTitleSug && (
                    <ul className="ajf-field__suggestions">
                      {titleHistory
                        .filter(h => h.toLowerCase().includes(form.title.toLowerCase()))
                        .map((h, i) => (
                          <li key={i} onMouseDown={() => {
                            setForm(prev => ({ ...prev, title: h }))
                            setShowTitleSug(false)
                          }}>{h}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Company */}
              <div className="ajf-field">
                <label className="ajf-field__label">Company</label>
                <div className="ajf-field__autocomplete">
                  <div className="ajf-field__company-wrap">
                    {logoPreview && (
                      <img className="ajf-field__company-logo" src={logoPreview} alt="logo" />
                    )}
                    <input
                      className="ajf-field__input"
                      type="text"
                      placeholder="e.g. PT Antam Tbk"
                      value={form.company}
                      onChange={e => {
                        handleChange('company')(e)
                        setShowCompanySug(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowCompanySug(form.company.length > 0)}
                      onBlur={() => setTimeout(() => setShowCompanySug(false), 150)}
                    />
                  </div>
                  {showCompanySug && (
                    <ul className="ajf-field__suggestions">
                      {companyHistory
                        .filter(h => h.toLowerCase().includes(form.company.toLowerCase()))
                        .map((h, i) => (
                          <li key={i} onMouseDown={() => {
                            setForm(prev => ({ ...prev, company: h }))
                            setShowCompanySug(false)
                          }}>{h}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ---- SECTION: Logo & Link ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Logo & Link</h3>
              <p className="ajf-section__desc">Upload logo perusahaan dan link pendaftaran.</p>
            </div>
            <div className="ajf-section__right">

              {/* Logo Upload */}
              <div className="ajf-field">
                <label className="ajf-field__label">Company Logo <span className="ajf-field__optional">(optional)</span></label>
                <div className="ajf-field__upload-wrap">
                  {logoPreview ? (
                    <img className="ajf-field__logo-preview" src={logoPreview} alt="preview" />
                  ) : (
                    <div className="ajf-field__logo-empty">No logo</div>
                  )}
                  <label className="ajf-field__upload-btn">
                    Upload
                    <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                  </label>
                </div>
              </div>

              {/* Apply Link */}
              <div className="ajf-field">
                <label className="ajf-field__label">Apply Link</label>
                <input
                  className="ajf-field__input"
                  type="url"
                  placeholder="https://..."
                  value={form.applyUrl}
                  onChange={handleChange('applyUrl')}
                />
              </div>

            </div>
          </div>

          {/* ---- SECTION: Salary ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Salary</h3>
              <p className="ajf-section__desc">Isi rentang gaji atau pilih not listed.</p>
            </div>
            <div className="ajf-section__right">
              <div className="ajf-field ajf-field--row">
                <div className="ajf-field" style={{ flex: 1 }}>
                  <label className="ajf-field__label">Salary Range</label>
                  <input
                    className="ajf-field__input"
                    type="text"
                    placeholder="e.g. Rp 1.000.000 – Rp 2.000.000"
                    value={form.salary}
                    onChange={handleChange('salary')}
                    disabled={form.salaryPeriod === 'not listed'}
                  />
                </div>
                <div className="ajf-field" style={{ flexShrink: 0 }}>
                  <label className="ajf-field__label">Period</label>
                  <div className="ajf-custom-select" onClick={() => setPeriodOpen(p => !p)}>
                    <span className={form.salaryPeriod ? 'ajf-custom-select__value' : 'ajf-custom-select__placeholder'}>
                      {form.salaryPeriod || 'Select...'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`ajf-custom-select__arrow ${periodOpen ? 'open' : ''}`}
                    />
                    {periodOpen && (
                      <ul className="ajf-custom-select__dropdown">
                        {SALARY_PERIOD.map(p => (
                          <li key={p}
                            className={`ajf-custom-select__option ${form.salaryPeriod === p ? 'active' : ''}`}
                            onMouseDown={() => {
                              setForm(prev => ({ ...prev, salaryPeriod: p }))
                              setPeriodOpen(false)
                            }}>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- SECTION: Location ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Location</h3>
              <p className="ajf-section__desc">Kota/kabupaten dan negara.</p>
            </div>
            <div className="ajf-section__right">
              <div className="ajf-field ajf-field--row">
                <div className="ajf-field" style={{ flex: 1 }}>
                  <label className="ajf-field__label">City / Regency</label>
                  <input
                    className="ajf-field__input"
                    type="text"
                    placeholder="e.g. South Tangerang"
                    value={form.city}
                    onChange={handleChange('city')}
                  />
                </div>
                <div className="ajf-field" style={{ flex: 1 }}>
                  <label className="ajf-field__label">Country</label>
                  <div className="ajf-custom-select" onClick={() => setCountryOpen(p => !p)}>
                    <span className={form.country ? 'ajf-custom-select__value' : 'ajf-custom-select__placeholder'}>
                      {form.country || 'Select country...'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`ajf-custom-select__arrow ${countryOpen ? 'open' : ''}`}
                    />
                    {countryOpen && (
                      <ul className="ajf-custom-select__dropdown ajf-custom-select__dropdown--scroll">
                        {countryOptions.map(c => (
                          <li key={c.value}
                            className={`ajf-custom-select__option ${form.country === c.label ? 'active' : ''}`}
                            onMouseDown={() => {
                              setForm(prev => ({ ...prev, country: c.label }))
                              setCountryOpen(false)
                            }}>
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- SECTION: Timeline ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Timeline</h3>
              <p className="ajf-section__desc">Tentukan periode pendaftaran.</p>
            </div>
            <div className="ajf-section__right">
              <div className="ajf-field ajf-field--row">
                <div className="ajf-field" style={{ flex: 1 }}>
                  <label className="ajf-field__label">Start Date</label>
                  <div className="ajf-field__date-box" onClick={() => document.getElementById('startDate').showPicker()}>
                    <input
                      id="startDate"
                      className="ajf-field__input"
                      type="date"
                      value={form.startDate}
                      onChange={handleChange('startDate')}
                    />
                  </div>
                </div>

                <div className="ajf-field" style={{ flex: 1 }}>
                  <label className="ajf-field__label">End Date</label>
                  <div className="ajf-field__date-box" onClick={() => document.getElementById('endDate').showPicker()}>
                    <input
                      id="endDate"
                      className="ajf-field__input"
                      type="date"
                      value={form.endDate}
                      onChange={handleChange('endDate')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- SECTION: Job Type ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Job Type</h3>
              <p className="ajf-section__desc">Internship atau Management Trainee.</p>
            </div>
            <div className="ajf-section__right">
              <div className="ajf-field">
                <label className="ajf-field__label">Type</label>
                <div className="ajf-custom-select" onClick={() => setTypeOpen(p => !p)}>
                  <span className="ajf-custom-select__value">
                    {form.type === 'internship' ? 'Internship' : 'Management Trainee (MT)'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ajf-custom-select__arrow ${typeOpen ? 'open' : ''}`}
                  />
                  {typeOpen && (
                    <ul className="ajf-custom-select__dropdown">
                      <li className={`ajf-custom-select__option ${form.type === 'internship' ? 'active' : ''}`}
                        onMouseDown={() => { setForm(prev => ({ ...prev, type: 'internship' })); setTypeOpen(false) }}>
                        Internship
                      </li>
                      <li className={`ajf-custom-select__option ${form.type === 'mt' ? 'active' : ''}`}
                        onMouseDown={() => { setForm(prev => ({ ...prev, type: 'mt' })); setTypeOpen(false) }}>
                        Management Trainee (MT)
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- SECTION: Description ---- */}
          <div className="ajf-section">
            <div className="ajf-section__left">
              <h3 className="ajf-section__title">Description</h3>
              <p className="ajf-section__desc">Deskripsi singkat dan tanggung jawab posisi.</p>
            </div>
            <div className="ajf-section__right">

              <div className="ajf-field">
                <label className="ajf-field__label">About the Role</label>
                <textarea
                  className="ajf-field__textarea"
                  rows={4}
                  placeholder="Describe the role..."
                  value={form.about}
                  onChange={handleChange('about')}
                />
              </div>

              <div className="ajf-field">
                <label className="ajf-field__label">Responsibilities</label>
                <textarea
                  className="ajf-field__textarea"
                  rows={4}
                  placeholder="1.  Responsibility 1&#10;2. Responsibility 2"
                  value={form.responsibilities}
                  onChange={handleChange('responsibilities')}
                />
              </div>

            </div>
          </div>

          {/* ---- Actions ---- */}
          <div className="ajf-actions">
            <button type="button" className="ajf-actions__btn ajf-actions__btn--back"
              onClick={() => navigate('/admin/dashboard')}>
              Kembali
            </button>
            <button type="submit" className="ajf-actions__btn ajf-actions__btn--save">
              Simpan
            </button>
          </div>

        </form>
      </div>

      <footer className="db-footer">
        © 2026 CareerFlow Professional Network. All rights reserved.
      </footer>
    </div>
  )
}