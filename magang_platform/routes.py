from flask import Blueprint
from flask_jwt_extended import jwt_required

# Import Controllers
from controllers.auth_controller import AuthController
from controllers.magang_controller import MagangController

api = Blueprint('api', __name__)

# ==========================================
# AUTENTIKASI: Sign Up & Login
# ==========================================
api.route('/signup', methods=['POST'])(AuthController.signup)
api.route('/login', methods=['POST'])(AuthController.login)

# ==========================================
# SIGNUP: OTP SEND & VERIFY
# ==========================================
api.route('/signup/send-otp', methods=['POST'])(AuthController.send_signup_otp)
api.route('/signup/verify-otp', methods=['POST'])(AuthController.verify_signup_otp)

# ==========================================
# LUPA PASSWORD: OTP & RESET
# ==========================================
api.route('/forgot-password/send-otp', methods=['POST'])(AuthController.send_forgot_otp)
api.route('/forgot-password/verify-otp', methods=['POST'])(AuthController.verify_forgot_otp)
api.route('/forgot-password/reset', methods=['POST'])(AuthController.reset_password)

# ==========================================
# USER PROFILE
# ==========================================
# Route baru untuk mengambil data user yang sedang login
api.route('/profile', methods=['GET'])(jwt_required()(AuthController.get_profile))

# ==========================================
# ADMIN: Mengelola Lowongan
# ==========================================
api.route('/admin/lowongan', methods=['POST'])(jwt_required()(MagangController.add_lowongan))
api.route('/admin/lowongan/<id>', methods=['PUT'])(jwt_required()(MagangController.update_lowongan))
api.route('/admin/lowongan/<id>', methods=['DELETE'])(jwt_required()(MagangController.delete_lowongan))

# ==========================================
# MAHASISWA: Mencari & Melamar Lowongan
# ==========================================
api.route('/lowongan', methods=['GET'])(MagangController.get_all_lowongan)
api.route('/lowongan/<id>', methods=['GET'])(MagangController.get_detail_lowongan)
api.route('/lamaran', methods=['POST'])(jwt_required()(MagangController.apply_lowongan))

# ==========================================
# MAHASISWA: Dashboard Tracking
# ==========================================
api.route('/mahasiswa/dashboard', methods=['GET'])(jwt_required()(MagangController.get_dashboard))
api.route('/lamaran/<id>/status', methods=['PUT'])(jwt_required()(MagangController.update_lamaran_status))