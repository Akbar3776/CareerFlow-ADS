import { useState, useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'

const DEFAULT_STATUSES = [
  { label: 'Applied', color: '#c7d2fe' },
  { label: 'CV Screening', color: '#bbf7d0' },
  { label: 'Interview', color: '#bae6fd' },
  { label: 'Offered', color: '#bbf7d0' },
]

function getAutoTextColorFromHex(hex) {
  if (!hex || hex.length < 7) return '#1e293b'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }
  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = l * 100
  const textL = lPct > 50 ? Math.max(15, lPct - 60) : Math.min(95, lPct + 60)
  return `hsl(${hDeg}, ${sPct}%, ${textL}%)`
}

function ColorPicker({ value, onChange, presets = [] }) {
  const canvasRef = useRef(null)
  const stripRef = useRef(null)
  const [hue, setHue] = useState(220)
  const [pos, setPos] = useState({ x: 0.8, y: 0.2 })
  const draggingCanvas = useRef(false)
  const draggingStrip = useRef(false)

  const hslToHex = (h, s, l) => {
    s /= 100; l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = n => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const computeColor = (h, x, y) => {
    const s = x * 100
    const l = (1 - y) * (100 - x * 50)
    return hslToHex(h, s, l)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width, h = canvas.height
    const gradH = ctx.createLinearGradient(0, 0, w, 0)
    gradH.addColorStop(0, '#fff')
    gradH.addColorStop(1, `hsl(${hue},100%,50%)`)
    ctx.fillStyle = gradH
    ctx.fillRect(0, 0, w, h)
    const gradV = ctx.createLinearGradient(0, 0, 0, h)
    gradV.addColorStop(0, 'transparent')
    gradV.addColorStop(1, '#000')
    ctx.fillStyle = gradV
    ctx.fillRect(0, 0, w, h)
  }, [hue])

  const handleCanvasMove = (e) => {
    if (!draggingCanvas.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    setPos({ x, y })
    onChange(computeColor(hue, x, y))
  }

  const handleStripMove = (e) => {
    if (!draggingStrip.current) return
    const strip = stripRef.current
    const rect = strip.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const newHue = Math.round(x * 360)
    setHue(newHue)
    onChange(computeColor(newHue, pos.x, pos.y))
  }

  useEffect(() => {
    const up = () => {
      draggingCanvas.current = false
      draggingStrip.current = false
    }
    const move = (e) => {
      handleCanvasMove(e)
      handleStripMove(e)
    }
    window.addEventListener('mouseup', up)
    window.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('mousemove', move)
    }
  })

  return (
    <div className="trkd-colorpicker" onMouseDown={e => e.stopPropagation()}>
      <div className="trkd-colorpicker__header">
        <span className="trkd-colorpicker__label">Pick Color</span>
        <span className="trkd-colorpicker__hex">{value}</span>
      </div>
      <div className="trkd-colorpicker__canvas-wrap"
        onMouseDown={e => { e.stopPropagation(); draggingCanvas.current = true; handleCanvasMove(e) }}>
        <canvas ref={canvasRef} width={200} height={120} className="trkd-colorpicker__canvas" />
        <div className="trkd-colorpicker__cursor" style={{
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
        }} />
      </div>
      <div className="trkd-colorpicker__strip-wrap"
        onMouseDown={e => { e.stopPropagation(); draggingStrip.current = true; handleStripMove(e) }}>
        <div ref={stripRef} className="trkd-colorpicker__strip" />
        <div className="trkd-colorpicker__strip-cursor"
          style={{ left: `${(hue / 360) * 100}%` }} />
      </div>
      <div className="trkd-colorpicker__presets">
        {presets.slice(0, 6).map((c, i) => (
          <div key={i} className="trkd-colorpicker__preset"
            style={{
              background: c,
              outline: value === c ? '2px solid #2563eb' : 'none',
              outlineOffset: '2px',
            }}
            onMouseDown={e => { e.stopPropagation(); onChange(c) }}
          />
        ))}
      </div>
    </div>
  )
}

