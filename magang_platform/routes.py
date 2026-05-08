# routes.py
from flask import Blueprint, request, jsonify
from models import db, Admin, Mahasiswa, LowonganMagang, Lamaran
from werkzeug.security import generate_password_hash, check_password_hash
# PERUBAHAN: Menambahkan 'get_jwt' untuk mengambil 'additional_claims'
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

api = Blueprint('api', __name__)

# ==========================================
# AUTENTIKASI: Sign Up & Login
# ==========================================

@api.route('/signup', methods=['POST'])
def signup_mahasiswa():
    data = request.json
    if Mahasiswa.query.filter_by(email=data['email']).first() or Mahasiswa.query.filter_by(nim=data['nim']).first():
        return jsonify({"message": "Email atau NIM sudah terdaftar"}), 400
    
    hashed_password = generate_password_hash(data['password'])
    new_mahasiswa = Mahasiswa(
        nama=data['nama'],
        email=data['email'],
        password=hashed_password,
        nim=data['nim'],
        programStudi=data['programStudi']
    )
    db.session.add(new_mahasiswa)
    db.session.commit()
    return jsonify({"message": "Akun mahasiswa berhasil dibuat", "nim": new_mahasiswa.nim}), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = Admin.query.filter_by(email=email).first()
    role = 'admin'
    user_id = user.idAdmin if user else None
    
    if not user:
        user = Mahasiswa.query.filter_by(email=email).first()
        role = 'mahasiswa'
        user_id = user.nim if user else None

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Email atau password salah"}), 401

    # PERUBAHAN: Memisahkan identity sebagai string, dan role di additional_claims
    access_token = create_access_token(
        identity=str(user_id), 
        additional_claims={'role': role}
    )
    return jsonify({"access_token": access_token, "role": role}), 200

# ==========================================
# ADMIN: Mengelola Lowongan (Khusus Admin)
# ==========================================

@api.route('/admin/lowongan', methods=['POST'])
@jwt_required()
def add_lowongan():
    claims = get_jwt() # Mengambil additional_claims
    if claims.get('role') != 'admin':
        return jsonify({"message": "Akses ditolak, khusus admin"}), 403

    data = request.json
    new_lowongan = LowonganMagang(
        posisi=data['posisi'],
        deskripsi=data['deskripsi'],
        kategori=data['kategori'],
        kuota=data['kuota'],
        idAdmin=get_jwt_identity() # Identity langsung berisi string ID User
    )
    db.session.add(new_lowongan)
    db.session.commit()
    return jsonify({"message": "Lowongan berhasil ditambahkan", "idLowongan": new_lowongan.idLowongan}), 201

@api.route('/admin/lowongan/<id>', methods=['PUT'])
@jwt_required()
def update_lowongan(id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"message": "Akses ditolak, khusus admin"}), 403

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
@jwt_required()
def hapus_lowongan(id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({"message": "Akses ditolak, khusus admin"}), 403

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
@jwt_required()
def kirim_lamaran():
    claims = get_jwt()
    if claims.get('role') != 'mahasiswa':
        return jsonify({"message": "Hanya mahasiswa yang dapat mengirim lamaran"}), 403

    data = request.json
    new_lamaran = Lamaran(
        dokumenCV=data['dokumenCV'],
        idLowongan=data['idLowongan'],
        nimMahasiswa=get_jwt_identity()
    )
    db.session.add(new_lamaran)
    db.session.commit()
    return jsonify({"message": "Lamaran berhasil dikirim", "idLamaran": new_lamaran.idLamaran}), 201

# ==========================================
# MAHASISWA: Dashboard Tracking
# ==========================================

@api.route('/mahasiswa/dashboard', methods=['GET'])
@jwt_required()
def akses_dashboard():
    claims = get_jwt()
    if claims.get('role') != 'mahasiswa':
        return jsonify({"message": "Akses ditolak"}), 403

    current_user_id = get_jwt_identity()
    daftar_lamaran = Lamaran.query.filter_by(nimMahasiswa=current_user_id).all()
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
@jwt_required()
def update_status_manual(id):
    claims = get_jwt()
    if claims.get('role') != 'mahasiswa':
        return jsonify({"message": "Akses ditolak"}), 403

    data = request.json
    lamaran = Lamaran.query.get(id)
    if not lamaran:
        return jsonify({"message": "Lamaran tidak ditemukan"}), 404
    
    if lamaran.nimMahasiswa != get_jwt_identity():
        return jsonify({"message": "Anda tidak memiliki akses ke lamaran ini"}), 403
        
    lamaran.statusLamaran = data.get('statusLamaran', lamaran.statusLamaran)
    db.session.commit()
    return jsonify({"message": "Status lamaran berhasil diperbarui"}), 200