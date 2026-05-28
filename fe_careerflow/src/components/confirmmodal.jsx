import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="cfmodal-overlay">
      <div className="cfmodal">
        <div className="cfmodal__icon">
          <AlertTriangle size={28} color="#BA1A1A" />
        </div>
        <h3 className="cfmodal__title">Hapus Magang?</h3>
        <p className="cfmodal__desc">
          Apakah Anda yakin ingin menghapus magang ini?<br />
          Data yang dihapus tidak dapat dikembalikan.
        </p>
        <div className="cfmodal__actions">
          <button className="cfmodal__btn cfmodal__btn--cancel" onClick={onCancel}>
            Batal
          </button>
          <button className="cfmodal__btn cfmodal__btn--confirm" onClick={onConfirm}>
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  )
}