export default function TrackingDrawer({ mode, job, onSave, onClose }) {
  const isAdd = mode === 'add'
  const drawerRef = useRef(null)

  const [form, setForm] = useState({
    id: job?.id || null,
    position: job?.position || '',
    company: job?.company || '',
    dateApplied: job?.dateApplied || '',
    status: job?.status || 'Applied',
    type: job?.type || 'internship',
    workType: job?.workType || 'On-site',
    statuses: job?.statuses ? [...job.statuses] : [...DEFAULT_STATUSES],
    currentStatusIdx: job?.statuses
      ? Math.max(0, job.statuses.findIndex(s => s.label === job.status))
      : 0,
  })

  const [newStatusLabel, setNewStatusLabel] = useState('')
  const [newStatusColor, setNewStatusColor] = useState('#c7d2fe')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [activeColorIdx, setActiveColorIdx] = useState(null)

  // history: default 4 warna status + hitam putih
  // update HANYA saat add status baru
  const [colorHistory, setColorHistory] = useState([
    '#c7d2fe', '#bbf7d0', '#bae6fd', '#fef08a', '#ffffff', '#1e293b'
  ])

  // close picker saat klik di luar drawer
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setActiveColorIdx(null)
        setShowColorPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleAddStatus = () => {
    if (!newStatusLabel.trim()) return
    // update history HANYA di sini, saat add status
    setColorHistory(prev => {
      const filtered = prev.filter(c => c !== newStatusColor)
      return [newStatusColor, ...filtered].slice(0, 6)
    })
    setForm(prev => ({
      ...prev,
      statuses: [...prev.statuses, { label: newStatusLabel.trim(), color: newStatusColor }]
    }))
    setNewStatusLabel('')
    setNewStatusColor('#c7d2fe')
    setShowColorPicker(false)
  }

  const handleRemoveStatus = (idx) => {
    setForm(prev => ({
      ...prev,
      statuses: prev.statuses.filter((_, i) => i !== idx),
      currentStatusIdx: Math.min(prev.currentStatusIdx, Math.max(0, prev.statuses.length - 2)),
    }))
  }

  // fix: hanya update index yang dipilih
  const handleStatusColorChange = (idx, color) => {
    setForm(prev => ({
      ...prev,
      statuses: prev.statuses.map((s, i) => i === idx ? { ...s, color } : s)
    }))
  }

  const handleSubmit = () => onSave(form)

  return (
    <div className="trkd" ref={drawerRef}>
      {/* Header */}
      <div className="trkd__header">
        <div>
          <h2 className="trkd__title">
            {isAdd ? 'Add New Job Tracking' : form.position}
          </h2>
          {!isAdd && (
            <div className="trkd__company-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
              <span>{form.company}</span>
            </div>
          )}
        </div>
        <button className="trkd__close" onClick={onClose}>✕</button>
      </div>

      {/* Badges */}
      {!isAdd && (
        <div className="trkd__badges">
          <span className="trkd__badge trkd__badge--type">
            {job?.type === 'mt' ? 'MT' : 'Internship'}
          </span>
          <span className="trkd__badge trkd__badge--work">{job?.workType}</span>
          <span className="trkd__badge trkd__badge--status">{form.status}</span>
        </div>
      )}

      <div className="trkd__body">

        {/* Job Position + Company */}
        <div className="trkd__row">
          <div className="trkd__field">
            <label className="trkd__label">Job Position</label>
            <input className="trkd__input" type="text"
              value={form.position} onChange={handleChange('position')} />
          </div>
          <div className="trkd__field">
            <label className="trkd__label">Company</label>
            <input className="trkd__input" type="text"
              value={form.company} onChange={handleChange('company')} />
          </div>
        </div>

        {/* Date Applied */}
        <div className="trkd__field">
          <label className="trkd__label">Date Applied</label>
          <div className="trkd__date-wrap"
            onClick={() => document.getElementById('trkd-date').showPicker()}>
            <input
              id="trkd-date"
              className={`trkd__input trkd__input--date${!form.dateApplied ? ' trkd__input--empty' : ''}`}
              type="date"
              value={form.dateApplied}
              onChange={handleChange('dateApplied')}
            />
            <svg className="trkd__date-icon" width="15" height="15"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        </div>

        {/* Selection Progress Timeline */}
        <div className="trkd__field">
          <label className="trkd__label">Selection Progress Timeline</label>
          <div className="trkd__timeline">
            {form.statuses.map((s, i) => (
              <div key={i} className="trkd__tag"
                style={{
                  background: s.color,
                  color: getAutoTextColorFromHex(s.color),
                }}>
                {s.label}
                <span className="trkd__tag-remove"
                  onClick={() => handleRemoveStatus(i)}>×</span>
                {activeColorIdx === i && (
                  <div className="trkd__tag-picker"
                    onMouseDown={e => e.stopPropagation()}>
                    <ColorPicker
                      value={s.color}
                      onChange={(c) => handleStatusColorChange(i, c)}
                      presets={colorHistory}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new status */}
          <div className="trkd__add-status">
            <button
              className="trkd__palette-btn"
              onMouseDown={e => {
                e.stopPropagation()
                setShowColorPicker(p => !p)
                setActiveColorIdx(null)
              }}
            >
              <Palette size={16} />
            </button>
            <input
              className="trkd__status-input"
              type="text"
              placeholder="Add new status"
              value={newStatusLabel}
              onChange={e => setNewStatusLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddStatus()}
            />
            <button className="trkd__add-btn" onClick={handleAddStatus}>+</button>
            {showColorPicker && (
              <div className="trkd__new-picker"
                onMouseDown={e => e.stopPropagation()}>
                <ColorPicker
                  value={newStatusColor}
                  onChange={setNewStatusColor}
                  presets={colorHistory}
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="trkd__footer">
        <button className="trkd__btn trkd__btn--cancel" onClick={onClose}>
          Cancel
        </button>
        <button className="trkd__btn trkd__btn--save" onClick={handleSubmit}>
          Update Tracking
        </button>
      </div>
    </div>
  )
}