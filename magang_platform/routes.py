# routes.py
from flask import Blueprint, request, jsonify
from models import db, Admin, Mahasiswa, LowonganMagang, Lamaran

api = Blueprint('api', __name__)

# ==========================================
# ADMIN: Mengelola Lowongan
# ==========================================

@api.route('/admin/lowongan', methods=['POST'])
def add_lowongan():
    data = request.json
    new_lowongan = LowonganMagang(
        posisi=data['posisi'],
        deskripsi=data['deskripsi'],
        kategori=data['kategori'],
        kuota=data['kuota'],
        idAdmin=data['idAdmin']
    )
    db.session.add(new_lowongan)
    db.session.commit()
    return jsonify({"message": "Lowongan berhasil ditambahkan", "idLowongan": new_lowongan.idLowongan}), 201

@api.route('/admin/lowongan/<id>', methods=['PUT'])
def update_lowongan(id):
    data = request.json
    lowongan = LowonganMagang.query.get(id)
    if not lowongan:
        return jsonify({"message": "Lowongan tidak ditemukan"}), 404
    
    lowongan.posisi = data.get('posisi', lowongan.posisi)
    lowongan.deskripsi = data.get('deskripsi', lowongan.deskripsi)
    lowongan.kategori = data.get('kategori', lowongan.kategori)
    lowongan.kuota = data.get('kuota', lowongan.kuota)
    
    db.session.commit()
    return jsonify({"message": "Lowongan berhasil diupdate"}), 200

@api.route('/admin/lowongan/<id>', methods=['DELETE'])
def hapus_lowongan(id):
    lowongan = LowonganMagang.query.get(id)
    if not lowongan:
        return jsonify({"message": "Lowongan tidak ditemukan"}), 404
    
    db.session.delete(lowongan)
    db.session.commit()
    return jsonify({"message": "Lowongan berhasil dihapus"}), 200

# ==========================================
# MAHASISWA: Mencari & Melamar Lowongan
# ==========================================

@api.route('/lowongan', methods=['GET'])
def cari_dan_filter_lowongan():
    keyword = request.args.get('keyword')
    kategori = request.args.get('kategori')
    
    query = LowonganMagang.query
    
    if keyword:
        query = query.filter(
            LowonganMagang.posisi.ilike(f'%{keyword}%') | 
            LowonganMagang.deskripsi.ilike(f'%{keyword}%')
        )
    if kategori:
        query = query.filter_by(kategori=kategori)
        
    hasil = query.all()
    return jsonify([{
        "idLowongan": l.idLowongan,
        "posisi": l.posisi,
        "kategori": l.kategori,
        "kuota": l.kuota
    } for l in hasil]), 200

@api.route('/lowongan/<id>', methods=['GET'])
def detail_lowongan(id):
    l = LowonganMagang.query.get(id)
    if not l:
        return jsonify({"message": "Lowongan tidak ditemukan"}), 404
        
    return jsonify({
        "idLowongan": l.idLowongan,
        "posisi": l.posisi,
        "deskripsi": l.deskripsi,
        "kategori": l.kategori,
        "kuota": l.kuota,
        "idAdmin": l.idAdmin
    }), 200

@api.route('/lamaran', methods=['POST'])
def kirim_lamaran():
    data = request.json
    new_lamaran = Lamaran(
        dokumenCV=data['dokumenCV'],
        idLowongan=data['idLowongan'],
        nimMahasiswa=data['nimMahasiswa']
    )
    db.session.add(new_lamaran)
    db.session.commit()
    return jsonify({"message": "Lamaran berhasil dikirim", "idLamaran": new_lamaran.idLamaran}), 201

# ==========================================
# MAHASISWA: Dashboard Tracking
# ==========================================

@api.route('/mahasiswa/<nim>/dashboard', methods=['GET'])
def akses_dashboard(nim):
    daftar_lamaran = Lamaran.query.filter_by(nimMahasiswa=nim).all()
    if not daftar_lamaran:
        return jsonify({"message": "Dashboard kosong"}), 200
        
    return jsonify([{
        "idLamaran": l.idLamaran,
        "idLowongan": l.idLowongan,
        "posisi": l.lowongan.posisi,
        "tanggalApply": l.tanggalApply.strftime('%Y-%m-%d %H:%M:%S'),
        "statusLamaran": l.statusLamaran
    } for l in daftar_lamaran]), 200

@api.route('/lamaran/<id>/status', methods=['PUT'])
def update_status_manual(id):
    data = request.json
    lamaran = Lamaran.query.get(id)
    if not lamaran:
        return jsonify({"message": "Lamaran tidak ditemukan"}), 404
        
    lamaran.statusLamaran = data.get('statusLamaran', lamaran.statusLamaran)
    db.session.commit()
    return jsonify({"message": "Status lamaran berhasil diperbarui"}), 200