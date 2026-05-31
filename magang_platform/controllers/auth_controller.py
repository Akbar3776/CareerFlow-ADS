from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.auth_service import AuthService
from validators.validator import validate_signup_data

class AuthController:
    @staticmethod
    def signup():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        data = request.json
        is_valid, msg = validate_signup_data(data)
        if not is_valid:
            return jsonify({"message": msg}), 400

        user, error = AuthService.create_mahasiswa(data)
        if error:
            return jsonify({"message": error}), 400
        return jsonify({"message": "Akun mahasiswa berhasil dibuat", "nim": user.nim}), 201

    @staticmethod
    def login():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        data = request.json
        token, role, error = AuthService.authenticate_user(data.get('email'), data.get('password'))
        if error:
            return jsonify({"message": error}), 401
        return jsonify({"access_token": token, "role": role}), 200

    @staticmethod
    def send_signup_otp():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        email = request.json.get('email')
        otp, error = AuthService.generate_otp(email, 'signup')
        if error:
            return jsonify({"message": error}), 400
        return jsonify({"message": "OTP telah dikirim ke email"}), 200

    @staticmethod
    def verify_signup_otp():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        data = request.json
        is_valid, error = AuthService.verify_otp(data.get('email'), data.get('otp'), 'signup')
        if not is_valid:
            return jsonify({"message": error}), 400
        return jsonify({"message": "OTP valid, silakan lanjutkan pendaftaran"}), 200

    @staticmethod
    def send_forgot_otp():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        email = request.json.get('email')
        otp, error = AuthService.generate_otp(email, 'forgot')
        if error:
            return jsonify({"message": error}), 404
        return jsonify({"message": "OTP telah dikirim ke email"}), 200

    @staticmethod
    def verify_forgot_otp():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        data = request.json
        is_valid, error = AuthService.verify_otp(data.get('email'), data.get('otp'), 'forgot')
        if not is_valid:
            return jsonify({"message": error}), 400
        return jsonify({"message": "OTP valid, silakan reset password"}), 200

    @staticmethod
    def reset_password():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        data = request.json
        success, error = AuthService.reset_password(data.get('email'), data.get('otp'), data.get('newPassword'))
        if not success:
            return jsonify({"message": error}), 400
        return jsonify({"message": "Password berhasil direset"}), 200
    
    @staticmethod
    @jwt_required()
    def get_profile():
        # OPTIONS check usually isn't strictly necessary for GET requests, 
        # but it's safe to include if your frontend sends preflights for headers.
        if request.method == 'OPTIONS': return '', 200

        user_id = get_jwt_identity()
        role = get_jwt().get('role')
        
        profile = AuthService.get_user_profile(user_id, role)
        
        if not profile:
            return jsonify({"message": "User tidak ditemukan"}), 404
            
        return jsonify(profile), 200

    @staticmethod
    @jwt_required()
    def update_profile():
        if request.method == 'OPTIONS': return '', 200
        if not request.is_json: return jsonify({"message": "Content-Type must be application/json"}), 415

        from validators.validator import validate_profile_update_data
        user_id = get_jwt_identity()
        role = get_jwt().get('role')
        data = request.json
        
        is_valid, msg = validate_profile_update_data(data)
        if not is_valid:
            return jsonify({"message": msg}), 400

        # Password required if email is changed
        password = data.get('password') if 'email' in data else None
        updated_profile, error = AuthService.update_user_profile(user_id, role, data, password)
        if error:
            return jsonify({"message": error}), 400
        return jsonify(updated_profile), 200