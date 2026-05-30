from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

# Sign Up & Login
auth_bp.route('/signup', methods=['POST'])(AuthController.signup)
auth_bp.route('/login', methods=['POST'])(AuthController.login)

# OTP Send & Verify
auth_bp.route('/signup/send-otp', methods=['POST'])(AuthController.send_signup_otp)
auth_bp.route('/signup/verify-otp', methods=['POST'])(AuthController.verify_signup_otp)

# Forgot Password
auth_bp.route('/forgot-password/send-otp', methods=['POST'])(AuthController.send_forgot_otp)
auth_bp.route('/forgot-password/verify-otp', methods=['POST'])(AuthController.verify_forgot_otp)
auth_bp.route('/forgot-password/reset', methods=['POST'])(AuthController.reset_password)

# Profile
auth_bp.route('/profile', methods=['GET'])(jwt_required()(AuthController.get_profile))
auth_bp.route('/profile', methods=['PUT'])(jwt_required()(AuthController.update_profile))