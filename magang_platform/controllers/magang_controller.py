from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from services.magang_service import MagangService
from validators.validator import validate_lowongan_data

class MagangController:
    # --- ADMIN ROUTES ---
    @staticmethod
    def add_lowongan():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"message": "Akses ditolak, khusus admin"}), 403

        data = request.json
        is_valid, msg = validate_lowongan_data(data)
        if not is_valid:
            return jsonify({"message": msg}), 400

        lowongan = MagangService.create_lowongan(data, get_jwt_identity())
        return jsonify({
            "message": "Lowongan berhasil ditambahkan", 
            "id": lowongan.id  # Updated from idLowongan
        }), 201

    @staticmethod
    def update_lowongan(id):
        if get_jwt().get('role') != 'admin':
            return jsonify({"message": "Akses ditolak, khusus admin"}), 403

        lowongan = MagangService.update_lowongan(id, request.json)
        if not lowongan:
            return jsonify({"message": "Lowongan tidak ditemukan"}), 404
        return jsonify({"message": "Lowongan berhasil diupdate"}), 200

    @staticmethod
    def delete_lowongan(id):
        if get_jwt().get('role') != 'admin':
            return jsonify({"message": "Akses ditolak, khusus admin"}), 403

        success = MagangService.delete_lowongan(id)
        if not success:
            return jsonify({"message": "Lowongan tidak ditemukan"}), 404
        return jsonify({"message": "Lowongan berhasil dihapus"}), 200

    # --- PUBLIC/MAHASISWA ROUTES ---
    @staticmethod
    def get_all_lowongan():
        # Change request parameter from 'kategori' to 'type' to match frontend filters
        hasil = MagangService.get_lowongan(request.args.get('keyword'), request.args.get('type'))
        
        # Use to_dict() to return the exact JSON structure React needs
        return jsonify([l.to_dict() for l in hasil]), 200

    @staticmethod
    def get_detail_lowongan(id):
        l = MagangService.get_lowongan_by_id(id)
        if not l:
            return jsonify({"message": "Lowongan tidak ditemukan"}), 404
            
        # Return the full serialized dictionary
        return jsonify(l.to_dict()), 200

    @staticmethod
    def apply_lowongan():
        if get_jwt().get('role') != 'mahasiswa':
            return jsonify({"message": "Hanya mahasiswa yang dapat mengirim lamaran"}), 403

        data = request.json
        lamaran = MagangService.create_lamaran(data, get_jwt_identity())
        return jsonify({"message": "Lamaran berhasil dikirim", "idLamaran": lamaran.idLamaran}), 201

    @staticmethod
    def get_dashboard():
        if get_jwt().get('role') != 'mahasiswa':
            return jsonify({"message": "Akses ditolak"}), 403

        lamaran = MagangService.get_lamaran_by_mahasiswa(get_jwt_identity())
        if not lamaran:
            return jsonify({"message": "Dashboard kosong"}), 200
            
        return jsonify([{
            "idLamaran": l.idLamaran,
            "idLowongan": l.idLowongan,
            "title": l.lowongan.title,       # Updated from posisi
            "company": l.lowongan.company,   # Added company so the dashboard shows where they applied
            "tanggalApply": l.tanggalApply.strftime('%Y-%m-%d %H:%M:%S'),
            "statusLamaran": l.statusLamaran
        } for l in lamaran]), 200

    @staticmethod
    def update_lamaran_status(id):
        if get_jwt().get('role') != 'mahasiswa':
            return jsonify({"message": "Akses ditolak"}), 403

        lamaran, error = MagangService.update_status_lamaran(id, get_jwt_identity(), request.json.get('statusLamaran'))
        if error:
            return jsonify({"message": error}), 400 
        return jsonify({"message": "Status lamaran berhasil diperbarui"}), 200
    
    @staticmethod
    def delete_lamaran(id):
        if get_jwt().get('role') != 'mahasiswa':
            return jsonify({"message": "Akses ditolak"}), 403

        success, error = MagangService.delete_lamaran(id, get_jwt_identity())
        if error:
            return jsonify({"message": error}), 404 if "ditemukan" in error else 403
            
        return jsonify({"message": "Lamaran berhasil dihapus"}), 200